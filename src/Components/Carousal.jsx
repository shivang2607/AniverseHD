"use client";
import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import axios from "axios";
import Image from "next/image";

const ResponsiveCarousal = () => {
  const [topAiring, setTopAiring] = useState();

  useEffect(() => {
    
    axios.get("/api/v1/get-top-anime").then((response) => {
      setTopAiring(response?.data);
      console.log(response?.data);
    });

    return () => {};
  }, []);

  return (
    <div className="w-full h-64 md:h-96 lg:h-[85vh]">
      {topAiring && <Swiper
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
        {topAiring?.map((anime) => {
          return (
            <SwiperSlide key={anime?.mal_id}>
              <div
                // style={{'--image-url': `url(${anime?.trailer?.images?.maximum_image_url})`}}
                className="bg-blue-500 h-full bg-[image:var(--image-url)] flex items-center justify-center text-white text-2xl bg-cover bg-no-repeat bg-center aspect-auto"
                style={{
                  backgroundImage: `url(${anime?.trailer?.images?.image_url || anime?.images?.webp?.small_image_url})`,
                }}
              >
                <div className="w-full flex justify-center items-center h-full backdrop-blur-md bg-black bg-opacity-50 ">
                Slide 1
                <div className="  flex w-1/5 h-2/3 drop-shadow-2xl  ">
                <div className="relative image flex-1  bg-gradient-radial  from-transparent to-cbg-100/20  ">
                <Image  src={anime.images.webp.image_url} fill className="shadow-lg  -z-10 " alt=""/>
                </div>
                </div>

                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>}
    </div>
  );
};

export default ResponsiveCarousal;
