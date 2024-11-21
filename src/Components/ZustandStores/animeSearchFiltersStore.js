import { create } from "zustand";

const useAnimeSearchFilterStore= create((set, get) => ({
 searchResults:[],
 page:1,
 limit:25,
 q:null,
 type:null,
 score:null,
 min_score:null,
 max_score:null,
 status:null,
 rating:null,
 sfw:null,
 genres:null,
 genres_exclude:null,
 order_by:null,
 sort:null,
 letter:null,
 producers:null,
 start_date:null,
 end_date:null,
 
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

}));

export default useUserStore;
