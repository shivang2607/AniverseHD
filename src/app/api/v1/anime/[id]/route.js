//! try to create multiple caches so that we dont have to send update payload request every time after 12 hours.

import { NextResponse } from "next/server";
import { LRUCache } from "lru-cache";
import jikan from "@mateoaranda/jikanjs";
import axios from "axios";

const animeOptions = {
    max:300,
    ttl: 1000*60*60*12,
  }

  export const animeCache = new LRUCache(animeOptions);

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
                })
            animeCache.set(`qdrant-${id}`, qdrantRes?.data.result[0].payload);
            return qdrantRes?.data.result[0].payload;
        
    } catch (error) {
        return NextResponse.json(error);
    }
}

export async function GET(req, {params}){
    const id = params.id;
    const updateFlag = animeCache.get(`update-${id}`);
    const cachedResult = animeCache.get(`qdrant-${id}`);
    if(updateFlag){ 
        console.log("cache hit of update Flag")
        if(cachedResult){
            console.log('cache hit : response sent from qdrant cached result');
            return NextResponse.json(cachedResult);
        }

        console.log("cache miss: response sent from qdrant api call")
        const res = await getQdrantAnime(id);
        return NextResponse.json(res);
    }

    try {
        
        const resPayload = await getQdrantAnime(id);
        const jikanResp = await jikan.loadAnime(id, 'full');
        const jikanData = jikanResp.data;
        let updatePayload = {
            "aired": jikanData.aired,
            "airing": jikanData.airing,
            "episode_duration": jikanData.episode_duration,
            "duration":jikanData.duration,
            "favorites": jikanData.favorites,
            "members": jikanData.members,
            "popularity": jikanData.popularity,
            "rank": jikanData.rank,
            "rating": jikanData.rating,
            "score": jikanData.score,
            "scored_by": jikanData.scored_by,
            "start_date": jikanData.start_date,
            "start_season": jikanData.start_season,
            "status": jikanData.status,

        }

        if(!(resPayload?.relations)){
            updatePayload = {
                ...updatePayload,
                "images": jikanData.images,
                "trailer": jikanData.trailer,
                "titles": jikanData.titles,
                "relations": jikanData.relations,
                "theme": jikanData.theme,
                "external": jikanData.external
            }
           
        }
        await axios.post(`${process.env.QDRANT_URL}/collections/Anime/points/payload`,
        {
            "payload": updatePayload,
            "points": [Number(id)]
          },
         {            
            headers: {
                "api-key": process.env.QDRANT_API_KEY
              }
            })
        // console.log("response payload update when relations is found", updatePayloadRes);
        console.log("cache miss for anime id")
        const responsePayload = {
            ...jikanData,
            "sub": resPayload.sub,
            "dub": resPayload.dub,
            "uncensored": resPayload.uncensored,
        }
        animeCache.set(`update-${id}`, "updated", {ttl: 1000*60*60*24*30});
        console.log("response send after updating Qdrant")
        return NextResponse.json(responsePayload);
         
    } catch (error) {
        console.log(error)
        return NextResponse.json(error);
    }
}