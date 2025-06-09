// lib/fetchAnimepaheEpisode.ts

import axios from "axios";

export async function fetchAnimepaheEpisode(episodeId) {
  if (!episodeId) {
    throw new Error("No episodeId provided.");
  }

  try {
    const response = await axios.get(
      `${process.env.SCRAPER_URL}/anime/animepahe/watch?episodeId=${episodeId}`
    );

    if (response?.data) {
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
