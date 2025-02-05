import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Autoplay, Navigation } from "swiper/modules";
import Image from "next/image";
import axios from "axios";
import Link from "next/link";
import Skeleton from "react-loading-skeleton";
import { getSessionWithExpiry, setSessionWithExpiry } from "./utils/storage";

export default function TopAiringCarousal() {
  const [topFavorite, setTopFavorite] = useState();

  useEffect(() => {
    const cachedData = getSessionWithExpiry('topAnimeData');
    if(cachedData){
      setTopFavorite(cachedData);
      return;
    }
    axios.get("/api/v1/get-top-anime").then((response) => {
      setTopFavorite(response?.data?.data);
      setSessionWithExpiry('topAnimeData', response?.data?.data, 60 * 60 * 1000 * 24); //24hrs
    });
  }, []);

  return (
    <div className="my-1 p-4  flex flex-col gap-4">
      <h1 className="text-primary-500 font-semibold text-2xl tracking-wide">
        Top Favorite
      </h1>
      <div className="cards ">
        {topFavorite ? (
          <Swiper
            className="h-full w-full  mySwiper"
            modules={[Autoplay, Navigation]}
            style={{
              "--swiper-pagination-color": "#57a6a1",
              "--swiper-navigation-color": "#57a6a1",
            }}
            slidesPerView={3}
            loop
            freeMode={true}
            spaceBetween={20}
            autoplay={{
              delay: 2500,
              autoplay: true,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            // navigation={true}
            breakpoints={{
              640: {
                slidesPerView: 4,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 4,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 5,
                spaceBetween: 40,
              },
            }}
          >
            {Array.isArray(topFavorite) &&
              topFavorite?.map((anime, id) => {
                return (
                  <SwiperSlide key={anime?.mal_id} className="">
                    <div className="md:h-[60vh] h-52 gap-1 items-baseline flex flex-col">
                      <Link
                        href={`/anime/${anime?.mal_id}`}
                        className="relative flex rounded-sm overflow-hidden transition-all duration-500 md:bg-gradient-radial hover:bg-none from-transparent object-cover to-cbg-100/45 h-full  w-full"
                      >
                        <Image
                          src={
                            anime?.images?.webp?.large_image_url ||
                            anime?.images?.webp?.image_url
                          }
                          className="-z-10 object-cover"
                          alt={anime?.title_english || "title"}
                          fill
                        />
                      </Link>

                      <div className="title  flex items-baseline gap-1 md:gap-2">
                        <div className="font-bold text-xl text-primary-400 flex">
                          {id + 1}.
                        </div>
                        <div className="line-clamp-1 text-[whitesmoke]">
                          {anime?.title_english || anime?.title}
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
          </Swiper>
        ) : (
          <>
            {/* //?   below code is for PC screen */}
            <div className=" md:flex hidden rounded-sm overflow-hidden mx-auto md:h-[60vh] h-52 justify-between items-baseline  flex-row w-full">
              {[...Array(5)].map((i, ind) => {
                return (
                  <div className="h-full w-[18%] flex" key={ind}>
                    <Skeleton
                      className="flex"
                      containerClassName="flex-1 flex h-full"
                    />
                  </div>
                );
              })}
            </div>

            <div className=" flex md:hidden rounded-sm overflow-hidden mx-auto  h-52 justify-between items-baseline  flex-row w-full">
              {[...Array(3)].map((i, k) => {
                return (
                  <div className="h-full w-[30%] flex" key={k}>
                    <Skeleton
                      className="flex"
                      containerClassName="flex-1 flex h-full"
                    />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
