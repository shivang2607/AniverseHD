import { NextResponse } from "next/server";
import getAnime from "./mainFunction";

export const runtime = "edge";



export async function GET(req, {params}){
    const id = params.id;
    const res = await getAnime(id);
    return NextResponse.json(res);
    
}


