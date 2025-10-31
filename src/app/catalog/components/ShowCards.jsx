"use client";
import MainCard from "@/components/mainCard";
import Pagination from "@/components/Pagination";
import useAnimeSearchFilterStore from "@/components/ZustandStores/animeSearchFiltersStore";
import { useRouter, useSearchParams } from "next/navigation";

import React, { useEffect } from "react";

const ShowCards = () => {
  const { page, search, searchResults } = useAnimeSearchFilterStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const updatePage = (page) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", `${page}`);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="md:pt-10 pt-3 pb-10 w-full">
      {searchResults && searchResults.data ? (
        searchResults.data.length > 0 ? (
          <div className="flex flex-col">
            <div className="grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-4">
            {searchResults.data?.map((ele, ind) => {
            const imageHeight = window.innerWidth < 568 ? 44 : 56; // 36px for mobile, 56px for larger screens
            return (
              <MainCard
                anime={ele}
                imageHeight={imageHeight}
                key={ind}
              />
            );
          })}
            </div>
            <Pagination
              currentPage={page}
              setCurrentPage={updatePage}
              totalPages={searchResults.pagination.last_visible_page}
            />
          </div>
        ) : (
          <div className="h-screen"> No Data!!</div>
        )
      ) : (
        <div className="md:px-10 px-0 grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-4">
          {Array.from({ length: 25 }).map((_, index) => (
            <div
              key={index}
              className="bg-gray-600 rounded-md animate-pulse md:h-56 h-44"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ShowCards;
