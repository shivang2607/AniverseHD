import React from 'react';
import { FaCopy, FaDownload, FaPlay } from "react-icons/fa";
import { Link } from 'next/link';

const RowItem = ({ torrent }) => {
  const magnetLink = `magnet:?xt=urn:btih:${torrent.infoHash}`;

  const copyMagnet = () => {
    navigator.clipboard.writeText(magnetLink);
  };

  return (
    <tr className="border-b ">
      <td className="p-3">{torrent.title}</td>
      <td className="p-3">{torrent.size}</td>
      <td className="p-3 text-center">{torrent.seeders}</td>
      <td className="p-3 text-center">
        <button onClick={copyMagnet} className="p-2 border rounded hover:bg-gray-300">
          <FaCopy size={16} />
        </button>
      </td>
      <td className="p-3 text-center">
        <a href={magnetLink} className="text-blue-500 hover:underline">
          <FaDownload size={16} />
        </a>
      </td>
      <td className="p-3 text-center">
        <a href={`/torrent/stream/${torrent.infoHash}`} className="text-green-500 hover:underline">
          <FaPlay size={16} />
        </a>
      </td>
    </tr>
  );
};

export default RowItem;
