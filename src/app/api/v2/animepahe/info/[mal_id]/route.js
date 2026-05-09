import axios from "axios";
import { NextResponse } from "next/server";
import { LRUCache } from "lru-cache";
import { defaultCacheOptions } from "@/utils/lruCache";
import getAnime from "@/app/api/v1/anime/[id]/mainFunction";
import {
  getOrFindAnimeSession,
  getPaheEpisodes,
  buildEpisodeId,
} from "../../paheAdapter";
import {
  persistPaheSessionToQdrant,
  getPaheSessionFromSites,
} from "../../paheQdrantSync";

const infoCache = new LRUCache({
  ...defaultCacheOptions,
  max: 200,
  ttl: 1000 * 60 * 30,
});

function shapeEpisodes(rawEpisodes, animeSession) {
  return (rawEpisodes || []).map((ep) => ({
    id: buildEpisodeId(animeSession, ep?.session),
    number: ep?.number,
    title: ep?.title || `Episode ${ep?.number}`,
    image: ep?.snapshot || null,
    snapshot: ep?.snapshot || null,
    session: ep?.session,
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
      animeData?.title_english || animeData?.title || sites?.animepahe?.paheTitle;

    let animeSession = getPaheSessionFromSites(sites);
    let pickedTitle = sites?.animepahe?.paheTitle || titleForSearch;
    let pickedId = sites?.animepahe?.sub || null;
    let foundFresh = false;

    if (!animeSession) {
      const { searchPaheByTitle } = await import("../../paheAdapter");
      const found = await searchPaheByTitle(titleForSearch);
      if (found?.session) {
        animeSession = found.session;
        pickedTitle = found.title;
        pickedId = found.id || pickedId;
        foundFresh = true;
      }
    }

    if (!animeSession) {
      return NextResponse.json(
        { error: "Anime not found on AnimePahe", episodes: [], totalEpisodes: 0 },
        { status: 404 }
      );
    }

    const rawEpisodes = await getPaheEpisodes(animeSession);
    const episodes = shapeEpisodes(rawEpisodes, animeSession);

    if (foundFresh && episodes.length > 0) {
      persistPaheSessionToQdrant({
        malId,
        animeSession,
        paheTitle: pickedTitle,
        paheId: pickedId,
      }).catch(() => {});
    }

    const response = {
      title: pickedTitle || titleForSearch,
      animeSession,
      episodes,
      totalEpisodes: episodes.length,
    };

    if (episodes.length > 0) infoCache.set(malId, response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("v2/animepahe/info error:", error?.message);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
