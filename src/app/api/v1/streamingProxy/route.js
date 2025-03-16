import { NextResponse } from "next/server";

async function fetchWithCustomReferer(url) {
  if (!url) throw new Error("URL is required");
  return fetch(url, {
    headers: {
      referer: "https://megacloud.club/",
      "User-Agent": "Mozilla/5.0",
    },
  });
}

// Helper to resolve URLs and rewrite them to use the proxy
function rewritePlaylistUrls(playlistText, baseUrl) {
  const base = new URL(baseUrl);
  return playlistText
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("#") || trimmed === "") return line;

      // Resolve relative URLs to absolute
      const resolvedUrl = new URL(trimmed, base).href;
      // Point to the proxy for subsequent requests
      return `/api/v1/streamingProxy?url=${encodeURIComponent(resolvedUrl)}`;
    })
    .join("\n");
}

export async function GET(request) {
  const url = new URL(request.url).searchParams.get("url");
  if (!url) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetchWithCustomReferer(url);
    const contentType = response.headers.get("Content-Type");
    const isM3U8 = url.endsWith(".m3u8");

    if (isM3U8) {
      // Rewrite URLs in the playlist
      const playlistText = await response.text();
      const modifiedPlaylist = rewritePlaylistUrls(playlistText, url);

      return new NextResponse(modifiedPlaylist, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl",
          "Cache-Control": "public, max-age=31536000, immutable",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } else {
      // Handle segments (TS files)
      return new NextResponse(await response.arrayBuffer(), {
        status: 200,
        headers: {
          "Content-Type": "video/mp2t",
          "Cache-Control": "public, max-age=31536000, immutable",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}