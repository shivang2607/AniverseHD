// here goes the api code for the recommendation api
import { NextResponse } from "next/server"
import { pipeline } from "@xenova/transformers";
import axios from "axios";
import { LRUCache } from "lru-cache";



const options = {
  max:50,
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
    const {positive, fKey, scorelte, scoregte, type, yeargte, yearlte, description, selectedGenre, selectedTheme, selectedDemographics, limit, ratings} = payload;

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
            console.log("recommendation cache hit")
            return NextResponse.json(recommendCache.get(key));
          }
          console.log("cache miss")
          
          let embeddings = null;
          let positives = positive || []
          let updatedType = ["TV", "tv", "Movie", "movie", "ONA", "ona", "special", "specials", "TV Special", "Special", "Specials"]
          let updatedRatings = ["g", "G - All Ages", "pg", "PG", "pg_13", "r", "R", "R+", "r+", "R+ - Mild Nudity", "R - 17+ (violence & profanity)", "PG-13 - Teens 13 or older" ]
          
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

          if (Array.isArray(ratings) && ratings.length > 0) {
            const ratingMap = {
                "g": ["g", "G", "G - All Ages"],
                "pg": ["pg", "PG"],
                "pg_13": ["pg_13", "PG-13 - Teens 13 or older"],
                "r": ["r", "R", "R - 17+ (violence & profanity)"],
                "r+": ["r+", "R+", "R+ - Mild Nudity"]
            };
        
            updatedRatings = ratings.reduce((acc, rating) => {
                if (ratingMap[rating]) {
                    acc.push(...ratingMap[rating]);
                }
                return acc;
            }, []);
        }
        

          // console.log(updatedRatings);
          
          const filterKey = fKey || "must";


          const buildFilterObject = () => {
            const filterObject = {
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
                  "key": "rating",
                  "match": {
                    "any": updatedRatings
                  }
                }
              ]
            };
          
            // Conditionally add genres, themes, and demographics
            const shouldConditions = [];
            if (Array.isArray(selectedGenre) && selectedGenre.length > 0) {
              shouldConditions.push({
                "key": "genres",
                "match": {
                  "any": selectedGenre
                }
              });
            }
            if (Array.isArray(selectedTheme) && selectedTheme.length > 0) {
              shouldConditions.push({
                "key": "themes",
                "match": {
                  "any": selectedTheme
                }
              });
            }
            if (Array.isArray(selectedDemographics) && selectedDemographics.length > 0) {
              shouldConditions.push({
                "key": "demographics",
                "match": {
                  "any": selectedDemographics
                }
              });
            }
          
            if (shouldConditions.length > 0) {
              filterObject.must.push({ "should": shouldConditions });
            }
          
            return filterObject;
          };
          
          const filterObject = buildFilterObject();
          
          
          const recommendations = await axios.post(
            `${process.env.QDRANT_URL}/collections/Anime/points/recommend`,
            {
              "positive": positives,
              "strategy": "average_vector",
              "using": "fast-bge-small-en",
              "with_payload": [ "title", "title_english", "score", "start_year", "type", "rating", "duration", "images.webp", "main_picture", "episodes", "episode_duration"],
              "filter": filterObject,
              // "filter": {
              //   "must": [
              //     {
              //       [filterKey]: [
              //         {
              //           "key": "score",
              //           "range": {
              //             "gte": Number(scoregte) || 6.5,
              //             "lte": Number(scorelte) || null
              //           }
              //         },
              //         {
              //           "should": [
              //             {
              //               "key": "start_year",
              //               "range": {
              //                 "gte": Number(yeargte) || null,
              //                 "lte": Number(yearlte) || null
              //               }
              //             },
              //             {
              //               "key": "year",
              //               "range": {
              //                 "gte": Number(yeargte) || null,
              //                 "lte": Number(yearlte) || null
              //               }
              //             }
              //           ]
              //         }
              //       ]
              //     },
              //     {
              //       "key": "type",
              //       "match": {
              //         "any": updatedType
              //       }
              //     },
              //     {
              //       "key": "rating",
              //       "match": {
              //         "any": updatedRatings
              //       }
              //     },
              //     {
              //       "should": [
              //         {
              //           "key": "genres",
              //           "match": {
              //             "any": selectedGenre
              //           }
              //         },
              //         {
              //           "key": "themes",
              //           "match": {
              //             "any": selectedTheme
              //           }
              //         },
              //         {
              //           "key": "demographics",
              //           "match": {
              //             "any": selectedDemographics
              //           }
              //         }
              //       ]
              //     }
              //   ]
              // },
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