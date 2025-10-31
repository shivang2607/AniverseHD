// components/TorrentDownloader.js
"use client";
import { useEffect, useState, useRef } from "react";
import Script from "next/script";

const rtcConfig = {
  iceServers: [
    { urls: "stun:global.stun.twilio.com:3478" },
    { urls: "stun:stun.cloudflare.com" },
    { urls: "stun:stun.l.google.com:19302" },
  ],
};

const MAX_WEB_CONNS = 300;

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export default function TorrentDownloader({ magnetURI }) {
  const [webTorrentReady, setWebTorrentReady] = useState(false);
  const [torrentInfo, setTorrentInfo] = useState(null);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [stats, setStats] = useState({
    progress: 0,
    downloadSpeed: 0,
    uploadSpeed: 0,
    peers: 0,
    downloaded: 0,
    totalSize: 0,
    timeRemaining: 0,
  });

  const clientRef = useRef(null);
  const torrentRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !webTorrentReady || !window.WebTorrent)
      return;

    clientRef.current = new window.WebTorrent({
      rtcConfig,
      tracker: {
        wrtc: true,
        maxWebConns: MAX_WEB_CONNS,
        rtcConfig,
      },
      dht: false,
    });

    clientRef.current.on("error", (err) => {
      setError(err.message);
      console.error("WebTorrent error:", err);
    });

    return () => {
      if (clientRef.current) {
        clientRef.current.destroy();
      }
    };
  }, [webTorrentReady]);

  const startDownload = () => {
    if (!magnetURI || !clientRef.current) return;

    setIsDownloading(true);
    const client = clientRef.current;
    const torrent = client.add(magnetURI, {
      announce: [
          "wss://tracker.webtorrent.io",
          "wss://tracker.fastcast.nz",
          
          "wss://tracker.btorrent.xyz",
        "wss://tracker.openwebtorrent.com",
        "wss://tracker.sloppyta.co",
        
      ],
    });

    torrentRef.current = torrent;

    const updateStats = () => {
      if (!torrent) return;

      const timeRemaining = torrent.timeRemaining;
      const minutes = Math.floor(timeRemaining / 60000);
      const seconds = Math.floor((timeRemaining % 60000) / 1000);

      setStats({
        progress: torrent.progress,
        downloadSpeed: torrent.downloadSpeed,
        uploadSpeed: torrent.uploadSpeed,
        peers: torrent.numPeers,
        downloaded: torrent.downloaded,
        totalSize: torrent.length,
        timeRemaining: `${minutes}m ${seconds}s`,
      });
    };

    torrent.on("ready", () => {
      setFiles(torrent.files);
      setTorrentInfo({
        name: torrent.name,
        files: torrent.files,
        magnetURI: torrent.magnetURI,
      });
      updateStats();
    });

    const statsInterval = setInterval(updateStats, 1000);

    torrent.on("done", () => {
      console.log("Torrent download completed");
      setIsDownloading(false);
      torrent.files.forEach((file) => {
        downloadFile(file);
      });
    });

    torrent.on("download", updateStats);
    torrent.on("upload", updateStats);
    torrent.on("error", (err) => setError(err.message));

    return () => {
      clearInterval(statsInterval);
      if (client.get(magnetURI)) {
        client.remove(magnetURI);
      }
    };
  };

  const downloadFile = async (file) => {
    try {
      const blob = await new Promise((resolve, reject) => {
        file.getBlob((err, blob) => (err ? reject(err) : resolve(blob)));
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Download failed: " + err.message);
    }
  };

  const pauseTorrent = () => {
    if (torrentRef.current) {
      // Pause all connections to stop downloading
      torrentRef.current.pause();
      torrentRef.current.swarm.pause();
      setIsPaused(true);
    }
  };

  const resumeTorrent = () => {
    if (torrentRef.current) {
      // Resume all connections to start downloading
      torrentRef.current.resume();
      torrentRef.current.swarm.resume();
      setIsPaused(false);
    }
  };

  const cancelTorrent = () => {
    if (torrentRef.current) {
      torrentRef.current.destroy();
      setFiles([]);
      setIsDownloading(false);
      setStats({
        progress: 0,
        downloadSpeed: 0,
        uploadSpeed: 0,
        peers: 0,
        downloaded: 0,
        totalSize: 0,
        timeRemaining: 0,
      });
    }
  };

  return (
    <div className="p-4">
      <Script
        src="https://cdn.jsdelivr.net/npm/webtorrent@latest/webtorrent.min.js"
        strategy="lazyOnload"
        onLoad={() => {
          window.WebTorrent = window.WebTorrent?.default || window.WebTorrent;
          setWebTorrentReady(true);
        }}
        onError={() => setError("Failed to load WebTorrent")}
      />

      {webTorrentReady && !isDownloading && (
        <div className="mb-4 p-4 bg-cbg-100 rounded space-y-2">
          <button
            onClick={startDownload}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Start Download
          </button>
        </div>
      )}

      {isDownloading && (
        <div className="mb-4 p-4 bg-cbg-100 rounded space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>Progress: {(stats.progress * 100).toFixed(1)}%</div>
            <div>
              Downloaded: {formatBytes(stats.downloaded)} /{" "}
              {formatBytes(stats.totalSize)}
            </div>
            <div>Download Speed: {formatBytes(stats.downloadSpeed)}/s</div>
            <div>Upload Speed: {formatBytes(stats.uploadSpeed)}/s</div>
            <div>Peers: {stats.peers}</div>
            <div>Time Remaining: {stats.timeRemaining}</div>
          </div>

          {/* <div className="flex space-x-2 mt-4">
            {isPaused ? (
              <button
                onClick={resumeTorrent}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Resume
              </button>
            ) : (
              <button
                onClick={pauseTorrent}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Pause
              </button>
            )}
            </div> */}
          <button
            onClick={cancelTorrent}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Cancel
          </button>
        </div>
      )}

      {files.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Files:</h3>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span>
                  {file.name} ({formatBytes(file.length)})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}
    </div>
  );
}
