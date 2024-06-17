import jikan from "@mateoaranda/jikanjs";
import { pipeline } from "@xenova/transformers";
import axios from "axios";
import Bottleneck from "bottleneck";


//this function simply turn sentence to encodings.
async function encodeText(text) {
    const extractor = await pipeline("feature-extraction", "Xenova/bge-small-en-v1.5");
    const encodings = await extractor(text, {pooling: "mean", normalize: true});
    return Object.values(encodings.data);
}

export async function addQdrantAnime(id, redisClient){
    const res = await jikan.loadAnime(id, 'full');
    const jikanResp = res?.data;
    console.log("function add anime ran")

    const inputSentence = `type is ${jikanResp?.type || ''},
                            genres are ${jikanResp.genres.map(genre=>(genre.name || "")).join(" ")},
                            themes are ${jikanResp.themes.map(theme=>(theme.name || "")).join(" ")}, 
                            studio is ${jikanResp.studios.map(studio=>studio.name || "").join(" ")}, 
                            number of episodes are ${preprocess_episodes(jikanResp.episodes)}, 
                            start year is ${jikanResp.year || ""}, 
                            demographics are ${jikanResp.demographics.map(d=>(d.name || "")).join(" ")}, 
                            ${jikanResp.synopsis || ''}, 
                            ${jikanResp.title_english}
                            `.replace(/\n/g, ' ').trim();

    // below is our embeddings that must be sent on backend.
    const embeddings = await encodeText(inputSentence);

  // we now have our embeddings and payload now we will add anime mappings of zoro and gogo if available 
  let payload = jikanResp;

  //intialize bottleneck limiter
  const limiter = new Bottleneck({
    minTime: 666
    });

    //use proxy if in dev mode else make call directly to the malSync api, check if the response contains gogo, or zoro mappings, if Yes then Add it to the payload.
    const corsProxyUrl = process.env.ENV==='DEV' ? 'https://api.allorigins.win/raw?url=': '';
    const headers = {'Origin': '*'}
    const malSyncData = await limiter.schedule(()=> axios.get(`${corsProxyUrl}https://api.malsync.moe/mal/anime/${id}`, {headers}));

    if(malSyncData?.data?.Sites?.Gogoanime || malSyncData?.data?.Sites?.Zoro){
        payload = {
            ...payload,
            "genres": jikanResp.genres.map(genre=>genre.name),
            "themes": jikanResp.themes.map(theme=>theme.name),
            "demographics": jikanResp.demographics?.map(demo=>demo.name),
            "Sites": malSyncData?.data?.Sites
        }
        // console.log(payload);
    }

    // now we have our paylaod as well as embeddings, just add the fucking anime to the qdrant database.
    const uploadPoint = await axios.put(
        `${process.env.QDRANT_URL}/collections/Anime/points`,
        {
            "points": [
                {
                    "id": jikanResp.mal_id,
                    "payload": payload,
                    "vector": {
                       "fast-bge-small-en" : embeddings
                    }
                }
            ]
        },
        {
        headers: {
            "api-key": process.env.QDRANT_API_KEY
        }
        },
  );

//   console.log(uploadPoint.data.status==='ok');
  if(uploadPoint.data.status==='ok'){
    console.log("new anime added successfully !!")
    redisClient.set(`qdrant-anime-${id}`, JSON.stringify(payload) , 'EX', 60*60*24*7); //cache for 7 days.
  }


  //return response to the frontend, the response is nothing but the paylaod that we have just uploaded to the qdrant.
  return payload;

}

//================================================================



//helper function for preprocessing the episodes that we used in input sentences.
function preprocess_episodes(episodes){
    if(!episodes)return '';
    else if(episodes>100)return "Huge";
    else if(episodes>75)return "Very Large";
    else if(episodes>50)return "Large";
    else if(episodes>24) return "Decent";
    else if(episodes>10) return "Normal";
    else if(episodes===1) return "Movie";
    else return "Unknown";
}