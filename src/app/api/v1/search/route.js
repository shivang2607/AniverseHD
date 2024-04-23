import { NextResponse } from "next/server";
import axios from "axios";
import { LRUCache } from "lru-cache";

const options = {
    max:500,
    ttl: 1000*60*60*24*30,
}
const cache = new LRUCache(options)

export async function GET(req){
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q');
    if(typeof query !== "string"){
        return NextResponse.json({error:"Expected String type for search parameter!"}, {status:400});
    }

    if(cache.get(query)){
       return NextResponse.json(cache.get(query));
    }

    try {
        console.log("request fetched from qdrant")
        const results = await axios.post(
            `${process.env.QDRANT_URL}/collections/Anime/points/scroll`,
            {
                "filter": {
                    "must": [
                      {
                        "key": "title_english",
                        "match": {
                          "text": query
                        }
                      }
                    ]
                  },
                  "with_payload": ["start_year", "score", "type", "rating",  "images.webp.small_image_url", "main_picture", "title_english"],
                  "limit": 15
            },
            {
                headers: {
                    "api-key": process.env.QDRANT_API_KEY
                  }
            }
          );
          console.log("These are results",results);
          cache.set(query, results.data.result);
          return NextResponse.json(results.data.result);

    } catch (error) {
        console.log(error);
        return NextResponse.json(error);
    }
}