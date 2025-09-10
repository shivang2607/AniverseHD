// import redisClient from "@/lib/redis";
import { LRUCache } from "lru-cache";
import toast from "react-hot-toast";
import { create } from "zustand";
// import { Redis } from "@upstash/redis";
// import { REDIS_UPSTASH_URL } from "@/utils/constants";
const options = {
  max: 100,
  ttl: 1000 * 60 * 60 * 24,
};
// const redis = new Redis({
//   url: REDIS_UPSTASH_URL,
//   token: process.env.NEXT_PUBLIC_REDIS_UPSTASH_TOKEN,
// });
const cache = new LRUCache(options);
const useAnimeSearchFilterStore = create((set, get) => ({
  searchResults: null,
  page: 1,
  limit: 25,
  q: null,
  type: null,
  score: null,
  min_score: null,
  max_score: null,
  status: null,
  rating: null,
  sfw: null,
  genres: null,
  genres_exclude: null,
  order_by: null,
  sort: null,
  letter: null,
  producers: null,
  start_date: null,
  end_date: null,
  themes: null,
  demographis: null,

  // Set functions
  setSearchResults: (results) => set({ searchResults: results }),
  setPage: (page) => set({ page }),
  setLimit: (limit) => set({ limit }),
  setQuery: (q) => set({ q }),
  setType: (type) => set({ type }),
  setScore: (score) => set({ score }),
  setMinScore: (min_score) => set({ min_score }),
  setMaxScore: (max_score) => set({ max_score }),
  setStatus: (status) => set({ status }),
  setRating: (rating) => set({ rating }),
  setSfw: (sfw) => set({ sfw }),
  setGenres: (genres) => set({ genres }),
  setGenresExclude: (genres_exclude) => set({ genres_exclude }),
  setOrderBy: (order_by) => set({ order_by }),
  setSort: (sort) => set({ sort }),
  setLetter: (letter) => set({ letter }),
  setProducers: (producers) => set({ producers }),
  setStartDate: (start_date) => set({ start_date }),
  setEndDate: (end_date) => set({ end_date }),
  setThemes: (themes) => set({ themes }),
  setDemographics: (demographics) => set({ demographics }),
  setAllFilters: (filters) => {
    set((state) => {
      return {
        q: filters.q,
        type: filters.type,
        min_score: filters.min_score,
        max_score: filters.max_score,
        status: filters.status,
        rating: filters.rating,
        genres: filters.genres,
        genres_exclude: filters.genres_exclude,
        order_by: filters.order_by,
        sort: filters.sort,
        letter: filters.letter,
        producers: filters.producers,
        start_date: filters.start_date,
        end_date: filters.end_date,
        themes: filters.themes,
        demographics: filters.demographics,
        page:
          typeof filters.page === "number" &&
          filters.page > 0 &&
          filters.page !== state.page
            ? filters.page
            : state.page,
        limit:
          typeof filters.limit === "number" &&
          filters.limit > 0 &&
          filters.limit !== state.limit
            ? filters.limit
            : state.limit,
      };
    });
  },

  toggleGenre: (genreId) => {
    const { genres } = get();
    if (genres == null) {
      set({ genres: [genreId] });
      return;
    }

    if (genres.includes(genreId)) {
      const updatedGenres = genres.filter((e) => e !== genreId);
      set({ genres: updatedGenres });
    } else {
      set({ genres: [...genres, genreId] });
    }
  },

  toggleTheme: (themeId) => {
    const { themes } = get();
    if (themes == null) {
      set({ themes: [themeId] });
      return;
    }

    if (themes.some((e) => e == themeId)) {
      const updatedThemes = themes.filter((e) => e !== themeId);

      set({ themes: updatedThemes.length ? updatedThemes : [] });
    } else {
      set({ themes: themes.concat([themeId]) });
    }
  },

  toggleDemographic: (demographicId) => {
    const { demographics } = get();
    if (demographics == null) {
      set({ demographics: [demographicId] });
      return;
    }

    if (demographics.some((e) => e == demographicId)) {
      set({ demographics: demographics.filter((e) => e !== demographicId) });

      const updatedDemographics = demographics.filter(
        (e) => e !== demographicId
      );

      set({
        demographics: updatedDemographics.length ? updatedDemographics : [],
      });
    } else {
      set({ demographics: demographics.concat([demographicId]) });
    }
  },

  search: async () => {
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
    } = get();

    let themes_plus_genres_demographics = [];

    if (genres)
      themes_plus_genres_demographics =
        themes_plus_genres_demographics.concat(genres);
    if (themes)
      themes_plus_genres_demographics =
        themes_plus_genres_demographics.concat(themes);
    if (demographics)
      themes_plus_genres_demographics =
        themes_plus_genres_demographics.concat(demographics);

    // Build query parameters
    const params = new URLSearchParams();

    if (q !== null) params.append("q", q);
    if (type !== null) params.append("type", type);
    if (score !== null) params.append("score", score);
    if (min_score !== null) params.append("min_score", min_score);
    if (max_score !== null) params.append("max_score", max_score);
    if (status !== null) params.append("status", status);
    if (rating !== null) params.append("rating", rating);
    if (sfw !== null) params.append("sfw", sfw);
    if (
      themes_plus_genres_demographics !== null &&
      themes_plus_genres_demographics.length > 0
    )
      params.append("genres", themes_plus_genres_demographics);
    if (genres_exclude !== null && genres_exclude.length > 0)
      params.append("genres_exclude", genres_exclude);
    if (order_by !== null) params.append("order_by", order_by);
    if (sort !== null) params.append("sort", sort);
    if (letter !== null) params.append("letter", letter);
    if (producers !== null && producers.length > 0)
      params.append("producers", producers);

    if (start_date !== null) params.append("start_date", `${start_date}-01-01`);
    if (end_date !== null) params.append("end_date", `${end_date}-12-31`);

    params.append("page", page);
    params.append("limit", limit);

    try {
      set({ searchResults: null });
      const jikanSearchFiltersUrl = `https://api.jikan.moe/v4/anime?${params.toString()}`;
      let data = null;
      const cacheData = null;

      // const cacheData = await redis.get(jikanSearchFiltersUrl);
      if (cacheData) {
        data = cacheData;
      } else {
        const response = await fetch(jikanSearchFiltersUrl);
        if (!response.ok) {
          throw new Error("Failed to fetch data from the API");
        }

        data = await response.json();
        // await redis.set(jikanSearchFiltersUrl, data);
        // cache.set(jikanSearchFiltersUrl,data)
      }

      set({ searchResults: data });
    } catch (error) {
      toast.error(error.message, {
        id: "1",
        duration: 3000,
      });
      console.error("Error fetching anime search results:", error);
    }
  },

  resetFilters: async () => {
    set({
      searchResults: null,
      page: 1,
      limit: 25,
      q: null,
      type: null,
      score: null,
      min_score: null,
      max_score: null,
      status: null,
      rating: null,
      sfw: null,
      genres: null,
      genres_exclude: null,
      order_by: null,
      sort: null,
      letter: null,
      producers: null,
      start_date: null,
      end_date: null,
    });
  },
}));

export default useAnimeSearchFilterStore;
