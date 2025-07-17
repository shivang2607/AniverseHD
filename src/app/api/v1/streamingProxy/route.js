import { LRUCache } from "lru-cache";
import { NextResponse } from "next/server";

const options = {
    max:2000,  // Maximum 2000 segments
    ttl: 1000*60*30, // 30 minutes
}
const cache = new LRUCache(options)


async function fetchWithCustomReferer(url) {
  if (!url) throw new Error("URL is required");
  return fetch(url, {
    headers: {
      "referer": "https://kwik.si/",
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
      if (trimmed.startsWith("#") || trimmed === ""){
        // return line;
         if (trimmed.startsWith("#EXT-X-KEY:METHOD=AES-128,URI=")) {
            const uriMatch = trimmed.match(/URI="([^"]+)"/);
            if (uriMatch) {
                const originalUrl = uriMatch[1];
                const proxiedUrl = `/api/v1/streamingProxy?url=${encodeURIComponent(originalUrl)}`;
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

    // if (cache.get(url)) {
    //     console.log("Streaming proxy cache hit");
    //     const segment_file = cache.get(url);
    //     return new NextResponse(segment_file, {
    //         status: 200,
    //         headers: {
    //             "Content-Type": "video/mp2t",
    //             "Cache-Control": "public, max-age=31536000, immutable",
    //             "Access-Control-Allow-Origin": "*",
    //         },
    //     });
    // }

    const response = await fetchWithCustomReferer(url);
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
      // Handle segments (TS files)
      // let segment_file = cache.get(url);
      // if (!segment_file) {
      //   segment_file = Buffer.from(await response.arrayBuffer());
      //   cache.set(url, segment_file);
      // }
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
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}