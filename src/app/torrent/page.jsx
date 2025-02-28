"use client";

import { getTorrentData } from "@/app/torrent/utils/torrentsData";
import React, { useState, useEffect } from "react";
import TorrentRow from "./TorrentRow";
import { FaSearch, FaExclamationTriangle, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { BiReset } from "react-icons/bi";

const Page = () => {
  const [query, setQuery] = useState("");
  const [torrents, setTorrents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "seeders",
    direction: "desc",
  });
  const [noResults, setNoResults] = useState(false);

  const searchTorrents = async () => {
    if (!query.trim()) {
      setError("Please enter a search term");
      return;
    }

    setLoading(true);
    setError(null);
    setNoResults(false);

    try {
      const torrentList = await getTorrentData(query);
      if (torrentList && torrentList.length > 0) {
        setTorrents(torrentList);
        // console.log(torrentList)
      } else {
        setNoResults(true);
        setTorrents([]);
      }
    } catch (error) {
      setError("Failed to fetch torrents. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      searchTorrents();
    }
  };

  const clearSearch = () => {
    setQuery("");
    setTorrents([]);
    setError(null);
    setNoResults(false);
  };

  const requestSort = (key) => {
    if (key !== "size" && key !== "seeders") return; // Only allow sorting by size and seeders

    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Helper function to get sort icon based on current sort configuration
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <FaSort className="text-gray-400" />;
    }
    return sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />;
  };

  // Helper function to convert size strings to numbers for comparison
  const parseFileSize = (sizeStr) => {
    if (!sizeStr) return 0;

    const units = {
      'KIB': 1,
      'MIB': 1024,
      'GIB': 1024 * 1024,
      'TIB': 1024 * 1024 * 1024,
      'KB': 1,
      'MB': 1000,
      'GB': 1000 * 1000,
      'TB': 1000 * 1000 * 1000
    };
    
    // Match digits and unit (case insensitive)
    const matches = sizeStr.match(/^([\d.]+)\s*([KMGT]i?B)$/i);
    if (!matches) return 0;

    const size = parseFloat(matches[1]);
    const unit = matches[2].toUpperCase();
   
    return size * (units[unit] || 0);
  };

  // Helper function to parse seeders value to a number
  const parseSeeders = (seedersValue) => {
    if (seedersValue === undefined || seedersValue === null) return 0;
    const numValue = parseInt(seedersValue, 10);
    return isNaN(numValue) ? 0 : numValue;
  };

  const sortedTorrents = React.useMemo(() => {
    if (torrents.length === 0) return [];

    let sortableTorrents = [...torrents];

    sortableTorrents.sort((a, b) => {
      if (sortConfig.key === "size") {
        // Convert size strings to comparable numbers
        const sizeA = parseFileSize(a.size);
        const sizeB = parseFileSize(b.size);

        if (sortConfig.direction === "asc") {
          return sizeA - sizeB;
        } else {
          return sizeB - sizeA;
        }
      } else if (sortConfig.key === "seeders") {
        // Convert seeders to numbers for comparison
        const seedersA = parseSeeders(a.seeders);
        const seedersB = parseSeeders(b.seeders);

        if (sortConfig.direction === "asc") {
          return seedersA - seedersB;
        } else {
          return seedersB - seedersA;
        }
      }
      
      // Default to seeders desc if no valid sort key
      return parseSeeders(b.seeders) - parseSeeders(a.seeders);
    });

    return sortableTorrents;
  }, [torrents, sortConfig]);

  return (
    <div className="flex w-full justify-center min-h-screen bg-cbg-100 text-white">
      <div className="pt-32 pb-16 w-full max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-primary-300">
            Torrent Search
          </h1>
          <p className="text-cbg-600">
            Search and find torrents from multiple sources
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-2 mb-6">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search for anime titles"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full p-3 pl-10 rounded-lg bg-cbg-200 border border-cbg-300 text-white focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cbg-600" />
          </div>

          <div className="flex gap-2">
            <button
              onClick={searchTorrents}
              disabled={loading}
              className="px-6 py-3 bg-primary-300 text-cbg-100 font-medium rounded-lg hover:bg-primary-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 whitespace-nowrap"
            >
              {loading ? "Searching..." : "Search"}
            </button>

            {query && (
              <button
                onClick={clearSearch}
                className="p-3 bg-cbg-300 rounded-lg hover:bg-cbg-400 transition-colors flex-shrink-0"
                title="Clear search"
              >
                <BiReset size={20} />
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-lg flex items-center gap-3">
            <FaExclamationTriangle className="text-red-500" size={20} />
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-primary-300 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-cbg-500">Searching for torrents...</p>
          </div>
        ) : (
          <>
            {noResults ? (
              <div className="text-center py-12 bg-cbg-200 rounded-lg border border-cbg-300">
                <p className="text-xl font-medium mb-2">No torrents found</p>
                <p className="text-cbg-500">Try a different search term</p>
              </div>
            ) : (
              sortedTorrents.length > 0 && (
                <div className="overflow-x-auto rounded-lg border border-cbg-300 bg-cbg-200 scrollbar-thin scrollbar-thumb-cbg-400 scrollbar-track-cbg-200">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-cbg-300 text-primary-300">
                        <th className="p-4 text-left">
                          Title
                        </th>
                        <th
                          onClick={() => requestSort("size")}
                          className="p-4 text-left cursor-pointer hover:bg-cbg-400 transition-colors whitespace-nowrap"
                        >
                          <div className="flex items-center gap-1">
                            Size
                            {getSortIcon("size")}
                          </div>
                        </th>
                        <th 
                          onClick={() => requestSort("seeders")}
                          className="p-4 text-center cursor-pointer hover:bg-cbg-400 transition-colors whitespace-nowrap"
                        >
                          <div className="flex items-center justify-center gap-1">
                            Seeders
                            {getSortIcon("seeders")}
                          </div>
                        </th>
                        <th className="p-4 text-center whitespace-nowrap">
                          Copy link
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedTorrents.map((torrent, index) => (
                        <TorrentRow
                          key={`${torrent.infoHash}-${index}`}
                          torrent={torrent}
                          index={index}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Page;