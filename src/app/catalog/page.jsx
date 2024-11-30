"use client";
import React, { useEffect } from "react";
import ShowCards from "./components/ShowCards";
import Filters from "./components/Filters";
import useAnimeSearchFilterStore from "@/components/ZustandStores/animeSearchFiltersStore";
import { useRouter } from "next/router";

const Page = () => {
  const { resetFilters } = useAnimeSearchFilterStore();
  const router = useRouter();
  const { name } = router.query; // Destructure the specific parameter

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
