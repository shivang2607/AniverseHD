import AddAnimeToWatchList from '@/app/firebase/WatchList/UpdateWatchLists/AddAnimeToWatchList';
import GetLoggedUserWatchListsInfo from '@/app/firebase/WatchList/WatchListDocument/GetLoggedUserWatchListsInfo';
import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast';
import { TiTick } from "react-icons/ti";


export default function ListDropDown({
    anime,
    isOpen,
    setIsOpen,
    watchListData
}) {

    const handleOnClickList = async(id)=>{
        const result =await AddAnimeToWatchList({
            watchListId : id,
            animeId: toString(anime?.mal_id),
            animeName:  anime?.title_english || anime?.title,
            animePhoto: anime?.images || {},
            animeGenre: anime?.genres || [],
            animeType: anime?.type || "NA",
            animeScore: anime?.score || "NA",
            animeAgeRating: anime?.rating || "NA",
            animeStartYear: anime?.year || "NA",
            animeLength: anime?.episodes || anime?.episode || "NA",
        });

        if(result?.status==='success'){
            toast.success("Watchlist Updated Successfully!!", {duration:3000});
        }
        else{
            toast.error(result?.response?.message, {duration:3000});
        }
        console.log(result?.response);
            
    }


    console.log(watchListData);
    

  return (
    <>
    {isOpen && <div  className='absolute z-30 h-60 overflow-y-scroll md:scrollbar-thin bg-cbg-300 text-sm flex flex-col  rounded-lg p-2 mt-10  '>
        {watchListData?.map(list => {
            return (
                <div key={list?.id} className={`p-2 bg-primary-400 my-1 items-center rounded-md cursor-pointer text-cbg-100 flex justify-between gap-2`} onClick={()=>handleOnClickList(list?.id)}><div>{list?.watchListName}</div> <TiTick className="text-sky-700" size={20}/> </div>
            )
        })}
        
    </div>}
    </>
  )
}
