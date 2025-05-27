'use client'
import React from 'react'
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import MagnetPlayer from './MagnetPlayer';
import TorrentStreamer from './MagnetPlayer';





export default function Page() {
    const magnetUrl = "magnet:?xt=urn:btih:cb6754e5c8556bb92541d5def777a932329d1a4d";
    //"magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel"
    //  "magnet:?xt=urn:btih:c8afd9c575c1754f0dcac6391dfd35716c1fb5cd&dn=%5BSubsPlease%5D%20Solo%20Leveling%20-%2018%20%281080p%29%20%5B28C7D1C2%5D.mkv&tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Fexodus.desync.com%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce";
  
    return (
      <div className="container mx-auto p-4 w-screen flex min-h-screen justify-center items-center">
        <TorrentStreamer magnetURI={magnetUrl}/>
      </div>
    );
}
