import axios from "axios";
import { NextResponse } from "next/server";



export async function GET(req, { params }) {
  const mal_id = params.mal_id;
  
  try {
    const res = await axios.get(
      `${process.env.MAPPER_URL}/anime/mappings/mal_id/${mal_id}`,)
        return NextResponse.json(res?.data);  



    
  } catch (error) {
    // console.error("Error fetching anime info:", error);
    return NextResponse.json(
      { error: `Error in mappings -> ${error?.response?.data}` },
      { status: error.response?.status || 500 }
    );
  }
}

