

import { NextResponse } from "next/server";
import { LRUCache } from "lru-cache";
import axios from "axios";
import createRedisInstance from "@/lib/redis";
import { syncQdrant } from "./syncWithJikan";

const animeOptions = {
    max:300,
    ttl: 1000*60*60*12, //12hrs
  }

const redisClient = createRedisInstance();

  export const animeCache = new LRUCache(animeOptions);


export async function GET(req, {params}){
    const id = params.id;
    const lruCachedData = animeCache.get(`qdrant-anime-${id}`)
     if(lruCachedData){     // data found in lrucache
        return NextResponse.json(lruCachedData);
     }
    
    const cachedResult = await redisClient.get(`qdrant-anime-${id}`);
    if(cachedResult){       //data found in redis cache
        const parsedCacheResult = JSON.parse(cachedResult);
        console.log('cache hit : response sent from qdrant cached result');
        animeCache.set(`qdrant-anime-${id}`, parsedCacheResult);
        return NextResponse.json(parsedCacheResult);
    }

    //* if both cache got a miss, then fetch data from qdrant, check if it has sites in it if no then update with malsync , check if relations is there if no then update with jikan miscellaneous data, and everytime update data like score, rating, popularity, members,etc. and then cache the data in redis for coming 7 days and send back the response.


    try {           
        console.log('cache miss: response sent from qdrant api call')
        const resPayload = await getQdrantAnime(id);
        // console.log(resPayload);
        const updatedData = await syncQdrant(id, resPayload, redisClient);
        return NextResponse.json(updatedData);
        
    } catch (error) {
        console.log(error)
        return NextResponse.json(error);
    }
    
}


async function getQdrantAnime(id){
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
                });

        return qdrantRes?.data.result[0].payload;
        
    } catch (error) {
        return NextResponse.json(error);
    }
}
