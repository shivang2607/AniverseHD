import Script from "next/script";
import { Suspense } from "react";


export default function TorentSearch({
    children, // will be a page or nested layout
  }) {
    return (
      <div className=" flex w-full gap-4">   
      <Script data-cfasync="false" async type="text/javascript" src="https://cluckedzion.com/gHBwiL5kU0DqfIaYF/121367"></Script>
        {children}
      </div>
    )
  }