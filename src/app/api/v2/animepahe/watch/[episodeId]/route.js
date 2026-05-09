import { NextResponse } from "next/server";
import { LRUCache } from "lru-cache";
import { defaultCacheOptions } from "@/utils/lruCache";
import { buildPaheStream, parseEpisodeId } from "../../paheAdapter";

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

  let { animeSession, episodeSession } = parseEpisodeId(raw);

  if (!animeSession) {
    animeSession = url.searchParams.get("animeSession");
    episodeSession = raw;
  }

  if (!animeSession || !episodeSession) {
    return NextResponse.json(
      { error: "Missing animeSession or episodeSession" },
      { status: 400 }
    );
  }

  const prefersDub = dubFlag === "1" || dubFlag === "true";
  const cacheKey = `${animeSession}|${episodeSession}|${prefersDub ? "dub" : "sub"}`;
  const cached = watchCache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const stream = await buildPaheStream(animeSession, episodeSession, prefersDub);
    if (!stream?.primary?.url) {
      return NextResponse.json(
        { error: "No stream resolved", sources: [], tracks: [] },
        { status: 404 }
      );
    }

    const response = {
      sources: [
        {
          url: stream.primary.url,
          type: stream.primary.type,
          quality: stream.primary.quality,
          isDub: stream.primary.isDub,
        },
      ],
      qualities: stream.sources,
      tracks: [],
      intro: null,
      outro: null,
      headers: stream.headers,
    };

    watchCache.set(cacheKey, response);
    return NextResponse.json(response);
  } catch (err) {
    console.error("v2/animepahe/watch error:", err?.message);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
