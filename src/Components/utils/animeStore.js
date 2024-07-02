// stores/animeStore.js
import { create } from 'zustand';
import { getWithExpiry, setWithExpiry } from './storage';
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
    const animeData = response.data;
    set((state) => ({ anime: { ...state.anime, [id]: animeData } }));
    setWithExpiry(`anime_${id}`, animeData, 60 * 60 * 1000); // 60 minutes TTL
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
