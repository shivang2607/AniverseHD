import { Suspense } from "react";


export default function ProfileLayout({
    children, // will be a page or nested layout
  }) {
    return (
      <div className=" flex w-full gap-4">   
        {children}
      </div>
    )
  }