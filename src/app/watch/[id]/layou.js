// app/watch/[id]/layout.js
"use client";
import Script from "next/script";

// Generate a timestamp that changes every 10 minutes
const getCacheBuster = () => {
  const time = 10 * 60 * 1000;
  return Math.floor(Date.now() / time) * time;
};

export default function WatchLayout({ children }) {
  const cacheBuster = getCacheBuster();

  // useEffect(() => {
  //   //script of in page push notification.
  //   (function (d, z, s) {
  //     s.src = "https://" + d + "/400/" + z;
  //     try {
  //       (document.body || document.documentElement).appendChild(s);
  //     } catch (e) {}
  //   })("vemtoutcheeg.com", 9015075, document.createElement("script"));
  // }, []);

  return (
    <>
        {/* <Script
        src={`/scripts/adblocker-detection.js?${cacheBuster}`}
        strategy="afterInteractive"
        data-cfasync="false"
      /> */}
        <Script
          src={`/scripts/monetag-script.js?${cacheBuster}`}
          strategy="afterInteractive"
        />

      <script
        id="native banner"
        dangerouslySetInnerHTML={{
          __html: `(function(d, z, s) {
            s.src = 'https://' + d + '/401/' + z;
            try {
              (document.body || document.documentElement).appendChild(s);
            } catch (e) {}
          })('groleegni.net', 8974905, document.createElement('script'));`,
        }}
      />
      <div>{children}</div>
    </>
  );
}
