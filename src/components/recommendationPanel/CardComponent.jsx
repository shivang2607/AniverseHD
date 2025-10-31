import React from "react";
import { FaPlay } from "react-icons/fa6";
import Image from "next/image";
import { PiVideoFill } from "react-icons/pi";
import { MdMovie } from "react-icons/md";
import Link from "next/link";

export default function CardComponent({ anime }) {
  const animeData = anime?.payload;
  return (
    <>
      <div className="relative flex-shrink-0 group gap-2 w-32 h-56  flex flex-col  ">
        <Link  href={`/anime/${anime?.id}`} className="relative w-full h-full bg-cover overflow-hidden bg-center rounded-md">
          <Image
            className="object-cover "
            src={
              animeData?.images?.webp?.image_url ||
              animeData?.main_picture ||
              animeData?.images?.webp?.small_image_url
            }
            alt="poster image"
            fill={true}
            sizes="(max-width: 768px) 25vw, (max-width: 1024px) 20vw, 15vw" //optinal, even i dont know why i am using this XD
          />
          <div className="absolute top-0 right-0 bg-red-500 px-1   justify-center text-xs  rounded-sm m-1 z-10 items-center">
            {animeData?.rating?.split(" ")[0].toUpperCase() || "NA"}
          </div>
          <div className="absolute bottom-0 left-0 flex z-10 gap-1 p-1 text-[0.65rem] rounded-sm overflow-hidden">
            <div className="bg-sky-700 text-gray-200 font-semibold px-1   rounded-sm">
            { typeof animeData?.score === "number" ? animeData.score.toFixed(2) :( animeData?.score || "NA")}
            </div>
            <div className="bg-primary-300 text-cbg-100 font-semibold px-1  rounded-sm">
              {Math.floor(animeData?.start_year) || "NA"}
            </div>
          </div>
          <div className="blured-on-hover flex absolute inset-0 items-center justify-center backdrop-blur-sm hover:opacity-100 opacity-0 transition-all duration-150 ease-in-out z-0">
            <FaPlay size={32} className='text-primary-400' />
          </div>
        </Link>

        {/*******DETAILS */}
        <div className="card-content w-full  ">
          <h3 className=" font-semibold text-gray-50 tracking-wide  line-clamp-1 hover:text-primary-600">
            {animeData?.title_english || animeData?.title}
          </h3>
          <div className="details flex text-xs  items-center w-full justify-between text-gray-300">
            <p className="  flex gap-1 items-center">
              <MdMovie size={14} className="text-green-300" />
              {animeData?.type?.toUpperCase() || "NA"}
            </p>
            
              <div className="gap-1 flex w-full mr-auto justify-start flex-1 fl items-center ml-2">
                <div>
                  <PiVideoFill size={14} className="text-sky-200 font-bold" />
                </div>
                <span className=" text-xs  text-nowrap overflow-ellipsis">{animeData.episodes ? `${animeData?.episodes} ep`  :  "NA"} </span>
              </div>
            
          </div>
        </div>
      </div>
    </>
  );
}
