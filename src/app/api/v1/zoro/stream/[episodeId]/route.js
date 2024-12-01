import axios from "axios";
import { LRUCache } from "lru-cache";
import { NextResponse } from "next/server";



const option = {
  max: 500,
  ttl: 1000 * 30, //30 seconds
};
const zoroCache = new LRUCache(option);

// available server according to docs = ["gogocdn", "streamsb", "streamtape", "vidstreaming"], others servers may also be present fetch server api for getting available servers for any episode;
export async function GET(req, { params }) {
  const id = params.episodeId;
  const searchParams = req.nextUrl.searchParams;
  const ep = searchParams.get("ep");
  const server = searchParams.get("server") || '';
  const category = searchParams.get("category") || "sub";

  const episodeId = `${id}?ep=${ep}`;

  // console.log(server, episodeId);


  const cachedData = zoroCache.get(
    `zoro-${episodeId}-${server}-${category}`
  );
  if (cachedData) {
    // console.log("Cache hit for Zoro streaming api");
    return NextResponse.json(cachedData);
  }

  try {
    const res = await axios.get(
      `${process.env.ANIWATCH_SCRAPER_URL}/api/v2/hianime/episode/sources?animeEpisodeId=${episodeId}&server=${server}&category=${category}`,
      // {
      //   params: {   
      //     server,
      //   },
      // }
    );
    zoroCache.set(`zoro-${episodeId}-${server}-${category}`, res?.data?.data);
    return NextResponse.json(res.data?.data);

  } catch (error) {
    console.log(error);
    return NextResponse.json({
      ...error.response.data,
      status: error.response.status,
    });
  }
}
