"use client";
import MainCard from "@/components/mainCard";
import RecommendationSearchComponent from "@/components/recommendationPanel/SearchComponentRecommendation";
import SharinganLoader from "@/components/sharinganLoader";
import useRecommendationStore from "@/components/utils/store";
import Image from "next/image";
import React from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { GiStarSwirl } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";
import { RxReset } from "react-icons/rx";
import { Hourglass } from "react-loader-spinner";
import { MdFilterList, MdFilterListOff } from "react-icons/md";
import { TypeAnimation } from "react-type-animation";

export default function Recommendation() {


  const {loading, isFilterOpen, toggleFilterOpen, setLoading, page, setPage, selectedAnimeList, setSelectedAnimeList, recommendations, description, setDescription, reset, getRecommendations} = useRecommendationStore(state=>state);

  const totalPages = Math.ceil(recommendations?.length / 20);

  

  const handleReset = () => {
    setLoading(false);
    reset();
    
  };

  function handleAnimeSelect(anime) {
    if (selectedAnimeList.length >= 4) {
      toast.error("You can only Select 4 Animes");
      return;
    }
    if (selectedAnimeList.some(selectedAnime => selectedAnime.id === anime.id)) {
        toast.error("Anime already added");
        return;
      }
    
    setSelectedAnimeList([...selectedAnimeList, anime]);
  }

  const handleRemoveAnime = (anime) => {
    setSelectedAnimeList(selectedAnimeList.filter((obj) => obj.id !== anime.id));
  };

  return (
    <div className="md:w-[73%] w-[100vw] flex flex-col gap-4 py-4 mx-4">
      
      <div className={`fixed h-screen w-screen top-0 z-20 backdrop-blur-sm ${isFilterOpen?"visible":"hidden"}`}></div>


      <div className="heading flex flex-col gap-2 md:p-4  rounded-lg shadow-lg">
        <h1 className="text-2xl text-primary-500 font-bold tracking-wide">
          Discover Your Next Favorite Anime!
        </h1>
        <span className="content  text-fuchsia-200 text-sm italic">
          Describe what you're in the mood for or select a few of your favorite
          shows. Our system will find anime that matches your tastes. Whether
          you're into action, heartwarming tales, or something unique, we've got
          you covered! Mixing different genres might lead to unexpected, but
          exciting, results. Dive in and explore! 🎉
        </span>
      </div>

      <div className="input-box flex md:flex-row flex-col justify-between w-full h-fit">
        <div className="inputfields md:w-[65%] w-full p-2">
          <div className="search flex w-full h-10 gap-4">
            <RecommendationSearchComponent onAnimeSelect={handleAnimeSelect} />
          </div>
          <div className="textarea flex flex-col gap-2 my-6">
          <textarea
            maxLength={300}
            rows={4}
            value={description || ""}
            placeholder="Enter Description, eg: Anime with demons and monster set in old era with sword fights."
            className=" block w-full p-2  outline-none rounded-md shadow-sm scrollbar-thin text-gray-800"
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
          <span className="remaininglength flex ml-auto text-xs text-gray-400 relative ">
          {300 - description?.length || 0}/300
          </span>
        </div>
        
        <div className="button-sets flex justify-end gap-2">
        <button
          className="rounded-md font-semibold  text-primary-300 hover:text-primary-400  p-1 px-2 flex items-center gap-1"
          onClick={handleReset}
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



      {/* //! below  content is for cards beside the input fields */}
      <div className="grid md:grid-cols-2 w-full md:m-0 md:my-8 my-4 grid-cols-4 md:w-[30%] gap-4">
        {selectedAnimeList?.map(anime=>{
            return(
                <div key={anime.id} className="selected-card  h-fit flex flex-row-reverse gap-2 rounded-md">
                <button className='absolute z-10 rounded-full border-[1px] border-cbg-100 translate-x-1 -translate-y-1 bg-primary-600 p-1' onClick={()=>handleRemoveAnime(anime)}><IoMdClose className='text-cbg-100'/></button>
                <div className="image relative md:w-32 rounded-md md:h-40 h-32 w-24 object-cover overflow-hidden">
                    <Image fill  src={anime?.payload?.images?.webp?.image_url || anime?.payload?.main_picture} alt={anime?.payload?.title_english}/>
                </div>
                
            </div>
            )
        })}
      </div>

      </div>


      {/* //!below div are for recommendation results  */}
      {loading ?
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
            </div> : 

    <div className="flex flex-col gap-8">


      

      {/* //!main cards mapping  */}
      <span className={` relative opacity-90 z-30  text-[2.8rem] right-2 justify-center items-center self-end  mr-3 md:hidden flex `}>
          
          <button
            className="relative inline-flex  rounded-full  "
            onClick={toggleFilterOpen}
          >
            {isFilterOpen ? <MdFilterListOff className=" text-primary-500" /> : <MdFilterList className=" text-primary-500" />}
          </button>
        </span>


      <div className="results grid grid-cols-2 md:grid-cols-4 gap-4 md:mt-12">
        {recommendations?.slice((page-1)*20, page*20)?.map(anime=>{
          return <MainCard anime={({...(anime.payload), mal_id: anime.id})} key={anime.id}/>
        })}
      </div>

      {recommendations?.length > 0 ?  <div className="pagination gap-4 flex w-full justify-center">
      <button disabled={page==1} className="px-2 py-1 mx-5 text-primary-100 text-xl rounded disabled:text-gray-500" onClick={()=>setPage(page-1)}>
                <FaChevronLeft/>
        </button>
        {[...Array(totalPages)].map((pg, key)=>{
          return (
            <button key={key} className={`px-2   font-bold rounded-md ${key+1==page?"text-primary-100":"text-gray-500"}`} onClick={()=>setPage(key+1)}>{key+1}</button>
          )
        })}
        <button disabled={page==totalPages} className="px-2 py-1 mx-5 text-primary-100 text-xl rounded disabled:text-gray-500" onClick={()=>setPage(page+1)}>
                <FaChevronRight/>
        </button>
      </div>
      :
      recommendations!==null && 
      <>

      <div className="flex flex-col gap-2 self-center items-center justify-center">
          <img src={`rnf-${Math.floor(Math.random() * 4) + 1}.png`} className="w-1/3 mx-auto" alt="No results found"/>
          <h1 className="text-3xl text-sky-500 font-semibold tracking-wide">No Results Found :/</h1>
      </div>
      </>}
    </div>
    
      }
    </div>
  );
}
