"use client";
import React, { useEffect, useState } from "react";
import SharinganLoader from "../sharinganLoader";
import { TypeAnimation } from "react-type-animation";
import { Hourglass } from "react-loader-spinner";
import { RxReset } from "react-icons/rx";
import { GiStarSwirl } from "react-icons/gi";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import CardComponent from "./CardComponent";
import { FaChevronRight } from "react-icons/fa6";
import useRecommendationStore from "../utils/store";
import { demographics, genres, themes } from "../utils/genre-themes-list";

export default function DescriptionBased() {
  
  const {resetStore, setStoreRecommendations, setSelectedAnimeList, setStoreDescription} = useRecommendationStore(state=>({
    resetStore: state.reset,
    setStoreRecommendations : state.setRecommendations,
    setStoreDescription : state.setDescription,
  }))
  

  const [description, setDescription] = useState();
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState();

  useEffect(()=>{
    const localDescription = sessionStorage.getItem("description");
    const localRecommendations = JSON.parse(sessionStorage.getItem("description recommendations"));
    setDescription(localDescription || null);
    setRecommendations(localRecommendations?.slice(0, 5) || null);
  }, [])

  const getRecommendations = async () => {
    if (!description || (description && description?.trim() === "")) {
      toast.error("Description cannot be empty!", {
        duration: 2000,
        id: "error",
      });
      return;
    } else if (description?.trim().split(" ").length < 5) {
      toast.error("Description should have at least 5 words!", {
        id: "word-limit-error",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/api/v1/recommend", {
        description,
        selectedGenre: genres.map(g => g.value),
        selectedTheme: themes.map(t => t.value),
        selectedDemographics: demographics.map(d => d.value),
      });
      setRecommendations(response?.data);
      setLoading(false);
      //Setting the description and recommendation results in local Storage
      sessionStorage.setItem("description", description);
      sessionStorage.setItem("description recommendations", JSON.stringify(response?.data));
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
  };

  const reset = () => {
    setRecommendations();
    setLoading(false);
    setDescription();
    sessionStorage.removeItem("description");
    sessionStorage.removeItem("description recommendations");
  };

  const handleViewAll = ()=>{
    resetStore();
    setStoreRecommendations(recommendations);
    setStoreDescription(description);
    
  }

  return (
    <div className="description-block flex flex-col gap-3 px-2  md:pl-4 md:pr-16">
      <textarea
        maxLength={300}
        value={description || ""}
        placeholder="Enter Description, eg: Anime with demons and monster set in old era with sword fights."
        className=" block w-full p-2  outline-none rounded-md shadow-sm scrollbar-thin text-gray-800" 
        onChange={(e) => setDescription(e.target.value)}
      ></textarea>
      <span className="remaininglength flex ml-auto text-xs text-gray-400 relative -translate-y-2">
        {300 - description?.length || 0}/300
      </span>

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
        <>
        {recommendations && <div className="loading items-center gap-3 mt-4 md:p-3 pb-0 !tracking-wide flex flex-col bg-opacity-30 ">
              
            <h1 className='font-semibold text-2xl mr-auto justify-between flex items-center w-full  mb-3 '>Here are your Recommendations
                <Link onClick={handleViewAll} className="flex font-semibold tracking-wide text-lg text-primary-300 hover:text-primary-600 items-center" href="/recommendations">
                View All<FaChevronRight/>
                </Link>
            </h1>
             
             <div className=' component flex md:justify-between md:scrollbar-thin gap-4 overflow-x-scroll md:overflow-x-hidden md:p-0 pb-4  w-full '>{
               recommendations?.slice(0, 5)?.map(anime=>{
                 return <CardComponent key={anime?.id} anime={anime}/>
               })
             }
           
             </div>
             
             </div>
}
        </>
      )}
    </div>
  );
}
