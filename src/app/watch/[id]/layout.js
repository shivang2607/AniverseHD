import Script from "next/script";

export default function WatchAnimeLayout({
  children, // will be a page or nested layout
}) {
  return (
    <>
     
     <Script
        id="monetag-script"
        strategy="lazyOnload"
        async defer
        dangerouslySetInnerHTML={{
          __html: `(function(d,z,s){
              s.src = 'https://' + d + '/401/' + z;
              try { (document.body || document.documentElement).appendChild(s); } catch(e) { }
          })('gizokraijaw.net', 8974908, document.createElement('script'));`,
        }}
      />


      <div>
        {children}
      </div>
    </>
  )
}