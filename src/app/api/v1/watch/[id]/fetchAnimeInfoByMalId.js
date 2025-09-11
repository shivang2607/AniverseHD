// lib/fetchAnimepaheInfoByMalId.js

import { defaultCacheOptions } from "@/utils/lruCache";
import axios from "axios";
import { LRUCache } from "lru-cache";

// LRU cache config
const animepaheInfoCache = new LRUCache({
  ...defaultCacheOptions,
  max: 100,
  ttl: 1000 * 60 * 15, // 15 minutes
});

export async function fetchAnimepaheInfoByMalId(malId, Sites) {
  if (!malId){
    console.warn("No MAL ID Provided in fetchAnimepaheInfoByMalId!");
    return null;
  }

  const cacheKey = `animepahe-info-${malId}`;
  const cached = animepaheInfoCache.get(cacheKey);
  if (cached) {
    console.log("✅ LRU Cache hit for Animepahe info:", malId);
    console.log("Cached data:", cached);
    return cached;
  }

  try {
    // Step 1: Get AnimePahe ID
    let animepaheId = null;

    if (Sites?.animepahe?.sub !== null) {
      animepaheId = Sites.animepahe.sub;
    } else {
      const mapRes = await axios.get(
        `${process.env.MAPPER_URL}/anime/mappings/mal_id/${malId}`
      );
      animepaheId = mapRes?.data?.animepahe?.sub || null;
    }

    if (!animepaheId) {
      console.log("Animepahe ID not found for this MAL ID =>", malId);
    }

    // Step 2: Fetch AnimePahe info
    const infoUrl = `${process.env.SCRAPER_URL}/anime/animepahe/info/${animepaheId}`;
    const infoRes = await axios.get(infoUrl);

    if (infoRes?.data) {
      animepaheInfoCache.set(cacheKey, infoRes.data);
      return infoRes.data;
    } else {
      console.error("Animepahe info not found.");
      return null;
    }
  } catch (error) {
    console.error("❌ Failed to fetch AnimePahe info:", error?.message);
    return null
  }
}
