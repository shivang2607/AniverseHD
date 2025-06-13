import axios from "axios";
import { NextResponse } from "next/server";



// available server according to docs = ["gogocdn", "streamsb", "streamtape", "vidstreaming"], others servers may also be present fetch server api for getting available servers for any episode;
export async function GET(req, { params }) {
  const episodeId = params.episodeId;
  try {
    console.log("Episode URL -> ", `${process.env.SCRAPER_URL}/anime/animepahe/watch?episodeId=${encodeURIComponent(episodeId)}`);
    const data = await axios.get(`${process.env.SCRAPER_URL}/anime/animepahe/watch?episodeId=${encodeURIComponent(episodeId)}`);
    if(data?.data){
        return NextResponse.json(data?.data);
    }
    return NextResponse.json({ error: "Episode not found" }, { status: 404 });
    
  } catch (error) {
    console.error("Error fetching episode info (animepahe):", error);
    return NextResponse.json(
      { error: `Error -> ${error?.response?.data}` },
      { status: error.response?.status || 500 }
    );
  }
}
