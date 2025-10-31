import { defaultCacheOptions } from "@/utils/lruCache";
import axios from "axios";
import { LRUCache } from "lru-cache";
import { NextResponse } from "next/server";



const options = {
  ...defaultCacheOptions,
    max: 100,
    ttl: 1000*60* 60 * 5 //5 hour
}

const serverCache = new LRUCache(options);


function transformResults(input) {
  const results = {};

  input.forEach(item => {
    if (!results[item.type]) {
      results[item.type] = [];
    }
    results[item.type].push({
      serverName: item.serverName,
      ...item
    });
  });

  return results;
}



export async function GET(req, {params}){
    const episodeId = params.episodeId;
    const searchParams = req.nextUrl.searchParams;
    const ep = searchParams.get('ep');
    console.log(episodeId, ep);
    const cachedData = serverCache.get(`zoro-server-${episodeId}-${ep}`);

    if(cachedData)
        return NextResponse.json(cachedData);

    try {
        console.log(`${process.env.ANIWATCH_SCRAPER_URL}/anime/servers?episodeId=${episodeId}?ep=${ep}`)
        const res = await axios.get(`${process.env.ZORO_SCRAPER_URL}/api/servers/${episodeId}?ep=${ep}`);
        serverCache.set(`zoro-server-${episodeId}-${ep}`, transformResults(res?.data?.results || []));
        // console.log(res?.data);
        return NextResponse.json(transformResults(res?.data?.results) || []);

        
    } catch (error) {
        console.log(error);
        return NextResponse.json({...error.response.data, status: error.response.status});
    }
}