"use client"
import MainCard from "@/components/mainCard";
import Pagination from "@/components/Pagination";
import useAnimeSearchFilterStore from "@/components/ZustandStores/animeSearchFiltersStore";
import React from "react";

const Page = () => {
    const {setQuery,search,searchResults}=useAnimeSearchFilterStore();

  return <div className="pt-96">
    <input onChange={(e)=>setQuery(e.target.value)}/>
    <button onClick={search}>Search</button>
    <div className="px-10 grid md:grid-cols-5 grid-cols-2 gap-4">
    {searchResults && searchResults.map((ele,ind)=>(
        <MainCard anime={ele} key={ind}/>
    ))}
    </div>
  </div>;
};

export default Page;
