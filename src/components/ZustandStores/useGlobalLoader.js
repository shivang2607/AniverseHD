import { create } from "zustand";

const useGlobalLoader = create((set, get) => ({
  isLoaderVisible: false,
  imageUrl:null,
  loaderText:null,
  setIsLoaderVisible: (val) => set({ isLoaderVisible: val }),
  setImageUrl: (val) => set({ imageUrl: val }),
  setLoaderText: (val) => set({ loaderText: val }),
}));

export default useGlobalLoader;
