import axios from "axios";
import { LRUCache } from "lru-cache";
import { NextResponse } from "next/server";



const option = {
    max:500,
    ttl: 1000*60*5, //5 min 
  }
const gogoCache = new LRUCache(option);

// available server according to docs = ["gogocdn", "streamsb", "streamtape", "vidstreaming"], others servers may also be present fetch server api for getting available servers for any episode;
export async function GET(req, {params}){
    const episodeId = params.episodeId;
    const searchParams = req.nextUrl.searchParams;
    const serverName = searchParams.get('server').toLowerCase();

    // console.log(server, episodeId);
    const cachedData = gogoCache.get(`gogo-${episodeId}-${serverName}`);
    if(cachedData){
        console.log("Cache hit for Gogo streaming api");
        return NextResponse.json(cachedData);
    }

    try {
        console.log(`${process.env.SCRAPER_URL}/anime/gogoanime/watch/${episodeId}`);
        const res = await axios.get(`${process.env.SCRAPER_URL}/anime/gogoanime/watch/${episodeId}`);
        // console.log(res?.data);
        if(res?.data){
        gogoCache.set(`gogo-${episodeId}`, res?.data);
        }
        return NextResponse.json(res.data);

    } catch (error) {
        return NextResponse.json({...error.response.data, status: error.response.status});
    }
}