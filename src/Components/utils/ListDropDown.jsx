import AddAnimeToWatchList from "@/app/firebase/WatchList/UpdateWatchLists/AddAnimeToWatchList";
import GetLoggedUserWatchListsInfo from "@/app/firebase/WatchList/WatchListDocument/GetLoggedUserWatchListsInfo";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { TiTick } from "react-icons/ti";

export default function ListDropDown({
  anime,
  isOpen,
  setIsOpen,
  watchListData,
}) {
  const handleOnClickList = async (id) => {
    const result = await AddAnimeToWatchList({
      watchListId: id,
      animeId: `${anime?.mal_id}`,
      animeName: anime?.title_english || anime?.title,
      animePhoto: anime?.images || {},
      animeGenre: anime?.genres || [],
      animeType: anime?.type || "NA",
      animeScore: anime?.score || "NA",
      animeAgeRating: anime?.rating || "NA",
      animeStartYear: Math.floor(
        anime?.aired?.prop?.from?.year || anime?.start_year || anime?.year
      ) || "NA",
      animeLength: 1110 || anime?.episodes || anime?.episode || null,
    });

    if (result?.status === "success") {
      toast.success("Watchlist Updated Successfully!!", {id:'1', duration: 3000 });
      setIsOpen(false);
    } else {
      toast.error(result?.response?.message, { duration: 3000 });
    }
    console.log(result?.response);
  };

  console.log(watchListData);

  return (
    <>
      {isOpen && (
        <div className="absolute z-30 h-60 overflow-y-scroll md:scrollbar-thin bg-cbg-300 text-sm flex flex-col  rounded-lg p-2 mt-10  ">
          {watchListData?.map((list) => {
            const isAnimeInList = list?.animeList?.some(
              (an) => an.animeId === `${anime?.mal_id}`
            );
            return (
              <div
                key={list?.id}
                className={`p-2 ${
                  isAnimeInList ? "bg-primary-400 text-cbg-100" : ""
                }  my-1 items-center rounded-md cursor-pointer  flex justify-between gap-2`}
                onClick={(e) => {
                  
                  e.preventDefault();
                  e.stopPropagation();
                  handleOnClickList(list?.id);}}
              >
                <div>{list?.watchListName}</div>{" "}
                {isAnimeInList && <TiTick className="text-sky-700" size={20} />}{" "}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
