import axios from "axios";
import { NextResponse } from "next/server";
import { LRUCache } from "lru-cache";
import { defaultCacheOptions } from "@/utils/lruCache";

const HNEMBED_BASE = process.env.HNEMBED_BASE || "https://hnembed.cc/embed";

const responseCache = new LRUCache({
  ...defaultCacheOptions,
  max: 1000,
  ttl: 1000 * 60 * 60 * 24,
});

const idLookupCache = new LRUCache({
  ...defaultCacheOptions,
  max: 2000,
  ttl: 1000 * 60 * 60 * 24 * 7,
});

const MOVIE_TYPES = new Set(["MOVIE", "Movie", "movie"]);

async function fetchExternalIdsFromQdrant(malId) {
  try {
    const { data } = await axios.post(
      `${process.env.QDRANT_URL}/collections/Anime/points`,
      { ids: [Number(malId)], with_payload: true },
      { headers: { "api-key": process.env.QDRANT_API_KEY }, timeout: 8000 }
    );
    const point = data?.result?.[0];
    if (!point) return null;
    const sites = point?.payload?.Sites || {};
    const type = point?.payload?.type || null;
    return {
      imdb_id: sites?.imdb_id || sites?.hnembed?.imdb_id || null,
      tmdb_id: sites?.themoviedb_id || sites?.hnembed?.tmdb_id || null,
      type,
      cachedFromQdrant: Boolean(sites?.hnembed?.imdb_id || sites?.hnembed?.tmdb_id),
    };
  } catch {
    return null;
  }
}

async function fetchExternalIdsFromMapper(malId) {
  const cached = idLookupCache.get(malId);
  if (cached) return cached;
  try {
    const { data } = await axios.get(
      `${process.env.MAPPER_URL}/anime/mappings/mal_id/${malId}`,
      { timeout: 15000 }
    );
    const ids = {
      imdb_id: data?.imdb_id || null,
      tmdb_id: data?.themoviedb_id || null,
      type: data?.type || null,
    };
    if (ids.imdb_id || ids.tmdb_id) idLookupCache.set(malId, ids);
    return ids;
  } catch {
    return null;
  }
}

async function persistHnembedIdsToQdrant(malId, { imdb_id, tmdb_id }) {
  if (!malId || (!imdb_id && !tmdb_id)) return;
  try {
    const { data } = await axios.post(
      `${process.env.QDRANT_URL}/collections/Anime/points`,
      { ids: [Number(malId)], with_payload: true },
      { headers: { "api-key": process.env.QDRANT_API_KEY }, timeout: 8000 }
    );
    const point = data?.result?.[0];
    if (!point) return;
    const existingSites = point?.payload?.Sites || {};
    const existingHn = existingSites?.hnembed || {};
    if (existingHn?.imdb_id === imdb_id && existingHn?.tmdb_id === tmdb_id) return;
    await axios.post(
      `${process.env.QDRANT_URL}/collections/Anime/points/payload`,
      {
        payload: {
          Sites: {
            ...existingSites,
            hnembed: {
              imdb_id: imdb_id || existingHn?.imdb_id || null,
              tmdb_id: tmdb_id || existingHn?.tmdb_id || null,
              lastSync: new Date().toISOString(),
            },
          },
        },
        points: [Number(malId)],
      },
      { headers: { "api-key": process.env.QDRANT_API_KEY }, timeout: 8000 }
    );
  } catch {}
}

function isMovie(type) {
  return type ? MOVIE_TYPES.has(String(type)) : false;
}

export async function GET(req, { params }) {
  const malId = params?.mal_id;
  const url = new URL(req.url);
  const ep = parseInt(url.searchParams.get("ep") || "1", 10);
  const preferTmdb = url.searchParams.get("prefer") === "tmdb";
  const forceKind = url.searchParams.get("kind");
  const HNEMBED_DEFAULT_SEASON = 1;

  if (!malId) {
    return NextResponse.json({ error: "mal_id required" }, { status: 400 });
  }

  const cacheKey = `hnembed-${malId}-${ep}-${preferTmdb ? "t" : "i"}-${forceKind || "auto"}`;
  const cached = responseCache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    let ids = await fetchExternalIdsFromQdrant(malId);
    let fromQdrant = ids?.cachedFromQdrant;

    if (!ids?.imdb_id && !ids?.tmdb_id) {
      const mapped = await fetchExternalIdsFromMapper(malId);
      if (mapped) ids = { ...ids, ...mapped, cachedFromQdrant: false };
    }

    if (!ids?.imdb_id && !ids?.tmdb_id) {
      return NextResponse.json(
        {
          error: "no_external_id",
          message: "No IMDB or TMDB mapping for this anime. The provider can't embed it.",
        },
        { status: 404 }
      );
    }

    if (!fromQdrant) {
      persistHnembedIdsToQdrant(malId, ids).catch(() => {});
    }

    const idForEmbed = preferTmdb
      ? ids.tmdb_id || ids.imdb_id
      : ids.imdb_id || ids.tmdb_id;
    const idType = idForEmbed === ids.imdb_id ? "imdb" : "tmdb";

    const kind = forceKind === "movie" || forceKind === "tv"
      ? forceKind
      : isMovie(ids.type)
        ? "movie"
        : "tv";

    const embedUrl =
      kind === "movie"
        ? `${HNEMBED_BASE}/movie/${idForEmbed}`
        : `${HNEMBED_BASE}/tv/${idForEmbed}/${HNEMBED_DEFAULT_SEASON}/${ep}`;

    const response = {
      type: "iframe",
      embedUrl,
      kind,
      idType,
      idValue: idForEmbed,
      episode: kind === "tv" ? ep : null,
      animeType: ids.type || null,
    };

    responseCache.set(cacheKey, response);
    return NextResponse.json(response);
  } catch (err) {
    console.error("v2/hnembed/embed error:", err?.message);
    return NextResponse.json(
      { error: "internal", message: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
