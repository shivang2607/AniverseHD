import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  let genres = searchParams.get("genres");
  let minScore = searchParams.get("minScore");
  const yeargte= searchParams.get("yeargte");
  const yearlte= searchParams.get("yearlte");
  // console.log("yeargte", yeargte);
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
              key: "start_year",
              range: {
                gte: new Date(yeargte).getFullYear() || null,
                lte: new Date(yearlte).getFullYear() || null,
              },
            },
          ],
        },
        with_payload: [
          "score",
          "start_year",
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
    return NextResponse.json(results.data.result);
  } catch (error) {
    // console.log("error", error);
    return NextResponse.json(error);
  }
}
