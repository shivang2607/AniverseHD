// here goes the api code for the recommendation api
import { NextResponse } from "next/server"
import { pipeline } from "@xenova/transformers";
import axios from "axios";

async function encodeText(text) {
    const extractor = await pipeline("feature-extraction", "Xenova/bge-small-en-v1.5");
    return await extractor(text, {pooling: "mean", normalize: true});
}



export async function POST(req){
  try {
    const {positive, fKey, scorelte, scoregte, type, yeargte, yearlte, description, limit} = await req.json();
    
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
        console.log(description.split())
        return NextResponse.json(
          { error: 'description should have at least 5 words!!' },
          { status: 400 })
      }
    }
    
    
    if(type!==undefined && !Array.isArray(type))
      return NextResponse.json(
        {error:"type is not an Array, please provide array with valid values"},
        {status: 400 })

    let embeddings = null;
    let positives = positive || []
    let updatedType = ["TV", "tv", "Movie", "movie", "ONA", "ona"]
    
    if (description && description?.trim()!==""){
      embeddings = await encodeText(description || "Naruto Shippuden");
      positives.push(Object.values(embeddings.data));
    }
    if(Array.isArray(type) && type.length>0){
      updatedType = type.concat(type.map(value => value.toLowerCase()));
    }
        
      const filterKey = fKey || "must";

      const recommendations = await axios.post(
        `${process.env.QDRANT_URL}/collections/Anime/points/recommend`,
        {
          "positive": positives,
          "strategy": "average_vector",
          "using": "fast-bge-small-en",
          "with_payload": ["title", "title_english", "score", "start_year", "type", "rating"],
          "filter":{
            [filterKey] :[
              {
                "key": "score",
                "range": {
                    "gte": scoregte || 6.5,
                    "lte" : scorelte || null,
                }
            },
            {
              "key": "start_year",
              "range": {
                  "gte": yeargte || null,
                  "lte" : yearlte || null,
              }
          },
          {
            "key": "type",
            "match": {
              "any": updatedType
            }
          }
            ]
          },
          "limit": limit || 50
        },
        {
          headers: {
            "api-key": process.env.QDRANT_API_KEY
          }
        },
      );

      return NextResponse.json(recommendations.data.result);


    } catch (error) {
      console.log(error);
      return NextResponse.json(error, {status: 500})
    }
}