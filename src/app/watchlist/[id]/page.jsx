"use client"
import GetWatchListDataById from '@/app/firebase/WatchList/WatchListAnimeList/GetWatchListDataById';
import GetWatchListInfoById from '@/app/firebase/WatchList/WatchListDocument/GetWatchListInfoById';
import MainCard from '@/components/mainCard';
import { Constant_Var_success } from '@/utils/constants';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function Page({params}) {

    const [watchlistData, setWatchlistData] = useState();
    const [watchlistInfo, setWatchlistInfo] = useState();
    const [error, setError] = useState();
    
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
                    setError();
                    setWatchlistData(watchListDataResponse.response);
                    console.log("Complete Watchlist Data:", watchListDataResponse.response);
                } else {
                    console.error("Error fetching complete watchlist:", watchListDataResponse.response);
                    setError(watchListDataResponse.response);
                }
            } catch (error) {
                // Catch any unexpected errors (e.g., network issues)
                console.error("Error during API calls:", error);
            }
        })();
        


    }, [params]);   
  return (
    <div className='pt-24 text-lg flex w-full  flex-col gap-4 min-h-screen md:px-4 p-2'>
      {watchlistInfo &&
      <div className="header md:text-xl text-sm flex w-full overflow-hidden md:mx-4 items-center justify-between">

      <h1 className=' font-semibold mx-auto flex md:flex-row flex-col text-ellipsis'><span className='text-primary-100 mx-2'>OWNER: </span> <span>{watchlistInfo?.ownerName || "NA"}</span></h1>

      <h1 className=' font-semibold mx-auto flex md:flex-row flex-col text-ellipsis'><span className='text-primary-100 mx-2'>List Name: </span> <span>{watchlistInfo?.watchListName || "NA"}</span></h1>

      </div>
      }

      {error ? 
      <div className='error flex flex-col w-full gap-3 text-2xl font-semibold tracking-wide text-primary-500 mx-auto my-8'>
        <div className="img relative rounded-xl overflow-hidden flex mx-auto w-96 h-80">
        <Image src={"/saying NO anime.png"} alt='Error Image' fill/></div>
        <div className='md:w-1/2 flex mx-auto justify-center'>Error : {error.message}</div>
      </div>
      :
       watchlistData && 
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
