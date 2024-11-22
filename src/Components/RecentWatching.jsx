'use client'
import React, { useEffect } from 'react'
import useUserStore from './ZustandStores/userStore'
import RecentCard from './RecentCard';

export default function RecentWatching() {

    const {RecentWatchListData, loadLoggedInUserRecentWatchList} = useUserStore();

    useEffect(()=>{
        loadLoggedInUserRecentWatchList();
    }, []);


  return (
    <>
    {RecentWatchListData?.length > 0 && <div className=" flex-col flex gap-4 p-4 md:mt-16 mt-8 mb-2 ">
      <h1 className="text-primary-500 font-semibold text-2xl tracking-wide">
        Recently Watched
      </h1> {console.log("This is watch list", RecentWatchListData)}

      <div className="results grid grid-cols-2 md:grid-cols-5 gap-4 my-2 ">
        {RecentWatchListData?.slice()?.reverse().map(anime=>{
          return <RecentCard anime={anime} key={anime.animeId}/>
        })}
      </div>

    </div>
    }
    </>
  )
}
