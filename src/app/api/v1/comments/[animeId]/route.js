import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req, { params }) {
  try {
    // Get the animeId from route params
    const { animeId } = params;
    
    // Get the search params from the URL
    const searchParams = req.nextUrl.searchParams;
    const epNo = searchParams.get('epNo');
    const parentCommentId = searchParams.get('parentCommentId');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    const orderBy = searchParams.get('orderBy');
    
    // Get userId from headers
    const userId = req.headers.get('user-id');
    
    const response = await axios.get(
      `${process.env.WORKER_URL}/api/${process.env.WORKER_VERSION}/${animeId}/comments`,
      {
        params: {
          epNo: epNo || 1,
          parentCommentId,
          limit: parseInt(limit) || 10,
          offset: parseInt(offset) || 0,
          orderBy
        },
        headers: {
          'user-id': userId
        }
      }
    );
    return NextResponse.json(response?.data);

  } catch (error) {
    console.error('Error fetching comments:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(req, { params }) {
    const {animeId} = params;
    const payload = await req.json();
    const {userId, userName, commentBody, epNo, isSpoiler, zoroEpId, gogoEpId, parentCommentId, repliedToUId} = payload;

    // Validate required fields
    console.log("Hello", animeId, userId, commentBody);
    if(!animeId || !userId  || !commentBody) {
        return NextResponse.json(
            { error: 'userId and commentBody are required' },
            { status: 400 }
        );
    }

    try {
        // Send only the extracted data
        const data = {
            userId,
            userName,
            commentBody,
            epNo,
            isSpoiler: isSpoiler || false,
            zoroEpId: zoroEpId || null,
            gogoEpId: gogoEpId || null,
            parentCommentId: parentCommentId || null,
            repliedToUId
        };

        const res = await axios.post(
            `${process.env.WORKER_URL}/api/${process.env.WORKER_VERSION}/${animeId}/comments`, 
            data
        );
        
        return NextResponse.json(res.data);
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: `Error -> ${error?.response?.data?.error}` },
            { status: error.response?.status || 500 }
        );
    }
}

export async function PUT(req) {
    const payload = await req.json();
    const { commentId, commentBody, isSpoiler } = payload;

    // Validate required fields
    if (!commentId || !commentBody) {
        return NextResponse.json(
            { error: 'commentId and commentBody are required' },
            { status: 400 }
        );
    }

    try {
        const data = {
            commentId:commentId,
            newBody: commentBody,
            isSpoiler: isSpoiler,
        };

        const res = await axios.put(
            `${process.env.WORKER_URL}/api/${process.env.WORKER_VERSION}/comments`,
            data
        );
        return NextResponse.json(res.data);
    } catch (error) {
        console.error('Error updating comment:', error);
        return NextResponse.json(
            { error: `Error => ${error.response?.data?.message}` },
            { status: error.response?.status || 500 }
        );
    }
}


export async function DELETE(req) {
    
    const commentId = req.nextUrl.searchParams.get('commentId');

    // Validate required commentId
    if (!commentId) {
        return NextResponse.json(
            { error: 'commentId is required' },
            { status: 400 }
        );
    }

    try {
        const res = await axios.delete(
            `${process.env.WORKER_URL}/api/${process.env.WORKER_VERSION}/comments/${commentId}`,
        );
        
        return NextResponse.json(res.data);
    } catch (error) {
        console.error('Error deleting comment:', error);
        return NextResponse.json(
            { error: 'Failed to delete comment' },
            { status: error.response?.status || 500 }
        );
    }
}