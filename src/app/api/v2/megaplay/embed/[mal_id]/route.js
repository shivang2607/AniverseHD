import { NextResponse } from "next/server";
import { LRUCache } from "lru-cache";
import { defaultCacheOptions } from "@/utils/lruCache";

const MEGAPLAY_BASE = process.env.MEGAPLAY_BASE || "https://megaplay.buzz/stream/mal";

const cache = new LRUCache({
  ...defaultCacheOptions,
  max: 1000,
  ttl: 1000 * 60 * 60 * 24,
});

export async function GET(req, { params }) {
  const malId = params?.mal_id;
  const url = new URL(req.url);
  const ep = parseInt(url.searchParams.get("ep") || "1", 10);
  const dubFlag = url.searchParams.get("dub");
  const dub = dubFlag === "1" || dubFlag === "true";
  const language = dub ? "dub" : "sub";

  if (!malId) {
    return NextResponse.json({ error: "mal_id required" }, { status: 400 });
  }

  const epNum = Number.isFinite(ep) && ep > 0 ? ep : 1;
  const cacheKey = `megaplay-${malId}-${epNum}-${language}`;
  const cached = cache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  const embedUrl = `${MEGAPLAY_BASE}/${malId}/${epNum}/${language}`;
  const response = {
    type: "iframe",
    embedUrl,
    malId: String(malId),
    episode: epNum,
    dub,
    language,
  };

  cache.set(cacheKey, response);
  return NextResponse.json(response);
}
