"use client";
import React, { useEffect, useState } from "react";
import ShowCards from "./components/ShowCards";
import Filters from "./components/Filters";
import useAnimeSearchFilterStore from "@/ZustandStores/animeSearchFiltersStore";
import { useSearchParams } from "next/navigation";

const Page = () => {
  const { resetFilters, setAllFilters, search } = useAnimeSearchFilterStore();
  const searchParams = useSearchParams();
  const [isFiltersVisible, setIsFiltersVisible] = useState(false); // State to toggle filter visibility

  useEffect(() => {
    if (!searchParams) return;

    const genres = searchParams.get("genres")?.split(",");
    const themes = searchParams.get("themes")?.split(",");
    const demographics = searchParams.get("demographics")?.split(",");
    const start_date = searchParams.get("start_date");
    const end_date = searchParams.get("end_date");
    const min_score = searchParams.get("min_score");
    const max_score = searchParams.get("max_score");
    const status = searchParams.get("status");
    const query = searchParams.get("q");
    const type = searchParams.get("type");
    const rated = searchParams.get("rated");
    const pageQ = searchParams.get("page");
    let limitQ = searchParams.get("limit");
    const orderBy = searchParams.get("orderBy");

    if (limitQ && Number(limitQ) > 25) limitQ = "25";

    const filters = {
      q: query,
      type,
      min_score,
      max_score,
      status,
      rating: rated,
      genres,
      genres_exclude: null,
      order_by: orderBy,
      sort: null,
      letter: null,
      producers: null,
      start_date,
      end_date,
      themes,
      demographics,
      page: Number(pageQ),
      limit: Number(limitQ),
    };

    setAllFilters(filters);
    search();

    return () => {
      resetFilters();
    };
  }, [searchParams]);

  return (
    <div className={`pt-20 xl:px-10 lg:px-7 md:px-5 ${!isFiltersVisible?"sm:px-10 px-3":""} flex md:flex-row flex-col lg:gap-x-10 md:gap-x-5 relative`}>
      {/* Filters in desktop view */}
      <div className="md:flex hidden lg:w-[25%] md:w-[33%]">
        <Filters />
      </div>

      {/* ShowCards section */}
      <div className="lg:w-[75%] md:w-[67%] w-[100%]">
        <ShowCards />
      </div>

      {/* Mobile filter button */}
      <button
        className="fixed z-50 bottom-5 right-5 bg-primary-100 text-white p-3 rounded-full shadow-lg md:hidden"
        onClick={() => setIsFiltersVisible(!isFiltersVisible)}
      >
        Filters
      </button>

      {/* Mobile filter modal */}
    
        <div className={`md:hidden absolute bg-opacity-50 flex justify-center items-center z-40 ${isFiltersVisible? "translate-x-0  bg-opacity-50 backdrop-blur-lg bg-slate-500/25":"-translate-x-full"} w-full  transition-all ease-in duration-300 h-full `}>
          <div className="h-fit min-w-80 sticky bottom-0">
            <Filters open={setIsFiltersVisible} />
            </div>
        </div>
    
    </div>
  );
};

export default Page;
