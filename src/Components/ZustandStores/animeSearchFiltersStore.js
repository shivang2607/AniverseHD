import toast from "react-hot-toast";
import { create } from "zustand";

const useAnimeSearchFilterStore= create((set, get) => ({
 searchResults:null,
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
      end_date
    } = get();

    // Build query parameters
    const params = new URLSearchParams();

    if (q!==null) params.append('q', q);
    if (type!==null) params.append('type', type);
    if (score!==null) params.append('score', score);
    if (min_score!==null) params.append('min_score', min_score);
    if (max_score!==null) params.append('max_score', max_score);
    if (status!==null) params.append('status', status);
    if (rating!==null) params.append('rating', rating);
    if (sfw!==null) params.append('sfw', sfw);
    if (genres!==null) params.append('genres', genres);
    if (genres_exclude!==null) params.append('genres_exclude', genres_exclude);
    if (order_by!==null) params.append('order_by', order_by);
    if (sort!==null) params.append('sort', sort);
    if (letter!==null) params.append('letter', letter);
    if (producers!==null) params.append('producers', producers);
    if (start_date!==null) params.append('start_date', start_date);
    if (end_date!==null) params.append('end_date', end_date);

    params.append('page', page);
    params.append('limit', limit);

    try {
    
      set({ searchResults: null });
      // Make the API call
      const response = await fetch(`https://api.jikan.moe/v4/anime?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data from the API');
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
      console.error('Error fetching anime search results:', error);
    }
  },

  resetFilters: async()=>{
    set({
      searchResults:null,
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
    })
  }
}));

export default useAnimeSearchFilterStore;
