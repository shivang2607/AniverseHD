import { NextResponse } from "next/server";

async function fetchWithCustomReferer(url) {
  if (!url) throw new Error("URL is required");

  const response = await fetch(url, {
    headers: {
      "referer": "https://megacloud.club/", // Modify as needed
      "User-Agent": "Mozilla/5.0", // Optional: Customize or forward User-Agent
    },
  });

  return response;
}

// In your Next.js API route
export async function GET(request, { params }) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "URL parameter is required" }, { status: 400 });
  }

  try {
    const response = await fetchWithCustomReferer(url);
    const contentType = response.headers.get("Content-Type");

    return new NextResponse(await response.arrayBuffer(), {
      status: response.status,
      headers: {
        "Content-Type": contentType || "video/mp2t",
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}