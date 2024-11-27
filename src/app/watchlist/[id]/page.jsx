"use client"
import GetWatchListDataById from '@/app/firebase/WatchList/WatchListAnimeList/GetWatchListDataById';
import GetWatchListInfoById from '@/app/firebase/WatchList/WatchListDocument/GetWatchListInfoById';
import MainCard from '@/components/mainCard';
import WatchListCard from '@/components/watchListCard';
import { Constant_Var_success } from '@/utils/constants';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function page({params}) {

    const [watchlistData, setWatchlistData] = useState();
    const [watchlistInfo, setWatchlistInfo] = useState();
    
    useEffect(()=>{
        if(!(params?.id)){
            toast.error("Watchlist Id not provided");
            return;
        }
        (async () => {
            try {
                // Execute both API calls in parallel using Promise.all
                const [watchListInfoResponse, watchListDataResponse] = await Promise.all([
                    GetWatchListInfoById({ watchListId: params.id }),
                    GetWatchListDataById({ watchListId: params.id, getAll: true })
                ]);
        
                if (watchListInfoResponse.status === Constant_Var_success) {
                    setWatchlistInfo(watchListInfoResponse.response);
                    console.log('Watchlist info:', watchListInfoResponse.response);
                } else {
                    console.error('Error fetching watchlist info:', watchListInfoResponse.response);
                }
        
                if (watchListDataResponse.status === Constant_Var_success) {
                    setWatchlistData(watchListDataResponse.response);
                    console.log("Complete Watchlist Data:", watchListDataResponse.response);
                } else {
                    console.error("Error fetching complete watchlist:", watchListDataResponse.response);
                }
            } catch (error) {
                // Catch any unexpected errors (e.g., network issues)
                console.error("Error during API calls:", error);
            }
        })();
        


    }, []);     //! params aayega dependency array m...baar baar page refresh na ho dev k waqt isiliye hataya mene.
  return (
    <div className='pt-24 text-lg flex w-full  flex-col gap-4 min-h-screen md:px-4 p-2'>
      {watchlistInfo &&
      <div className="header md:text-xl text-sm flex w-full overflow-hidden md:mx-4 items-center justify-between">

      <h1 className=' font-semibold mx-auto flex md:flex-row flex-col text-ellipsis'><span className='text-primary-100 mx-2'>OWNER: </span> <span>{watchlistInfo?.ownerName || "NA"}</span></h1>

      <h1 className=' font-semibold mx-auto flex md:flex-row flex-col text-ellipsis'><span className='text-primary-100 mx-2'>List Name: </span> <span>{watchlistInfo?.watchListName || "NA"}</span></h1>

      </div>
      }

      {watchlistData && 
        <div className='w-full rounded-xl self-center bg-cbg-200 grid md:grid-cols-6 grid-cols-2 p-1 md:p-4 min-h-full gap-2'>
            {watchlistData.length > 0 ? watchlistData.map(anime => {
                return(
                    <MainCard anime={anime} key={anime.animeId}/>
                )
            }) : <div className='flex mx-auto my-4 text-lg'>Empty List</div>}
        </div>
      }
    </div>
  )
}
