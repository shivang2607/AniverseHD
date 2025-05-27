import { NextResponse } from "next/server";
import axios from "axios";
import { load } from "cheerio";
import Kwik from "./Kwik";

const baseUrl = "https://animepahe.ru";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const episodeId = searchParams.get("episodeId");

    if (!episodeId) {
      return NextResponse.json(
        { error: "Missing episodeId parameter" },
        { status: 400 }
      );
    }

    const sessionId = episodeId.split("/")[0];
    const headers = {
      authority: "animepahe.ru",
      accept: "application/json, text/javascript, */*; q=0.01",
      "accept-language": "en-US,en;q=0.9",
      cookie: "_ddg2=;",
      dnt: "1",
      referer: `${baseUrl}/anime/${sessionId}`,
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    };

    // Fetch episode page
    const { data } = await axios.get(`${baseUrl}/play/${episodeId}`, { headers });
    const $ = load(data);

    // Extract video links
    const links = $("div#resolutionMenu > button")
      .map((i, el) => ({
        url: $(el).attr("data-src"),
        quality: $(el).text().trim(),
        audio: $(el).attr("data-audio"),
      }))
      .get();

    // Process Kwik links
    const iSource = { sources: []};
    for (const link of links) {
      try {
        const kwik = new Kwik();
        const sources = await kwik.extract(new URL(link.url));
        
        if (sources.length > 0) {
          iSource.sources.push({
            ...sources[0],
            quality: link.quality,
            isDub: link.audio === "eng",
          });
        }
      } catch (error) {
        console.error(`Error processing ${link.url}:`, error);
      }
    }

    return NextResponse.json(iSource);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}