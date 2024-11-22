import useAnimeSearchFilterStore from "@/components/ZustandStores/animeSearchFiltersStore";
import React from "react";

const Filters = () => {
  const { setQuery, setPage, page, search } = useAnimeSearchFilterStore();
  function handleSearch() {
    if (page == 1) {
      search();
    } else setPage(1);
  }
  return (
    <div className="flex flex-col w-[25%]">
      <input
        className="bg-slate-700 text-white"
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default Filters;
