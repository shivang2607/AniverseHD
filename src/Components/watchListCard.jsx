import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { FaPlay } from "react-icons/fa";
import { MdMovie } from "react-icons/md";
import { IoMdTimer } from "react-icons/io";
import { PiBookmarkSimpleBold } from "react-icons/pi";
import ListDropDown from "./utils/ListDropDown";
import toast, { Toaster } from "react-hot-toast";
import GetLoggedUserWatchListsInfo from "@/app/firebase/WatchList/WatchListDocument/GetLoggedUserWatchListsInfo";
import { MdDeleteOutline } from "react-icons/md";
import RemoveAnimeFromWatchList from "@/app/firebase/WatchList/UpdateWatchLists/RemoveAnimeFromWatchList";
import { Constant_Var_success } from "@/utils/constants";
import useUserStore from "./ZustandStores/userStore";

export default function WatchListCard({ anime, watchListId }) {
  const {removeAnimeFromWatchList}=useUserStore();

  const handleRemoveAnime= async (id,watchListId)=>{
     await removeAnimeFromWatchList({watchListId:watchListId,animeId:id});
  }
  
  return (
    <div className="image-container  my-1 w-full  h-fit pb-3 rounded-md  flex flex-col  hover:shadow-m overflow-hidden">
      <Link
        href={anime.url? `${anime?.url}`:`/watch/${anime?.animeId}?provider=zoro`}
        className=" flex relative flex-col gap-2 h-56  rounded-md overflow-hidden duration-300 transition-all w-full   "
      >
        <div className="image relative rounded-md overflow-hidden  h-full w-full ">
          <Image
            fill
            src={
              anime?.animePhoto?.webp?.large_image_url ||
              anime?.animePhoto?.webp?.large_image_url
            }
            alt={anime?.animeName || "Anime title"}
            className="object-cover "
          />
        </div>
        <div className="z-10 bg-non hover:backdrop-brightness-75 rounded-md overflow-hidden hover:backdrop-blur-sm  o0 bg-gradient-radial from-transparent to-black via-transparent transition-all duration-200 ease-in-out  absolute h-full w-full">
          <div className="content flex flex-col  w-full h-full z-10">
            <div className="flex">
              <div className="flex flex-col">
                <button
                  className="flex mr-auto m-2 px-1 rounded-sm z-20 text-red-500 text-2xl font-bold"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemoveAnime(anime.animeId,watchListId);
                  }}
                >
                  <MdDeleteOutline/>
                </button>
        
              </div>
             
              <div className="flex ml-auto m-2 bg-red-500 px-1 rounded-sm items-center text-sm">
                {anime?.animeAgeRating?.split(" ")[0].toUpperCase() || "NA"}
              </div>
            </div>
            <div className="absolute  play hover:opacity-100 opacity-0 flex h-full w-full items-center justify-center ">
              <FaPlay size={50} className="text-primary-400 opacity-85" />
            </div>
            <div className="flex mt-auto m-2 gap-1 text-xs">
              <div className="score bg-sky-700 text-gray-200 font-semibold px-1   rounded-sm">
                {anime?.animeScore?.toFixed(2) || "NA"}
              </div>
              <div className="bg-primary-300 text-cbg-100 font-semibold px-1  rounded-sm">
                {Math.floor(
                  anime?.animeStartYear
                ) || "NA"}
              </div>
            </div>
          </div>
        </div>
      </Link>
      <div className="metacontent flex flex-col gap- p-2">
        <Link
          href={`/anime/${anime?.animeId}`}
          className="title text-lg tracking-wide font-semibold line-clamp-1 text-gray-200"
        >
          {anime?.animeName || "NA"}
        </Link>
        <div className="details flex text-sm  items-center w-full gap-2 text-gray-400">
          <p className="  flex gap-1 items-center">
            <MdMovie className="" />
            {anime?.animeType?.toUpperCase() || "NA"}
          </p>
          {/* {animeData?.episodes && ( */}
          <div className="gap-1 flex items-center mx-2">
            <div>
              <IoMdTimer className=" font-bold" />
            </div>
            <span className=" text-sm text-nowrap">
              {anime?.animeLength}
              {/* {animeData.episodes ? `${animeData?.episodes} ep`  :  "NA"} */}
            </span>
          </div>
          {/* )} */}
        </div>
      </div>
      <Toaster
                toastOptions={{
                  style: {
                    borderRadius: "10px",
                    background: "#b6d7d4",
                    border: "1px solid ",
                    color: "#041C32",
                  },
                }}
              />
    </div>
  );
}
