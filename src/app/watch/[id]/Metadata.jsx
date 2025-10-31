import ShareModal from '@/components/utils/ShareModal'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { useEffect } from 'react'
import { IoMdTimer } from 'react-icons/io'
import { MdOutlineSportsScore } from 'react-icons/md'
import { PiVideoFill } from 'react-icons/pi'
import { RxDotFilled } from 'react-icons/rx'

export default function Metadata({id, content}) {

    const [isClient, setIsClient] = useState(false);

    useEffect(()=>{
        setIsClient(true);
    }, []);

  return (
    <div className="metadata flex md:flex-row flex-col gap-6 items-center mx-2">
          <div className="flex flex-col gap-2 justify-center">
          <div className="img relative h-60 w-40 flex my-auto">
          {content?.images &&<Image src={content?.images?.webp?.large_image_url} fill className=" h-full flex-shrink-0 w-full rounded" alt={content?.title_english || content?.title}/>}
          </div>
          <div className="flex justify-between w-full">
          { id &&  <Link href={`/anime/${id}`} className="md:px-1 px-2 w-fit text-center items-center text-sm  bg-gray-200 text-gray-800 rounded-full">View Details</Link>}

          {isClient &&
          
          <ShareModal url={window?.location?.origin + `/anime/${id}`} modalTitle="Share this Episode"/>
          
          }
          </div>
          </div>
          

          <div className="contentContainer text-sm flex flex-col gap-3 my-auto">
            <h2 className="title text-2xl tracking-wide max-w-96 flex-wrap font-semibold">{content?.title_english || content?.title}</h2>

            <div className="additional-data justify-center md:justify-start flex gap-2 md:text-sm ">
                  {content && (
                    <>
                      {content?.score && (
                        <div className="score rounded flex items-center bg-sky-400 p- px-1 text-cbg-200 font-semibold">
                          <MdOutlineSportsScore className="text-xl" />{" "}
                          {typeof content?.score === "number" ? content?.score.toFixed(2) :( content?.score || "NA")}
                        </div>
                      )}
                      <div className="episodes flex gap-1 bg-primary-300 text-cbg-200 font-semibold rounded px-1 items-center">
                        <PiVideoFill /> {content?.episodes || "?"}
                      </div>
                      <div className="flex gap-1 items-center bg-cbg-400 rounded px-1">
                        <IoMdTimer />{" "}
                        {content?.duration || content?.episode_duration || "?"}
                      </div>
                      <div className="type flex  items-center">
                        <RxDotFilled /> {content?.type?.toUpperCase() || "?"}
                      </div>
                    </>
                  )}
                </div>
            
            <div className="genre-themes text-gray-400 ">
              {content?.genres?.join(", ")} <br />
              {content?.themes?.join(", ")} <br />
            </div>

            <div className="synopsis w-96 text-justify h-24 overflow-y-scroll scrollbar-track-transparent  md:scrollbar-thin pr-3 text-xs flex-wrap">
              {content?.synopsis  || ""}
            </div>
          </div>
        </div>
  )
}
