import axios from "axios";
import { NextResponse } from "next/server";
import { LRUCache } from "lru-cache";
import { defaultCacheOptions } from "@/utils/lruCache";
import { resolveSeasonNumber } from "@/app/api/v1/anime/[id]/seasonResolver";

const HNEMBED_BASE = process.env.HNEMBED_BASE || "https://hnmbed.cc/embed";

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

async function fetchPointFromQdrant(malId) {
  try {
    const { data } = await axios.post(
      `${process.env.QDRANT_URL}/collections/Anime/points`,
      { ids: [Number(malId)], with_payload: true },
      { headers: { "api-key": process.env.QDRANT_API_KEY }, timeout: 8000 }
    );
    return data?.result?.[0] || null;
  } catch {
    return null;
  }
}

function extractIdsFromPoint(point) {
  if (!point) return null;
  const sites = point?.payload?.Sites || {};
  const type = point?.payload?.type || null;
  return {
    imdb_id: sites?.imdb_id || sites?.hnembed?.imdb_id || null,
    tmdb_id: sites?.themoviedb_id || sites?.hnembed?.tmdb_id || null,
    type,
  };
}

function extractCachedSeason(point) {
  const cached = point?.payload?.Sites?.hnembed?.season;
  const n = Number(cached);
  return Number.isFinite(n) && n > 0 ? n : null;
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

function isMovie(type) {
  return type ? MOVIE_TYPES.has(String(type)) : false;
}

export async function GET(req, { params }) {
  const malId = params?.mal_id;
  const url = new URL(req.url);
  const ep = parseInt(url.searchParams.get("ep") || "1", 10);
  const preferTmdb = url.searchParams.get("prefer") === "tmdb";
  const forceKind = url.searchParams.get("kind");
  const seasonOverrideRaw = url.searchParams.get("season");
  const seasonOverride = seasonOverrideRaw ? parseInt(seasonOverrideRaw, 10) : null;

  if (!malId) {
    return NextResponse.json({ error: "mal_id required" }, { status: 400 });
  }

  const overrideKey = Number.isFinite(seasonOverride) && seasonOverride > 0
    ? `s${seasonOverride}`
    : "auto";
  const cacheKey = `hnembed-${malId}-${ep}-${preferTmdb ? "t" : "i"}-${forceKind || "auto"}-${overrideKey}`;
  const cached = responseCache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const point = await fetchPointFromQdrant(malId);
    let ids = extractIdsFromPoint(point);

    if (!ids?.imdb_id && !ids?.tmdb_id) {
      const mapped = await fetchExternalIdsFromMapper(malId);
      if (mapped) ids = { ...ids, ...mapped };
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

    const idForEmbed = preferTmdb
      ? ids.tmdb_id || ids.imdb_id
      : ids.imdb_id || ids.tmdb_id;
    const idType = idForEmbed === ids.imdb_id ? "imdb" : "tmdb";

    const kind = forceKind === "movie" || forceKind === "tv"
      ? forceKind
      : isMovie(ids.type)
        ? "movie"
        : "tv";

    let season = 1;
    let seasonSource = "default";
    if (kind === "tv") {
      if (Number.isFinite(seasonOverride) && seasonOverride > 0) {
        season = seasonOverride;
        seasonSource = "override";
      } else {
        // The /api/v1/anime/[id] sync persists Sites.hnembed.season — read it here.
        const cachedSeason = extractCachedSeason(point);
        if (cachedSeason) {
          season = cachedSeason;
          seasonSource = "qdrant";
        } else if (point?.payload) {
          // Fallback: anime predates the sync change, resolve once on the fly.
          // No persistence here — the next /api/v1/anime/[id] hit will cache it.
          try {
            season = await resolveSeasonNumber(malId, point.payload);
            seasonSource = "resolved";
          } catch {
            season = 1;
          }
        }
      }
    }

    const embedUrl =
      kind === "movie"
        ? `${HNEMBED_BASE}/movie/${idForEmbed}`
        : `${HNEMBED_BASE}/tv/${idForEmbed}/${season}/${ep}`;

    const response = {
      type: "iframe",
      embedUrl,
      kind,
      idType,
      idValue: idForEmbed,
      season: kind === "tv" ? season : null,
      seasonSource: kind === "tv" ? seasonSource : null,
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
