import { LRUCache } from "lru-cache";
import { NextResponse } from "next/server";

const options = {
  max: 2000, // Maximum 2000 segments
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

async function fetchWithCustomReferer(url, referer = null, rangeHeader = null) {
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

  const headers = {
    referer: referer,
    "User-Agent": "Mozilla/5.0",
    "Connection": "keep-alive",
  };

  // Forward range requests for better streaming
  if (rangeHeader) {
    headers["Range"] = rangeHeader;
  }

  return fetch(url, { headers });
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

export async function GET(request) {
  try {
    const url = new URL(request.url).searchParams.get("url");
    const origin = request.headers.get("origin") || null;
    const referer = new URL(request.url).searchParams.get("referer") || null;
    const range = request.headers.get("range"); // Get range header for streaming
    
    if (!url) {
      return NextResponse.json(
        { error: "URL parameter is required" },
        { status: 400 }
      );
    }

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

    // Pass range header for partial content requests
    const response = await fetchWithCustomReferer(url, referer, range);
    const contentType = response.headers.get("Content-Type");
    const contentLength = response.headers.get("Content-Length");
    const isM3U8 = url.endsWith(".m3u8");

    if (!response.ok) {
      return NextResponse.json(
        { error: response.statusText },
        { status: response.status }
      );
    }

    const responseHeaders = {
      "Content-Type": contentType || guessContentTypeFromUrl(url),
      "Access-Control-Allow-Origin": isAllowedOrigin ? origin : "null",
    };

    // Handle range requests properly
    if (range && response.status === 206) {
      responseHeaders["Accept-Ranges"] = "bytes";
      responseHeaders["Content-Range"] = response.headers.get("Content-Range");
      responseHeaders["Content-Length"] = response.headers.get("Content-Length");
    } else if (contentLength) {
      responseHeaders["Content-Length"] = contentLength;
    }

    if (isM3U8) {
      // Handle playlists (small files)
      const playlistText = await response.text();
      const modifiedPlaylist = rewritePlaylistUrls(playlistText, url);

      return new NextResponse(modifiedPlaylist, {
        status: 200,
        headers: {
          ...responseHeaders,
          "Content-Type": "application/vnd.apple.mpegurl",
          "Cache-Control": "public, max-age=30",
        },
      });
    } else {
      // Changes from loading data in buffer then passing the buffer to streaming directly
      // to streaming the response body directly to reduce memory usage and latency
      return new NextResponse(response.body, {
        status: response.status,
        headers: {
          ...responseHeaders,
          "Cache-Control": "public, max-age=31536000, immutable",
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