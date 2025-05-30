// app/layout.js (or your watch layout component)

import Script from "next/script";

export default function WatchLayout({ children }) {
  return (
    <>
      
    <meta name="referer" content="no-referer-when-downgrade" />
      <div className="flex w-full gap-4 md:pt-16 pt-20 z-0">
      

        {children}
      </div>
    </>
  );
}