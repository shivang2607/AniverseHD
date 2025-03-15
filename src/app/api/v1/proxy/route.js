import { NextResponse } from "next/server";

async function fetchWithCustomReferer(url) {
  if (!url) throw new Error("URL is required");

  const response = await fetch(url, {
    headers: {
      Referer: "https://megacloud.club/", // Modify as needed
      "User-Agent": "Mozilla/5.0", // Optional: Customize or forward User-Agent
    },
  });

  return response;
}

export async function GET(request, { params }) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "URL parameter is required" }, { status: 400 });
  }

  try {
    const response = await fetchWithCustomReferer(url);
    const data = await response.text(); // Use response.json() if the API returns JSON

    return new NextResponse(data, {
      status: response.status,
      headers: { "Content-Type": response.headers.get("Content-Type") || "text/plain" },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
