"use client";

import { useEffect, useRef } from "react";
import Artplayer from "artplayer";
import Hls from "hls.js";
import { toast } from "react-hot-toast";

Artplayer.USE_RAF = true;
Artplayer.MOBILE_CLICK_PLAY = true;
Artplayer.ASPECT_RATIO = ["default", "4:3", "16:9", "18:9", "21:9"];

export default function ArtVideoPlayer({
  src,
  getNextEpisode,
  getPrevEpisode,
  defaultQuality = "1080p",
  setDuration,
  sources,
  intro,
  outro,
  isAutoSkip,
  title,
  poster,
  subtitles = [],
  thumbnail,
  startTime,
  recentTimestampRef,
  mediaPlayerState,
}) {
  const skipStyle = {
    position: "absolute",
    display: "none",
    border: "2px solid #fff",
    borderRadius: "0.5rem",
    bottom: "5rem",
    right: "20px",
    fontSize: "1rem",
    fontWeight: "bold",
    padding: "0.5rem 1rem",
    opacity: ".9",
    cursor: "pointer",
  };

  // const [hls]
  const artRef = useRef(null);
  const playerRef = useRef(null);
  // The the purpose of this ref and hlsInstanceRef is to store the levels of the quality of the video that is being played, and to store the rref of hls itself so that the art.setting.add (<quality option>) can be used!. Since without the refs, we could not use the level or hls instance on art.on('ready') event, which is necessary if we want to add the quality change option.
  const hlsLevelsRef = useRef([]);
  const hlsInstanceRef = useRef(null);

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

      const qualities = sources?.map((source) => ({
        html: source?.quality || " ",
        url: `/api/v1/streamingProxy?url=${encodeURIComponent(source?.url)}`,
        default: source?.quality?.includes(defaultQuality) || false,
        width: "10px",
      }));

      const defaultSource = qualities?.find((q) => q?.default);

      const playerSettings = [];
      const playerControls = [];

      if (subtitles?.length > 0) {
        playerSettings.push({
          html: "Captions",
          width: 300,
          selector: subtitles.map((sub) => ({
            html: sub?.label,
            ...sub,
          })),
          onSelect: function (item) {
            playerRef.current?.subtitle.switch(item.file, {
              name: item.label || "Subtitle",
              escape: false,
            });
            return item.label;
          },
        });

        playerSettings.push({
          html: "Caption Size",
          width: 180,
          selector: [
            { html: "Small", value: "18px" },
            { html: "Medium", value: "24px" },
            { html: "Large", value: "32px" },
            { html: "Extra Large", value: "40px" },
          ],
          onSelect: function (item) {
            playerRef.current?.subtitle.style({
              fontSize: item.value,
            });
            return item.html;
          },
        });

        playerControls.push({
          name: "Captions",
          index: 10,
          position: "right",
          html: "📝",
          tooltip: "Toggle Caption",
          style: {
            fontSize: "1.2rem",
          },
          click: function (...args) {
            playerRef.current?.subtitle.toggle();
          },
          // mounted: function (...args) {
          //     console.info('mounted', args);
          // },
        });
      }

      const option = {
        container: artRef.current,
        url: defaultSource?.url || src,
        type: "m3u8",
        title: title || "TITLE",
        poster: poster || "",
        volume: 1,
        autoplay: true,
        flip: true,
        aspectRatio: true,
        mutex: true,
        miniProgressBar: false, //was true earlier , this is the progress bar that will come even when the menu is not visible
        setting: true,
        fullscreen: true,
        playbackRate: true,
        screenshot: true,
        pip: true,
        fastForward: true,
        autoOrientation: true,
        airplay: true,
        theme: "#7289da",

        layers: [
          {
            name: "skip-intro",
            html: `Skip Intro`,
            position: "right",
            style: skipStyle,
            click: function (...args) {
              playerRef.current.currentTime = intro?.end;
            },
            mounted: function (...args) {},
          },

          {
            name: "skip-outro",
            html: `Skip Outro`,
            position: "right",
            style: skipStyle,
            click: function (...args) {
              playerRef.current.currentTime = outro?.end;
            },
            mounted: function (...args) {},
          },
        ],

        controls: playerControls,
        quality: qualities,

        subtitle: {
          url: subtitles.find((sub) => sub.default)?.file || "",
          style: {
            color: "#ffffff",
            fontSize: "32px",
            marginBottom: "2rem",
          },
          encoding: "utf-8",
          escape: false,
        },
        settings: playerSettings,
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
                maxBufferLength: 100,
                maxMaxBufferLength: 200,
                // ADD THESE TIMEOUT SETTINGS:
                manifestLoadingTimeOut: 100000, // 100 seconds for M3U8 manifest loading
                manifestLoadingMaxRetry: 3, // Retry 3 times
                manifestLoadingRetryDelay: 1000, // Wait 1 second between retries

                levelLoadingTimeOut: 60000, // 60 seconds for level playlists
                levelLoadingMaxRetry: 3,
                levelLoadingRetryDelay: 1000,

                fragLoadingTimeOut: 60000, // 60 seconds for video segments
                fragLoadingMaxRetry: 3,
                fragLoadingRetryDelay: 1000,

                // Additional network settings
                maxLoadingDelay: 4000, // Max delay before giving up on a fragment
                maxBufferHole: 0.5, // Max gap in buffer (seconds)
                highBufferWatchdogPeriod: 2, // Check buffer health every 2 seconds
                nudgeOffset: 0.1, // Small offset to fix playback issues
                nudgeMaxRetry: 3,

                // Error recovery
                maxBufferSize: 60 * 1000 * 1000, // 60MB buffer size
                maxBufferHole: 0.5,
              });

              hls.loadSource(url);
              hls.attachMedia(video);
              video.hls = hls;
              hlsInstanceRef.current = hls;

              hls.on(Hls.Events.MANIFEST_PARSED, () => {
                const levels = hls.levels.map((level, i) => ({
                  html: `${level.height}p`,
                  value: i,
                  default: level.height === parseInt(defaultQuality),
                }));

                // Add 'Auto' option at the top
                hlsLevelsRef.current = [
                  {
                    html: "Auto",
                    value: -1,
                    default: !levels.some((lvl) => lvl.default),
                  },
                  ...levels,
                ];
                console.log("HLS levels:", hlsLevelsRef.current);
              });

              hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                  console.error("HLS fatal error:", data);
                  toast.error(
                    "Sorry! Streaming source not available. Try a different source."
                  );
                }
              });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
              video.src = url;
            } else {
              toast.error("Browser doesn't support HLS or this format.");
            }

            video.onerror = () => {
              console.error("Video playback failed");
            };

            video.onloadedmetadata = () => {
              try {
                if (startTime && !isNaN(startTime)) {
                  video.currentTime = startTime;
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

        art.on("ready", () => {
          setDuration(art.duration);
          if (hlsLevelsRef.current.length > 0 && sources?.length === 1) {
            art.setting.add({
              html: "Quality",
              width: 200,
              selector: hlsLevelsRef.current,
              onSelect(item) {
                hlsInstanceRef.current.currentLevel = item.value;
                return item.html;
              },
            });
          }
        });

        art.on("video:timeupdate", () => {
          const t = art.currentTime;

          if (t > intro?.end || t < intro?.start) {
            art.layers.update({
              name: "skip-intro",
              style: { ...skipStyle, display: "none" },
            });
          }
          if (t > outro?.end || t < outro?.start) {
            art.layers.update({
              name: "skip-outro",
              style: { ...skipStyle, display: "none" },
            });
          }
          if (t > intro?.start && t < intro?.end) {
            art.layers.update({
              name: "skip-intro",
              style: { ...skipStyle, display: "flex" },
            });
            if (isAutoSkip) {
              art.currentTime = intro?.end;
            }
          }

          if (t > outro?.start && t < outro?.end) {
            art.layers.update({
              name: "skip-outro",
              style: { ...skipStyle, display: "flex" },
            });
            if (isAutoSkip) {
              art.currentTime = outro?.end;
            }
          }

          if (
            Math.floor(t) % 5 === 0 &&
            Math.floor(t) !== Math.floor(recentTimestampRef.current)
          ) {
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
          if (key === " ") return;

          switch (key) {
            case "c":
              art.subtitle.toggle();
              break;
            case "f":
              art.fullscreen = !art.fullscreen;
              break;
            case "m":
              art.muted = !art.muted;
              break;

            case "t":
              art.setting.show = !art.setting.show;
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

        art.on("video:ended", () => {
          mediaPlayerState?.isAutoNext && getNextEpisode();
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
      className="w-full h-full flex rounded-2xl overflow-hidden shadow-lg min-h-[300px]"
    />
  );
}
