import axios from "axios";
import { NextResponse } from "next/server";
import { LRUCache } from "lru-cache";
import { defaultCacheOptions } from "@/utils/lruCache";

const TRYEMBED_BASE = process.env.TRYEMBED_BASE || "https://tryembed.us.cc/embed/anime";

const cache = new LRUCache({
  ...defaultCacheOptions,
  max: 1000,
  ttl: 1000 * 60 * 60 * 24,
});

const anilistLookupCache = new LRUCache({
  ...defaultCacheOptions,
  max: 2000,
  ttl: 1000 * 60 * 60 * 24 * 7,
});

async function resolveAnilistIdFromQdrant(malId) {
  try {
    const { data } = await axios.post(
      `${process.env.QDRANT_URL}/collections/Anime/points`,
      { ids: [Number(malId)], with_payload: true },
      { headers: { "api-key": process.env.QDRANT_API_KEY }, timeout: 8000 }
    );
    const sites = data?.result?.[0]?.payload?.Sites || {};
    return sites?.vidsrc?.anilist_id || sites?.anilist_id || null;
  } catch {
    return null;
  }
}

async function resolveAnilistIdViaMapper(malId) {
  const cached = anilistLookupCache.get(malId);
  if (cached) return cached;
  try {
    const { data } = await axios.get(
      `${process.env.MAPPER_URL}/anime/mappings/mal_id/${malId}`,
      { timeout: 15000 }
    );
    const id = data?.anilist_id || null;
    if (id) anilistLookupCache.set(malId, id);
    return id;
  } catch (err) {
    console.error("TryEmbed: mapper lookup failed:", err?.message);
    return null;
  }
}

export async function GET(req, { params }) {
  const malId = params?.mal_id;
  const url = new URL(req.url);
  const ep = parseInt(url.searchParams.get("ep") || "1", 10);
  const dubFlag = url.searchParams.get("dub");
  const dub = dubFlag === "1" || dubFlag === "true";
  const startAt = parseInt(url.searchParams.get("t") || "0", 10);

  if (!malId) {
    return NextResponse.json({ error: "mal_id required" }, { status: 400 });
  }

  const epNum = Number.isFinite(ep) && ep > 0 ? ep : 1;
  const audio = dub ? "dub" : "sub";

  // Don't cache responses that include a startAt timestamp — the URL is unique per position.
  const cacheKey = startAt > 0 ? null : `tryembed-${malId}-${epNum}-${audio}`;
  if (cacheKey) {
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json(cached);
  }

  try {
    let anilistId = await resolveAnilistIdFromQdrant(malId);
    if (!anilistId) {
      anilistId = await resolveAnilistIdViaMapper(malId);
    }

    if (!anilistId) {
      return NextResponse.json(
        { error: "AniList ID not found for this anime" },
        { status: 404 }
      );
    }

    const queryParams = new URLSearchParams({
      autoplay: "true",
      autoSkip: "true",
    });
    if (startAt > 0) queryParams.set("startAt", String(startAt));

    const embedUrl = `${TRYEMBED_BASE}/${anilistId}/${epNum}/${audio}?${queryParams.toString()}`;

    const response = {
      type: "iframe",
      embedUrl,
      anilistId,
      episode: epNum,
      dub,
      audio,
    };

    if (cacheKey) cache.set(cacheKey, response);
    return NextResponse.json(response);
  } catch (err) {
    console.error("v2/tryembed/embed error:", err?.message);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
