import axios from "axios";
import { NextResponse } from "next/server";
import {LRUCache} from "lru-cache";

// Initialize LRU Cache (adjust max size and TTL as needed)
const cache = new LRUCache({
  max: 500,                  // max 500 items
  ttl: 1000 * 60 * 60,       // cache for 1 hour
});

export async function GET(req, { params }) {
  const episodeId = params.episodeId;

  if (!episodeId) {
    return NextResponse.json({ error: "Missing episodeId" }, { status: 400 });
  }

  const cacheKey = `animepahe-${episodeId}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const url = `${process.env.SCRAPER_URL}/anime/animepahe/watch?episodeId=${encodeURIComponent(episodeId)}`;
    console.log("Episode URL ->", url);
    
    const { data } = await axios.get(url);

    if (data) {
      cache.set(cacheKey, data);
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Episode not found" }, { status: 404 });

  } catch (error) {
    console.error("Error fetching episode info (animepahe):", error);
    return NextResponse.json(
      { error: `Error -> ${error?.response?.data || error.message}` },
      { status: error?.response?.status || 500 }
    );
  }
}
