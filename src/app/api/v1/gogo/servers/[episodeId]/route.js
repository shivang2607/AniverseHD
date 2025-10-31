import axios from "axios";
import { NextResponse } from "next/server";



export async function GET(req, {params}){
    const episodeId = params.episodeId;
    
    try {
        const res = await axios.get(`${process.env.SCRAPER_URL}/anime/gogoanime/servers/${episodeId}`);
        return NextResponse.json(res?.data);
    } catch (error) {
        console.log(error);
        return NextResponse.error(error);
    }
}