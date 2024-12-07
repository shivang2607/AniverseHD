import useAnimeSearchFilterStore from "@/components/ZustandStores/animeSearchFiltersStore";
import React from "react";

const QuerySearch = () => {
  const { q, setQuery } = useAnimeSearchFilterStore();
  return (
    <div className="w-full">
      <input
        className="bg-slate-800 text-white rounded-md w-full p-2 border-[0.5px] border-slate-700"
        value={q || ""}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search"
      />
    </div>
  );
};

export default QuerySearch;
