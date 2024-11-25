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
    hideWatchlistBar,
  } = useUserStore();

  const count = 20;

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
    <>
    {!hideWatchlistBar &&
    <div className="w-full p-1 mx-2  bg-black/5. md:pr-10 pr-8 rounded-md overflow-clip flex md:gap-4 gap-2  items-center md:text-sm text-xs md:mt-2">
      <BiSolidHide
        className="!text-2xl w-20 text-primary-300 ml-3 cursor-pointer"
        onClick={() => toggleHideWatchlistBar()}
      />

      <select
        name="list"
        id="list"
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className=" px-1 bg-transparent md:mx-5 text-sm w-24 md:w-auto rounded-full scrollbar-thin"
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
            ?.slice(0, count)
            ?.map((anime,ind) => {
              return (
                <Link
                  href={`/anime/${anime?.animeId}`}
                  className="rounded-lg px-2 py-1 flex gap-2 items-center  bg-primary-100/50"
                  key={ind}
                >
                  <div className="overflow-x-hidden text-ellipsis whitespace-nowrap md:max-w-48 max-w-36">
                    {anime?.animeName}
                  </div>
                  <Link
                    href={`/watch/${anime.animeId}?provider=zoro`}
                    className="text-lg"
                    onClick={(e) => {
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
     }</>
  );
}
