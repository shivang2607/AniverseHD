import { NextResponse } from "next/server";
import { LRUCache } from "lru-cache";
import axios from "axios";

const animeOptions = {
    max:300,
    ttl: 1000*60*60*12,
  }

  export const animeCache = new LRUCache(animeOptions);

export async function GET(req, {params}){
    const id = params.id;
    const cachedResult = animeCache.get(id);
    if(cachedResult){ 
        console.log("cache hit") 
        return NextResponse.json(cachedResult);
    }

    try {
        const qdrantRes = await axios.post(`${process.env.QDRANT_URL}/collections/Anime/points`,
        {
            "ids":[Number(id)],
            "with_payload": true,
          },
         {            
            headers: {
                "api-key": process.env.QDRANT_API_KEY
              }
            })
        const resPayload = qdrantRes?.data.result[0].payload;
        if(resPayload?.titles){
            console.log("titles' array found!")
        }
        console.log("cache miss for anime id")
        animeCache.set(id, qdrantRes?.data.result[0].payload);

        return NextResponse.json(qdrantRes?.data?.result[0].payload);
         
    } catch (error) {
        console.log(error)
        return NextResponse.json(error);
    }
}