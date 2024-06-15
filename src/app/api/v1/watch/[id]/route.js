import axios from "axios";
import { LRUCache } from "lru-cache";
import { NextResponse } from "next/server";
import getAnime from "../../anime/[id]/mainFunction";

const watchOptions = {
  max: 500,
  ttl: 1000 * 60 * 60 * 2, // 2 hrs
};  //! future scope of permanent caching for anime which have finished airing is still remaining.
const watchCache = new LRUCache(watchOptions);

export async function GET(req, { params }) {
  const id = params.id;
  
  const cachedData = watchCache.get(`watch-${id}`);
  if(cachedData){
    console.log("watch anime : cache hit");
    return NextResponse.json(cachedData);
  }
  
  const scrapeUrl = process.env.SCRAPER_URL;

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
        const res = await axios.get(`${scrapeUrl}/anime/zoro/info?id=${id}`);
        if (res.data.episodes.length > maxEpisode) {
          maxEpisode = res.data.episodes.length;
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
            hasSub: zoroEps?.hasSub,
            totalEpisodes: zoroEps?.totalEpisodes,
            subOrDub: zoroEps?.subOrDub,            
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
    watchCache.set(`watch-${id}`, finalResponse);
    return NextResponse.json(finalResponse);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error });
  }
}
