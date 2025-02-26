"use client";
import { getTorrentData } from "@/app/torrent-search/utils/torrentsData";
import React, { useState } from "react";
import { FaCopy, FaDownload } from "react-icons/fa";

const TorrentRow = ({ torrent }) => {
  const magnetLink = `magnet:?xt=urn:btih:${torrent.infoHash}`;

  const copyMagnet = () => {
    navigator.clipboard.writeText(magnetLink);
  };

  return (
    <tr className="border-b hover:bg-gray-100">
      <td className="p-3">{torrent.title}</td>
      <td className="p-3">{torrent.size}</td>
      <td className="p-3 text-center">
        <button onClick={copyMagnet} className="p-2 border rounded hover:bg-gray-200">
          <FaCopy size={16} />
        </button>
      </td>
      <td className="p-3 text-center">
        <a href={magnetLink} className="text-blue-500 hover:underline">
          <FaDownload size={16} />
        </a>
      </td>
    </tr>
  );
};

const Page = () => {
  const [query, setQuery] = useState("");
  const [torrents, setTorrents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchTorrents = async () => {
    setLoading(true);
    setError(null);

    const torrentList = await getTorrentData(query);
    if (torrentList && torrentList.length > 0) {
      setTorrents(torrentList);
    } else {
      setError("No torrents found.");
    }

    setLoading(false);
  };

  return (
    <div className="pt-40 max-w-3xl mx-auto">
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search Torrents"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-grow p-2 border rounded"
        />
        <button
          onClick={searchTorrents}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Search
        </button>
      </div>

      {loading && <p className="text-center text-gray-500">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Size</th>
              <th className="p-3 text-center">Copy</th>
              <th className="p-3 text-center">Download</th>
            </tr>
          </thead>
          <tbody>
            {torrents.length > 0 ? (
              torrents.map((torrent, index) => <TorrentRow key={index} torrent={torrent} />)
            ) : (
              !loading && (
                <tr>
                  <td colSpan={4} className="p-3 text-center text-gray-500">
                    No results found.
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Page;
