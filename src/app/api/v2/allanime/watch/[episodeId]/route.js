import { NextResponse } from "next/server";
import { LRUCache } from "lru-cache";
import { defaultCacheOptions } from "@/utils/lruCache";
import {
  buildAllAnimeStream,
  parseAllAnimeEpisodeId,
} from "../../allAnimeAdapter";

const watchCache = new LRUCache({
  ...defaultCacheOptions,
  max: 300,
  ttl: 1000 * 60 * 5,
});

export async function GET(req, { params }) {
  const raw = decodeURIComponent(params?.episodeId || "");
  const url = new URL(req.url);
  const dubFlag = url.searchParams.get("dub");

  if (!raw) {
    return NextResponse.json({ error: "episodeId required" }, { status: 400 });
  }

  const { showId, episode } = parseAllAnimeEpisodeId(raw);
  if (!showId || !episode) {
    return NextResponse.json(
      { error: "Missing showId or episode" },
      { status: 400 }
    );
  }

  const prefersDub = dubFlag === "1" || dubFlag === "true";
  const cacheKey = `${showId}|${episode}|${prefersDub ? "dub" : "sub"}`;
  const cached = watchCache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const stream = await buildAllAnimeStream({ showId, episode, prefersDub });
    if (!stream?.sources?.[0]?.url) {
      return NextResponse.json(
        { error: "No stream resolved", sources: [], tracks: [] },
        { status: 404 }
      );
    }

    watchCache.set(cacheKey, stream);
    return NextResponse.json(stream);
  } catch (err) {
    console.error("v2/allanime/watch error:", err?.message);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
