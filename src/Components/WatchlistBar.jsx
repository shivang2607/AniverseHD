"use client";
import React, { useEffect, useState } from "react";
import useUserStore from "./ZustandStores/userStore";
import { FaRegCirclePlay } from "react-icons/fa6";
import Link from "next/link";
import { MdCancel } from "react-icons/md";
import { BiSolidHide } from "react-icons/bi";
import RemoveAnimeFromWatchList from "@/app/firebase/WatchList/UpdateWatchLists/RemoveAnimeFromWatchList";
import { Constant_Var_success } from "@/utils/constants";

export default function WatchlistBar() {
  const {
    loggedInUserWatchListsInfo,
    isUserLoggedIn,
    RecentWatchListId,
    loadLoggedInUserWatchLists,
    toggleHideWatchlistBar,
    selectedId,
    setSelectedId,
    listData,
    setListData,
  } = useUserStore();

  useEffect(() => {
    setSelectedId(RecentWatchListId);
  }, [isUserLoggedIn]);

  useEffect(() => {
    if (loggedInUserWatchListsInfo) {
      const data = loggedInUserWatchListsInfo?.filter(
        (lst) => lst.id === selectedId
      );
      console.log(data);
      setListData(data?.[0]?.animeList);
      
    }
  }, [selectedId, loggedInUserWatchListsInfo]);


  const handleRemove = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await RemoveAnimeFromWatchList({
      watchListId: selectedId,
      animeId: id,
    });
    loadLoggedInUserWatchLists();

    if (result.status !== Constant_Var_success) {
      toast.error("Can't Remove Anime from Recent Watch list");
    }
  };

  return (
    <div className="w-full p-1 bg-black/5. flex gap-4  items-center text-sm mt-2">
      <BiSolidHide
        className="text-xl text-primary-300 ml-3 cursor-pointer"
        onClick={() => toggleHideWatchlistBar()}
      />

      <select
        name="list"
        id="list"
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className=" px-1 bg-cbg-300/15 mx-5 text-sm rounded-full scrollbar-thin"
      >
        {loggedInUserWatchListsInfo?.map((list) => {
          return (
            <option key={list.id} value={list.id} className="p-2 m-2">
              {list?.watchListName}
            </option>
          );
        })}
      </select>

      <div className="list flex overflow-x-auto md:scrollbar-none items-center gap-2">
        {listData?.length > 0 ? (
          listData
            ?.slice()
            ?.reverse()
            ?.map((anime) => {
              return (
                <Link
                  href={`/anime/${anime?.animeId}`}
                  className="rounded-lg px-2 py-1 flex gap-2 items-center  bg-primary-100/50"
                >
                  <div className="overflow-x-clip flex text-ellipsis whitespace-nowrap max-w-48">
                    {anime?.animeName}
                  </div>
                  <Link
                    href={`/watch/${anime.animeId}?provider=zoro`}
                    className="text-lg"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <FaRegCirclePlay />
                  </Link>
                  <button
                    className="text-xl"
                    onClick={(e) => handleRemove(e, anime?.animeId)}
                  >
                    <MdCancel />
                  </button>
                </Link>
              );
            })
        ) : (
          <div>No Data Available</div>
        )}
      </div>
    </div>
  );
}
