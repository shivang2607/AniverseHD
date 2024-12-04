'use client'
import React from 'react'
import RecentCard from './RecentCard';
import { FaAnglesRight } from 'react-icons/fa6';
import Link from 'next/link';
import useUserStore from './ZustandStores/userStore';

export default function RecentWatching() {

    const {RecentWatchListData} = useUserStore();
    const defaultLength = 10;
    // console.log("Recent watchlist data is => ",RecentWatchListData);


  return (
    <>
    {RecentWatchListData?.length > 0 && <div className=" flex-col flex gap-4 p-4 md:mt-16 mt-8 mb-2 ">

        <div className='flex w-full items-center justify-between'>
      <h1 className="text-primary-500 flex font-semibold text-2xl tracking-wide">
        Recently Watched
      </h1> 
      {RecentWatchListData?.length > defaultLength && <Link href="/recently-watching" className='self-end  my-auto ml-auto flex gap-1 items-center'>View More <FaAnglesRight className='text-primary-200'/></Link>}
      </div>
      {/* grid grid-cols-2 md:grid-cols-5 */}
      <div className="results  flex overflow-x-auto gap-4 my-2 md:scrollbar-hidden ">
        {RecentWatchListData?.slice()?.reverse()?.slice(0, defaultLength)?.map(anime=>{
          return <RecentCard anime={anime} key={anime.animeId}/>
        })} 
      </div>

    </div>
    }
    </>
  )
}
