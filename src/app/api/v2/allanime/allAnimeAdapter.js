import axios from "axios";
import { LRUCache } from "lru-cache";
import { defaultCacheOptions } from "@/utils/lruCache";

const ALLANIME_API = process.env.ALLANIME_API || "https://api.allanime.day/api";
const ALLANIME_REFERER = process.env.ALLANIME_REFERER || "https://allmanga.to";
const ALLANIME_BASE = process.env.ALLANIME_BASE || "https://allanime.day";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const searchCache = new LRUCache({ ...defaultCacheOptions, max: 500, ttl: 1000 * 60 * 60 * 6 });
const episodesCache = new LRUCache({ ...defaultCacheOptions, max: 200, ttl: 1000 * 60 * 15 });
const sourcesCache = new LRUCache({ ...defaultCacheOptions, max: 500, ttl: 1000 * 60 * 10 });
const m3u8Cache = new LRUCache({ ...defaultCacheOptions, max: 500, ttl: 1000 * 60 * 5 });

const SEARCH_QUERY = `
  query($search: SearchInput, $limit: Int, $page: Int, $translationType: VaildTranslationTypeEnumType, $countryOrigin: VaildCountryOriginEnumType) {
    shows(search: $search, limit: $limit, page: $page, translationType: $translationType, countryOrigin: $countryOrigin) {
      edges {
        _id
        name
        englishName
        nativeName
        availableEpisodes
        season { quarter year }
      }
    }
  }
`;

const EPISODES_QUERY = `
  query($showId: String!) {
    show(_id: $showId) {
      _id
      name
      availableEpisodesDetail
    }
  }
`;

const SOURCES_QUERY = `
  query($showId: String!, $translationType: VaildTranslationTypeEnumType!, $episodeString: String!) {
    episode(showId: $showId, translationType: $translationType, episodeString: $episodeString) {
      episodeString
      sourceUrls
    }
  }
`;

function normalizeTitle(t) {
  return (t || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

async function gql(query, variables) {
  try {
    const { data } = await axios.get(ALLANIME_API, {
      params: {
        variables: JSON.stringify(variables),
        query,
      },
      headers: {
        Referer: ALLANIME_REFERER,
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
      timeout: 20000,
    });
    if (data?.errors) {
      console.error("AllAnime GraphQL error:", data.errors);
      return null;
    }
    return data?.data || null;
  } catch (err) {
    console.error("AllAnime GraphQL request failed:", err?.message);
    return null;
  }
}

export async function searchAllAnimeByTitle(title, { translationType = "sub" } = {}) {
  if (!title) return null;
  const key = `aa-search-${normalizeTitle(title)}-${translationType}`;
  const cached = searchCache.get(key);
  if (cached) return cached;

  const data = await gql(SEARCH_QUERY, {
    search: { allowAdult: false, allowUnknown: false, query: title },
    limit: 20,
    page: 1,
    translationType,
    countryOrigin: "ALL",
  });

  const edges = data?.shows?.edges || [];
  if (!edges.length) return null;

  const target = normalizeTitle(title);
  const exact = edges.find(
    (e) =>
      normalizeTitle(e?.name) === target ||
      normalizeTitle(e?.englishName) === target ||
      normalizeTitle(e?.nativeName) === target
  );
  const picked = exact || edges[0];
  if (picked?._id) searchCache.set(key, picked);
  return picked;
}

export async function getAllAnimeEpisodes(showId) {
  if (!showId) return null;
  const cached = episodesCache.get(showId);
  if (cached) return cached;

  const data = await gql(EPISODES_QUERY, { showId });
  const detail = data?.show?.availableEpisodesDetail || {};
  const result = {
    name: data?.show?.name || null,
    sub: Array.isArray(detail?.sub) ? detail.sub : [],
    dub: Array.isArray(detail?.dub) ? detail.dub : [],
    raw: Array.isArray(detail?.raw) ? detail.raw : [],
  };
  episodesCache.set(showId, result);
  return result;
}

// AllAnime obfuscates source URLs by XOR-ing each pair of hex chars against 0x79.
// The string is prefixed with "--" and consists of hex pairs after that.
function decodeSourceUrl(encoded) {
  if (!encoded || typeof encoded !== "string") return null;
  let s = encoded;
  if (s.startsWith("--")) s = s.slice(2);
  if (s.length % 2 !== 0) return null;

  let out = "";
  for (let i = 0; i < s.length; i += 2) {
    const byte = parseInt(s.substr(i, 2), 16);
    if (Number.isNaN(byte)) return null;
    out += String.fromCharCode(byte ^ 0x79);
  }
  // The decoded URL often points to /apivtwo/clock?id=... — they want it called as
  // /apivtwo/clock.json?id=... when fetching the resolved clip data.
  return out.replace("/clock?", "/clock.json?");
}

async function fetchClipFromSourceUrl(sourceUrl) {
  if (!sourceUrl) return null;
  let url = sourceUrl;
  if (url.startsWith("/")) url = `${ALLANIME_BASE}${url}`;
  try {
    const { data } = await axios.get(url, {
      headers: {
        Referer: ALLANIME_REFERER,
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
      timeout: 20000,
    });
    return data || null;
  } catch (err) {
    return null;
  }
}

function pickFromClip(clip) {
  // Clip shape varies per provider. Common: { links: [{ link, hls, mp4, src, resolutionStr }] }
  const links = clip?.links || [];
  if (!Array.isArray(links) || !links.length) return null;

  // Prefer m3u8 / hls
  const hls = links.find((l) => l?.hls === true || /\.m3u8/i.test(l?.link || l?.src || ""));
  if (hls) return { url: hls.link || hls.src, type: "hls", quality: hls.resolutionStr || null };

  // Fall back to mp4
  const mp4 = links.find((l) => l?.mp4 === true || /\.mp4/i.test(l?.link || l?.src || ""));
  if (mp4) return { url: mp4.link || mp4.src, type: "mp4", quality: mp4.resolutionStr || null };

  // Last resort: first link
  const first = links[0];
  if (first?.link || first?.src) {
    return { url: first.link || first.src, type: "auto", quality: first.resolutionStr || null };
  }
  return null;
}

// providerName priority — these are the "internal" provider tags AllAnime returns.
// Order roughly by reliability.
const PROVIDER_PRIORITY = ["wixmp", "Default", "Sak", "S-mp4", "Luf-mp4", "Yt-mp4", "Kir", "Mp4"];

export async function buildAllAnimeStream({ showId, episode, prefersDub = false }) {
  if (!showId || !episode) return null;
  const translationType = prefersDub ? "dub" : "sub";
  const cacheKey = `${showId}|${episode}|${translationType}`;
  const cached = sourcesCache.get(cacheKey);
  if (cached) return cached;

  const data = await gql(SOURCES_QUERY, {
    showId,
    translationType,
    episodeString: String(episode),
  });
  const rawSources = data?.episode?.sourceUrls || [];
  if (!rawSources.length) return null;

  // Decode and rank
  const decoded = rawSources
    .map((s) => ({
      raw: s,
      providerName: s?.sourceName || s?.type || "unknown",
      priority: typeof s?.priority === "number" ? s.priority : 0,
      decodedUrl: decodeSourceUrl(s?.sourceUrl),
    }))
    .filter((s) => s.decodedUrl);

  decoded.sort((a, b) => {
    const ai = PROVIDER_PRIORITY.indexOf(a.providerName);
    const bi = PROVIDER_PRIORITY.indexOf(b.providerName);
    const an = ai === -1 ? 999 : ai;
    const bn = bi === -1 ? 999 : bi;
    if (an !== bn) return an - bn;
    return (b.priority || 0) - (a.priority || 0);
  });

  for (const candidate of decoded) {
    const clipKey = `clip-${candidate.decodedUrl}`;
    let clip = m3u8Cache.get(clipKey);
    if (!clip) {
      clip = await fetchClipFromSourceUrl(candidate.decodedUrl);
      if (clip) m3u8Cache.set(clipKey, clip);
    }
    const picked = clip ? pickFromClip(clip) : null;
    if (picked?.url) {
      const result = {
        sources: [
          {
            url: picked.url,
            type: picked.type,
            quality: picked.quality,
            isDub: prefersDub,
          },
        ],
        tracks: [],
        intro: null,
        outro: null,
        headers: { Referer: ALLANIME_REFERER, "User-Agent": USER_AGENT },
        provider: candidate.providerName,
      };
      sourcesCache.set(cacheKey, result);
      return result;
    }
  }

  return null;
}

export function buildAllAnimeEpisodeId(showId, episodeString) {
  return `${showId}::${episodeString}`;
}

export function parseAllAnimeEpisodeId(combined) {
  if (!combined || !combined.includes("::")) {
    return { showId: null, episode: combined || null };
  }
  const [showId, episode] = combined.split("::");
  return { showId, episode };
}
