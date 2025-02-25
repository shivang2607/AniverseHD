import Script from "next/script";
import { monetagAntiAddBlock } from "../../../../public/monetagAntiAddblockScript";

export default function WatchAnimeLayout({
  children, // will be a page or nested layout
}) {
  return (
    <>

<Script
        id="monetag-inline-script"
        src="/monetagAntiAddblockScript.js"
        strategy="afterInteractive"
        onError={(e) => console.error('Monetag script failed to load, please disable add blocker to support Us.', e)}
      />
     
     <Script
        id="monetag-external-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(d, z, s, c){
              s.src = '//' + d + '/400/' + z;
              s.onerror = s.onload = E;
              function E(){ c && c(); c = null }
              try {
                (document.body || document.documentElement).appendChild(s)
              } catch(e) {
                E()
              }
            })('shaiwourtijogno.net', 8974908, document.createElement('script'), _ytcwhw);
          `,
        }}
      />


      <div>
        {children}
      </div>
    </>
  )
}