import Link from "next/link";
import React, { useState } from "react";
import { FaCopy, FaCheck, FaInfoCircle, FaMagnet, FaDownload, FaPlay } from "react-icons/fa";

const TorrentRow = ({ torrent, index }) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // 1. Add display name (torrent title) to the magnet link
  // 2. Add well-known trackers for faster speeds
  const magnetLink = `magnet:?xt=urn:btih:${torrent.infoHash}&dn=${encodeURIComponent(torrent.title)}&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2710%2Fannounce&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A6969%2Fannounce&tr=http%3A%2F%2Ftracker.internetwarriors.net%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce&tr=udp%3A%2F%2Fexodus.desync.com%3A6969%2Fannounce`;

  const copyMagnet = (e) => {
    e.stopPropagation(); // Prevent link opening when clicking copy button
    navigator.clipboard.writeText(magnetLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTitle = (title) => {
    // Try to clean up title for display by removing common patterns
    return title
      .replace(/\.\w{3,4}$/, "") // Remove file extension
      .replace(/\./g, " ") // Replace dots with spaces
      .replace(/_/g, " ") // Replace underscores with spaces
      .replace(/\[.*?\]|\(.*?\)/g, "") // Remove content in brackets and parentheses
      .trim();
  };

  const displayTitle = formatTitle(torrent.title);

  return (
    <>
      <tr
        className={`border-b border-cbg-300 hover:bg-cbg-300/50 transition-colors ${
          index % 2 === 0 ? "bg-cbg-200" : "bg-cbg-200/70"
        }`}
      >
         <td className="p-4 text-sm ">
          <span className="flex items-center justify-center text-cbg-600">{index+1}</span>
        </td>
        <td className="p-4">
          <div className="flex items-start">
            <button
              onClick={() => setExpanded(!expanded)}
              className="mr-2 mt-1 text-cbg-500 hover:text-primary-300 transition-colors"
              title={expanded ? "Show less" : "Show more"}
            >
              <FaInfoCircle size={16} />
            </button>
            <div>
              <div
                className="font-medium line-clamp-2 hover:text-primary-300 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
              >
                {displayTitle}
              </div>
              {/* 4. Add transition animation for expanded content */}
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  expanded ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"
                }`}
              >
                <div className="text-sm text-cbg-500">
                  <p className="mb-1">Original filename: {torrent.title}</p>
                  {torrent.category && (
                    <p className="mb-1">Category: {torrent.category}</p>
                  )}
                  {torrent.uploadDate && (
                    <p className="mb-1">Uploaded: {torrent.uploadDate}</p>
                  )}
                  {torrent.leechers && <p>Leechers: {torrent.leechers}</p>}
                </div>
              </div>
            </div>
          </div>
        </td>
        <td className="p-4 whitespace-nowrap text-cbg-500">
          {torrent.size || "Unknown size"}
        </td>
        <td className="p-4 text-center">
          <span
            className={`${
              parseInt(torrent.seeders) > 10
                ? "text-green-500"
                : parseInt(torrent.seeders) > 0
                ? "text-yellow-500"
                : "text-red-500"
            }`}
          >
            {torrent.seeders || "0"}
          </span>
        </td>
        <td className="p-4 text-center">
          <div className="flex items-center justify-center space-x-3">
            {/* 3. Modified: Magnet icon opens URL in new tab, added separate copy button */}
            <Link
              href={magnetLink}
              data-umami-event="onClick Magnetic URL"
              className="p-2 rounded-full bg-cbg-300 hover:bg-cbg-400 text-primary-300 transition-all duration-200 hover:scale-110"
              title="Open magnet link"
            >
              <FaMagnet size={16} />
            </Link>
            
            <button
              onClick={copyMagnet}
              className={`p-2 rounded-full ${
                copied
                  ? "bg-green-700/30 text-green-500"
                  : "bg-cbg-300 hover:bg-cbg-400 text-primary-300"
              } transition-all duration-200 hover:scale-110`}
              title="Copy magnet link"
              data-umami-event="onClick copy Magnetic URL"
            >
              {copied ? <FaCheck size={16} /> : <FaCopy size={16} />}
            </button>

            {/* <Link
              href={magnetLink}
              className="p-2 rounded-full bg-cbg-300 hover:bg-cbg-400 text-primary-300 transition-colors"
              title="Download with torrent client"
            >
              <FaDownload size={16} />
            </Link>

            <Link
              href={`/torrent/stream/${torrent.infoHash}`}
              className="p-2 rounded-full bg-primary-300/20 hover:bg-primary-300/40 text-primary-300 transition-colors"
              title="Stream online"
            >
              <FaPlay size={16} />
            </Link> */}
          </div>
        </td>
      </tr>
    </>
  );
};

export default TorrentRow;