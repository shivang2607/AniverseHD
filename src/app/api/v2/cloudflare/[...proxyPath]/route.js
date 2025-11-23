import { NextResponse } from "next/server";
import { auth } from "../../../../firebase/Admin/setup";

const API_BASE_URL = `${process.env.WORKER_URL}/api/${process.env.WORKER_VERSION}`;

async function verifyAuthToken(token) {
  try {
    const decodedToken = await auth.verifyIdToken(token);
    return {
      success: true,
      userId: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      user: decodedToken,
    };
  } catch (error) {
    console.error("Token verification failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

async function proxyHandler(req, { params }) {
  const proxyPath = params.proxyPath ? params.proxyPath.join("/") : "";
  const search = req.nextUrl.search || "";
  const targetUrl = `${API_BASE_URL}/${proxyPath}${search}`;

  try {
    // Clone headers and add user-id if needed
    const headers = new Headers(req.headers);

    // Remove hop-by-hop headers that should not be forwarded
    headers.delete("host");
    headers.delete("connection");
    headers.delete("content-length");

    // Add user-id if token is present
    const token = headers.get("authorization")?.split("Bearer ")[1];
    let userId = "";

    console.log("firebase auth token ", token);

    if (token) {
      const authResult = await verifyAuthToken(token);

      console.log("firebase auth result ", authResult);
      if (authResult.success) {
        userId = authResult.userId;
        headers.set("user-id", authResult.userId);
      } else {
        console.error("[Proxy] Token verification failed:", authResult.error);
        return NextResponse.json(
          { error: "Authentication failed", details: authResult.error },
          { status: 401 }
        );
      }
    } else {
      headers.set("user-id", "");
    }

    // Prepare fetch options
    const fetchOptions = {
      method: req.method,
      headers,
      redirect: "manual",
    };

    // Attach body for all methods except GET and HEAD
    if (!["GET", "HEAD"].includes(req.method)) {
      fetchOptions.body = req.body ? req.body : await req.arrayBuffer();
      fetchOptions.duplex = "half";
    }

    // Log the request
    console.log(`[Proxy] ${req.method} ${targetUrl}`, {
      userId: userId || "anonymous",
      headers: fetchOptions.headers,
      body: fetchOptions.body,
    });

    // Proxy the request
    const proxiedResponse = await fetch(targetUrl, fetchOptions);

    // Read the response body once
    const body = await proxiedResponse.arrayBuffer();

    // Log the response
    console.log(`[Proxy] Response from ${targetUrl}:`, {
      status: proxiedResponse.status,
      statusText: proxiedResponse.statusText,
      bodySize: body.byteLength,
    });

    // Forward all response headers except hop-by-hop headers
    const resHeaders = new Headers(proxiedResponse.headers);
    resHeaders.delete("content-length");
    resHeaders.delete("connection");

    return new Response(body, {
      status: proxiedResponse.status,
      statusText: proxiedResponse.statusText,
      headers: resHeaders,
    });
  } catch (error) {
    console.error("[Proxy] Error proxying request:", error);
    return NextResponse.json(
      { error: "Proxy error", details: error.message },
      { status: 500 }
    );
  }
}

export const GET = proxyHandler;
export const POST = proxyHandler;
export const PUT = proxyHandler;
export const PATCH = proxyHandler;
export const DELETE = proxyHandler;