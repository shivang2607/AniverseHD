import Script from "next/script";
import { monetagAntiAddBlock } from "./dangerousInnerHTMLContent";

export default function WatchAnimeLayout({
  children, // will be a page or nested layout
}) {
  return (
    <>

<Script
        id="monetag-inline-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: monetagAntiAddBlock,
        }}
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