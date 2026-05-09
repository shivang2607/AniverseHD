import axios from "axios";
import redisClient from "@/lib/redis";

export async function persistPaheSessionToQdrant({
  malId,
  animeSession,
  paheTitle,
  paheId,
}) {
  if (!malId || !animeSession) return;

  try {
    const fetchRes = await axios.post(
      `${process.env.QDRANT_URL}/collections/Anime/points`,
      { ids: [Number(malId)], with_payload: true },
      { headers: { "api-key": process.env.QDRANT_API_KEY } }
    );

    const point = fetchRes?.data?.result?.[0];
    if (!point) {
      console.warn(`Pahe sync: anime ${malId} not in Qdrant, skipping persist`);
      return;
    }

    const existingSites = point?.payload?.Sites || {};
    const existingPahe = existingSites?.animepahe || {};

    if (
      existingPahe?.paheSession === animeSession &&
      existingPahe?.paheTitle === paheTitle
    ) {
      return;
    }

    const updatedSites = {
      ...existingSites,
      animepahe: {
        ...existingPahe,
        sub: existingPahe?.sub || paheId || null,
        paheSession: animeSession,
        paheTitle: paheTitle || existingPahe?.paheTitle || null,
        paheLastSync: new Date().toISOString(),
      },
    };

    await axios.post(
      `${process.env.QDRANT_URL}/collections/Anime/points/payload`,
      { payload: { Sites: updatedSites }, points: [Number(malId)] },
      { headers: { "api-key": process.env.QDRANT_API_KEY } }
    );

    try {
      const cached = await redisClient.get(`qdrant-anime-${malId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        parsed.Sites = updatedSites;
        await redisClient.set(
          `qdrant-anime-${malId}`,
          JSON.stringify(parsed),
          "EX",
          60 * 60 * 24 * 7
        );
      }
    } catch (cacheErr) {
      console.warn("Pahe sync: redis update skipped:", cacheErr?.message);
    }

    console.log(`Pahe sync: persisted session for MAL ${malId}`);
  } catch (err) {
    console.error("Pahe sync to Qdrant failed:", err?.message);
  }
}

export function getPaheSessionFromSites(Sites) {
  return Sites?.animepahe?.paheSession || null;
}
