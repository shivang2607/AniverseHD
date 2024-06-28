"use client";
import React, { useEffect, useState } from "react";
import useAnimeStore from "@/components/utils/animeStore";
import Image from "next/image";
import { FaPlay, FaPlayCircle } from "react-icons/fa";
import { MdPlayDisabled } from "react-icons/md";
import { RxDotFilled } from "react-icons/rx";
import { MdOutlineSportsScore } from "react-icons/md";
import { PiVideoFill } from "react-icons/pi";
import { IoMdAdd, IoMdTimer } from "react-icons/io";
import Link from "next/link";
import Details from "./Details";


export default function Anime({ params }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const { anime, fetchAnime } = useAnimeStore((state) => ({
    fetchAnime: state.fetchAnime,
    anime: state.getAnimeById(params.id),
  }));



  useEffect(() => {
    console.log("response anime data", anime);
    if (!params.id || anime) return;
    fetchAnime(params.id);
  }, [params.id, fetchAnime, anime]);

  return (
    <div className="w-full h-full">
      {anime && (
        <div
          className={`trailer w-full ${
            isPlaying ? "h-[90vh]" : "h-52"
          } relative`}
        >
          {!isPlaying ? (
            <>
              <div className="w-full h-full absolute backdrop-blur-md bg-black bg-opacity-50 z-10"></div>
              <div className="relative h-full w-full object-fit  ">
                <Image
                  src={
                    anime?.images?.webp?.image_url ||
                    anime?.images?.jpg?.large_image_url ||
                    anime?.images?.jpg?.maximum_image_url
                  }
                  alt="YouTube Thumbnail"
                  fill
                  className=" object-cover "
                />
              </div>
            </>
          ) : (
            <div className=" w-full h-full">
              <iframe
                src={anime?.trailer?.embed_url} // Assuming `anime.trailer.url` contains the direct video URL
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          )}
        </div>
      )}
      <div className="playbutton flex w-full h-14 ml-auto ">
        {anime?.trailer?.embed_url && (
          <button
            className="rounded-md  flex ml-auto mx-4 bg-primary-100 text-cbg-100 gap-1 font-semibold py-1 px-2 items-center my-2"
            onClick={() => setIsPlaying((prev) => !prev)}
          >
            {!isPlaying ? (
              <>
                <FaPlay className="text-sm" /> <span>Show Trailer</span>
              </>
            ) : (
              <>
                <MdPlayDisabled className="text-2xl" />{" "}
                <span> Hide Trailer </span>
              </>
            )}
          </button>
        )}
      </div>
      {anime && (
        <div>
          <div className="first-container w-full gap-16 flex  px-8">
            <div className="image-and-details w-1/5 flex flex-col">
            <div
              className={`relative mt-auto  image flex h-[22rem] ${
                isPlaying ? "translate-y-0 mb-8 md:mb-12" : "-translate-y-24"
              }  z-10 w-full shadow-xl to-cbg-100/65  overflow-hidden rounded-md   `}
            >
              <Image
                src={
                  anime?.images?.webp?.large_image_url ||
                  anime?.images?.jpg?.large_image_url ||
                  anime?.images?.jpg?.image_url ||
                  anime?.images?.webp?.image_url
                }
                fill
                className="shadow-lg "
                alt={anime?.title_english || anime?.title}
              />
            </div>
            {/* //? details component */}
                <Details anime={anime}/>  
            </div>

            <div className="primary-content flex flex-col w-2/3">
              <h1 className="w-full text-4xl font-semibold tracking-wide">
                {anime.title_english || anime.title}
              </h1>

              {/* //!below div contains data like episodes, type, duration etc */}
              <div className="additional-data flex gap-2 text-sm my-8">
               {anime?.score && <div className="score rounded flex items-center bg-sky-400 p- px-1 text-cbg-200 font-semibold">
                <MdOutlineSportsScore className="text-xl"/> {anime?.score?.toFixed(2)}
                </div>}
                <div className="episodes flex gap-1 bg-primary-300 text-cbg-200 font-semibold rounded px-1 items-center">
                    <PiVideoFill/> {anime?.episodes || "?"}
                </div>
                <div className="flex gap-1 items-center bg-cbg-400 rounded px-1">
                   <IoMdTimer/> {anime?.duration || anime?.episode_duration || "?"}
                </div>
                <div className="type flex  items-center">
                    <RxDotFilled/> {anime?.type?.toUpperCase() || "?"}
                </div>
              </div>

              <div className="flex mt-4 gap-4">
                <Link href="#" className="watchnow flex gap-2 items-center bg-primary-500  rounded-full font-sembold px-3 py-1 text-cbg-100 text-lg"><FaPlayCircle/> Watch now</Link>
                <button className="watchnow flex gap-2 items-center bg-gray-200  rounded-full font-sembold px-3 py-1 text-cbg-100 text-lg"><IoMdAdd/> Add to List</button>
            </div>

            {anime?.gif_images && 
            <div className="gif py-16  items-center  flex gap-4">
              <div className='relative overflow-hidden rounded-full  w-20 h-20 object-cover object-center'>
          <Image src={anime.gif_images?.original?.webp ||
                      anime.gif_images?.fixed_height?.webp ||
                      anime.gif_images?.fixed_width?.webp 
          } unoptimized alt={anime.title_english || anime.title} fill className=''/>
              </div>

    
              <div className="gifcontent w-2/5 ">Check out our <Link href="/recommendations" className="text-fuchsia-500 font-semibold italic">Recommendations</Link> page for more similar Anime like <div className="text-primary-300 w-full    overflow-hidden text-ellipsis text-nowrap italic  font-semibold ">{anime.title_english || anime.title}</div>
            </div>
            </div>
            }
              
                


            </div>
            
          </div>
                
          <p>{anime.description}</p>
          {/* Add more fields as necessary */}
        </div>
      )}
    </div>
  );
}
