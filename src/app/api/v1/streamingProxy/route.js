import { NextResponse } from "next/server";

const referer_map = {
  "tubeplx.viddsn": "https://vidwish.live/",
  "dotstream.buzz": "https://megaplay.buzz/",
  "kwikie.com": "https://kwik.si/",
  "owocdn": "https://kwik.si/",
  "uwucdn": "https://kwik.si/",
};

// Connection pooling
const agents = {
  http: new (await import("http")).Agent({
    keepAlive: true,
    maxSockets: 300,
    maxFreeSockets: 10,
    timeout: 30000,
  }),
  https: new (await import("https")).Agent({
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

async function fetchWithCustomReferer(url, referer) {
  const isHttps = url.startsWith("https:");
  return fetch(url, {
    headers: {
      referer:  referer || detectReferer(url),
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "*/*",
      "Accept-Encoding": "gzip, deflate, br",
      Connection: "keep-alive",
    },
    agent: isHttps ? agents.https : agents.http,
  });
}

function guessContentTypeFromUrl(url) {
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase();
  switch (ext) {
    case "vtt": case "webvtt": return "text/vtt";
    case "srt": return "application/x-subrip";
    case "m3u8": return "application/vnd.apple.mpegurl";
    case "mpd": return "application/dash+xml";
    case "ts": return "video/mp2t";
    case "mp4": return "video/mp4";
    case "json": return "application/json";
    case "xml": return "application/xml";
    default: return "application/octet-stream";
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
        // Rewrite AES key URI if present //! Do not comment this if block this is handling animepahe streaming since they are sending the url in form of jpg instead of ts segments
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

export async function GET(request) {
  try {
    const url = new URL(request.url).searchParams.get("url");
    const referer = new URL(request.url).searchParams.get("referer");

    if (!url) {
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 });
    }

    const response = await fetchWithCustomReferer(url, referer);
    if (!response.ok) {
      return NextResponse.json({ error: response.statusText }, { status: response.status });
    }

    const isM3U8 = url.endsWith(".m3u8");
    const contentType = response.headers.get("Content-Type") || guessContentTypeFromUrl(url);

    const responseHeaders = {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Range, Content-Range, Content-Length",
    };

    const range = request.headers.get("range");
    if (range && !isM3U8) {
      responseHeaders["Accept-Ranges"] = "bytes";
      responseHeaders["Content-Range"] = response.headers.get("Content-Range") || "";
      responseHeaders["Content-Length"] = response.headers.get("Content-Length") || "";
    }

    if (isM3U8) {
      const playlistText = await response.text();
      const modifiedPlaylist = rewritePlaylistUrls(playlistText, url);
      return new NextResponse(modifiedPlaylist, {
        status: response.status,
        headers: { ...responseHeaders, "Cache-Control": "public, max-age=30" },
      });
    }

    if (response.headers.get("Content-Length")) {
      responseHeaders["Content-Length"] = response.headers.get("Content-Length");
    }

    responseHeaders["Cache-Control"] = "public, max-age=31536000, immutable";

    return new Response(response.body, { headers: responseHeaders, status: response.status });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
