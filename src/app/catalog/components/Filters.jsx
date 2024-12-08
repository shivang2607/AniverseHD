import useAnimeSearchFilterStore from "@/components/ZustandStores/animeSearchFiltersStore";
import React, { useState } from "react";
import GenreFilter from "./GenreFilter";
import { useRouter, useSearchParams } from "next/navigation";
import ThemeFilter from "./ThemeFilter";
import DemographicsFilter from "./DemographicsFilter";
import ScoreRange from "./ScoreRange";
import RatingFilter from "./RatingFilter";
import YearRange from "./YearRange";
import StatusFilter from "./StatusFilter";
import TypeFilter from "./TypeFilter";
import { Query } from "firebase/firestore";
import QuerySearch from "./QuerySearch";
import { IoIosSearch } from "react-icons/io";

const Filters = ({open}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    page,
    limit,
    q,
    type,
    score,
    min_score,
    max_score,
    status,
    rating,
    sfw,
    genres,
    genres_exclude,
    order_by,
    sort,
    letter,
    producers,
    start_date,
    end_date,
    themes,
    demographics,
  } = useAnimeSearchFilterStore();
  const [currOpened, setCurrOpened] = useState(null);

  function handleSearch() {
    
    const queryParams = new URLSearchParams();

    if (page) queryParams.set("page", page.toString());
    if (limit) queryParams.set("limit", limit.toString());
    if (q) queryParams.set("q", q);
    if (type) queryParams.set("type", type);
    if (score) queryParams.set("score", score.toString());
    if (min_score != null) queryParams.set("min_score", min_score.toString());
    if (max_score != null) queryParams.set("max_score", max_score.toString());
    if (status) queryParams.set("status", status);
    if (rating) queryParams.set("rated", rating);
    if (sfw !== null) queryParams.set("sfw", sfw.toString());
    if (genres && genres.length) queryParams.set("genres", genres.join(","));
    if (genres_exclude)
      queryParams.set("genres_exclude", genres_exclude.join(","));
    if (order_by) queryParams.set("order_by", order_by);
    if (sort) queryParams.set("sort", sort);
    if (letter) queryParams.set("letter", letter);
    if (producers) queryParams.set("producers", producers.join(","));
    if (start_date) queryParams.set("start_date", start_date);
    if (end_date) queryParams.set("end_date", end_date);
    if (themes && themes.length) queryParams.set("themes", themes.join(","));
    if (demographics && demographics.length)
      queryParams.set("demographics", demographics.join(","));

    router.push(`?${queryParams.toString()}`);
    open && open(false)
  }

  return (
    <div className="flex flex-col my-10 h-fit w-full gap-y-3 bg-opacity-50 backdrop-blur-lg bg-slate-500/25 rounded-md p-4 z-10 text-sm">
      <h1 className="text-2xl text-primary-100 font-bold font-sans">Filters</h1>
      <QuerySearch handleSearch={handleSearch}/>
      <GenreFilter currOpened={currOpened} setCurrOpened={setCurrOpened} />
      <DemographicsFilter
        currOpened={currOpened}
        setCurrOpened={setCurrOpened}
      />
      <ThemeFilter currOpened={currOpened} setCurrOpened={setCurrOpened} />
      <ScoreRange />
      <YearRange />
      <RatingFilter />
      <StatusFilter />
      <TypeFilter />
      <button
        onClick={handleSearch}
        className="bg-primary-100 w-[70%] self-center mt-5 py-2 rounded-md"
      >
        Search
      </button>
    </div>
  );
};

export default Filters;
