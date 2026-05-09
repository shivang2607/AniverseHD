import { defaultCacheOptions } from "@/utils/lruCache";
import axios from "axios";
import { LRUCache } from "lru-cache";
import { NextResponse } from "next/server";

const option = {
  ...defaultCacheOptions,
  max: 100,
  ttl: 1000 * 60 * 1, // 1 min
};
const zoroCache = new LRUCache(option);

function formatStreamingResponse(data) {
  const stream = data?.streamingLink || {};
  return {
    sources: stream.link
      ? [{ url: stream.link.file, type: stream.link.type }]
      : [{ url: null, type: null }],
    tracks: stream.tracks || [],
    intro: stream.intro || null,
    outro: stream.outro || null,
    headers: stream?.headers || null,
  };
}

export async function GET(req, { params }) {
  const id = params.episodeId;
  const searchParams = req.nextUrl.searchParams;
  const ep = searchParams.get("ep");
  const server = searchParams.get("server") || "";
  const type = searchParams.get("type") || "sub";

  const episodeId = `${id}?ep=${ep}`;
  const cacheKey = `zoro-${episodeId}-${server}-${type}`;

  const cachedData = zoroCache.get(cacheKey);
  if (cachedData) {
    console.log("LRU Cache hit for Zoro V2 streaming api");
    return NextResponse.json(cachedData);
  }

  try {
    const url = `${process.env.ZORO_SCRAPER_URL}/api/stream?id=${episodeId}&server=${server}&type=${type}`;
    console.log("Url of zoro_scraper_url", url);
    console.log(url);

    const res = await axios.get(url);
    const results = res?.data?.results;

    if (results) {
      const formatted = formatStreamingResponse(results);
      zoroCache.set(cacheKey, formatted);
      return NextResponse.json(formatted);
    }

    return NextResponse.json({
      sources: [],
      tracks: [],
      intro: null,
      outro: null,
      headers: null,
    });
  } catch (error) {
    console.error("Zoro stream fetch failed", error);
    return NextResponse.json({
      error: true,
      message: error?.response?.data?.message || "Internal Server Error",
      status: error?.response?.status || 500,
    });
  }
}
