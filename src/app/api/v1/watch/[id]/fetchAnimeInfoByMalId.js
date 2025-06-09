// lib/fetchAnimepaheInfoByMalId.js

import axios from "axios";

export async function fetchAnimepaheInfoByMalId(malId, Sites) {

  if (!malId) throw new Error("No MAL ID provided.");

  try {
    // Step 1: Fetch animepahe ID from Sites, otherwise from mapper
    let animepaheId = null;
    if(Sites?.animepahe?.sub) {
        animepaheId = Sites.animepahe.sub;
        console.log("AnimePahe ID found in Sites:", animepaheId);
    }
    else{
    const mapRes = await axios.get(
      `${process.env.MAPPER_URL}/anime/mappings/mal_id/${malId}`
    );

    animepaheId = mapRes?.data?.animepahe?.sub || null;
    }

    if (!animepaheId) {
      throw new Error("Animepahe ID not found for this MAL ID.");
    }

    // Step 2: Fetch full animepahe info
    const infoUrl = `${process.env.SCRAPER_URL}/anime/animepahe/info/${animepaheId}`;
    console.log(`🔍 Fetching AnimePahe Info: ${infoUrl}`);

    const infoRes = await axios.get(infoUrl);
    return infoRes?.data;
  } catch (error) {
    console.error("❌ Failed to fetch AnimePahe info:", error?.message);
    throw new Error(
      error?.response?.data?.error || error.message || "Unknown error"
    );
  }
}
