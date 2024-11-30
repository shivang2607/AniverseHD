'use client'
import RecentCard from '@/components/RecentCard';
import useUserStore from '@/components/ZustandStores/userStore'
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'

export default function RecentlyWatching() {

    const {RecentWatchListData, isUserLoggedIn} = useUserStore();
    const router =  useRouter();

    useEffect(()=>{
        if(!isUserLoggedIn){
            router.replace("/not-found");
        }
    }, [isUserLoggedIn]);
    
  return (
    <>
    {RecentWatchListData?.length > 0 ? <div className=" flex-col flex gap-4 p-4 md:pt-24 pt-8 mb-2 ">
        
      <h1 className="text-primary-500 flex font-semibold text-2xl tracking-wide">
        Recently Watched
      </h1> 
      {/*  */}
      <div className="results  grid grid-cols-2 md:grid-cols-5  gap-4 my-2  ">
        {RecentWatchListData?.slice()?.reverse().map(anime=>{
          return <RecentCard anime={anime} key={anime.animeId} grid={true}/>
        })} 
      </div>

    </div>
    :
    <div className='text-3xl w-full justify-center my-16'>
        No Anime in Watching List.
    </div>
    }</>
  )
}
