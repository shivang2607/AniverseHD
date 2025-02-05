import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req) {
    const payload = await req.json();
    //values of reactionType can be ["like", "dislike", null/undefined], can be undefiend because it is handled in the worker code, so to remove like or dislike just dont send the reactionType variable
    const {commentId, userId, reactionType = null} = payload;

    // Validate required fields
    
    if(!commentId || !userId  || !["like", "dislike", null].includes(reactionType)) {
        return NextResponse.json(
            { error: "Invalid input. Ensure commentId, userId, and reactionType are valid." },
            { status: 400 }
        );
    }

    try {
        // Send only the extracted data
        const data = {
            userId,
            commentId,
            reactionType
        };

        const res = await axios.post(
            `${process.env.WORKER_URL}/api/${process.env.WORKER_VERSION}/comments/${commentId}/react`, 
            data
        );
        
        return NextResponse.json(res.data);
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: `Error -> ${error}` },
            { status: error.status || 500 }
        );
    }
}