// if name of file is pag.jsx then its intentional because we probably wont want this route to get shown on the website
"use client";
import React, { useEffect, useState } from "react";

const Page = ({ params }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  return (
    <div className="pt-40 max-w-5xl mx-auto">
      {isClient ? (
        <>
          <video
            controls
            src={`magnet:?xt=urn:btih:${params.url}&dn=Sintel`}
          ></video>
          <script
            src="https://cdn.jsdelivr.net/npm/@webtor/embed-sdk-js/dist/index.min.js"
            charset="utf-8"
            async
          ></script>
        </>
      ) : (
        <h1>{`magnet:?xt=urn:btih:${params.url}&dn=Sintel`}</h1>
      )}
    </div>
  );
};

export default Page;
