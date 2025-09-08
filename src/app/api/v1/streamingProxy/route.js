import { LRUCache } from "lru-cache";
import { NextResponse } from "next/server";

const options = {
  max: 2000,
  ttl: 1000 * 60 * 30, // 30 minutes
};
const cache = new LRUCache(options);

const referer_map = {
  "tubeplx.viddsn": "https://vidwish.live/",
  "dotstream.buzz": "https://megaplay.buzz/",
  "kwikie.com": "https://kwik.si/",
};

const allowedOrigins = [
  "https://aniversehd.com",
  "https://aniversehd.cc",
  "https://aniversehd.in",
  "http://localhost:3000",
];

// Connection pooling for better performance
const agents = {
  http: new (await import('http')).Agent({
    keepAlive: true,
    maxSockets: 50,
    maxFreeSockets: 10,
    timeout: 30000,
  }),
  https: new (await import('https')).Agent({
    keepAlive: true,
    maxSockets: 50,
    maxFreeSockets: 10,
    timeout: 30000,
  }),
};

async function fetchWithCustomReferer(url, referer = null) {
  if (!url) throw new Error("URL is required");

  if (!referer) {
    referer = "https://kwik.si/";
    for (const key in referer_map) {
      if (url.includes(key)) {
        referer = referer_map[key];
        break;
      }
    }
  }

  const isHttps = url.startsWith('https:');
  
  return fetch(url, {
    headers: {
      referer: referer,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept": "*/*",
      "Accept-Encoding": "gzip, deflate, br",
      "Connection": "keep-alive",
    },
    // Use connection pooling
    agent: isHttps ? agents.https : agents.http,
  });
}

function guessContentTypeFromUrl(url) {
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase();
  switch (ext) {
    case "vtt":
      return "text/vtt";
    case "srt":
      return "application/x-subrip";
    case "m3u8":
      return "application/vnd.apple.mpegurl";
    case "mpd":
      return "application/dash+xml";
    case "ts":
      return "video/mp2t";
    case "mp4":
      return "video/mp4";
    case "json":
      return "application/json";
    case "xml":
      return "application/xml";
    case "webvtt":
      return "text/vtt";
    default:
      return "application/octet-stream";
  }
}

function rewritePlaylistUrls(playlistText, baseUrl) {
  let referer = "https://kwik.si/";

  for (const key in referer_map) {
    if (baseUrl.includes(key)) {
      referer = referer_map[key];
      break;
    }
  }

  const base = new URL(baseUrl);
  return playlistText
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("#") || trimmed === "") {
        if (trimmed.startsWith("#EXT-X-KEY:METHOD=AES-128,URI=")) {
          const uriMatch = trimmed.match(/URI="([^"]+)"/);
          if (uriMatch) {
            const originalUrl = uriMatch[1];
            const proxiedUrl = `/api/v1/streamingProxy?url=${encodeURIComponent(
              originalUrl
            )}&referer=${referer}`;
            return trimmed.replace(/URI="[^"]+"/, `URI="${proxiedUrl}"`);
          }
          return trimmed;
        } else {
          return line;
        }
      }

      const resolvedUrl = new URL(trimmed, base).href;
      return `/api/v1/streamingProxy?url=${encodeURIComponent(
        resolvedUrl
      )}&referer=${referer}`;
    })
    .join("\n");
}

// Create a ReadableStream from the response for true streaming
function createStreamingResponse(response, headers) {
  const reader = response.body?.getReader();
  
  if (!reader) {
    throw new Error("Response body is not readable");
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            controller.close();
            break;
          }
          
          controller.enqueue(value);
        }
      } catch (error) {
        controller.error(error);
      }
    },
    
    cancel() {
      reader.releaseLock();
    }
  });

  return new Response(stream, { headers });
}

export async function GET(request) {
  try {
    const url = new URL(request.url).searchParams.get("url");
    const origin = request.headers.get("origin") || null;
    const referer = new URL(request.url).searchParams.get("referer") || null;
    
    if (!url) {
      return NextResponse.json(
        { error: "URL parameter is required" },
        { status: 400 }
      );
    }

    // Check for cached content first (for small files like playlists)
    const cacheKey = `${url}_${referer}`;
    const cached = cache.get(cacheKey);
    
    const normalize = (url) => url.replace(/^https?:\/\//, "");

    let isAllowedOrigin = false;

    if (origin) {
      isAllowedOrigin =
        origin.endsWith(".aniversehd.com") || allowedOrigins.includes(origin);
    } else {
      const host = request.headers.get("host") || "";
      isAllowedOrigin =
        host.endsWith(".aniversehd.com") ||
        allowedOrigins.some((o) => normalize(o) === host);
    }

    if (!isAllowedOrigin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // For cached playlists
    if (cached && url.endsWith(".m3u8")) {
      return new NextResponse(cached, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl",
          "Cache-Control": "public, max-age=30",
          "Access-Control-Allow-Origin": isAllowedOrigin ? origin : "null",
        },
      });
    }

    const response = await fetchWithCustomReferer(url, referer);
    const contentType = response.headers.get("Content-Type");
    const contentLength = response.headers.get("Content-Length");
    const isM3U8 = url.endsWith(".m3u8");

    if (!response.ok) {
      return NextResponse.json(
        { error: response.statusText },
        { status: response.status }
      );
    }

    // Common headers
    const responseHeaders = {
      "Content-Type": contentType || guessContentTypeFromUrl(url),
      "Access-Control-Allow-Origin": isAllowedOrigin ? origin : "null",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Range, Content-Range, Content-Length",
    };

    // Handle range requests for video segments
    const range = request.headers.get("range");
    if (range && !isM3U8) {
      responseHeaders["Accept-Ranges"] = "bytes";
      responseHeaders["Content-Range"] = response.headers.get("Content-Range") || "";
      responseHeaders["Content-Length"] = response.headers.get("Content-Length") || "";
    }

    if (isM3U8) {
      // Handle playlists (small files, can be buffered)
      const playlistText = await response.text();
      const modifiedPlaylist = rewritePlaylistUrls(playlistText, url);
      
      // Cache the playlist
      cache.set(cacheKey, modifiedPlaylist);

      return new NextResponse(modifiedPlaylist, {
        status: response.status,
        headers: {
          ...responseHeaders,
          "Content-Type": "application/vnd.apple.mpegurl",
          "Cache-Control": "public, max-age=30", // Short cache for playlists
        },
      });
    } else {
      // Handle video segments and other binary files with TRUE STREAMING
      if (contentLength) {
        responseHeaders["Content-Length"] = contentLength;
      }
      
      // Set appropriate cache headers for video segments
      responseHeaders["Cache-Control"] = "public, max-age=31536000, immutable";
      
      // Create streaming response
      return createStreamingResponse(response, responseHeaders);
    }
  } catch (error) {
    console.log("Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}