import axios from "axios";
import { LRUCache } from "lru-cache";
import { NextResponse } from "next/server";
import getAnime from "../../anime/[id]/mainFunction";
import redisClient from "@/lib/redis"; // Use the singleton instance directly
import { fetchAnimepaheInfoByMalId } from "./fetchAnimeInfoByMalId";

//? The commented code in the file is mostly of the gogo provider, since gogo has went down we can't do much about it and its not working as of writing this on 24/02/2025, the commented code for gogo is now deprecated.

const watchOptions = {
  max: 500,
  ttl: 1000 * 60 * 15, // 15 min
};
const watchCache = new LRUCache(watchOptions);

export async function GET(req, { params }) {
  const id = params?.id;

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  console.log("Fetching watch anime data for id:", id);
  const cachedData = watchCache.get(`watch-${id}`);
  if (cachedData) {
    console.log(
      `LRU watch anime cache hit for id ${id}, animepahe key available => ${cachedData?.animepahe}`
    );
    // Add cache control headers for 30 min server-side caching
    return new NextResponse(JSON.stringify(cachedData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=600",
      },
    });
  }

  try {
    const redisCache = await redisClient.get(`watch-${id}`);
    if (redisCache) {
      console.log("Redis watch anime cache hit");
      const parsedCacheResult = JSON.parse(redisCache);
      watchCache.set(`watch-${id}`, parsedCacheResult);
      // Add cache control headers for 30 min server-side caching
      return new NextResponse(JSON.stringify(parsedCacheResult), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=600",
        },
      });
    }
  } catch (redisError) {
    console.error("Redis error:", redisError);
  }

  const scrapeUrl = process.env.SCRAPER_URL;
  const aniwatchScrapeUrl = process.env.ANIWATCH_SCRAPER_URL;

  try {
    const animeData = await getAnime(id);
    if (!animeData?.Sites) {
      return new NextResponse(
        JSON.stringify({
          message:
            "Sites not found. Anime may not be available in your region.",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

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
          console.log("Zoro episodes fetched:", res.data?.data?.totalEpisodes);
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

    //below code is for getting the episodes from the animepahe provider!

    let animepaheEps = null;
    console.log("Entering the fetchAnimepaheInfoByMalId");
    const animepaheData = await fetchAnimepaheInfoByMalId(id, animeData?.Sites); // Fetch animepahe data (first it will check for the id in Sites, if not found which is super rare, it will fetch from mapper)
    // console.log("animepahe data in the watch api is => ", animepaheData);
    if (animepaheData?.episodes) {
      animepaheEps = animepaheData.episodes;
    }

    const finalResponse = {
      zoro: {
        episodes: zoroEps?.episodes || [],
        totalEpisodes: zoroEps?.totalEpisodes || 0,
      },
      animepahe: {
        episodes: animepaheEps || [],
        totalEpisodes:
          animepaheData?.totalEpisodes || animepaheData?.episodes?.length || 0,
      },
      gogoSub: {
        episodes: [],
        status: null,
        subOrDub: null,
        totalEpisodes: 0,
      },
      gogoDub: {
        episodes: [],
        status: null,
        subOrDub: null,
        totalEpisodes: 0,
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

    if (isDateMoreThanSixMonthsOld(finalResponse?.aired?.to) &&
      id &&
      finalResponse?.zoro?.episodes?.length > 0 &&
      finalResponse?.animepahe?.episodes?.length > 0
    ) {
      console.log("Caching finished anime for 7 days in Redis");

      await redisClient.set(
        `watch-${id}`,
        JSON.stringify(finalResponse),
        "EX",
        60 * 60 * 24 * 7
      );
    }

    if (id &&
      finalResponse?.zoro?.episodes?.length > 0 &&
      finalResponse?.animepahe?.episodes?.length > 0
    ) {
      watchCache.set(`watch-${id}`, finalResponse);
    }

    // Add cache control headers for 30 min server-side caching
    return new NextResponse(JSON.stringify(finalResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error fetching anime data:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch anime data." }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
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
