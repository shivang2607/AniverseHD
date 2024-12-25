import AddAnimeToWatchList from "@/app/firebase/WatchList/UpdateWatchLists/AddAnimeToWatchList";
import GetLoggedUserWatchListsInfo from "@/app/firebase/WatchList/WatchListDocument/GetLoggedUserWatchListsInfo";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { TiTick } from "react-icons/ti";
import { RxCross1 } from "react-icons/rx";
import RemoveAnimeFromWatchList from "@/app/firebase/WatchList/UpdateWatchLists/RemoveAnimeFromWatchList";
import { Constant_Var_success } from "@/utils/constants";
import useUserStore from "../ZustandStores/userStore";


export default function ListDropDown({
  anime,
  isOpen,
  setIsOpen,
  watchListData,
}) {

  const {loadLoggedInUserWatchLists} = useUserStore();

  const handleOnClickList = async (id, listName, isAnimeInList) => {
    // console.log("list has been clicked",listName, isAnimeInList, anime);
    if(isAnimeInList){
      console.log(listName);
      const result = await RemoveAnimeFromWatchList({
           watchListId: id,
           animeId: `${anime?.mal_id}`,
         });
        //  console.log(result);
         if (result?.status === Constant_Var_success) {
          toast.success("Watchlist Updated Successfully!!", {
            id: "5",
            duration: 3000,
          });
          setIsOpen(false);
        } else {
          toast.error(result?.response?.message || "Some Error Occured while Updating the List!", { duration: 3000 , id: "2"});
        }
    }
    else{
      // console.log("these are images",anime?.images);
    const result = await AddAnimeToWatchList({
      watchListId: id,
      animeId: anime?.mal_id ? `${anime?.mal_id}` : null,
      animeName: anime?.title_english || anime?.title,
      animePhoto: anime?.main_picture || anime?.images || {},
      animeGenre: anime?.genres || [],
      animeType: anime?.type || "NA",
      animeScore: anime?.score || "NA",
      animeAgeRating: anime?.rating || "NA",
      animeStartYear:
        Math.floor(
          anime?.aired?.prop?.from?.year || anime?.start_year || anime?.year
        ) || "NA",
      animeLength: anime?.episodes || anime?.episode || null,
    });

    if (result?.status === Constant_Var_success) {
      toast.success("Watchlist Updated Successfully!!", {
        id: "1",
        duration: 3000,
      });
      setIsOpen(false);
    } else {
      toast.error(result?.response?.message, { duration: 3000, id: "2 " });
    }
    // console.log(result?.response);
  }

  loadLoggedInUserWatchLists(); //this will sync the zustand store with the latest data 
  
  };

  const removeFromAll = async () => {
    try {
      // Filter the lists to exclude "Recent" and "Favourite"
      const listsToRemoveFrom = watchListData?.filter(
        (lst) =>
          lst?.watchListName !== "Recent"
      );

      // console.log(anime);
      // Create an array of promises for removing the anime from each watchlist
      const removalPromises = listsToRemoveFrom.map((list) => {
        return RemoveAnimeFromWatchList({
          watchListId: list?.id,
          animeId: `${anime?.mal_id}`,
        });
      });

      // Execute all promises concurrently
      const results = await Promise.all(removalPromises);

      // console.log(results);
      // Check if all removals were successful
      const allSuccessful = results.every((result) => {
        return result.status === Constant_Var_success;
      });

      if (allSuccessful) {
        toast.success("Anime successfully removed from watchlists.", {
          id: "1",
          duration: 3000,
        });
        // console.log("Anime successfully removed from watchlists.");
        setIsOpen(false);
      } else {
        //! also show the reason for error,
        const failedRemovals = results.filter(
          (result) => result.status !== Constant_Var_success
        );

        // Extract error messages from the failed results
        const errorMessages = failedRemovals.map(
          (result) => result.error || "Unknown error"
        );

        // Show a toast with all error messages
        toast.error(
          `Some removals failed. Reasons: ${errorMessages.join(", ")}`,
          {
            id: "2",
            duration: 3000, 
          }
        );
      }
    } catch (error) {
      console.log(error);
      toast.error("Watchlist could not be updated!", { duration: 3000 });
    }
  };



  return (
    <>
      {isOpen && (
        <div className="absolute z-30 h-[80%] max-h-60 w-40 overflow-y-scroll md:scrollbar-thin md:scrollbar-track-transparent  bg-cbg-300 text-sm flex flex-col  rounded-lg py-2  mt-10  ">
          {watchListData
            ?.filter((lst) => lst?.watchListName !== "Recent")
            ?.map((list) => {
              const isAnimeInList = list?.animeList?.some(
                (an) => an.animeId === `${anime?.mal_id}`
              );
              return (
                <div
                  key={list?.id}
                  className={`p-2 ${
                    isAnimeInList
                      ? "bg-primary-400/70 w-full text-sky-00"
                      : "hover:bg-cbg-400"
                  }  my-1 items-center px-2  cursor-pointer  flex justify-between gap-2 `}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    list?.id && handleOnClickList(list?.id, list?.watchListName, isAnimeInList);
                  }}
                >
                  <div>{list?.watchListName}</div>{" "}
                  {isAnimeInList && (
                    <TiTick className="text-sky-700" size={20} />
                  )}{" "}
                </div>
              );
            })}

          <div
            className={`p-2  text-red-400 w-full my-1 items-center px-2  cursor-pointer  flex justify-between gap-2 hover:bg-cbg-400`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              removeFromAll();
            }}
          >
            <div>Remove</div>{" "}
          </div>
        </div>
      )}
    </>
  );
}