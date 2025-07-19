import { ref } from "firebase/storage";
import { LRUCache } from "lru-cache";
import { NextResponse } from "next/server";

const options = {
    max:2000,  // Maximum 2000 segments
    ttl: 1000*60*30, // 30 minutes
}
const cache = new LRUCache(options)

const referer_map = {
  "tubeplx.viddsn": "https://vidwish.live/",
  "dotstream.buzz": "https://megaplay.buzz/",
  "kwikie.com": "https://kwik.si/",
}

async function fetchWithCustomReferer(url, referer=null) {
  if (!url) throw new Error("URL is required");

  if(!referer){
    referer = "https://kwik.si/";
    for (const key in referer_map) {
      if (url.includes(key)){
        referer = referer_map[key];
        break;
      }
    }
  }

  // console.log("Fetching URL:", url, "with referer:", referer);

  return fetch(url, {
    headers: {
      "referer": referer,
      "User-Agent": "Mozilla/5.0",
    },
  });
}

// Helper to resolve URLs and rewrite them to use the proxy
function rewritePlaylistUrls(playlistText, baseUrl) {
  let referer = "https://kwik.si/";

  for (const key in referer_map) {
    if (baseUrl.includes(key)){
      referer = referer_map[key];
      break;
    }
  }

  const base = new URL(baseUrl);
  return playlistText
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("#") || trimmed === ""){
        // return line;
         if (trimmed.startsWith("#EXT-X-KEY:METHOD=AES-128,URI=")) {
            const uriMatch = trimmed.match(/URI="([^"]+)"/);
            if (uriMatch) {
                const originalUrl = uriMatch[1];
                const proxiedUrl = `/api/v1/streamingProxy?url=${encodeURIComponent(originalUrl)}&referer=${referer}`;
                return trimmed.replace(/URI="[^"]+"/, `URI="${proxiedUrl}"`);
            }
            return trimmed;
        } else {
            return line;
        }
      }

      // Resolve relative URLs to absolute
      const resolvedUrl = new URL(trimmed, base).href;
      // Point to the proxy for subsequent requests
      return `/api/v1/streamingProxy?url=${encodeURIComponent(resolvedUrl)}&referer=${referer}`;
    })
    .join("\n");
}

export async function GET(request) {
  try {
    const url = new URL(request.url).searchParams.get("url");
    const referer = new URL(request.url).searchParams.get("referer") || null;
    if (!url) {
      return NextResponse.json(
        { error: "URL parameter is required" },
        { status: 400 }
      );
    }

    const response = await fetchWithCustomReferer(url, referer);
    const contentType = response.headers.get("Content-Type");
    const isM3U8 = url.endsWith(".m3u8");

    if (!response.ok) {
      return NextResponse.json(
        { error: response.statusText },
        { status: response.status }
      );
    }

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
      return new NextResponse(Buffer.from(await response.arrayBuffer()), {
        status: 200,
        headers: {
          "Content-Type": "video/mp2t",
          "Cache-Control": "public, max-age=31536000, immutable",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  } catch (error) {
    console.log("Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}