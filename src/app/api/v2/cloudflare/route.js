import { NextResponse } from "next/server";
import {auth} from "../../../firebase/Admin/setup";

const API_BASE_URL = `${process.env.WORKER_URL}/api/${process.env.WORKER_VERSION}`;

async function verifyAuthToken(token) {
  try {
    const decodedToken = await auth.verifyIdToken(token);
    return {
      success: true,
      userId: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      user: decodedToken
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}


export async function GET(req) {
  const token = req.headers.get("Authorization")?.split("Bearer ")[1];
  if(!token) {
    req.headers["user-id"] = "";
  }else{
    const authResult = await verifyAuthToken(token);
    if (authResult.success) {
      req.headers["user-id"] = authResult.userId;
    } else {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
  }





  return NextResponse.json({ message: "Cloudflare route is operational.", headers: req.headers });
}

