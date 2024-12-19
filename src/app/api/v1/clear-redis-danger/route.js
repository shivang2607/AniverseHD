import redisClient from "@/lib/redis";
import { NextResponse } from "next/server";


export async function GET(){
 await redisClient.flushall();
 return NextResponse.json({msg:"Api executed!"});
}