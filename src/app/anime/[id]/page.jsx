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
import Synopsis from "./Synopsis";
import Relations from "./Relations";
import Suggested from "./Suggested";


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

    
    // setRelations(filteredRelations);

    // console.log("relations h bhaai", filteredRelations);


  }, [params.id, fetchAnime, anime]);

  const filteredRelations = anime?.relations?.map(item => ({
    ...item,
    entry: item.entry.filter(entryItem => entryItem.type === 'anime')
  })).filter(item => item.entry.length > 0)

  return (
    <div className="w-full h-full">
      {anime && (
        <div
          className={`trailer w-full ${
            isPlaying ? "h-[90vh]" : "h-64"
          } relative`}
        >
          {!isPlaying ? (
            <>
              <div className="w-full h-full absolute backdrop-blur-md bg-black/30 z-10"></div>
              <div className="relative h-full w-full object-cover  ">
                <Image
                  src={
                    anime?.trailer?.images?.image_url || 
                    anime?.images?.webp?.image_url
                  }
                  alt="YouTube Thumbnail"
                  fill
                  className=" object-cover  "
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
        <div className="">
          <div className="first-container w-full gap-16 flex  px-12">
            <div className="image-and-details w-[28%]   flex flex-col">
            <div
              className={`relative mt-auto  image flex h-96 ${
                isPlaying ? "translate-y-0 mb-8 md:mb-12" : "-translate-y-32"
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
            
            </div>

                <div className="flex gap-4 w-full ">
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

    
              <div className="gifcontent w-3/5 ">Check out our <Link href="/recommendations" className="text-fuchsia-500 font-semibold italic">Recommendations</Link> page for more similar Anime like <div className="text-primary-300 w-full    overflow-hidden text-ellipsis text-nowrap italic  font-semibold ">{anime.title_english || anime.title}</div>
            </div>
            </div>
            }
              
                


            </div>

            {anime?.streaming?.length > 0 && <div className="stream w-1/3 flex flex-col justify-center ">
              <h2 className="font-semibold text-xl mb-4 -mt-8 text-gray-200">Also Stream On:</h2>
              <div className="content flex flex-col gap-5">
                {anime?.streaming?.map(stream=>{
                  if (!["Netflix", "Crunchyroll", "Hulu", "Funimation"].includes(stream?.name)) return;


                 return <Link key={stream?.name} href={stream?.url} target="_blank" className={`object-cover ${stream?.name==="Netflix"?"h-[1.1rem] !w-28":stream?.name==="Funimation" ? "h-[0.8rem] w-28" : stream?.name==="Hulu"?"":""} w-32 h-6`}>
                    <img src={`/${stream?.name}.png`} alt={stream?.name} className="h-full w-full"/>
                  </Link>
                })}
              </div>
            </div>}


            </div>
            
          </div>
          
          <div className="bgimage  bg-cover bg-bottom object-cover w-full h-full bg-no-repeat"
          style={{
            backgroundImage: `url(${anime?.trailer?.images?.large_image_url || anime?.images?.webp?.large_image_url})`,
          }}
          >

          <div className="second-container py-4  bg-cbg-100 bg-opacity-80 backdrop-blur-md justify-around flex px-12 w-full my-8"
          
          >
            {/* //? details component */}
            <Details anime={anime}/>  
            <Synopsis description={anime?.synopsis} background={anime?.background} theme={anime?.theme}/>
          </div>
            </div>
                
          
            {
            Array.isArray(filteredRelations) && 
            filteredRelations?.length>0 && 
            <Relations relations={filteredRelations}/>
            }
            <Suggested id={params?.id}/>
          
        </div>
      )}
    </div>
  );
}
