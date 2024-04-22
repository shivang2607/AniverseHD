import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(req){
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q')
    console.log("this is query",query)
    if(typeof query !== "string"){
        return NextResponse.json({error:"Expected String type for search parameter!"}, {status:400});
    }


    try {
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
          return NextResponse.json(results.data.result);

    } catch (error) {
        console.log(error);
        return NextResponse.json(error);
    }
}