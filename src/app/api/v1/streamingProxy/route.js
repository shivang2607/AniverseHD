import { NextResponse } from "next/server";
import axios from "axios";
import http from "http";
import https from "https";

const referer_map = {
  "tubeplx.viddsn": "https://vidwish.live/",
  "dotstream.buzz": "https://megaplay.buzz/",
  "kwikie.com": "https://kwik.si/",
  "owocdn": "https://kwik.si/",
  "uwucdn": "https://kwik.si/",
};

// Connection pooling agents
const agents = {
  http: new http.Agent({
    keepAlive: true,
    maxSockets: 300,
    maxFreeSockets: 10,
    timeout: 30000,
  }),
  https: new https.Agent({
    keepAlive: true,
    maxSockets: 300,
    maxFreeSockets: 10,
    timeout: 30000,
  }),
};

function detectReferer(url) {
  for (const key in referer_map) {
    if (url.includes(key)) return referer_map[key];
  }
  return "https://megacloud.blog/";
}

function guessContentTypeFromUrl(url) {
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase();
  switch (ext) {
    case "vtt":
    case "webvtt":
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
    default:
      return "application/octet-stream";
  }
}

function rewritePlaylistUrls(playlistText, baseUrl) {
  const referer = detectReferer(baseUrl);
  const base = new URL(baseUrl);

  return playlistText
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        if (trimmed.startsWith("#EXT-X-KEY:")) {
          return trimmed.replace(
            /URI="([^"]+)"/,
            (_, uri) =>
              `URI="/api/v1/streamingProxy?url=${encodeURIComponent(
                uri
              )}&referer=${referer}"`
          );
        }
        return line;
      }

      const resolvedUrl = new URL(trimmed, base).href;
      return `/api/v1/streamingProxy?url=${encodeURIComponent(
        resolvedUrl
      )}&referer=${referer}`;
    })
    .join("\n");
}

async function axiosStream(url, referer, rangeHeader) {
  const isHttps = url.startsWith("https:");
  const headers = {
    Referer: referer || detectReferer(url),
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    Accept: "*/*",
    "Accept-Encoding": "gzip, deflate, br",
    Connection: "keep-alive",
    ...(rangeHeader ? { Range: rangeHeader } : {}),
  };

  const response = await axios({
    method: "GET",
    url,
    headers,
    responseType: "stream",
    httpAgent: agents.http,
    httpsAgent: agents.https,
    validateStatus: () => true, // allow non-2xx responses
  });

  return response;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    const referer = searchParams.get("referer");
    const rangeHeader = request.headers.get("range");

    if (!url) {
      return NextResponse.json(
        { error: "URL parameter is required" },
        { status: 400 }
      );
    }

    const response = await axiosStream(url, referer, rangeHeader);
    const isM3U8 = url.endsWith(".m3u8");
    const contentType =
      response.headers["content-type"] || guessContentTypeFromUrl(url);

    const responseHeaders = {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Range, Content-Range, Content-Length",
    };

    // Handle partial content
    if (rangeHeader && !isM3U8) {
      responseHeaders["Accept-Ranges"] = "bytes";
      if (response.headers["content-range"])
        responseHeaders["Content-Range"] = response.headers["content-range"];
      if (response.headers["content-length"])
        responseHeaders["Content-Length"] = response.headers["content-length"];
    }

    if (isM3U8) {
      const playlistText = await new Promise((resolve, reject) => {
        let data = "";
        response.data.on("data", (chunk) => (data += chunk.toString()));
        response.data.on("end", () => resolve(data));
        response.data.on("error", reject);
      });

      const modifiedPlaylist = rewritePlaylistUrls(playlistText, url);
      return new NextResponse(modifiedPlaylist, {
        status: response.status,
        headers: { ...responseHeaders, "Cache-Control": "public, max-age=30" },
      });
    }

    if (response.headers["content-length"]) {
      responseHeaders["Content-Length"] = response.headers["content-length"];
    }

    responseHeaders["Cache-Control"] =
      "public, max-age=31536000, immutable";

    // Stream the response body
    return new Response(response.data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Error fetching data:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
