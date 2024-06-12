import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { demographics, genres, themes } from "./genre-themes-list";

const recommendationStore = (set, get) => ({
  recommendations: [],
  description: "",
  queryAnime: [],
  selectedGenre : genres.map(g=>g.value),
  selectedTheme : themes.map(t=>t.value),
  selectedDemographics : demographics.map(d=>d.value),


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
  setSelectedGenre: (selectedGenre)=> {
    set(state=>({
      selectedGenre: Array.isArray(selectedGenre)? selectedGenre : [...state.selectedGenre, selectedGenre],
    }))
  },
  setSelectedTheme: (selectedTheme)=> {
    set(state=>({
      selectedTheme: Array.isArray(selectedTheme)? selectedTheme : [...state.selectedTheme, selectedTheme],
    }))
  },
  setSelectedDemographics: (selectedDemo)=> {
    set(state=>({
      selectedDemographics: Array.isArray(selectedDemo)? selectedDemo : [...state.selectedDemographics, selectedDemo],
    }))
  },
  reset : ()=>{
    set(state=>({
        recommendations : [],
        description : "",
        queryAnime : [],
        selectedGenre : genres.map(g=>g.value),
        selectedTheme : themes.map(t=>t.value),
        selectedDemographics : demographics.map(d=>d.value),

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