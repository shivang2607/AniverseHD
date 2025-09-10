// lib/fetchAnimepaheEpisode.ts

import axios from "axios";
import { LRUCache } from "lru-cache";

// LRU cache config
const episodeCache = new LRUCache({
  max: 100,
  ttl: 1000 * 60 * 15, // 15 minutes
});

export async function fetchAnimepaheEpisode(episodeId) {
  if (!episodeId) {
    throw new Error("No episodeId provided.");
  }

  const cacheKey = `animepahe-ep-${episodeId}`;
  const cached = episodeCache.get(cacheKey);
  if (cached) {
    console.log("✅ LRU Cache hit for Animepahe episode:", episodeId);
    return cached;
  }

  try {
    const response = await axios.get(
      `${process.env.SCRAPER_URL}/anime/animepahe/watch?episodeId=${episodeId}`
    );

    if (response?.data) {
      episodeCache.set(cacheKey, response.data);
      return response.data;
    } else {
      throw new Error("Episode not found.");
    }
  } catch (error) {
    console.error("❌ Error fetching episode info (animepahe) (from function):", error?.message);
    throw new Error(
      `Failed to fetch episode ${episodeId}: ${error?.response?.data || error.message}`
    );
  }
}
