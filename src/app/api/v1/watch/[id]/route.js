import axios from "axios";
import { LRUCache } from "lru-cache";
import { NextResponse } from "next/server";
import getAnime from "../../anime/[id]/mainFunction";
import redisClient from "@/lib/redis"; // Use the singleton instance directly

const watchOptions = {
  max: 500,
  ttl: 1000 * 60 * 60 * 2, // 2 hrs
}; // Future scope of permanent caching for anime which have finished airing is still remaining.
const watchCache = new LRUCache(watchOptions);

export async function GET(req, { params }) {
  const id = params.id;

  const cachedData = watchCache.get(`watch-${id}`);
  if (cachedData) {
    console.log("watch anime: cache hit from LRUCache");
    return NextResponse.json(cachedData);
  }

  try {
    const redisCache = await redisClient.get(`watch-${id}`);
    if (redisCache) {
      const parsedCacheResult = JSON.parse(redisCache);
      console.log("watch anime: cache hit from Redis");
      watchCache.set(`watch-${id}`, parsedCacheResult);
      return NextResponse.json(parsedCacheResult);
    }
  } catch (redisError) {
    console.error("Redis error:", redisError);
    // Handle Redis error if needed
  }

  const scrapeUrl = process.env.SCRAPER_URL;
  const aniwatchScrapeUrl = process.env.ANIWATCH_SCRAPER_URL;

  try {
    const animeData = await getAnime(id);
    const {
      title,
      title_english,
      genres,
      themes,
      type,
      score,
      episodes,
      aired,
      airing,
      synopsis,
      duration,
      episode_duration,
      images,
      main_picture,
      rating,
      start_year,
    } = animeData;

    if (!animeData.Sites)
      return NextResponse.error({
        message:
          "Sites not found, either this Anime is not yet airing or not available in your region.",
      });

    const gogoanimeKeys = Object.keys(animeData.Sites.Gogoanime);
    const gogoIdSub = animeData.Sites?.Gogoanime[gogoanimeKeys[0]].identifier;
    const gogoIdDub =
      gogoanimeKeys.length > 1
        ? animeData.Sites?.Gogoanime[gogoanimeKeys[1]].identifier
        : null;

    // Fetch Zoro episodes and find the one with the maximum episodes
    let maxEpisode = 0;
    let zoroEps;
    await Promise.all(
      Object.keys(animeData?.Sites?.Zoro).map(async (key) => {
        const id = animeData.Sites.Zoro[key].url.split("/").pop();
        const res = await axios.get(`${aniwatchScrapeUrl}/api/v2/hianime/anime/${id}/episodes`);
        if (res.data?.data?.totalEpisodes > maxEpisode) {
          maxEpisode = res.data?.data?.totalEpisodes;
          zoroEps = res.data?.data;
        }
      })
    );

    // Fetch Gogoanime episodes concurrently
    const gogoEpsSubPromise = axios.get(`${scrapeUrl}/anime/gogoanime/info/${gogoIdSub}`);
    const gogoEpsDubPromise = gogoIdDub
      ? axios.get(`${scrapeUrl}/anime/gogoanime/info/${gogoIdDub}`)
      : Promise.resolve(null);

    const [gogoEpsSub, gogoEpsDub] = await Promise.all([
      gogoEpsSubPromise,
      gogoEpsDubPromise,
    ]);

    const finalResponse = {
      zoro: {
        episodes: zoroEps?.episodes,
        totalEpisodes: zoroEps?.totalEpisodes,
      },
      gogoSub: {
        episodes: gogoEpsSub?.data?.episodes,
        status: gogoEpsSub?.data?.status,
        subOrDub: gogoEpsSub?.data?.subOrDub,
        totalEpisodes: gogoEpsSub?.data?.totalEpisodes,
      },
      gogoDub: {
        episodes: gogoEpsDub?.data?.episodes || null,
        status: gogoEpsDub?.data?.status || null,
        subOrDub: gogoEpsDub?.data?.subOrDub || null,
        totalEpisodes: gogoEpsDub?.data?.totalEpisodes || null,
      },
      title,
      title_english,
      genres,
      themes,
      type,
      score,
      episodes,
      aired,
      airing,
      synopsis,
      duration,
      episode_duration,
      images,
      main_picture,
      rating,
      start_year,
    }; 

    // Caching logic handling
    if (isDateMoreThanSixMonthsOld(finalResponse?.aired?.to)) {
      console.log("current anime is finished more than 6 months ago");
      id && await redisClient.set(`watch-${id}`, JSON.stringify(finalResponse), "EX", 60 * 60 * 24 * 7); // Cache for 7 days
    }
    watchCache.set(`watch-${id}`, finalResponse);
    return NextResponse.json(finalResponse);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error });
  }
}

function isDateMoreThanSixMonthsOld(dateString) {
  if (!dateString) {
    return false; // Return false if dateString is empty or undefined
  }

  const dateToCheck = new Date(dateString);

  // Check if dateToCheck is a valid Date object and the parsed date is valid
  if (!(dateToCheck instanceof Date && !isNaN(dateToCheck))) {
    return false; // Return false if dateToCheck is not a valid Date object
  }

  const currentDate = new Date();

  // Calculate difference in milliseconds
  const timeDifference = currentDate - dateToCheck;

  // Approximate 6 months in milliseconds
  const sixMonthsInMilliseconds = 6 * 30 * 24 * 60 * 60 * 1000; // 6 months roughly

  // Check if the time difference is greater than or equal to six months
  return timeDifference >= sixMonthsInMilliseconds;
}
