// here goes the api code for the recommendation api
import { NextResponse } from "next/server"
import { pipeline } from "@xenova/transformers";
import axios from "axios";
import { LRUCache } from "lru-cache";

const options = {
  max:300,
  ttl: 1000*60*60*24*30,
}
const recommendCache = new LRUCache(options)

async function encodeText(text) {
    const extractor = await pipeline("feature-extraction", "Xenova/bge-small-en-v1.5");
    return await extractor(text, {pooling: "mean", normalize: true});
}


function serializePayload(payload) {
  const serialized = [];

  // Serialize each key-value pair in the payload
  for (const key of Object.keys(payload).sort()) {
      serialized.push(`${key}:${JSON.stringify(payload[key])}`);
  }

  // Join the serialized key-value pairs into a single string
  return serialized.join(',');
}


export async function POST(req){
  try {
    const payload = await req.json();
    const key = serializePayload(payload);
    const {positive, fKey, scorelte, scoregte, type, yeargte, yearlte, description, selectedGenre, selectedTheme, selectedDemographics, limit} = payload;

    // console.log(selectedGenre ,selectedTheme, selectedDemographics);
    
    if(!positive && !description){
      return NextResponse.json(
        { error: 'Please Provide positive array or description text!!' },
        { status: 400 })
      }
      else{
        if(positive && !Array.isArray(positive)){
          return NextResponse.json(
            { error: 'positive key should be an array of anime ids!!' },
            { status: 400 })
          }
          if(description && typeof description !=="string"){
            return NextResponse.json(
              { error: 'description should be string type!!' },
              { status: 400 })
            }
            if(description && description.split(" ").length <5){
              return NextResponse.json(
                { error: 'description should have at least 5 words!!' },
                { status: 400 })
              }
            }
            
            
            if(type!==undefined && !Array.isArray(type))
            return NextResponse.json(
          {error:"type is not an Array, please provide array with valid values"},
          {status: 400 })

          if(recommendCache.get(key)){
            console.log("cache hit")
            return NextResponse.json(recommendCache.get(key));
          }
          console.log("cache miss")
          
          let embeddings = null;
          let positives = positive || []
          let updatedType = ["TV", "tv", "Movie", "movie", "ONA", "ona", "special", "specials", "TV Special", "Special", "Specials"]
          
          if (description && description?.trim()!==""){
            embeddings = await encodeText(description || "Naruto Shippuden");
            positives.push(Object.values(embeddings.data));
          }
          if(Array.isArray(type) && type.length>0){
            updatedType = type.concat(type.map(value => value.toLowerCase()));
            if (type.includes("special")) {
              updatedType.push("TV Special");
            }
            
          }
          
          const filterKey = fKey || "must";
          
          const recommendations = await axios.post(
            `${process.env.QDRANT_URL}/collections/Anime/points/recommend`,
            {
              "positive": positives,
              "strategy": "average_vector",
              "using": "fast-bge-small-en",
              "with_payload": ["title", "title_english", "score", "start_year", "type", "rating", "duration", "images.webp", "main_picture", "episodes", "episode_duration"],
              "filter": {
                "must": [
                  {
                    [filterKey]: [
                      {
                        "key": "score",
                        "range": {
                          "gte": Number(scoregte) || 6.5,
                          "lte": Number(scorelte) || null
                        }
                      },
                      {
                        "should": [
                          {
                            "key": "start_year",
                            "range": {
                              "gte": Number(yeargte) || null,
                              "lte": Number(yearlte) || null
                            }
                          },
                          {
                            "key": "year",
                            "range": {
                              "gte": Number(yeargte) || null,
                              "lte": Number(yearlte) || null
                            }
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "key": "type",
                    "match": {
                      "any": updatedType
                    }
                  },
                  {
                    "should": [
                      {
                        "key": "genres",
                        "match": {
                          "any": selectedGenre
                        }
                      },
                      {
                        "key": "themes",
                        "match": {
                          "any": selectedTheme
                        }
                      },
                      {
                        "key": "demographics",
                        "match": {
                          "any": selectedDemographics
                        }
                      }
                    ]
                  }
                ]
              },
              "limit": limit || 100
            },
            {
              headers: {
                "api-key": process.env.QDRANT_API_KEY
              }
            }
          );
          
      
      recommendCache.set(key, recommendations.data.result);
      return NextResponse.json(recommendations.data.result);


    } catch (error) {
      console.log(error);
      return NextResponse.json(error, {status: 500})
    }
}