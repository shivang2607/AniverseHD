import useAnimeSearchFilterStore from "@/components/ZustandStores/animeSearchFiltersStore";
import React from "react";
import GenreFilter from "./GenreFilter";
import { useRouter, useSearchParams } from "next/navigation";

const Filters = () => {
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
    demographis,
    setQuery,
  } = useAnimeSearchFilterStore();

  function handleSearch() {
    const queryParams = new URLSearchParams();

    if (page) queryParams.set("page", page.toString());
    if (limit) queryParams.set("limit", limit.toString());
    if (q) queryParams.set("q", q);
    if (type) queryParams.set("type", type);
    if (score) queryParams.set("score", score.toString());
    if (min_score) queryParams.set("min_score", min_score.toString());
    if (max_score) queryParams.set("max_score", max_score.toString());
    if (status) queryParams.set("status", status);
    if (rating) queryParams.set("rating", rating);
    if (sfw !== null) queryParams.set("sfw", sfw.toString());
    if (genres) queryParams.set("genres", genres.join(","));
    if (genres_exclude)
      queryParams.set("genres_exclude", genres_exclude.join(","));
    if (order_by) queryParams.set("order_by", order_by);
    if (sort) queryParams.set("sort", sort);
    if (letter) queryParams.set("letter", letter);
    if (producers) queryParams.set("producers", producers.join(","));
    if (start_date) queryParams.set("start_date", start_date);
    if (end_date) queryParams.set("end_date", end_date);
    if (themes) queryParams.set("themes", themes.join(","));
    if (demographis) queryParams.set("demographis", demographis.join(","));

    router.push(`?${queryParams.toString()}`);
  }

  return (
    <div className="flex flex-col md:w-[25%] w-[0%]">
      <input
        className="bg-slate-700 text-white"
        value={q}
        onChange={(e) => setQuery(e.target.value)}
      />
      <GenreFilter />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default Filters;
