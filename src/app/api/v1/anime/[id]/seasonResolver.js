import axios from "axios";

const MAX_PREQUEL_HOPS = 10;

const NUM_WORDS = {
  first: 1, second: 2, third: 3, fourth: 4, fifth: 5,
  sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10,
};

// Read an explicit season number from titles/synonyms. Returns a positive int or null.
export function parseSeasonFromTitles(payload) {
  const candidates = [];
  if (payload?.title) candidates.push(payload.title);
  if (payload?.title_english) candidates.push(payload.title_english);
  if (Array.isArray(payload?.titles)) {
    for (const t of payload.titles) if (t?.title) candidates.push(t.title);
  }
  // title_synonyms can be a stringified python list ("['Foo', 'Bar']")
  const syn = payload?.title_synonyms;
  if (typeof syn === "string") {
    const matches = syn.match(/'([^']+)'|"([^"]+)"/g) || [];
    for (const m of matches) candidates.push(m.replace(/^['"]|['"]$/g, ""));
  } else if (Array.isArray(syn)) {
    for (const s of syn) if (s) candidates.push(s);
  }

  for (const raw of candidates) {
    const t = String(raw);
    let m = t.match(/\bSeason\s+(\d{1,2})\b/i);
    if (m) return Number(m[1]);
    m = t.match(/\b(\d{1,2})(?:st|nd|rd|th)\s+Season\b/i);
    if (m) return Number(m[1]);
    m = t.match(/\b(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth)\s+Season\b/i);
    if (m) return NUM_WORDS[m[1].toLowerCase()];
    m = t.match(/第?\s*(\d{1,2})\s*期/);
    if (m) return Number(m[1]);
  }
  return null;
}

function coreTitle(title) {
  if (!title) return "";
  return String(title)
    .toLowerCase()
    .replace(/\s*[:\-]\s*/g, " ")
    .replace(/\b(part|cour|kai|specials?|recap|movie|ova|ona|special|final\s+arc|final\s+chapter)\b.*/i, "")
    .replace(/\b\d{1,2}(?:st|nd|rd|th)?\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// True when current and prequel are different parts/cours of the same TMDB season.
function isSamePartContinuation(currentTitle, prequelTitle) {
  if (!currentTitle || !prequelTitle) return false;
  const ct = String(currentTitle).toLowerCase();
  const pt = String(prequelTitle).toLowerCase();
  const partMarker = /\b(part\s*\d|cour\s*\d|2nd\s+half|second\s+half|specials?)\b/i;
  if (!partMarker.test(ct) && !partMarker.test(pt)) return false;
  const cc = coreTitle(currentTitle);
  const pc = coreTitle(prequelTitle);
  if (!cc || !pc) return false;
  return cc === pc || cc.startsWith(pc) || pc.startsWith(cc);
}

async function fetchPayloadFromQdrant(malId) {
  try {
    const { data } = await axios.post(
      `${process.env.QDRANT_URL}/collections/Anime/points`,
      { ids: [Number(malId)], with_payload: true },
      { headers: { "api-key": process.env.QDRANT_API_KEY }, timeout: 8000 }
    );
    return data?.result?.[0]?.payload || null;
  } catch {
    return null;
  }
}

function findPrequelMalId(payload) {
  const relations = payload?.relations;
  if (!Array.isArray(relations)) return null;
  for (const rel of relations) {
    if (rel?.relation !== "Prequel") continue;
    const entries = Array.isArray(rel?.entry) ? rel.entry : [];
    const animeEntry = entries.find(
      (e) => String(e?.type).toLowerCase() === "anime" && Number.isFinite(Number(e?.mal_id))
    );
    if (animeEntry) return Number(animeEntry.mal_id);
  }
  return null;
}

/**
 * Resolve the TMDB-equivalent season number for a given anime by:
 * 1. Trying explicit "Season N" parsing on the starting title/synonyms.
 * 2. Walking the Prequel chain (anchoring on the first ancestor with an explicit "Season N").
 * 3. Treating same-season part splits ("Part 2", "Cour 2", "Specials") as the same season.
 *
 * @param {number|string} startMalId
 * @param {object} startPayload  - Qdrant point payload for startMalId
 * @param {object} [opts]
 * @param {(malId:number) => Promise<object|null>} [opts.fetchPayload] - injected fetcher; defaults to Qdrant
 * @returns {Promise<number>}
 */
export async function resolveSeasonNumber(startMalId, startPayload, opts = {}) {
  const fetchPayload = opts.fetchPayload || fetchPayloadFromQdrant;

  const parsed = parseSeasonFromTitles(startPayload || {});
  if (parsed && parsed > 0 && parsed < 50) return parsed;

  let season = 1;
  let currentPayload = startPayload;
  const visited = new Set([Number(startMalId)]);

  for (let hop = 0; hop < MAX_PREQUEL_HOPS; hop++) {
    const prequelMalId = findPrequelMalId(currentPayload);
    if (!prequelMalId || visited.has(prequelMalId)) break;
    visited.add(prequelMalId);

    const prequelPayload = await fetchPayload(prequelMalId);
    if (!prequelPayload) {
      season += 1;
      break;
    }

    const anchored = parseSeasonFromTitles(prequelPayload);
    if (anchored && anchored > 0) {
      const continuation = isSamePartContinuation(
        currentPayload?.title,
        prequelPayload?.title
      );
      season = continuation ? anchored : anchored + 1;
      break;
    }

    if (!isSamePartContinuation(currentPayload?.title, prequelPayload?.title)) {
      season += 1;
    }
    currentPayload = prequelPayload;
  }

  if (!Number.isFinite(season) || season < 1) season = 1;
  return season;
}
