import axios from "axios";
import { LRUCache } from "lru-cache";
import { NextResponse } from "next/server";
import getAnime from "../../anime/[id]/mainFunction";
import createRedisInstance from "@/lib/redis";

const watchOptions = {
  max: 500,
  ttl: 1000 * 60 * 60 * 2, // 2 hrs
};  //! future scope of permanent caching for anime which have finished airing is still remaining.
const watchCache = new LRUCache(watchOptions);

const redisClient = createRedisInstance();

export async function GET(req, { params }) {
  const id = params.id;
  
  const cachedData = watchCache.get(`watch-${id}`);
  const redisCache = await redisClient.get(`watch-${id}`);
  if(cachedData){
    console.log("watch anime : cache hit");
    return NextResponse.json(cachedData);
  }
  else if(redisCache){
    const parsedCacheResult = JSON.parse(redisCache);
    console.log('cache hit watch anime : response sent from redis cached result');
    watchCache.set(`watch-${id}`, parsedCacheResult);
    return NextResponse.json(parsedCacheResult);
  }
  
  const scrapeUrl = process.env.SCRAPER_URL;
  const aniwatchScrapeUrl = process.env.ANIWATCH_SCRAPER_URL;

  try {
    const animeData = await getAnime(id);
    const {title, title_english, genres, themes, type, score, aired, airing, synopsis, duration, episode_duration, images, main_picture, rating, start_year} = animeData;

    if (!animeData.Sites)
      return NextResponse.error({
        message:
          "Sites not found, either this Anime is not yet airing or not available in your region.",
      });

    const gogoanimeKeys = Object.keys(animeData.Sites.Gogoanime);
    const gogoIdSub = animeData.Sites?.Gogoanime[gogoanimeKeys[0]].identifier;
    const gogoIdDub =gogoanimeKeys.length > 1 ? animeData.Sites?.Gogoanime[gogoanimeKeys[1]].identifier : null;

    // Fetch Zoro episodes and find the one with the maximum episodes
    let maxEpisode = 0;
    let zoroEps;
    await Promise.all(

      Object.keys(animeData?.Sites?.Zoro).map(async (key) => {
        const id = animeData.Sites.Zoro[key].url.split("/").pop();
        const res = await axios.get(`${aniwatchScrapeUrl}/anime/episodes/${id}`);
        if (res.data?.totalEpisodes > maxEpisode) {
          maxEpisode = res.data?.totalEpisodes;
          zoroEps = res.data;
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
        zoro:{
            episodes : zoroEps?.episodes,
            totalEpisodes: zoroEps?.totalEpisodes,          
        },
        gogoSub:{
            episodes: gogoEpsSub?.data?.episodes,
            status: gogoEpsSub?.data?.status,
            subOrDub: gogoEpsSub?.data?.subOrDub,
            totalEpisodes: gogoEpsSub?.data?.totalEpisodes
        },
        gogoDub:{
            episodes: gogoEpsDub?.data?.episodes || null,
            status: gogoEpsDub?.data?.status || null,
            subOrDub: gogoEpsDub?.data?.subOrDub || null,
            totalEpisodes: gogoEpsDub?.data?.totalEpisodes || null
        },
        title, title_english, genres, themes, type, score, aired, airing, synopsis, duration, episode_duration, images, main_picture, rating, start_year

    }

    //caching logic handling
    if(isDateMoreThanSixMonthsOld(finalResponse?.aired?.to)){
      console.log("current anime is finished more than 4 months ago");
      redisClient.set(`watch-${id}`, JSON.stringify(finalResponse));
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

  // Approximate 4 months in milliseconds
  const fourMonthsInMilliseconds = 6 * 30 * 24 * 60 * 60 * 1000; // 4 months roughly

  // Check if the time difference is greater than or equal to four months
  return timeDifference >= fourMonthsInMilliseconds;
}