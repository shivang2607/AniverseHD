'use client'
import React, { useEffect, useState } from 'react'
import RecommendationSearchComponent from './SearchComponentRecommendation'
import Image from 'next/image';
import { IoMdClose } from "react-icons/io";
import { RxReset } from 'react-icons/rx';
import { Hourglass } from 'react-loader-spinner';
import { GiStarSwirl } from 'react-icons/gi';
import toast, { Toaster } from 'react-hot-toast';
import SharinganLoader from '../sharinganLoader';
import { TypeAnimation } from 'react-type-animation';
import axios from 'axios';
import CardComponent from './CardComponent';
import Link from 'next/link';
import { FaChevronRight } from 'react-icons/fa6';
import useRecommendationStore from '@/ZustandStores/recommendationStore';
import { demographics, genres, themes } from '../utils/genre-themes-list';

export default function AnimeBased() {

  const { setStoreRecommendations, setStoreSelectedAnime, resetStore} = useRecommendationStore(state=>({
    setStoreRecommendations : state.setRecommendations,
    setStoreSelectedAnime : state.setSelectedAnimeList,
    // setDescription : state.setDescription,
    resetStore: state.reset,
  }))
    
    

    const [selectedAnime, setSelectedAnime] = useState();
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState([]);


    useEffect(()=>{
      const localAnime = JSON.parse(sessionStorage.getItem("anime"));
      // console.log(localAnime);
      const localRecommendations = JSON.parse(sessionStorage.getItem("anime recommendations"));
      setSelectedAnime(localAnime || null);
      setRecommendations(localRecommendations?.slice(0, 5) || null);
    }, [])
    

    const handleAnimeSelect = (anime)=>{
        // console.log(anime);
        setSelectedAnime(anime);
    }

    const getRecommendations = async()=>{
      if (!selectedAnime) {
        toast.error("Please select an Anime", {
          duration: 2000,
          id: "error",
        });
        return;
      }
  
      setLoading(true);
      try {
        const response = await axios.post("/api/v1/recommend", {
          positive: [selectedAnime?.id],
          selectedGenre: genres.map(g => g.value),
          selectedTheme: themes.map(t => t.value),
          selectedDemographics: demographics.map(d => d.value),
        });
        // console.log(response);
        setRecommendations(response?.data);
        setLoading(false);
        sessionStorage.setItem("anime", JSON.stringify(selectedAnime));
        sessionStorage.setItem("anime recommendations", JSON.stringify(response?.data));
      } catch (error) {
        toast.error(
          error?.response?.data?.error ||
            error?.message ||
            "Something Went Wrong",
          {
            id: "catch-error",
          }
        );
        setLoading(false);
      }
    }

    const reset = ()=>{
        setSelectedAnime();
        setLoading(false);
        setRecommendations();
        sessionStorage.removeItem("anime");
        sessionStorage.removeItem("anime recommendations");
    }

    const handleViewAll = ()=>{
      resetStore();
      setStoreRecommendations(recommendations);
      setStoreSelectedAnime([selectedAnime]);
    }

  return (
    <div className='md:px-8 px-2 '>
        <div className="flex w-full justify-between gap-2 md:pr-3">
        <div className='flex flex-col gap-8 md:w-[74%] w-full '>
            <div className="search flex w-full h-10 gap-4">
                <RecommendationSearchComponent onAnimeSelect={handleAnimeSelect}/>
            </div>
            <div className="button-sets flex justify-end gap-2">
        <button
          disabled={loading}
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
        {/* <Toaster
          toastOptions={{
            style: {
              borderRadius: "10px",
              background: "#b6d7d4",
              border: "1px solid ",
              color: "#041C32",
              
            },
          }}
        /> */}
      </div>
        </div>
            {selectedAnime && <div className="selected-card  h-fit flex flex-row-reverse gap-2 rounded-md">
                <button className='absolute z-10 rounded-full border-[1px] border-cbg-100 translate-x-1 -translate-y-1 bg-primary-600 p-1' onClick={()=>setSelectedAnime()}><IoMdClose className='text-cbg-100'/></button>
                <div className="image relative md:w-32 rounded-md md:h-40 h-32 w-24 object-cover overflow-hidden">
                    <Image fill  src={selectedAnime?.payload?.images?.webp?.image_url || selectedAnime?.payload?.main_picture} alt={selectedAnime?.payload?.title_english}/>
                </div>
                
            </div>}
        </div>



        {loading ? (
        <div className="loading items-center gap-3 flex flex-col">
          <div className=" md:w-28 md:h-28 w-24 h-24 mx-auto mt-8 flex ">
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
                "Your recommendations are on its way!",
                2000,
              ]}
              speed={60}
              repeat={Infinity}
            />
          </h3>
        </div>
      ) : (
        <>{recommendations?.length > 0 && <div className="loading items-center gap-3 mt-4 md:p-3 pb-0 !tracking-wide flex flex-col bg-opacity-30 ">
              
              <h1 className='font-semibold text-2xl mr-auto justify-between flex items-center w-full  mb-3 '>Here are your Recommendations
              <Link href="/recommendations"  onClick={handleViewAll} className="flex font-semibold tracking-wide text-lg text-primary-300 hover:text-primary-600 items-center">
                
                  View All <FaChevronRight />
                
              </Link>
              </h1>
        
        <div className=' component flex md:justify-between gap-4 md:scrollbar-thin  overflow-x-scroll md:overflow-x-hidden md:p-0 pb-4  w-full '>{
          recommendations?.slice(0, 5)?.map(anime=>{
            return <CardComponent key={anime?.id} anime={anime}/>
          })
        }
      
        </div>
        </div>
}</>
      )}
    </div>
  )
}
