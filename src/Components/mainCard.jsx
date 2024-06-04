import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { FaPlay } from 'react-icons/fa'
import { MdMovie } from 'react-icons/md'
import { IoMdTimer } from "react-icons/io";
import { PiBookmarkSimpleBold } from "react-icons/pi";

export default function MainCard({anime}) {
  // console.log(anime);
  return (
    
    <div className='image-container  my-1 w-full  h-fit pb-3 rounded-md  flex flex-col  hover:shadow-m overflow-hidden'>
    <Link href="#" className=' flex relative flex-col gap-2 h-72  rounded-md overflow-hidden duration-300 transition-all w-full   '>
        <div className="image relative rounded-md overflow-hidden  h-full w-full ">
            <Image 
            fill 
            src={anime?.images?.webp?.large_image_url || anime?.images?.webp?.large_image_url}
            alt={anime?.title_english}
            className='object-cover '
            />
        </div>
        <div className='z-10 bg-non hover:backdrop-brightness-75 rounded-md overflow-hidden hover:backdrop-blur-sm  o0 bg-gradient-radial from-transparent to-black via-transparent transition-all duration-200 ease-in-out  absolute h-full w-full'>

            <div className="content flex flex-col  w-full h-full z-10">
                <div className="flex">
            <button className="flex mr-auto m-2 px-1 rounded-sm  text-fuchsia-400 z-20 text-2xl font-bold" onClick={e=>{
                e.preventDefault();
                e.stopPropagation();
                console.log("Shivang");
            }}><PiBookmarkSimpleBold/></button>
                <div className="flex ml-auto m-2 bg-red-500 px-1 rounded-sm items-center text-sm">{anime?.rating?.split(" ")[0] || 'NA'}</div>
                </div>
                <div className="absolute  play hover:opacity-100 opacity-0 flex h-full w-full items-center justify-center ">
                    <FaPlay size={50} className='text-primary-400 opacity-85'  />
                </div>
                <div className="flex mt-auto m-2 gap-1 text-xs">
                    <div className="score bg-sky-700 text-gray-200 font-semibold px-1   rounded-sm">{anime?.score?.toFixed(2) || "NA"}</div>
                    <div className="bg-primary-300 text-cbg-100 font-semibold px-1  rounded-sm">{Math.floor(anime?.aired?.prop?.from?.year) || "NA"}</div>
                </div>
            </div>

        </div>
    </Link>
    <div className="metacontent flex flex-col gap- p-2">
    <Link href="#" className="title text-lg tracking-wide font-semibold line-clamp-1 text-gray-200">{anime?.title_english || anime?.title || "NA"}</Link>
    <div className="details flex text-sm  items-center w-full gap-2 text-gray-400">
            <p className="  flex gap-1 items-center">
              <MdMovie  className="" />
              {anime?.type?.toUpperCase() || "NA"}
              
            </p>
            {/* {animeData?.episodes && ( */}
              <div className="gap-1 flex items-center mx-2">
                <div>
                  <IoMdTimer  className=" font-bold" />
                </div>
                <span className=" text-sm text-nowrap">
                    {anime?.duration}
                    {/* {animeData.episodes ? `${animeData?.episodes} ep`  :  "NA"} */}
                 </span>
              </div>
            {/* )} */}
          </div>
    </div>
    </div>
  )
}
