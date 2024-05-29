import axios from "axios";
import Bottleneck from "bottleneck";
import { LRUCache } from "lru-cache";
import { NextResponse } from "next/server";

const animeOptions = {
    max:10,
    ttl: 1000*60*60*24, //24hrs
  }



  export const topCache = new LRUCache(animeOptions);

const limiter = new Bottleneck({
    minTime: 333
  });

export async function GET(req){
    const {searchParams} = new URL(req.url);
    const filter  = searchParams.get("filter") || "favorite";
    const limit = searchParams.get("limit") || 20;
    const page = searchParams.get("page") || 1;
    if(!["airing", "upcoming", "bypopularity", "favorite"].includes(filter))
        return NextResponse.json({msg: "Unexpected filter type!"})
    
    try {
        const cachedResults = topCache.get(`top-anime-${filter}-${limit}-${page}`);
        if(cachedResults){
            console.log("cache hit")
            return NextResponse.json(cachedResults);
        }
        const results = await limiter.schedule(()=> axios.get(`https://api.jikan.moe/v4/top/anime?page=${page}&limit=${limit}&filter=${filter}`));    
        const filteredResults = results.data.data.map((anime)=>{
            return (
                {
                   mal_id: anime.mal_id,
                   aired: anime.aired,
                   images: anime.images,
                   trailer: anime.trailer,
                   title: anime.title,
                   title_english: anime.title_english,
                   type: anime.type,
                   score: anime.score,
                   synopsis: anime.synopsis,
                   duration: anime.duration,
                   episodes: anime.episodes,
                   rating: anime.rating,
                }
            )
        })
        topCache.set(`top-anime-${filter}-${limit}-${page}`,filteredResults);
        return NextResponse.json(filteredResults);

    } catch (error) {
        return NextResponse.json(error);
    }
}