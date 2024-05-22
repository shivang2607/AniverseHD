import React, { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Autoplay, Navigation } from 'swiper/modules';
import Image from 'next/image';
import axios from 'axios';
import Link from 'next/link';

export default function TopAiringCarousal() {

    const [topAiring, setTopAiring] = useState();

    useEffect(()=>{
        axios.get('/api/v1/get-top-anime?filter=airing').then(response=>{
            setTopAiring(response?.data);
        })
    }, [])

  return (
    <div className='my-6 p-4  flex flex-col gap-4'>
        <h1 className='text-primary-500 font-semibold text-2xl tracking-wide'>Top Airing</h1>
        <div className="cards ">
        {topAiring && <Swiper
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
            autoplay:true,
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
       { topAiring?.map((anime, id)=>{
            return <SwiperSlide key={anime?.mal_id} className=''>
            <div className='md:h-[60vh] h-52 gap-1 items-baseline flex flex-col'>
                <Link href="#"  className="relative flex rounded-sm overflow-hidden transition-all duration-500 md:bg-gradient-radial hover:bg-none from-transparent to-cbg-100/45 h-full  w-full">
                    <Image src={anime?.images?.webp?.large_image_url || anime?.images?.webp?.image_url} className='-z-10' alt={anime?.title_english || "title"} fill/>
                </Link>

                <div className="title  flex items-baseline gap-1 md:gap-2">
                    <div className='font-bold text-xl text-primary-400 flex'>
                        {id+1}.
                    </div>
                    <div className='line-clamp-1 text-[whitesmoke]'>{anime?.title_english || anime?.title}</div>
                </div>
            </div>
          </SwiperSlide>
       })} 
      
      
      </Swiper>}
        </div>
    </div>
  )
}
