import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { demographics, genres, themes } from "./genre-themes-list";
import toast from "react-hot-toast";
import axios from "axios";

const recommendationStore = (set, get) => ({
  loading: false,
  page : 1,
  recommendations: [],
  description: "",
  selectedAnimeList: [],
  isFilterOpen: false,
  matchType: "must",
  checkboxes: {
    all: true,
    tv: false,
    movie: false,
    ona: false,
    ova: false,
    specials: false,
  },
  ratings : {
    all : true,
    g: false,
    pg: false,
    pg_13: false,
    r: false,
    rplus : false,
  },
  scoreRange: [6.5, 10],
  yearRange: [1960, new Date().getFullYear()],
  selectedGenre: genres.map(g => g.value),
  selectedTheme: themes.map(t => t.value),
  selectedDemographics: demographics.map(d => d.value),

  setLoading: (val) => set({ loading: val }),

  setPage: (pg)=> set({page: pg}),

  getRecommendations: async () => {
    const {matchType, checkboxes, description, selectedAnimeList, scoreRange, yearRange, selectedGenre, selectedTheme, selectedDemographics, ratings } = get();
    
    const {tv, movie, ona, ova, specials} = checkboxes;
    const {g, pg, pg_13, r , rplus} = ratings;
    let type = [];
    if(tv) type.push("TV");
    if(movie) type.push("Movie");
    if(ona) type.push("ONA");
    if(ova) type.push("OVA");
    if(specials) type.push("special");

    let newRatings = [];
    if(g) newRatings.push("g");
    if(pg) newRatings.push("pg");
    if(pg_13) newRatings.push("pg_13");
    if(r) newRatings.push("r");
    if(rplus) newRatings.push("r+");

    const descriptionTrimmed = description?.trim();
    const hasValidDescription = descriptionTrimmed && descriptionTrimmed.split(" ").length >= 5;

    if (!descriptionTrimmed && selectedAnimeList.length === 0) {
      toast.error("Please Select Anime or write description!", {
        duration: 2000,
        id: "error",
      });
      return;
    } else if (!selectedAnimeList.length && !hasValidDescription) {
      toast.error("Description should have at least 5 words!", {
        id: "word-limit-error",
      });
      return;
    }

    set({ loading: true });

    try {
      const response = await axios.post("/api/v1/recommend", {
        positive: selectedAnimeList.map(anime => anime.id),
        description,
        fKey: matchType,
        type,
        selectedGenre,
        selectedTheme,
        selectedDemographics,
        scoregte: scoreRange[0],
        scorelte: scoreRange[1],
        yeargte: yearRange[0],
        yearlte: yearRange[1],
        ratings: newRatings
      });

      set({
        recommendations: response?.data,
        page: 1,
        loading: false,
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.error || error?.message || "Something Went Wrong",
        {
          id: "catch-error",
        }
      );
      set({ loading: false });
    }
  },

  setRecommendations: (recommend) => set({ recommendations: recommend }),

  setDescription: (desc) => set({ description: desc }),

  setSelectedAnimeList: (animeList) => set({ selectedAnimeList: animeList }),

  toggleFilterOpen : ()=>set(state=>({isFilterOpen: !(state.isFilterOpen)})),

  setMatchType: (type) => set({ matchType: type }),

  setCheckboxes: (newObj) => set({ checkboxes: newObj }),

  setRatings: (newObj) => set({ratings: newObj}),

  setScoreRange: (newRange) => set({ scoreRange: newRange }),

  setYearRange: (newRange) => set({ yearRange: newRange }),

  setSelectedGenre: (selectedGenre) => set({
    selectedGenre: Array.isArray(selectedGenre) ? selectedGenre : [...get().selectedGenre, selectedGenre],
  }),

  setSelectedTheme: (selectedTheme) => set({
    selectedTheme: Array.isArray(selectedTheme) ? selectedTheme : [...get().selectedTheme, selectedTheme],
  }),

  setSelectedDemographics: (selectedDemo) => set({
    selectedDemographics: Array.isArray(selectedDemo) ? selectedDemo : [...get().selectedDemographics, selectedDemo],
  }),

  reset: () => set({
    recommendations: [],
    description: "",
    selectedAnimeList: [],
    matchType: "must",
    checkboxes: {
      all: true,
      tv: false,
      movie: false,
      ona: false,
      ova: false,
      specials: false,
    },
    ratings :  {
      all : true,
      g: false,
      pg: false,
      pg_13: false,
      r: false,
      rplus : false,
    },
    scoreRange: [6.5, 10],
    yearRange: [1960, new Date().getFullYear()],
    selectedGenre: genres.map(g => g.value),
    selectedTheme: themes.map(t => t.value),
    selectedDemographics: demographics.map(d => d.value),
  }),
});

const useRecommendationStore = create(
  persist(recommendationStore, {
    name: "recommendations",
    storage: createJSONStorage(() => sessionStorage),
  })
);

export default useRecommendationStore;
