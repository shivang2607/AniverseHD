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

async function getEpisodeCount(malId, animeData) {
  if (animeData?.episodes && animeData.episodes > 0) return animeData.episodes;
  try {
    const r = await jikan.loadAnime(malId, "full");
    return r?.data?.episodes || 1;
  } catch {
    return 1;
  }
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

    const totalEpisodes = await getEpisodeCount(malId, animeData);
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
