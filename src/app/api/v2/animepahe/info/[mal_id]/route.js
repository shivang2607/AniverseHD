import axios from "axios";
import { NextResponse } from "next/server";



export async function GET(req, { params }) {
  const mal_id = params.mal_id;
  
  try {
    const res = await axios.get(
      `${process.env.MAPPER_URL}/anime/mappings/mal_id/${mal_id}`,)
    const animepaheId = res?.data?.animepahe?.sub || null;
    if(!animepaheId) {
      //return null
      return NextResponse.json({ error: "Anime not found" }, { status: 404 });
    }

    // get the info of the anime from animepahe api
    const resp = await axios.get(`${process.env.SCRAPER_URL}/anime/animepahe/info/${animepaheId}`);
    return NextResponse.json(resp?.data);

    
  } catch (error) {
    // console.error("Error fetching anime info:", error);
    console.log({ error: `Error -> ${error?.response?.data}` })
    return NextResponse.json(
      { error: `Error -> ${error?.response?.data}` },
      { status: error.response?.status || 500 }
    );
  }
}

