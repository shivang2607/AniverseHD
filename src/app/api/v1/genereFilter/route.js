import { NextResponse } from "next/server";
import axios from "axios";
import { LRUCache } from "lru-cache";



const options = {
  max:100,
  ttl: 1000*60*60*24*30,
}
const genreFilterCache = new LRUCache(options);

function serializePayload(payload) {
  const serialized = [];

  // Serialize each key-value pair in the payload
  for (const key of Object.keys(payload).sort()) {
      serialized.push(`${key}:${JSON.stringify(payload[key])}`);
  }

  // Join the serialized key-value pairs into a single string
  return serialized.join(',');
}

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  let genres = searchParams.get("genres");
  let minScore = searchParams.get("minScore");
  const yeargte= searchParams.get("yeargte");
  const yearlte= searchParams.get("yearlte");

  const cacheObject= {
    "genres": genres,
    "minScore":minScore,
    "yeargte":yeargte,
    "yearlte":yearlte
  }
  const key = serializePayload(cacheObject);

  if(genreFilterCache.get(key)){
    // console.log("cache hit")
    return NextResponse.json(genreFilterCache.get(key));
  }

  genres = genres.split(",");

  

  try {
    const results = await axios.post(
      `${process.env.QDRANT_URL}/collections/Anime/points/scroll`,
      {
        filter: {
          should: [
            {
              key: "genres",
              match: {
                any: genres,
              },
            },
            {
              key: "themes",
              match: {
                any: genres,
              },
            },
          ],
          must: [
            {
              key: "score",
              range: {
                gte: Number(minScore) || 0,
              },
            },
            {
              "should": [
                {
                  "key": "start_year",
                  "range": {
                      "gte": Number(yeargte) || null,
                      "lte" : Number(yearlte) || null,
                  }
              },
              {
                "key": "year",
                "range": {
                    "gte": Number(yeargte) || null,
                    "lte" : Number(yearlte) || null,
                }
            },

              ]
            },
          ],
        },
        with_payload: [
          "score",
          "start_year",
          "year",
          "type",
          "rating",
          "images.webp.small_image_url",
          "main_picture",
          "title_english",
          "title_japanese",
          "genres",
          "themes",
        ],
        limit: 40,
      },
      {
        headers: {
          "api-key": process.env.QDRANT_API_KEY,
        },
      }
    );
    //console.log("hett", results.data.result);
    genreFilterCache.set(key, results.data.result);
    return NextResponse.json(results.data.result);
  } catch (error) {
    // console.log("error", error);
    return NextResponse.json(error);
  }
}
