"use client";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import { MdSportsScore } from "react-icons/md";
import { PiVideoFill } from "react-icons/pi";
import { PiDotOutlineFill } from "react-icons/pi";
import Skeleton from "react-loading-skeleton";
import { getSessionWithExpiry, setSessionWithExpiry } from "./utils/storage";

const TopAnimeSection = ({ title, data, category }) => (
  <div className="top-anime-section flex w-full md:w-1/4 flex-col gap-3">
    <h2 className="text-primary-500 text-lg font-semibold tracking-wide">
      {title}
    </h2>
    <div className="flex flex-col gap-2">
      {data ? (
        <>
          {data.map((anime, key) => (
            <div
              key={key}
              className="flex gap-6 py-3 px-2 border-b-[1px] border-cbg-300"
            >
              <Link href={`/anime/${anime?.mal_id}`}>
                <div className="image relative -z-10 w-14 flex-shrink-0 h-20">
                  <Image
                    fill
                    src={
                      anime?.images?.webp?.image_url ||
                      anime?.images?.webp?.small_image_url
                    }
                    className="object-cover rounded-lg"
                    alt="image"
                  />
                </div>
              </Link>
              <div className="content flex flex-col h-full gap-2 py-1 ">
                <Link
                  href={`/anime/${anime?.mal_id}`}
                  className="name hover:text-primary-600 text-sm font-bold w-3/4 tracking-wide line-clamp-2"
                >
                  {anime?.title_english || anime?.title}
                </Link>
                <div className="secondline text-xs flex items-center gap-2">
                  <div className="metadata rounded-sm gap-1 overflow-hidden items-center font-semibold flex">
                    <div className="score px-1 py-[0.18rem] flex gap-1 items-center bg-sky-600 text-gray-200">
                      <MdSportsScore size={16} />
                      {anime?.score?.toFixed(2) || "NA"}
                    </div>
                    <div className="episodes px-1 py-[0.18rem] flex gap-1 items-center bg-primary-400 text-black">
                      <PiVideoFill size={15} />
                      {anime.episodes ? `${anime?.episodes} ep` : "NA"}
                    </div>
                  </div>
                  <div className="type text-sm flex items-center text-gray-400">
                    <PiDotOutlineFill size={18} />
                    {anime?.type || "NA"}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <Link
            href={`/top/${category}`}
            className="hover:text-primary-300 w-fit flex items-center gap-1 my-2"
          >
            View More <FaChevronRight />
          </Link>
        </>
      ) : (
        <Skeleton
          className="flex md:w-full md:h-[90vh] w-[50vw] h-[30vh]"
          count={1}
          containerClassName="flex flex-col"
        />
      )}
    </div>
  </div>
);

export default function AllTop() {
  const [airing, setAiring] = useState();
  const [popular, setPopular] = useState();
  const [favorite, setFavorite] = useState();
  const [upcoming, setUpcoming] = useState();


  const fetchData = async (filter, stateSetter, retryCount = 3) => {
    try {
      const cachedData = getSessionWithExpiry(`top_${filter}`);
      if (cachedData) {
        stateSetter(cachedData.slice(0, 5));
        return;
      }
      const response = await axios.get(`/api/v1/get-top-anime?filter=${filter}`);
      if (Array.isArray(response?.data?.data) && response.data?.data?.length > 0) {
        stateSetter(response.data.data.slice(0, 5));
        setSessionWithExpiry(`top_${filter}`, response.data.data, 60 * 60 * 1000 * 24) //24 hrs
        return;
      } else if (retryCount > 0) {
        fetchData(filter, stateSetter, retryCount - 1);
      } else {
        stateSetter([]);
      }
    } catch (error) {
      console.error(`Error fetching ${filter} data:`, error);
      if (retryCount > 0) {
        fetchData(filter, stateSetter, retryCount - 1);
      } else {
        stateSetter([]);
      }
    }
  };
  
  useEffect(() => {
    fetchData("airing", setAiring);
    fetchData("bypopularity", setPopular);
    fetchData("favorite", setFavorite);
    fetchData("upcoming", setUpcoming);
  }, []);
  

  return (
    <div className="my-14 p-4 w-full flex flex-col md:flex-row gap-6">
      <TopAnimeSection title="Top Airing" data={airing} category={"airing"}/>
      <TopAnimeSection title="Top Popular" data={popular} category={"bypopularity"}/>
      <TopAnimeSection title="Top Favorite" data={favorite} category={"favorite"}/>
      <TopAnimeSection title="Top Upcoming" data={upcoming} category={"upcoming"} />
    </div>
  );
}
