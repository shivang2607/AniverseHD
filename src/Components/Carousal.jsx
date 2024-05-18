'use client'
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Autoplay,  Navigation, Pagination } from 'swiper/modules';

const ResponsiveCarousal = () => {

  return (
    <div className="w-full h-64 md:h-96 lg:h-[85vh]">
      <Swiper
      className='h-full mySwiper'
      style={{
        "--swiper-pagination-color": '#57a6a1',
        "--swiper-navigation-color": "#57a6a1",
      }}
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={30}
        slidesPerView={1}
        loop
        navigation={true}
        pagination={{ clickable: true }}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        }}
        
      >
        <SwiperSlide>
          <div className="bg-blue-500 h-full flex items-center justify-center text-white text-2xl">
            Slide 1
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="bg-red-500 h-full flex items-center justify-center text-white text-2xl">
            Slide 2
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="bg-green-500 h-full flex items-center justify-center text-white text-2xl">
            Slide 3
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="bg-yellow-500 h-full flex items-center justify-center text-white text-2xl">
            Slide 4
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

export default ResponsiveCarousal;
