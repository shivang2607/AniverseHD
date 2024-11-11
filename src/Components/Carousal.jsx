"use client";
import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { FaPlayCircle, FaChevronRight } from "react-icons/fa";
import { FaClock, FaCakeCandles } from "react-icons/fa6";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

const ResponsiveCarousal = () => {
  const [topFavorite, setTopFavorite] = useState();

  useEffect(() => {
    // Check if data exists in session storage
    const sessionData = sessionStorage.getItem("topAnimeData");
    if (sessionData) {
      setTopFavorite(JSON.parse(sessionData));
      return;
    } 
      axios.get("/api/v1/get-top-anime")
        .then((response) => {
          const data = response?.data?.data;
          //! IMPLEMENT TRY CATCH HERE FOR ERRORS IN SESSION STORAGE PARSING
          setTopFavorite(data);
          sessionStorage.setItem("topAnimeData", JSON.stringify(data));
        })
        .catch((error) => {
          console.error("Error fetching top anime:", error);
        });
    
  }, []);

  function formatDate(dateString) {
    const date = new Date(dateString);
  
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
  
    return `${month} ${day}, ${year}`;
  }

  return (
    <div className="w-full h-80 md:h-96 lg:h-[87vh]">
      {topFavorite ? <Swiper
        className="h-full mySwiper"
        modules={[Autoplay, Pagination, Navigation]}
        style={{
          "--swiper-pagination-color": "#57a6a1",
          "--swiper-navigation-color": "#57a6a1",
        }}
        observer={true}
        observeParents={true}
        spaceBetween={30}
        slidesPerView={1}
        centeredSlides={true}
        
        loop
        pagination={{ clickable: true }}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        navigation={true}
      >
        {topFavorite?.map((anime, index) => {
          return (
            <SwiperSlide key={anime?.mal_id}>
              <div
                // style={{'--image-url': `url(${anime?.trailer?.images?.maximum_image_url})`}}
                className=" h-full  flex items-center justify-center text-white text-2xl bg-cover bg-no-repeat bg-center "
                style={{
                  backgroundImage: `url(${anime?.trailer?.images?.image_url || anime?.images?.webp?.image_url})`,
                }}
              >
                <div className="w-full flex justify-between items-baseline h-full backdrop-blur-sm bg-black bg-opacity-30 md:gap-12 gap-4 bg-gradient-to-r from-black to-transparent    md:px-28 px-4">
                
                <div className=" content flex flex-col   mt-auto md:m-auto mb-12 text-base gap-4 md:gap-6 w-2/3">
                  <div className="numbering text-primary-500 underline text-sm  tracking-wider md:text-base">#{index+1} Favorite</div>

                  <div className="title md:text-3xl text-lg font-bold md:w-[70%]  line-clamp-2  overflow-ellipsis  leading-relaxed text-white">{anime?.title_english || anime?.title}
                  </div>

                  <div className="meta-description md:flex gap-4 md:text-base hidden ">
                    <div className="gap-1 text-base flex justify-between items-center">
                      <FaPlayCircle/> {anime?.type}
                    </div>
                    <div className="duration gap-1 text-base flex justify-between items-center">
                      <FaClock/> {anime?.duration?.replace(' per ep', '') || 'NA'}
                    </div>
                    <div className="duration gap-1 text-base flex justify-between items-center">
                      <FaCakeCandles/> {formatDate(anime?.aired?.from?.split('T')[0]) || 'NA'}
                    </div>
                    <div className="ratings gap-1   rounded-md bg-primary-100  text-sm px-2  flex justify-between items-center">
                       {anime?.rating?.split(" ")[0] || 'NA'}
                    </div>
                  </div>

                  <div className="description hidden md:inline-flex w-4/5  text-base"><span className="overflow-ellipsis line-clamp-2">{anime?.synopsis}</span></div>
                  

                  <div className="reroute flex md:gap-6 gap-3 items-center mt-5">
                    <Link href={`/watch/${anime?.mal_id}?provider=zoro`} className="rounded-lg p-2 text-nowrap  md:text-base text-sm gap-1 bg-primary-600 md:gap-2 items-center flex text-cbg-100 "><FaPlayCircle/>Watch Now</Link>
                    <Link href={`/anime/${anime?.mal_id}`} className="rounded-lg  p-2 md:text-base text-sm  md:gap-2 items-center flex text-primary-600 bg-cbg-300 tracking-wide">Details <FaChevronRight/></Link>
                  </div>
                
                
                  </div>
                
                
                <div className="relative mt-auto mb-8 md:mb-12 image flex w-1/2 h-2/3 md:w-1/4 md:h-[72%]  bg-gradient-radial  from-transparent overflow-hidden rounded-sm to-cbg-100/65   ">
                <Image  src={anime?.images?.webp?.large_image_url || anime?.images?.webp?.large_image_url} fill className="shadow-lg  -z-10  " alt={anime?.title_english} />
                </div>
                

                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>:
      <div className="flex h-full w-full items-center justify-center">
        
      <div className="flex h-full w-full md:p-4 p-3 justify-center items-center">
      <Skeleton className=" flex" containerClassName="flex-1 h-[95%]  flex"/>
      </div>
      </div>
        }
    </div>
  );
};

export default ResponsiveCarousal;
