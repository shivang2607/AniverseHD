import axios from "axios";
import Bottleneck from "bottleneck";
import { LRUCache } from "lru-cache";
import { NextResponse } from "next/server";
import redisClient from "@/lib/redis";

const FRESH_TTL_MS = 1000 * 60 * 60;
const STALE_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const REDIS_FRESH_TTL_S = 60 * 60;
const REDIS_STALE_TTL_S = 60 * 60 * 24 * 30;

const freshCache = new LRUCache({ max: 20, ttl: FRESH_TTL_MS });
const staleCache = new LRUCache({ max: 20, ttl: STALE_TTL_MS });

const limiter = new Bottleneck({ minTime: 500 });

const ALLOWED_FILTERS = ["airing", "upcoming", "bypopularity", "favorite"];
const inflight = new Map();

function freshKey(filter, limit, page) {
  return `top-anime-fresh-${filter}-${limit}-${page}`;
}
function staleKey(filter, limit, page) {
  return `top-anime-stale-${filter}-${limit}-${page}`;
}

async function readRedisJSON(key) {
  try {
    const v = await redisClient.get(key);
    return v ? JSON.parse(v) : null;
  } catch (err) {
    console.warn(`Redis read failed for ${key}:`, err?.message);
    return null;
  }
}

async function writeRedisJSON(key, value, ttlSeconds) {
  try {
    await redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (err) {
    console.warn(`Redis write failed for ${key}:`, err?.message);
  }
}

function shapeAnime(anime) {
  return {
    mal_id: anime.mal_id,
    aired: anime.aired,
    images: anime.images,
    trailer: anime.trailer,
    title: anime.title,
    title_english: anime.title_english,
    type: anime.type,
    score: anime.score,
    synopsis: anime.synopsis,
    duration: anime.duration,
    episodes: anime.episodes,
    rating: anime.rating,
  };
}

async function jikanFetchOnce({ filter, limit, page, signal }) {
  const url = `https://api.jikan.moe/v4/top/anime?page=${page}&limit=${limit}&filter=${filter}&sfw=true`;
  const res = await axios.get(url, {
    timeout: 15000,
    signal,
    headers: {
      "User-Agent": "AniverseHD/1.0 (+https://aniversehd.com)",
      Accept: "application/json",
    },
    validateStatus: (s) => s >= 200 && s < 300,
  });
  const list = res?.data?.data;
  if (!Array.isArray(list)) {
    throw new Error("Jikan returned unexpected payload (no data array)");
  }
  return {
    totalPages: res.data?.pagination?.last_visible_page ?? 1,
    data: list.map(shapeAnime),
  };
}

async function jikanFetchWithRetry(args) {
  const attempts = 3;
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await limiter.schedule(() => jikanFetchOnce(args));
    } catch (err) {
      lastErr = err;
      const status = err?.response?.status;
      if (status === 429 || (status >= 500 && status < 600) || !status) {
        const backoff = Math.min(500 * Math.pow(2, i), 4000);
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

async function getCached(filter, limit, page) {
  const k = freshKey(filter, limit, page);
  const lru = freshCache.get(k);
  if (lru) return { kind: "lru-fresh", payload: lru };

  const redis = await readRedisJSON(k);
  if (redis) {
    freshCache.set(k, redis);
    return { kind: "redis-fresh", payload: redis };
  }
  return null;
}

async function getStale(filter, limit, page) {
  const k = staleKey(filter, limit, page);
  const lru = staleCache.get(k);
  if (lru) return lru;
  const redis = await readRedisJSON(k);
  if (redis) {
    staleCache.set(k, redis);
    return redis;
  }
  return null;
}

async function persistFresh(filter, limit, page, value) {
  const fk = freshKey(filter, limit, page);
  const sk = staleKey(filter, limit, page);
  freshCache.set(fk, value);
  staleCache.set(sk, value);
  await Promise.all([
    writeRedisJSON(fk, value, REDIS_FRESH_TTL_S),
    writeRedisJSON(sk, value, REDIS_STALE_TTL_S),
  ]);
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter") || "favorite";
  const limit = searchParams.get("limit") || 20;
  const page = searchParams.get("page") || 1;

  if (!ALLOWED_FILTERS.includes(filter)) {
    return NextResponse.json(
      { error: "Unexpected filter type", data: [] },
      { status: 400 }
    );
  }

  const cached = await getCached(filter, limit, page);
  if (cached) {
    return NextResponse.json(
      { ...cached.payload, source: cached.kind },
      {
        status: 200,
        headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400" },
      }
    );
  }

  const inflightKey = `${filter}-${limit}-${page}`;
  let pending = inflight.get(inflightKey);
  if (!pending) {
    pending = jikanFetchWithRetry({ filter, limit, page })
      .then(async (value) => {
        await persistFresh(filter, limit, page, value);
        return value;
      })
      .finally(() => inflight.delete(inflightKey));
    inflight.set(inflightKey, pending);
  }

  try {
    const value = await pending;
    return NextResponse.json(
      { ...value, source: "jikan-fresh" },
      {
        status: 200,
        headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400" },
      }
    );
  } catch (err) {
    console.error(
      `get-top-anime: Jikan failed (filter=${filter}):`,
      err?.message
    );

    const stale = await getStale(filter, limit, page);
    if (stale) {
      return NextResponse.json(
        { ...stale, source: "stale", warning: "Live data unavailable, served stale cache" },
        {
          status: 200,
          headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=86400" },
        }
      );
    }

    return NextResponse.json(
      { error: err?.message || "Upstream Jikan failed", data: [] },
      { status: 502 }
    );
  }
}
