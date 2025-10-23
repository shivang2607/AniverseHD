// stores/animeStore.js
import { create } from 'zustand';
import { getWithExpiry, setWithExpiry } from '@/components/utils/storage';
import axios from 'axios';

const useAnimeStore = create((set, get) => ({
  anime: {},
  fetchAnime: async (id) => {
    const cachedAnime = getWithExpiry(`anime_${id}`);
    if (cachedAnime) {
      set((state) => ({ anime: { ...state.anime, [id]: cachedAnime } }));
      return cachedAnime;
    }

    const response = await axios.get(`/api/v1/anime/${id}`);
    // console.log("This is the response from the anime details API", response);
    if(!(response?.data) || Object.keys(response?.data).length === 0){
      return {status: 404, message: "Anime not found with the given Id"};
    }
    const animeData = response.data;
    set((state) => ({ anime: { ...state.anime, [id]: animeData } }));
    setWithExpiry(`anime_${id}`, animeData, 2 * 60 * 60 * 1000); // 2hrs TTL
    return animeData;
  },

  getAnimeById: (id) => {
    return get().anime[id];
  },

  getRecommendationsById: async(id)=>{
    const cachedRecommendations = getWithExpiry(`suggested_${id}`);
    if (cachedRecommendations) {
      return cachedRecommendations;
    }
    try {
      const response = await axios.post("/api/v1/recommend", {
        positive: [Number(id)],
        limit: 18
      });
     setWithExpiry(`suggested_${id}`, response?.data, 60 * 60 * 1000); // 60 minutes TTL 
     return response?.data;

    } catch (error) {
      return null;
    }
  }
}));

export default useAnimeStore;
