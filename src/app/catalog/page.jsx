"use client";
import React, { useEffect } from "react";
import ShowCards from "./components/ShowCards";
import Filters from "./components/Filters";
import useAnimeSearchFilterStore from "@/components/ZustandStores/animeSearchFiltersStore";

const Page = () => {
  const { resetFilters } = useAnimeSearchFilterStore();

  useEffect(() => {
    return () => {
      resetFilters();
    };
  }, []);

  return (
    <div className="pt-20 px-10 flex flex-row">
      <Filters />
      <ShowCards />
    </div>
  );
};

export default Page;
