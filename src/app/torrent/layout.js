import Script from "next/script";
import { Suspense } from "react";


export default function TorentSearch({
    children, // will be a page or nested layout
  }) {
    return (
      <div className=" flex w-full gap-4">   
        {children}
      </div>
    )
  }