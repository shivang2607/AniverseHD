import { defaultCacheOptions } from "@/utils/lruCache";
import { LRUCache } from "lru-cache";
import {
  buildEpisodeId,
  getPaheEpisodes,
  searchPaheByTitle,
} from "@/app/api/v2/animepahe/paheAdapter";
import {
  getPaheSessionFromSites,
  persistPaheSessionToQdrant,
} from "@/app/api/v2/animepahe/paheQdrantSync";

const animepaheInfoCache = new LRUCache({
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

export async function fetchAnimepaheInfoByMalId(malId, Sites, animeMeta = {}) {
  if (!malId) {
    console.warn("No MAL ID Provided in fetchAnimepaheInfoByMalId!");
    return null;
  }

  const cacheKey = `animepahe-info-${malId}`;
  const cached = animepaheInfoCache.get(cacheKey);
  if (cached) {
    console.log("LRU Cache hit for AnimePahe info:", malId);
    return cached;
  }

  try {
    let animeSession = getPaheSessionFromSites(Sites);
    let pickedTitle = Sites?.animepahe?.paheTitle || null;
    let pickedId = Sites?.animepahe?.sub || null;
    let foundFresh = false;

    if (!animeSession) {
      const titleForSearch =
        animeMeta?.title_english || animeMeta?.title || pickedTitle;
      const found = await searchPaheByTitle(titleForSearch);
      if (found?.session) {
        animeSession = found.session;
        pickedTitle = found.title || titleForSearch;
        pickedId = found.id || pickedId;
        foundFresh = true;
      }
    }

    if (!animeSession) {
      console.log("AnimePahe session not resolvable for MAL ID:", malId);
      return null;
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

    const result = {
      title: pickedTitle,
      animeSession,
      episodes,
      totalEpisodes: episodes.length,
    };

    if (episodes.length > 0) animepaheInfoCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Failed to fetch AnimePahe info:", error?.message);
    return null;
  }
}
