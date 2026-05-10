import { NextResponse } from "next/server";
import { LRUCache } from "lru-cache";
import { defaultCacheOptions } from "@/utils/lruCache";
import getAnime from "@/app/api/v1/anime/[id]/mainFunction";
import {
  searchAllAnimeByTitle,
  getAllAnimeEpisodes,
  buildAllAnimeEpisodeId,
} from "../../allAnimeAdapter";
import {
  persistAllAnimeShowToQdrant,
  getAllAnimeShowFromSites,
} from "../../allAnimeQdrantSync";

const infoCache = new LRUCache({
  ...defaultCacheOptions,
  max: 200,
  ttl: 1000 * 60 * 30,
});

function shapeEpisodes(epList, showId) {
  // AllAnime returns episode strings like "1", "2", "3.5", etc.
  // Sort numerically ascending.
  const sorted = [...epList].sort((a, b) => parseFloat(a) - parseFloat(b));
  return sorted.map((epStr, i) => ({
    id: buildAllAnimeEpisodeId(showId, epStr),
    number: parseFloat(epStr),
    episodeIndex: i + 1,
    title: `Episode ${epStr}`,
    image: null,
    snapshot: null,
    episodeString: epStr,
  }));
}

export async function GET(req, { params }) {
  const malId = params?.mal_id;
  if (!malId) {
    return NextResponse.json({ error: "mal_id required" }, { status: 400 });
  }

  const cached = infoCache.get(malId);
  if (cached) return NextResponse.json(cached);

  try {
    const animeData = await getAnime(malId);
    const sites = animeData?.Sites || {};
    const titleForSearch =
      animeData?.title_english || animeData?.title || sites?.allanime?.title;

    let showId = getAllAnimeShowFromSites(sites);
    let pickedTitle = sites?.allanime?.title || titleForSearch;
    let foundFresh = false;

    if (!showId) {
      const found = await searchAllAnimeByTitle(titleForSearch);
      if (found?._id) {
        showId = found._id;
        pickedTitle = found?.englishName || found?.name || pickedTitle;
        foundFresh = true;
      }
    }

    if (!showId) {
      return NextResponse.json(
        { error: "Anime not found on AllAnime", episodes: [], totalEpisodes: 0 },
        { status: 404 }
      );
    }

    const epDetail = await getAllAnimeEpisodes(showId);
    const subEps = epDetail?.sub || [];
    const dubEps = epDetail?.dub || [];
    const rawEps = epDetail?.raw || [];
    // Use sub list for primary episode count; dub availability tracked separately.
    const primary = subEps.length ? subEps : rawEps.length ? rawEps : dubEps;

    const episodes = shapeEpisodes(primary, showId);

    if (foundFresh && episodes.length > 0) {
      persistAllAnimeShowToQdrant({
        malId,
        showId,
        title: pickedTitle,
      }).catch(() => {});
    }

    const response = {
      title: pickedTitle || titleForSearch,
      showId,
      episodes,
      totalEpisodes: episodes.length,
      hasSub: subEps.length > 0,
      hasDub: dubEps.length > 0,
    };

    if (episodes.length > 0) infoCache.set(malId, response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("v2/allanime/info error:", error?.message);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
