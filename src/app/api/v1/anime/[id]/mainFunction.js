// getAnime.ts
import { LRUCache } from "lru-cache";
import axios from "axios";
import redisClient from "@/lib/redis";  // Use the singleton instance directly
import { syncQdrant } from "./syncWithJikan";
import { addQdrantAnime } from "./addAnime";

const animeOptions = {
  max: 100,
  ttl: 1000 * 60 * 60 * 24 * 1, // 1 day
};

export const animeCache = new LRUCache(animeOptions);

export default async function getAnime(id) {
  // ! only uncomment below line when you need to clear the redis cache, PS: dont deploy without commenting this
  // await redisClient.flushall();

  const lruCachedData = animeCache.get(`qdrant-anime-${id}`);
  if (lruCachedData) { // data found in lrucache
    console.log("LRU cache hit");
    return lruCachedData;
  }

  try {
    const cachedResult = await redisClient.get(`qdrant-anime-${id}`);
    if (cachedResult) { // data found in redis cache
      const parsedCacheResult = JSON.parse(cachedResult);
      console.log('REDIS cache hit for anime id ', id);
      animeCache.set(`qdrant-anime-${id}`, parsedCacheResult);
      return parsedCacheResult;
    }
  } catch (redisError) {
    console.error('Redis error:', redisError);
    // Handle Redis error if needed
  }

  try {
    console.log('cache miss: response sent from qdrant api call');
    const resPayload = await getQdrantAnime(id);
    if (resPayload.add) { // that means anime is not present in qdrant database and that it has to be added from the addQdrantAnime function written in addAnime.js file.
      
      return resPayload.resultBhaai;
    }
    const updatedData = await syncQdrant(id, resPayload.payload);
    return updatedData;
  } catch (error) {
    console.log(error);
    return error;
  }
}

async function getQdrantAnime(id) {
  try {
    const qdrantRes = await axios.post(`${process.env.QDRANT_URL}/collections/Anime/points`,
      {
        "ids": [Number(id)],
        "with_payload": true,
      },
      {
        headers: {
          "api-key": process.env.QDRANT_API_KEY
        }
      });

    if (qdrantRes?.data?.result.length === 0) {
      const resultBhaai = await addQdrantAnime(id);
      const obj = {
        add: true,
        resultBhaai
      };
      return obj;
    }

    return { add: false, payload: qdrantRes?.data.result[0].payload };
  } catch (error) {
    return error;
  }
}
