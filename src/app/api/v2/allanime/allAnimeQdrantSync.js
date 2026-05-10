import axios from "axios";
import redisClient from "@/lib/redis";

export async function persistAllAnimeShowToQdrant({ malId, showId, title }) {
  if (!malId || !showId) return;

  try {
    const fetchRes = await axios.post(
      `${process.env.QDRANT_URL}/collections/Anime/points`,
      { ids: [Number(malId)], with_payload: true },
      { headers: { "api-key": process.env.QDRANT_API_KEY } }
    );

    const point = fetchRes?.data?.result?.[0];
    if (!point) return;

    const existingSites = point?.payload?.Sites || {};
    const existingAA = existingSites?.allanime || {};

    if (existingAA?.show_id === showId && existingAA?.title === title) return;

    const updatedSites = {
      ...existingSites,
      allanime: {
        ...existingAA,
        show_id: showId,
        title: title || existingAA?.title || null,
        lastSync: new Date().toISOString(),
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
      console.warn("AllAnime sync: redis update skipped:", cacheErr?.message);
    }
  } catch (err) {
    console.error("AllAnime sync to Qdrant failed:", err?.message);
  }
}

export function getAllAnimeShowFromSites(Sites) {
  return Sites?.allanime?.show_id || null;
}
