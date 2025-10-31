import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req, { params }) {
    try {
        const {commentId} = params;
        const userId = req.headers.get('user-id');
        console.log("comment fetched for comment id =>", commentId)
        const response = await axios.get(
            `${process.env.WORKER_URL}/api/${process.env.WORKER_VERSION}/comments/${commentId}`,
            { headers: { 'user-id': userId } }
        );
        return NextResponse.json(response?.data); // since the output array will always have one element we will return the first element of the array itself
        
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch comment' },
            { status: error.response?.status || 500 }
        );
    }
}

