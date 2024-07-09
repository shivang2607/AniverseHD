import Link from 'next/link'
import React from 'react'

export default function Footer() {
  return (
    <div className='w-full relative bottom-0 py-4  md:p-8 md:px-4 flex flex-col justify-center items-center border-t-[1px] border-primary-100 bg-black bg-opacity-35'>
        <div className='flex flex-col justify-center items-center'>
        <h1 className='text-xl font-bold tracking-wide'>AniverseHD</h1>
        <div className='text-gray-400 text-xs mt-1 '>made by Anime fans for Anime fans ❤️</div>
        </div>

        <p className="info my-8 mx-auto md:w-[90%] md:block hidden  text-sm text-gray-400 tracking-wider">
            This website does not store any streaming files or data on its server. Our <Link href="/recommendations" className='font-semibold '>recommendation system</Link>  is entirely developed by us. However, all streaming content is sourced from independent third parties not affiliated with this site.
        </p>
    </div>
  )
}
