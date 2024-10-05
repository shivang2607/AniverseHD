import { create } from 'zustand';

const useUserStore = create((set) => ({
    isUserLoggedIn: false,
    loggedInUserData: null,
    setIsUserLoggedIn: (status) => set({ isUserLoggedIn: status }),
    setLoggedInUserData: (data) => set({ loggedInUserData: data }),
  }));
  
  export default  useUserStore;