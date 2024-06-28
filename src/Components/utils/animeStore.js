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
  }
}));

export default useAnimeStore;
