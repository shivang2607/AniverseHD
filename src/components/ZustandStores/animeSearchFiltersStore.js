import toast from "react-hot-toast";
import { create } from "zustand";

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
  setAllFilters: (filters) =>
    set((state) => {
      return {
        q:
          filters.q !== undefined && filters.q !== state.q
            ? filters.q
            : state.q,
        type:
          filters.type !== undefined && filters.type !== state.type
            ? filters.type
            : state.type,
        min_score:
          filters.min_score !== undefined &&
          filters.min_score !== state.min_score
            ? filters.min_score
            : state.min_score,
        max_score:
          filters.max_score !== undefined &&
          filters.max_score !== state.max_score
            ? filters.max_score
            : state.max_score,
        status:
          filters.status !== undefined && filters.status !== state.status
            ? filters.status
            : state.status,
        rating:
          filters.rating !== undefined && filters.rating !== state.rating
            ? filters.rating
            : state.rating,
        genres:
          filters.genres !== undefined && filters.genres !== state.genres
            ? filters.genres
            : state.genres,
        genres_exclude:
          filters.genres_exclude !== undefined &&
          filters.genres_exclude !== state.genres_exclude
            ? filters.genres_exclude
            : state.genres_exclude,
        order_by:
          filters.order_by !== undefined && filters.order_by !== state.order_by
            ? filters.order_by
            : state.order_by,
        sort:
          filters.sort !== undefined && filters.sort !== state.sort
            ? filters.sort
            : state.sort,
        letter:
          filters.letter !== undefined && filters.letter !== state.letter
            ? filters.letter
            : state.letter,
        producers:
          filters.producers !== undefined &&
          filters.producers !== state.producers
            ? filters.producers
            : state.producers,
        start_date:
          filters.start_date !== undefined &&
          filters.start_date !== state.start_date
            ? filters.start_date
            : state.start_date,
        end_date:
          filters.end_date !== undefined && filters.end_date !== state.end_date
            ? filters.end_date
            : state.end_date,
        themes:
          filters.themes !== undefined && filters.themes !== state.themes
            ? filters.themes
            : state.themes,
        demographics:
          filters.demographics !== undefined &&
          filters.demographics !== state.demographics
            ? filters.demographics
            : state.demographics,
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
    }),

  toggleGenre: (genreId) => {
    const { genres } = get();
    if (genres == null) {
      set({ genres: [genreId] });
      return;
    }

    if (genres.some((e) => e == genreId)) {
      set({ genres: genres.filter((e) => e !== genreId) });
    } else {
      set({ genres: genres.concat([genreId]) });
    }
  },
  toggleTheme: (themeId) => {
    const { themes } = get();
    if (themes == null) {
      set({ themes: [themeId] });
      return;
    }

    if (themes.some((e) => e == themeId)) {
      set({ themes: themes.filter((e) => e !== themeId) });
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
    if (start_date !== null) params.append("start_date", start_date);
    if (end_date !== null) params.append("end_date", end_date);

    params.append("page", page);
    params.append("limit", limit);

    try {
      set({ searchResults: null });
      // Make the API call
      const response = await fetch(
        `https://api.jikan.moe/v4/anime?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data from the API");
      }

      // Parse the response
      const data = await response.json();

      // console.log(data,data?.data,"success");
      // Update the store with the search results
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
