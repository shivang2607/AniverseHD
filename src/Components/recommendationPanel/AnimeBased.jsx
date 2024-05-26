'use client'
import React, { useState } from 'react'
import RecommendationSearchComponent from './SearchComponentRecommendation'
import Image from 'next/image';
import { IoMdClose } from "react-icons/io";
import { RxReset } from 'react-icons/rx';
import { Hourglass } from 'react-loader-spinner';
import { GiStarSwirl } from 'react-icons/gi';
import { Toaster } from 'react-hot-toast';
import SharinganLoader from '../sharinganLoader';
import { TypeAnimation } from 'react-type-animation';

export default function AnimeBased() {

    const [selectedAnime, setSelectedAnime] = useState();
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState();

    const handleAnimeSelect = (anime)=>{
        console.log(anime);
        setSelectedAnime(anime);
    }

    const getRecommendations = async()=>{
        setLoading(true);
    }

    const reset = ()=>{
        setSelectedAnime();
        setLoading(false);
        setRecommendations();
    }

  return (
    <div className='px-8'>
        <div className="flex w-full gap-12">
        <div className='flex flex-col gap-8 w-[70%]'>
            <div className="search flex w-full h-10 gap-4">
                <RecommendationSearchComponent onAnimeSelect={handleAnimeSelect}/>
            </div>
            <div className="button-sets flex justify-end gap-2">
        <button
          className="rounded-md font-semibold  text-primary-300 hover:text-primary-400  p-1 px-2 flex items-center gap-1"
          onClick={reset}
        >
          {" "}
          <RxReset size={18} /> Reset
        </button>
        <button
          disabled={loading}
          className="rounded-md hover:bg-primary-300 bg-primary-200 text-cbg-100 font-semibold p-1 px-3 flex items-center gap-1"
          onClick={getRecommendations}
        >
          {loading ? (
            <Hourglass
              visible={true}
              wrapperClass="h-5 "
              colors={["#041C32", "#421fa3"]}
            />
          ) : (
            <>
              <GiStarSwirl size={18} /> Recommend{" "}
            </>
          )}
        </button>
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
        </div>
            {selectedAnime && <div className="selected-card  h-fit flex flex-row-reverse gap-2 rounded-md">
                <button className='absolute z-10 rounded-full border-[1px] border-cbg-100 translate-x-1 -translate-y-1 bg-primary-600 p-1' onClick={()=>setSelectedAnime()}><IoMdClose className='text-cbg-100'/></button>
                <div className="image relative w-32 rounded-md h-40 object-cover overflow-hidden">
                    <Image fill src={selectedAnime?.payload?.images?.webp?.large_image_url || selectedAnime?.payload?.main_picture} alt={selectedAnime?.payload?.title_english}/>
                </div>
                
            </div>}
        </div>



        {loading ? (
        <div className="loading items-center gap-3 flex flex-col">
          <div className=" w-36 h-36 mx-auto mt-8 flex ">
            <SharinganLoader />
          </div>
          <h3 className="text- text-red-500 italic backdrop-brightness-0 p-1 font-semibold">
            <TypeAnimation
              sequence={[
                "Sharingan in action...",
                2000,
                "Analyzing and finding your ideal anime picks!",
                2000,
                "Unleashing the power of the Sharingan...",
                2000,
                "This may take a while, Hang tight",
                2000,
                "Your personalized anime list is on its way!",
                2000,
              ]}
              speed={60}
              repeat={Infinity}
            />
          </h3>
        </div>
      ) : (
        <></>
      )}
    </div>
  )
}
