import { NextResponse } from "next/server";

export async function GET(req, {params}){
    const id = params.id;
    return NextResponse.json(id);
}