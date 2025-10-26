// Firebase imports (original)
import GetLoggedUserData from "@/app/firebase/Profile/GetLoggedUserData";
import UpdateCoverImage from "@/app/firebase/Profile/UpdateCoverImage";
import UpdateName from "@/app/firebase/Profile/UpdateName";
import UpdateProfileImage from "@/app/firebase/Profile/UpdateProfileImage";
import SignInGooglePopUp from "@/app/firebase/SignIn/SignInGooglePopUp";
import SignOut from "@/app/firebase/SignIn/SignOut";
import getUserAuth from "@/app/firebase/utils/GetUserAuth";
import CreateWatchList from "@/app/firebase/WatchList/CreateWatchList";
import DeleteWatchListById from "@/app/firebase/WatchList/DeleteWatchList";
import RemoveAnimeFromWatchList from "@/app/firebase/WatchList/UpdateWatchLists/RemoveAnimeFromWatchList";
import GetWatchListDataById from "@/app/firebase/WatchList/WatchListAnimeList/GetWatchListDataById";
import GetLoggedUserWatchListsInfo from "@/app/firebase/WatchList/WatchListDocument/GetLoggedUserWatchListsInfo";

// Hybrid imports (new)
import { 
  getUserData as getHybridUserData, 
  createUserProfile as createHybridUserProfile, 
  updateUserName as updateHybridUserName, 
  updateProfileImage as updateHybridProfileImage, 
  updateCoverImage as updateHybridCoverImage 
} from "@/services/hybrid/userService";
import { 
  getUserWatchlists as getHybridWatchlists, 
  createWatchlist as createHybridWatchlist, 
  deleteWatchlist as deleteHybridWatchlist, 
  removeAnimeFromWatchlist as removeHybridAnimeFromWatchlist, 
  getWatchlistById as getHybridWatchlistById 
} from "@/services/hybrid/watchlistService";

import {
  Constant_Var_starterWatchLists_recent,
  Constant_Var_success,
} from "@/utils/constants";
import toast from "react-hot-toast";
import { create } from "zustand";

/**
 * Migration modes:
 * - 'firebase': Original Firebase-only mode (default)
 * - 'hybrid': Dual-write to both Firebase and Cloudflare, read from Cloudflare with Firebase fallback
 * - 'cloudflare': Cloudflare-only mode (future)
 */
const getMigrationMode = () => {
  // Check environment variable first
  if (process.env.NEXT_PUBLIC_MIGRATION_MODE) {
    return process.env.NEXT_PUBLIC_MIGRATION_MODE;
  }
  
  // Check localStorage for runtime switching
  const localMode = localStorage.getItem('MIGRATION_MODE');
  if (localMode) {
    return localMode;
  }
  
  // Check for emergency fallback
  if (localStorage.getItem('USE_FIREBASE_FALLBACK') === 'true') {
    return 'firebase';
  }
  
  // Default to firebase for safety
  return 'firebase';
};



const useUserStore = create((set, get) => ({
  isUserLoggedIn: null,
  loggedInUserId: null,
  loggedInUserData: null,
  loggedInUserWatchListsInfo: null,
  loadingData: false,
  RecentWatchListId: null,
  RecentWatchListData: null,
  hideWatchlistBar: true, 
  selectedId: null,
  listData: [],
  
  // Migration state
  migrationMode: getMigrationMode(),
  lastHybridResults: null,
   
    
  loadLoggedInUserDataAndWatchLists: async () => {
    set({ loadingData: true });
    const mode = get().migrationMode;
    
    try {
      let respUserInfo, respUserWatchLists;
      
      if (mode === 'hybrid') {
        // Hybrid mode: use dual-write services
        [respUserInfo, respUserWatchLists] = await Promise.all([
          getHybridUserData(),
          getHybridWatchlists(),
        ]);
        
        // Store hybrid results for debugging
        set({ 
          lastHybridResults: {
            userInfo: respUserInfo.hybridResults,
            watchlists: respUserWatchLists.hybridResults
          }
        });
      } else {
        // Firebase mode: use original Firebase services
        [respUserInfo, respUserWatchLists] = await Promise.all([
          GetLoggedUserData(),
          GetLoggedUserWatchListsInfo(),
        ]);
      }

      if (
        respUserInfo.status === Constant_Var_success &&
        respUserWatchLists.status === Constant_Var_success
      ) {
        // Find recent watchlist (handle both Firebase and Cloudflare formats)
        let recentWatchlistId = null;
        for (let i = 0; i < respUserWatchLists.response.length; ++i) {
          let ele = respUserWatchLists.response[i];

          const isRecentWatchlist = 
            (ele.isSpecialStarter && ele.watchListName === Constant_Var_starterWatchLists_recent) ||
            (ele.isStarter === 1 && ele.name === Constant_Var_starterWatchLists_recent) ||
            ele.isRecentWatchlist === 1;

          if (isRecentWatchlist) {
            recentWatchlistId = ele.id || ele.watchlistId;
            break;
          }
        }

        set({
          loggedInUserData: respUserInfo.response,
          loggedInUserId: respUserInfo.response.uid || respUserInfo.response.userId,
          loggedInUserWatchListsInfo: respUserWatchLists.response,
          isUserLoggedIn: true,
          loadingData: false,
          RecentWatchListId: recentWatchlistId,
        });
      } else {
        set({
          loggedInUserData: null,
          loggedInUserId: null,
          isUserLoggedIn: false,
          loggedInUserWatchListsInfo: null,
          loadingData: false,
          RecentWatchListId: null,
        });
      }
    } catch (error) {
      console.error('Error loading user data and watchlists:', error);
      set({
        loggedInUserData: null,
        loggedInUserId: null,
        isUserLoggedIn: false,
        loggedInUserWatchListsInfo: null,
        loadingData: false,
        RecentWatchListId: null,
      });
      toast.error("Error loading user data", {
        id: "1",
        duration: 3000,
      });
    }
  },

  loadLoggedInUserData: async () => {
    set({ loadingData: true });
    const mode = get().migrationMode;
    
    try {
      let respUserInfo;
      
      if (mode === 'hybrid') {
        respUserInfo = await getHybridUserData();
        set({ lastHybridResults: { userInfo: respUserInfo.hybridResults } });
      } else {
        respUserInfo = await GetLoggedUserData();
      }

      if (respUserInfo.status === Constant_Var_success) {
        set({
          loggedInUserData: respUserInfo.response,
          isUserLoggedIn: true,
          loadingData: false,
        });
      } else {
        set({
          loggedInUserData: null,
          isUserLoggedIn: false,
          loggedInUserId: null,
          loggedInUserWatchListsInfo: null,
          loadingData: false,
        });
        toast.error("Error loading User Data", {
          id: "1",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      set({
        loggedInUserData: null,
        isUserLoggedIn: false,
        loggedInUserId: null,
        loggedInUserWatchListsInfo: null,
        loadingData: false,
      });
      toast.error("Error loading User Data", {
        id: "1",
        duration: 3000,
      });
    }
  },

  loadLoggedInUserWatchLists: async () => {
    set({ loadingData: true });
    const mode = get().migrationMode;
    
    try {
      let respWatchLists;
      
      if (mode === 'hybrid') {
        respWatchLists = await getHybridWatchlists();
        set({ lastHybridResults: { watchlists: respWatchLists.hybridResults } });
      } else {
        respWatchLists = await GetLoggedUserWatchListsInfo();
      }

      if (respWatchLists.status === Constant_Var_success) {
        set({
          loggedInUserWatchListsInfo: respWatchLists.response,
          isUserLoggedIn: true,
          loadingData: false,
        });
      } else {
        set({
          loggedInUserData: null,
          isUserLoggedIn: false,
          loggedInUserId: null,
          loggedInUserWatchListsInfo: null,
          loadingData: false,
        });
        toast.error("Error loading User WatchLists", {
          id: "1",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error loading watchlists:', error);
      set({
        loggedInUserData: null,
        isUserLoggedIn: false,
        loggedInUserId: null,
        loggedInUserWatchListsInfo: null,
        loadingData: false,
      });
      toast.error("Error loading User WatchLists", {
        id: "1",
        duration: 3000,
      });
    }
  },

  loadLoggedInUserRecentWatchList: async () => {
    let { RecentWatchListId, migrationMode } = get();

    if (RecentWatchListId) {
      try {
        let resp;
        
        if (migrationMode === 'hybrid') {
          resp = await getHybridWatchlistById({
            watchListId: RecentWatchListId,
            getAll: true,
          });
        } else {
          resp = await GetWatchListDataById({
            watchListId: RecentWatchListId,
            getAll: true,
          });
        }

        if (resp.status === Constant_Var_success) {
          set({ RecentWatchListData: resp.response });
        } else {
          set({ RecentWatchListData: null });
        }
      } catch (error) {
        console.error('Error loading recent watchlist:', error);
        set({ RecentWatchListData: null });
      }
    }
  },

  updateUserName: async ({ userName }) => {
    const mode = get().migrationMode;
    
    try {
      let resp;
      
      if (mode === 'hybrid') {
        resp = await updateHybridUserName(userName);
        set({ lastHybridResults: { updateName: resp.hybridResults } });
        
        // Show warning if only one system succeeded
        if (resp.hybridResults && (!resp.hybridResults.firebase || !resp.hybridResults.cloudflare)) {
          const failedSystem = !resp.hybridResults.firebase ? 'Firebase' : 'Cloudflare';
          toast.warning(`Warning: ${failedSystem} update failed, but operation succeeded`, {
            id: "hybrid-warning",
            duration: 5000,
          });
        }
      } else {
        resp = await UpdateName({ userName: userName });
      }

      if (resp.status === Constant_Var_success) {
        toast.success("Name Updated Successfully", {
          id: "1",
          duration: 3000,
        });
        await get().loadLoggedInUserData();
      } else {
        toast.error("Error Updating name", {
          id: "1",
          duration: 3000,
        });
        console.error(resp.response);
      }
    } catch (error) {
      console.error('Error updating user name:', error);
      toast.error("Error Updating name", {
        id: "1",
        duration: 3000,
      });
    }
  },

  updateProfileImaeg: async ({ blob }) => {
    const mode = get().migrationMode;
    
    try {
      let resp;
      
      if (mode === 'hybrid') {
        resp = await updateHybridProfileImage(blob);
        set({ lastHybridResults: { updateProfileImage: resp.hybridResults } });
        
        // Show warning if only one system succeeded
        if (resp.hybridResults && (!resp.hybridResults.firebase || !resp.hybridResults.cloudflare)) {
          const failedSystem = !resp.hybridResults.firebase ? 'Firebase' : 'Cloudflare';
          toast.warning(`Warning: ${failedSystem} update failed, but operation succeeded`, {
            id: "hybrid-warning",
            duration: 5000,
          });
        }
      } else {
        resp = await UpdateProfileImage({ blob: blob });
      }

      if (resp.status === Constant_Var_success) {
        toast.success("Profile Image Updated Successfully", {
          id: "1",
          duration: 3000,
        });
        await get().loadLoggedInUserData();
      } else {
        toast.error("Error Updating Profile Image", {
          id: "1",
          duration: 3000,
        });
        console.error(resp.response);
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
      toast.error("Error Updating Profile Image", {
        id: "1",
        duration: 3000,
      });
    }
  },

  updateCoverImage: async ({ blob }) => {
    const mode = get().migrationMode;
    
    try {
      let resp;
      
      if (mode === 'hybrid') {
        resp = await updateHybridCoverImage(blob);
        set({ lastHybridResults: { updateCoverImage: resp.hybridResults } });
        
        // Show warning if only one system succeeded
        if (resp.hybridResults && (!resp.hybridResults.firebase || !resp.hybridResults.cloudflare)) {
          const failedSystem = !resp.hybridResults.firebase ? 'Firebase' : 'Cloudflare';
          toast.warning(`Warning: ${failedSystem} update failed, but operation succeeded`, {
            id: "hybrid-warning",
            duration: 5000,
          });
        }
      } else {
        resp = await UpdateCoverImage({ blob: blob });
      }

      if (resp.status === Constant_Var_success) {
        toast.success("Cover Image Updated Successfully", {
          id: "1",
          duration: 3000,
        });
        await get().loadLoggedInUserData();
      } else {
        toast.error("Error Updating Cover Image", {
          id: "1",
          duration: 3000,
        });
        console.error(resp.response);
      }
    } catch (error) {
      console.error('Error updating cover image:', error);
      toast.error("Error Updating Cover Image", {
        id: "1",
        duration: 3000,
      });
    }
  },

  createWatchList: async ({ type, watchListName }) => {
    const mode = get().migrationMode;
    
    try {
      let resp;
      
      if (mode === 'hybrid') {
        resp = await createHybridWatchlist({
          type: type,
          watchListName: watchListName,
        });
        set({ lastHybridResults: { createWatchlist: resp.hybridResults } });
        
        // Show warning if only one system succeeded
        if (resp.hybridResults && (!resp.hybridResults.firebase || !resp.hybridResults.cloudflare)) {
          const failedSystem = !resp.hybridResults.firebase ? 'Firebase' : 'Cloudflare';
          toast.warning(`Warning: ${failedSystem} creation failed, but operation succeeded`, {
            id: "hybrid-warning",
            duration: 5000,
          });
        }
      } else {
        resp = await CreateWatchList({
          type: type,
          watchListName: watchListName,
        });
      }

      if (resp.status === Constant_Var_success) {
        toast.success("WatchList Created Successfully", {
          id: "1",
          duration: 3000,
        });
        await get().loadLoggedInUserWatchLists();
      } else {
        toast.error("Error Creating WatchList", {
          id: "1",
          duration: 3000,
        });
        console.error(resp.response);
      }
    } catch (error) {
      console.error('Error creating watchlist:', error);
      toast.error("Error Creating WatchList", {
        id: "1",
        duration: 3000,
      });
    }
  },

  deleteWatchList: async ({ watchListId }) => {
    const mode = get().migrationMode;
    
    try {
      let resp;
      
      if (mode === 'hybrid') {
        resp = await deleteHybridWatchlist(watchListId);
        set({ lastHybridResults: { deleteWatchlist: resp.hybridResults } });
        
        // Show warning if only one system succeeded
        if (resp.hybridResults && (!resp.hybridResults.firebase || !resp.hybridResults.cloudflare)) {
          const failedSystem = !resp.hybridResults.firebase ? 'Firebase' : 'Cloudflare';
          toast.warning(`Warning: ${failedSystem} deletion failed, but operation succeeded`, {
            id: "hybrid-warning",
            duration: 5000,
          });
        }
      } else {
        resp = await DeleteWatchListById({ watchListId: watchListId });
      }

      if (resp.status === Constant_Var_success) {
        toast.success("WatchList Deleted Successfully", {
          id: "1",
          duration: 3000,
        });
        await get().loadLoggedInUserWatchLists();
      } else {
        toast.error("Error Deleting WatchList", {
          id: "1",
          duration: 3000,
        });
        console.error(resp.response);
      }
    } catch (error) {
      console.error('Error deleting watchlist:', error);
      toast.error("Error Deleting WatchList", {
        id: "1",
        duration: 3000,
      });
    }
  },

  removeAnimeFromWatchList: async ({ animeId, watchListId }) => {
    const mode = get().migrationMode;
    
    try {
      let resp;
      
      if (mode === 'hybrid') {
        resp = await removeHybridAnimeFromWatchlist({
          watchListId: watchListId,
          animeId: animeId,
        });
        set({ lastHybridResults: { removeAnime: resp.hybridResults } });
        
        // Show warning if only one system succeeded
        if (resp.hybridResults && (!resp.hybridResults.firebase || !resp.hybridResults.cloudflare)) {
          const failedSystem = !resp.hybridResults.firebase ? 'Firebase' : 'Cloudflare';
          toast.warning(`Warning: ${failedSystem} removal failed, but operation succeeded`, {
            id: "hybrid-warning",
            duration: 5000,
          });
        }
      } else {
        resp = await RemoveAnimeFromWatchList({
          watchListId: watchListId,
          animeId: animeId,
        });
      }

      if (resp.status === Constant_Var_success) {
        toast.success("Anime Removed Successfully", {
          id: "1",
          duration: 3000,
        });
        await get().loadLoggedInUserWatchLists();
      } else {
        toast.error("Error Removing Anime", {
          id: "1",
          duration: 3000,
        });
        console.error(resp.response);
      }
    } catch (error) {
      console.error('Error removing anime:', error);
      toast.error("Error Removing Anime", {
        id: "1",
        duration: 3000,
      });
    }
  },

  logout: async () => {
    const resp = await SignOut();
    if (resp.status === Constant_Var_success) {
      set({
        loggedInUserData: null,
        isUserLoggedIn: false,
        loggedInUserId: null,
        loggedInUserWatchListsInfo: null,
      });
      // show success toast;
    } else {
      // show some toast for error
    }
  },

  login: async (callback) => {
   
    const res = await SignInGooglePopUp((res)=> {callback(res)});

    if (res.status === Constant_Var_success) {
      await get().loadLoggedInUserDataAndWatchLists(); // Use get() to call the function
      // shhow success toast
    } else {
      console.log(res);
      // show error toast
    }
  },

  toggleHideWatchlistBar: () => set({ hideWatchlistBar: !(get().hideWatchlistBar) }),

  setSelectedId: (selectedId) => set({ selectedId }),

  setListData: (listData) => set({ listData }),

  // Migration control functions
  setMigrationMode: (mode) => {
    localStorage.setItem('MIGRATION_MODE', mode);
    set({ migrationMode: mode });
    toast.info(`Switched to ${mode} mode`, {
      id: "migration-mode",
      duration: 3000,
    });
  },

  getMigrationMode: () => get().migrationMode,

  getLastHybridResults: () => get().lastHybridResults,

  // Emergency controls
  enableEmergencyFallback: () => {
    localStorage.setItem('USE_FIREBASE_FALLBACK', 'true');
    localStorage.setItem('USE_FIREBASE_FALLBACK_WATCHLISTS', 'true');
    set({ migrationMode: 'firebase' });
    toast.error("Emergency fallback enabled - using Firebase only", {
      id: "emergency-fallback",
      duration: 10000,
    });
  },

  disableEmergencyFallback: () => {
    localStorage.removeItem('USE_FIREBASE_FALLBACK');
    localStorage.removeItem('USE_FIREBASE_FALLBACK_WATCHLISTS');
    const mode = localStorage.getItem('MIGRATION_MODE') || 'firebase';
    set({ migrationMode: mode });
    toast.success("Emergency fallback disabled", {
      id: "emergency-fallback-disabled",
      duration: 5000,
    });
  },

  // Health check function
  checkSystemHealth: async () => {
    const mode = get().migrationMode;
    
    if (mode === 'hybrid') {
      try {
        // Import health monitor dynamically
        const { healthMonitor } = await import('@/utils/hybridMigrationHelper');
        const health = await healthMonitor.performHealthCheck();
        
        toast.info(`System Health - Firebase: ${health.firebase ? '✅' : '❌'}, Cloudflare: ${health.cloudflare ? '✅' : '❌'}`, {
          id: "health-check",
          duration: 5000,
        });
        
        return health;
      } catch (error) {
        console.error('Health check failed:', error);
        toast.error("Health check failed", {
          id: "health-check-error",
          duration: 3000,
        });
        return null;
      }
    } else {
      toast.info(`Currently in ${mode} mode - no health check needed`, {
        id: "health-check",
        duration: 3000,
      });
      return null;
    }
  },
}));

export default useUserStore;
