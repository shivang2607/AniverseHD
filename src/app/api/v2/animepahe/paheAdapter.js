import axios from "axios";
import { LRUCache } from "lru-cache";
import { defaultCacheOptions } from "@/utils/lruCache";

const sessionCache = new LRUCache({
  ...defaultCacheOptions,
  max: 500,
  ttl: 1000 * 60 * 60 * 6,
});

const episodesCache = new LRUCache({
  ...defaultCacheOptions,
  max: 200,
  ttl: 1000 * 60 * 15,
});

const sourcesCache = new LRUCache({
  ...defaultCacheOptions,
  max: 500,
  ttl: 1000 * 60 * 10,
});

const m3u8Cache = new LRUCache({
  ...defaultCacheOptions,
  max: 500,
  ttl: 1000 * 60 * 5,
});

function paheBase() {
  const url = process.env.PAL_ANIMEPAHE_URL;
  if (!url) throw new Error("PAL_ANIMEPAHE_URL env not set");
  return url.replace(/\/$/, "");
}

function normalizeTitle(t) {
  return (t || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export async function searchPaheByTitle(title) {
  if (!title) return null;
  const cacheKey = `pahe-search-${normalizeTitle(title)}`;
  const cached = sessionCache.get(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await axios.get(`${paheBase()}/search`, {
      params: { q: title },
      timeout: 20000,
    });
    const list = Array.isArray(data) ? data : data?.results || [];
    if (!list.length) return null;

    const target = normalizeTitle(title);
    const exact = list.find((it) => normalizeTitle(it?.title) === target);
    const picked = exact || list[0];
    if (picked?.session) sessionCache.set(cacheKey, picked);
    return picked;
  } catch (err) {
    console.error("Pal-droid search failed:", err?.message);
    return null;
  }
}

export async function getPaheEpisodes(animeSession) {
  if (!animeSession) return [];
  const cached = episodesCache.get(animeSession);
  if (cached) return cached;

  try {
    const { data } = await axios.get(`${paheBase()}/episodes`, {
      params: { session: animeSession },
      timeout: 25000,
    });
    const list = Array.isArray(data) ? data : data?.episodes || [];
    episodesCache.set(animeSession, list);
    return list;
  } catch (err) {
    console.error("Pal-droid episodes failed:", err?.message);
    return [];
  }
}

export async function getPaheSources(animeSession, episodeSession) {
  if (!animeSession || !episodeSession) return [];
  const key = `${animeSession}|${episodeSession}`;
  const cached = sourcesCache.get(key);
  if (cached) return cached;

  try {
    const { data } = await axios.get(`${paheBase()}/sources`, {
      params: {
        anime_session: animeSession,
        episode_session: episodeSession,
      },
      timeout: 25000,
    });
    const list = Array.isArray(data) ? data : data?.sources || [];
    sourcesCache.set(key, list);
    return list;
  } catch (err) {
    console.error("Pal-droid sources failed:", err?.message);
    return [];
  }
}

export async function resolveKwikToM3u8(kwikUrl) {
  if (!kwikUrl) return null;
  const cached = m3u8Cache.get(kwikUrl);
  if (cached) return cached;

  try {
    const { data } = await axios.get(`${paheBase()}/m3u8`, {
      params: { url: kwikUrl },
      timeout: 30000,
    });
    const m3u8 = data?.m3u8 || data?.url || null;
    if (m3u8) m3u8Cache.set(kwikUrl, m3u8);
    return m3u8;
  } catch (err) {
    console.error("Pal-droid m3u8 resolve failed:", err?.message);
    return null;
  }
}

function pickBestSource(sources, prefersDub = false) {
  if (!sources?.length) return null;

  const audioMatches = sources.filter((s) => {
    const aud = (s?.audio || "").toLowerCase();
    if (prefersDub) return aud.includes("eng") || aud.includes("dub");
    return aud.includes("jpn") || aud === "" || aud.includes("sub");
  });

  const pool = audioMatches.length ? audioMatches : sources;

  const qualityRank = (q) => {
    const n = parseInt(String(q || "").replace(/\D/g, ""), 10);
    return isNaN(n) ? 0 : n;
  };

  return [...pool].sort((a, b) => qualityRank(b?.quality) - qualityRank(a?.quality))[0];
}

export async function buildPaheStream(animeSession, episodeSession, prefersDub = false) {
  const sources = await getPaheSources(animeSession, episodeSession);
  if (!sources.length) return null;

  const picked = pickBestSource(sources, prefersDub);
  if (!picked?.url) return null;

  const m3u8 = await resolveKwikToM3u8(picked.url);
  if (!m3u8) return null;

  return {
    sources: sources.map((s) => ({
      url: s.url,
      quality: s.quality,
      isDub: (s?.audio || "").toLowerCase().includes("eng"),
      kwik: true,
    })),
    primary: {
      url: m3u8,
      type: "hls",
      quality: picked.quality,
      isDub: (picked?.audio || "").toLowerCase().includes("eng"),
    },
    headers: { Referer: "https://kwik.si/" },
  };
}

export function buildEpisodeId(animeSession, episodeSession) {
  return `${animeSession}::${episodeSession}`;
}

export function parseEpisodeId(combined) {
  if (!combined || !combined.includes("::")) {
    return { animeSession: null, episodeSession: combined || null };
  }
  const [animeSession, episodeSession] = combined.split("::");
  return { animeSession, episodeSession };
}

export async function getOrFindAnimeSession({ paheSession, title }) {
  if (paheSession) return paheSession;
  const found = await searchPaheByTitle(title);
  return found?.session || null;
}
