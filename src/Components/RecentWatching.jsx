'use client'
import React from 'react'
import useUserStore from './ZustandStores/userStore'
import RecentCard from './RecentCard';

export default function RecentWatching() {

    const {RecentWatchListData} = useUserStore();

  return (
    <>
    {RecentWatchListData && <div className=" flex-col flex gap-4 p-4 md:mt-16 mt-8 mb-4 ">
      <h1 className="text-primary-500 font-semibold text-2xl tracking-wide">
        Recently Watched
      </h1> {console.log(RecentWatchListData)}

      <div className="results grid grid-cols-2 md:grid-cols-5 gap-4 md:mt-12">
        {RecentWatchListData?.map(anime=>{
          return <RecentCard anime={anime} key={anime.animeId}/>
        })}
      </div>

    </div>
    }
    </>
  )
}
