import Head from "next/head";
import Script from "next/script";

export default function WatchAnimeLayout({
  children, // will be a page or nested layout
}) {
  return (
    <>
     



      <div>
        {children}
      </div>
    </>
  )
}