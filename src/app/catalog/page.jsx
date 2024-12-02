"use client";
import React, { useEffect } from "react";
import ShowCards from "./components/ShowCards";
import Filters from "./components/Filters";
import useAnimeSearchFilterStore from "@/components/ZustandStores/animeSearchFiltersStore";
import { useSearchParams } from 'next/navigation'



const Page = () => {
  const { resetFilters,page,setAllFilters,search } = useAnimeSearchFilterStore();
  const searchParams=useSearchParams();
  const genres=searchParams.get('genres')?.split(',');
  const themes=searchParams.get('themes')?.split(',');
  const demographics=searchParams.get('demographics')?.split(',');
  const start_date= searchParams.get('start_date');
  const end_date=searchParams.get('end_date');
  const min_score= searchParams.get('min_score');
  const max_score=searchParams.get('max_score');
  const status=searchParams.get('status');
  const query= searchParams.get('q');
  const type=searchParams.get('type');
  const rated = searchParams.get('rated');
  const pageQ = searchParams.get('page');
  const limitQ=searchParams.get('limit');
  const orderBy=searchParams.get('orderBy');


  useEffect(() => {
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
      page:Number(pageQ),
      limit:Number(limitQ)
    };
    console.log(filters,pageQ);

    setAllFilters(filters)
    search();
    return () => {
      console.log("reseting");
      resetFilters();
    };
  }, [searchParams]);

  return (
    <div className="pt-20 sm:px-10 px-3 flex md:flex-row flex-col">
      <Filters />
      <ShowCards />
    </div>
  );
};

export default Page;
