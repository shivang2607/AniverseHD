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
    const server = searchParams.get('server');

    console.log(server, episodeId);
    const cachedData = gogoCache.get(`gogo-${episodeId}-${server}`);
    if(cachedData){
        console.log("Cache hit for Gogo streaming api");
        return NextResponse.json(cachedData);
    }

    try {
        const res = await axios.get(`${process.env.SCRAPER_URL}/anime/gogoanime/watch/${episodeId}`, {params: {server} });
        gogoCache.set(`gogo-${episodeId}-${server}`, res?.data);
        return NextResponse.json(res.data);

    } catch (error) {
        return NextResponse.json({...error.response.data, status: error.response.status});
    }
}