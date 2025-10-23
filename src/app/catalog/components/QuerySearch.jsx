import useAnimeSearchFilterStore from "@/ZustandStores/animeSearchFiltersStore";
import React from "react";
import { IoIosSearch } from "react-icons/io";

const QuerySearch = ({ handleSearch }) => {
  const { q, setQuery } = useAnimeSearchFilterStore();
  return (
    <div className="w-full flex flex-row items-center justify-center gap-x-2">
      <input
        className="bg-slate-800 text-white rounded-md w-full p-2 border-[0.5px] border-slate-700"
        value={q || ""}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch();
          }
        }}
      />
      <IoIosSearch
        size={34}
        onClick={handleSearch}
        className="cursor-pointer bg-primary-100 rounded-md leading-none px-1"
      />
    </div>
  );
};

export default QuerySearch;
