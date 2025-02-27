// app/watch/[id]/layout.js
'use client'
import Script from "next/script";

// Generate a timestamp that changes every 20 minutes
const getCacheBuster = () => {
  const time = 20 * 60 * 1000;
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

      <Script
        strategy="afterInteractive"
        src="https://eechicha.com/act/files/tag.min.js?z=9015028"
        data-cfasync="false"
        async
      />

      <Script
        id="push-notification"
        strategy="afterInteractive"
        onLoad={() => {
          const script = document.createElement("script");
          script.src = "https://vemtoutcheeg.com/400/9015075";
          script.async = true;
          document.body.appendChild(script);
        }}
      />

      <div>{children}</div>
    </>
  );
}
