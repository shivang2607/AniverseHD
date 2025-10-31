import Image from 'next/image';
import Link from 'next/link';
import React from 'react'
import { PiBookmarkSimpleBold } from 'react-icons/pi';
import ListDropDown from '../utils/ListDropDown';
import { FaPlay } from 'react-icons/fa';
import { MdMovie } from 'react-icons/md';
import { IoMdTimer } from 'react-icons/io';
import { Toaster } from 'react-hot-toast';

export default function ScheduleCard({anime}) {

    const convertJSTtoIST = (time) => {
        // Parse the input time (in "HH:mm" format)
        const [hours, minutes] = time.split(":").map(Number);
      
        // Create a Date object with the JST time (we assume the date doesn't matter here)
        const jstDate = new Date();
        jstDate.setHours(hours, minutes, 0, 0);
        
        // JST is UTC+9, so let's adjust the date by subtracting 3 hours and 30 minutes to convert to IST
        // 3 * 60 * 60 * 1000 = 3 hours in milliseconds
        // 30 * 60 * 1000 = 30 minutes in milliseconds
        jstDate.setHours(jstDate.getHours() - 3);
        jstDate.setMinutes(jstDate.getMinutes() - 30);
      
        // Format the new time in "HH:mm" format
        const istHours = jstDate.getHours().toString().padStart(2, '0');
        const istMinutes = jstDate.getMinutes().toString().padStart(2, '0');
      
        return `${istHours}:${istMinutes}`;
      };


  return (
    <div className="image-container  my-1 w-full  h-fit pb-3 rounded-md  flex flex-col  hover:shadow-m overflow-hidden">
      <Link
        href={`/anime/${anime?.mal_id}`}
        className={ `flex relative flex-col gap-2 md:h-56 h-40 rounded-md overflow-hidden duration-300 transition-all w-full   `}
      >
        <div className="image relative rounded-md overflow-hidden  h-full w-full ">
          <Image
            fill
            src={
              anime?.main_picture ||
              anime?.images?.webp?.large_image_url ||
              anime?.images?.webp?.large_image_url
            }
            alt={anime?.title_english || "Anime title"}
            className="object-cover "
          />
        </div>
        <div className="z-10 bg-non hover:backdrop-brightness-75 rounded-md overflow-hidden hover:backdrop-blur-sm  o0 bg-gradient-radial from-transparent to-black via-transparent transition-all duration-200 ease-in-out  absolute h-full w-full">
          <div className="content flex flex-col  w-full h-full z-10">
            <div className="flex">
              
             
              <div className="flex ml-auto m-2 bg-red-500 px-1 rounded-sm items-center text-sm">
                {anime?.rating?.split(" ")[0].toUpperCase() || "NA"}
              </div>
            </div>
            <div className="absolute  play hover:opacity-100 opacity-0 flex h-full w-full items-center justify-center ">
              <FaPlay size={50} className="text-primary-400 opacity-85" />
            </div>
            <div className="flex mt-auto m-2 gap-1 text-xs">
              <div className="score bg-sky-700 text-gray-200 font-semibold px-1   rounded-sm">
              {typeof anime?.score === "number" ? anime.score.toFixed(2) :( anime?.score || "NA")}
              </div>
              <div className="bg-primary-300 text-cbg-100 font-semibold px-1  rounded-sm">
                {Math.floor(
                  anime?.aired?.prop?.from?.year || anime?.start_year
                ) || "NA"}
              </div>
            </div>
          </div>
        </div>
      </Link>
      <div className="metacontent flex flex-col gap- p-2">
        <Link
          href={`/anime/${anime?.mal_id}`}
          className="title text-lg tracking-wide font-semibold line-clamp-1 text-gray-200"
        >
          {anime?.title_english || anime?.title || "NA"}
        </Link>
        <div className="details flex text-sm  items-center w-full gap-2 text-gray-400">
          <p className="  flex gap-1 items-center">
            <MdMovie className="" />
            {anime?.type?.toUpperCase() || "NA"}
          </p>
          {/* {animeData?.episodes && ( */}
          {anime?.broadcast?.time && <div className="gap-1 flex items-center ml-auto">
            <div>
              <IoMdTimer className=" font-bold" />
            </div>
            <span className=" text-sm text-nowrap">
              {convertJSTtoIST(anime?.broadcast?.time)} (IST)
              {/* {animeData.episodes ? `${animeData?.episodes} ep`  :  "NA"} */}
            </span>
          </div>}
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
  )
}
