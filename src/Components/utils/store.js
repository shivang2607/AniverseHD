import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const recommendationStore = (set, get) => ({
  recommendations: [],
  description: "",
  queryAnime: [],
  setRecommendations: (recommend) => {
    set((state) => ({
      recommendations: recommend,
    }));
  },
  setDescription: (desc) => {
    set((state) => ({
      description: desc,
    }));
  },
  setQueryAnime: (anime) => {
    set((state) => ({
      queryAnime: Array.isArray(anime) ? anime : [anime],
    }));
  },
  reset : ()=>{
    set(state=>({
        recommendations : [],
        description : "",
        queryAnime : []
    }))
  }
});


const useRecommendationStore = create(
    persist(recommendationStore, {
        name: "recommendations",
        storage: createJSONStorage(()=>sessionStorage),
    })
)

export default useRecommendationStore;