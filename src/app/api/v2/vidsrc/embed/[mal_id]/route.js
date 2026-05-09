import axios from "axios";
import { NextResponse } from "next/server";
import { LRUCache } from "lru-cache";
import { defaultCacheOptions } from "@/utils/lruCache";

const cache = new LRUCache({
  ...defaultCacheOptions,
  max: 500,
  ttl: 1000 * 60 * 60 * 24,
});

const VIDSRC_BASE = process.env.VIDSRC_BASE || "https://vidsrc.icu/embed/anime";

const anilistLookupCache = new LRUCache({
  ...defaultCacheOptions,
  max: 2000,
  ttl: 1000 * 60 * 60 * 24 * 7,
});

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
    console.error("VidSrc: mapper lookup failed:", err?.message);
    return null;
  }
}

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

async function persistAnilistIdToQdrant(malId, anilistId) {
  if (!malId || !anilistId) return;
  try {
    const fetchRes = await axios.post(
      `${process.env.QDRANT_URL}/collections/Anime/points`,
      { ids: [Number(malId)], with_payload: true },
      { headers: { "api-key": process.env.QDRANT_API_KEY } }
    );
    const point = fetchRes?.data?.result?.[0];
    if (!point) return;

    const existingSites = point?.payload?.Sites || {};
    if (existingSites?.vidsrc?.anilist_id === anilistId) return;

    const updatedSites = {
      ...existingSites,
      vidsrc: {
        ...(existingSites.vidsrc || {}),
        anilist_id: anilistId,
        lastSync: new Date().toISOString(),
      },
    };

    await axios.post(
      `${process.env.QDRANT_URL}/collections/Anime/points/payload`,
      { payload: { Sites: updatedSites }, points: [Number(malId)] },
      { headers: { "api-key": process.env.QDRANT_API_KEY } }
    );
  } catch (err) {
    console.error("VidSrc: Qdrant persist failed:", err?.message);
  }
}

export async function GET(req, { params }) {
  const malId = params?.mal_id;
  const url = new URL(req.url);
  const ep = parseInt(url.searchParams.get("ep") || "1", 10);
  const dubFlag = url.searchParams.get("dub");
  const dub = dubFlag === "1" || dubFlag === "true" ? 1 : 0;

  if (!malId) {
    return NextResponse.json({ error: "mal_id required" }, { status: 400 });
  }

  const cacheKey = `vidsrc-${malId}-${ep}-${dub}`;
  const cached = cache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    let anilistId = await resolveAnilistIdFromQdrant(malId);
    let fromQdrant = Boolean(anilistId);

    if (!anilistId) {
      anilistId = await resolveAnilistIdViaMapper(malId);
    }

    if (!anilistId) {
      return NextResponse.json(
        { error: "AniList ID not found for this anime" },
        { status: 404 }
      );
    }

    if (!fromQdrant) {
      persistAnilistIdToQdrant(malId, anilistId).catch(() => {});
    }

    const embedUrl = `${VIDSRC_BASE}/${anilistId}/${ep}/${dub}`;
    const response = {
      type: "iframe",
      embedUrl,
      anilistId,
      episode: ep,
      dub: Boolean(dub),
    };

    cache.set(cacheKey, response);
    return NextResponse.json(response);
  } catch (err) {
    console.error("v2/vidsrc/embed error:", err?.message);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
