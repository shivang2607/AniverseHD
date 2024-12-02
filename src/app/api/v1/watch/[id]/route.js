import axios from "axios";
import { LRUCache } from "lru-cache";
import { NextResponse } from "next/server";
import getAnime from "../../anime/[id]/mainFunction";
import redisClient from "@/lib/redis"; // Use the singleton instance directly

const watchOptions = {
  max: 500,
  ttl: 1000 * 60 * 60 * 2, // 2 hours
};
const watchCache = new LRUCache(watchOptions);

export async function GET(req, { params }) {
  const id = params?.id;

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  const cachedData = watchCache.get(`watch-${id}`);
  if (cachedData) {
    console.log("LRU watch anime cache hit", cachedData);
    return NextResponse.json(cachedData);
  }

  try {
    const redisCache = await redisClient.get(`watch-${id}`);
    if (redisCache) {
      console.log("Redis watch anime cache hit", redisCache);
      const parsedCacheResult = JSON.parse(redisCache);
      watchCache.set(`watch-${id}`, parsedCacheResult);
      return NextResponse.json(parsedCacheResult);
    }
  } catch (redisError) {
    console.error("Redis error:", redisError);
  }

  const scrapeUrl = process.env.SCRAPER_URL;
  const aniwatchScrapeUrl = process.env.ANIWATCH_SCRAPER_URL;

  try {
    const animeData = await getAnime(id);
    if (!animeData?.Sites) {
      return NextResponse.json(
        {
          message: "Sites not found. Anime may not be available in your region.",
        },
        { status: 404 }
      );
    }

    const gogoanimeSites = animeData.Sites?.Gogoanime || {};
    const gogoanimeKeys = Object.keys(gogoanimeSites);
    const gogoIdSub = gogoanimeSites[gogoanimeKeys[0]]?.identifier || null;
    const gogoIdDub =
      gogoanimeKeys.length > 1
        ? gogoanimeSites[gogoanimeKeys[1]]?.identifier || null
        : null;

    let maxEpisode = 0;
    let zoroEps = null;

    const zoroSites = animeData.Sites?.Zoro || {};
    await Promise.all(
      Object.keys(zoroSites).map(async (key) => {
        try {
          const id = zoroSites[key]?.url?.split("/").pop();
          if (!id) return;

          const res = await axios.get(
            `${aniwatchScrapeUrl}/api/v2/hianime/anime/${id}/episodes`
          );

          const totalEpisodes = res.data?.data?.totalEpisodes || 0;
          if (totalEpisodes > maxEpisode) {
            maxEpisode = totalEpisodes;
            zoroEps = res.data?.data || {};
          }
        } catch (error) {
          console.error("Error fetching Zoro episodes:", error);
        }
      })
    );

    const gogoEpsSubPromise = gogoIdSub
      ? axios.get(`${scrapeUrl}/anime/gogoanime/info/${gogoIdSub}`)
      : Promise.resolve({ data: {} });

    const gogoEpsDubPromise = gogoIdDub
      ? axios.get(`${scrapeUrl}/anime/gogoanime/info/${gogoIdDub}`)
      : Promise.resolve({ data: {} });

    const [gogoEpsSub, gogoEpsDub] = await Promise.all([
      gogoEpsSubPromise,
      gogoEpsDubPromise,
    ]);

    const finalResponse = {
      zoro: {
        episodes: zoroEps?.episodes || [],
        totalEpisodes: zoroEps?.totalEpisodes || 0,
      },
      gogoSub: {
        episodes: gogoEpsSub?.data?.episodes || [],
        status: gogoEpsSub?.data?.status || null,
        subOrDub: gogoEpsSub?.data?.subOrDub || null,
        totalEpisodes: gogoEpsSub?.data?.totalEpisodes || 0,
      },
      gogoDub: {
        episodes: gogoEpsDub?.data?.episodes || [],
        status: gogoEpsDub?.data?.status || null,
        subOrDub: gogoEpsDub?.data?.subOrDub || null,
        totalEpisodes: gogoEpsDub?.data?.totalEpisodes || 0,
      },
      title: animeData.title || "",
      title_english: animeData.title_english || "",
      genres: animeData.genres || [],
      themes: animeData.themes || [],
      type: animeData.type || "",
      score: animeData.score || 0,
      episodes: animeData.episodes || 0,
      aired: animeData.aired || {},
      airing: animeData.airing || false,
      synopsis: animeData.synopsis || "",
      duration: animeData.duration || "",
      episode_duration: animeData.episode_duration || 0,
      images: animeData.images || {},
      main_picture: animeData.main_picture || "",
      rating: animeData.rating || "",
      start_year: animeData.start_year || "",
    };

    if (isDateMoreThanSixMonthsOld(finalResponse?.aired?.to)) {
      console.log("Caching finished anime for 7 days in Redis");
      id &&
        (await redisClient.set(
          `watch-${id}`,
          JSON.stringify(finalResponse),
          "EX",
          60 * 60 * 24 * 30 * 6 //cache for 6 months
        ));
    }

    watchCache.set(`watch-${id}`, finalResponse);
    return NextResponse.json(finalResponse);
  } catch (error) {
    console.error("Error fetching anime data:", error);
    return NextResponse.json(
      { error: "Failed to fetch anime data." },
      { status: 500 }
    );
  }
}

function isDateMoreThanSixMonthsOld(dateString) {
  if (!dateString) {
    return false;
  }

  const dateToCheck = new Date(dateString);
  if (!(dateToCheck instanceof Date && !isNaN(dateToCheck))) {
    return false;
  }

  const currentDate = new Date();
  const sixMonthsInMilliseconds = 6 * 30 * 24 * 60 * 60 * 1000;
  return currentDate - dateToCheck >= sixMonthsInMilliseconds;
}
