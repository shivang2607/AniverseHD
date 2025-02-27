// app/watch/[id]/layout.js
import Script from 'next/script';

// Generate a timestamp that changes every 5 minutes 
const getCacheBuster = () => {
  const time = 5 * 60 * 1000; 
  return Math.floor(Date.now() / time) * time;
};

export default function WatchLayout({ children }) {
  const cacheBuster = getCacheBuster();

  return (
    <>
      <Script
        src={`/scripts/adblocker-detection.js?${cacheBuster}`}
        strategy="afterInteractive"
        data-cfasync="false"
      />

      <Script
        src={`/scripts/monetag-script.js?${cacheBuster}`}
        strategy="afterInteractive"
      />

      <div>{children}</div>
    </>
  );
}