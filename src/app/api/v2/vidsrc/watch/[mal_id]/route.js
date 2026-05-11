import { NextResponse } from "next/server";
import { LRUCache } from "lru-cache";
import axios from "axios";
import jikan from "@mateoaranda/jikanjs";
import { defaultCacheOptions } from "@/utils/lruCache";
import getAnime from "@/app/api/v1/anime/[id]/mainFunction";

const cache = new LRUCache({
  ...defaultCacheOptions,
  max: 200,
  ttl: 1000 * 60 * 30,
});

async function resolveAnilistId(malId, sites) {
  if (sites?.vidsrc?.anilist_id) return sites.vidsrc.anilist_id;
  if (sites?.anilist_id) return sites.anilist_id;
  if (sites?.AniList?.sub) return sites.AniList.sub;
  try {
    const { data } = await axios.get(
      `${process.env.MAPPER_URL}/anime/mappings/mal_id/${malId}`,
      { timeout: 15000 }
    );
    return data?.anilist_id || null;
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
    await axios.post(
      `${process.env.QDRANT_URL}/collections/Anime/points/payload`,
      {
        payload: {
          Sites: {
            ...existingSites,
            vidsrc: {
              ...(existingSites.vidsrc || {}),
              anilist_id: anilistId,
              lastSync: new Date().toISOString(),
            },
          },
        },
        points: [Number(malId)],
      },
      { headers: { "api-key": process.env.QDRANT_API_KEY } }
    );
  } catch {}
}

async function getJikanEpisodeCount(malId) {
  // Jikan's /anime/{id}/episodes is paginated (100 per page) and exposes the
  // real episode count even when /anime/{id}/full returns episodes:null. This
  // is the canonical MAL source for shows like One Piece, Detective Conan, etc.
  // where the show is ongoing and the "total episodes" field isn't set.
  try {
    // Hit the last page hint via page=1; Jikan returns pagination.last_visible_page.
    const { data } = await axios.get(
      `https://api.jikan.moe/v4/anime/${malId}/episodes`,
      { params: { page: 1 }, timeout: 12000 }
    );
    const lastPage = Number(data?.pagination?.last_visible_page) || 0;
    const pageSize = Array.isArray(data?.data) ? data.data.length : 0;
    if (lastPage <= 0 || pageSize <= 0) return null;

    // If only one page, the page itself is the full count.
    if (lastPage === 1) return pageSize;

    // For >1 page, fetch the last page to get its real size and combine.
    try {
      const { data: lastData } = await axios.get(
        `https://api.jikan.moe/v4/anime/${malId}/episodes`,
        { params: { page: lastPage }, timeout: 12000 }
      );
      const lastPageSize = Array.isArray(lastData?.data) ? lastData.data.length : 0;
      const total = (lastPage - 1) * 100 + lastPageSize;
      return total > 0 ? total : null;
    } catch {
      // Couldn't reach last page — fall back to an upper-bound estimate from
      // page count alone. Slight overcount (up to 99) is fine; better than 1.
      return lastPage * 100;
    }
  } catch {
    return null;
  }
}

function estimateAiredEpisodes(animeData) {
  // For shows with no fixed episode count (One Piece, Detective Conan, etc.)
  // and shows still airing, MAL/Jikan often returns episodes:null. Falling back
  // to 1 hides hundreds/thousands of real episodes. Estimate from air start date
  // assuming weekly cadence — that's the cadence for the vast majority of TV
  // anime, and the few non-weekly shows just get a slightly looser upper bound
  // (still better than rendering a single episode card).
  const fromStr = animeData?.aired?.from || animeData?.aired?.prop?.from
    ? animeData.aired.from
    : null;
  const fromDate = fromStr ? new Date(fromStr) : null;
  if (!fromDate || Number.isNaN(fromDate.getTime())) return null;
  const weeks = Math.floor((Date.now() - fromDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
  if (!Number.isFinite(weeks) || weeks < 1) return null;
  // Cap at 1500 to avoid runaway numbers for very old long-runners; that still
  // covers everything up to early-2030s One Piece.
  return Math.min(weeks + 2, 1500);
}

async function getEpisodeCount(malId, animeData) {
  if (animeData?.episodes && animeData.episodes > 0) {
    return { count: animeData.episodes, estimated: false };
  }

  let jikanFull = null;
  try {
    const r = await jikan.loadAnime(malId, "full");
    jikanFull = r?.data || null;
    if (jikanFull?.episodes && jikanFull.episodes > 0) {
      return { count: jikanFull.episodes, estimated: false };
    }
  } catch {}

  // MAL's "total episodes" is null — usually an ongoing show. Jikan's paginated
  // /episodes endpoint still knows the real aired count even when the summary
  // field is empty, so try that next. This is the canonical source for One Piece,
  // Detective Conan, and other long-runners.
  const jikanPaged = await getJikanEpisodeCount(malId);
  if (jikanPaged && jikanPaged > 0) {
    return { count: jikanPaged, estimated: false };
  }

  // Jikan didn't help (rate limit, network) — fall back to estimating from air
  // start date assuming weekly cadence.
  const merged = { ...(animeData || {}), ...(jikanFull || {}) };
  const estimated = estimateAiredEpisodes(merged);
  if (estimated) return { count: estimated, estimated: true };

  // Last resort: 12 (one cour). Better than 1 — at least gives the user a list
  // to pick from, and they can use the manual episode input for anything beyond.
  return { count: 12, estimated: true };
}

export async function GET(req, { params }) {
  const malId = params?.mal_id;
  if (!malId) return NextResponse.json({ error: "mal_id required" }, { status: 400 });

  const cached = cache.get(malId);
  if (cached) return NextResponse.json(cached);

  try {
    let animeData = null;
    try {
      animeData = await getAnime(malId);
    } catch (err) {
      console.error("vidsrc/watch: getAnime failed, continuing with jikan-only:", err?.message);
    }

    const sites = animeData?.Sites || {};
    let anilistId = await resolveAnilistId(malId, sites);
    if (anilistId && !sites?.vidsrc?.anilist_id) {
      persistAnilistIdToQdrant(malId, anilistId).catch(() => {});
    }

    if (!anilistId) {
      return NextResponse.json(
        { error: "AniList ID not found for this anime" },
        { status: 404 }
      );
    }

    const { count: totalEpisodes, estimated: episodesEstimated } = await getEpisodeCount(malId, animeData);
    const episodeList = Array.from({ length: totalEpisodes }, (_, i) => ({
      number: i + 1,
      id: String(i + 1),
      title: `Episode ${i + 1}`,
    }));

    const response = {
      malId,
      anilistId,
      title: animeData?.title || "",
      title_english: animeData?.title_english || "",
      synopsis: animeData?.synopsis || "",
      images: animeData?.images || {},
      main_picture: animeData?.main_picture || "",
      genres: animeData?.genres || [],
      themes: animeData?.themes || [],
      type: animeData?.type || "",
      score: animeData?.score || 0,
      aired: animeData?.aired || {},
      airing: animeData?.airing || false,
      duration: animeData?.duration || "",
      rating: animeData?.rating || "",
      start_year: animeData?.start_year || "",
      episodes: totalEpisodes,
      totalEpisodes,
      episodesEstimated,
      episodeList,
    };

    cache.set(malId, response);
    return NextResponse.json(response);
  } catch (err) {
    console.error("v2/vidsrc/watch error:", err?.message);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
