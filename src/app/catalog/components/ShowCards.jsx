"use client"
import MainCard from "@/components/mainCard";
import Pagination from "@/components/Pagination";
import useAnimeSearchFilterStore from "@/components/ZustandStores/animeSearchFiltersStore";
import React, { useEffect } from "react";

const ShowCards = () => {
  const { page, setPage, search, searchResults } = useAnimeSearchFilterStore();

  useEffect(() => {;
    search();
  }, [page]);
  return (
    <div className="py-10 w-[75%] pl-5">
      {searchResults ? (
        <div className="flex flex-col">
          <div className="px-10 grid md:grid-cols-5 grid-cols-2 gap-4">
            {searchResults.data?.map((ele, ind) => (
              <MainCard anime={ele} imageHeight={56} key={ind} />
            ))}
          </div>
          <Pagination
            currentPage={page}
            setCurrentPage={setPage}
            totalPages={searchResults.pagination.last_visible_page}
          />
        </div>
      ) : (
        <div className="bg-black text-white">...Loading</div>
      )}
    </div>
  );
};

export default ShowCards;
