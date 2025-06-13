"use client";

import { useEffect, useRef } from "react";
import Artplayer from "artplayer";
import Hls from "hls.js";
import { toast } from "react-hot-toast";

Artplayer.USE_RAF = true;

export default function ArtVideoPlayer({
  src,
  getNextEpisode,
  getPrevEpisode,
  defaultQuality = "1080p",
  sources,
  title,
  poster,
  subtitles = [],
  thumbnails,
  startTime,
  recentTimestampRef,
}) {
  const artRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (!artRef.current || !src) return;

    const cleanup = () => {
      if (playerRef.current) {
        try {
          const video = playerRef.current.video;
          if (video && video.hls) {
            video.hls.destroy();
            video.hls = null;
          }
          playerRef.current.destroy();
        } catch (error) {
          console.warn("Error during cleanup:", error);
        } finally {
          playerRef.current = null;
        }
      }
    };

    cleanup();

    const timer = setTimeout(() => {
      if (!artRef.current) return;

      const option = {
        container: artRef.current,
        url: src,
        type: "m3u8",
        title: title || "TITLE",
        poster: poster || "",
        autoplay: true,
        flip: true,
        aspectRatio: true,
        mutex: true,
        miniProgressBar: true,
        setting: true,
        fullscreen: true,
        playbackRate: true,
        screenshot: true,
        pip: true,
        fastForward: true,
        autoOrientation: true,
        airplay: true,
        theme: "#7289da",
        quality: sources?.map((source) => ({
          html: source?.quality,
          url: `/api/v1/streamingProxy?url=${source?.url}`,
        })),
        moreVideoAttr: {
          crossOrigin: "anonymous",
        },
        customType: {
          m3u8: function (video, url) {
            if (video.hls) {
              video.hls.destroy();
              video.hls = null;
            }

            if (Hls.isSupported()) {
              const hls = new Hls({
                enableWorker: false,
                maxBufferLength: 30,
                maxMaxBufferLength: 60,
              });

              hls.loadSource(url);
              hls.attachMedia(video);
              video.hls = hls;

              hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                  console.error("HLS fatal error:", data);
                  toast.error("Sorry! Streaming source not available. Try a different source.");
                }
              });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
              video.src = url;
            } else {
              toast.error("Browser doesn't support HLS or this format.");
            }

            video.onerror = () => {
              console.error("Video playback failed");
              // toast.error("Streaming Source not available. Try another Server or Provider!");
            };

            // ⏩ Seek once video metadata is available
            video.onloadedmetadata = () => {
              try {
                if (startTime && !isNaN(startTime)) {
                  video.currentTime = startTime;
                  console.log("Seeked to startTime:", startTime);
                }
              } catch (err) {
                console.warn("Failed to seek:", err);
              }
            };
          },
        },
      };

      try {
        const art = new Artplayer(option);

        art.on("video:timeupdate", () => {
          const t = art.currentTime;
          if (
            Math.floor(t) % 5 === 0 &&
            Math.floor(t) !== Math.floor(recentTimestampRef.current)
          ) {
            console.log("saving recent timestamp", recentTimestampRef.current);
            recentTimestampRef.current = t;
          }
        });

        art.on("keydown", (event) => {
          const tag = document.activeElement.tagName.toLowerCase();
          const isTyping =
            tag === "input" ||
            tag === "textarea" ||
            document.activeElement.isContentEditable;
          if (isTyping) return;

          const key = event.key.toLowerCase();

          switch (key) {
            case "f":
              art.fullscreen = !art.fullscreen;
              break;
            case "m":
              art.muted = !art.muted;
              break;
            case "arrowright":
              art.forward = 10;
              break;
            case "arrowleft":
              art.backward = 10;
              break;
            case " ":
              event.preventDefault();
              art.toggle();
              break;
            case "p":
              getPrevEpisode();
              break;
            case "n":
              getNextEpisode();
              break;
          }
        });

        playerRef.current = art;
      } catch (error) {
        console.error("Error initializing Artplayer:", error);
        toast.error("Failed to load the player. Try again.");
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      cleanup();
    };
  }, [src]);

  return (
    <div
      ref={artRef}
      className="w-full h-full rounded-2xl overflow-hidden shadow-lg"
    />
  );
}
