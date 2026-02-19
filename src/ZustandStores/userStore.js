// Auth imports (always Firebase — auth is not migrated)
import SignInGooglePopUp from "@/app/firebase/SignIn/SignInGooglePopUp";
import SignOut from "@/app/firebase/SignIn/SignOut";

// Unified service layer — ALL data operations go through here.
// Datasource routing (firebase / hybrid / cloudflare) is handled inside index.js.
import {
  getUserData,
  createUserProfile,
  updateUserName,
  updateProfileImage,
  updateCoverImage,
  getUserWatchlists,
  createWatchlist,
  deleteWatchlist,
  removeAnimeFromWatchlist,
  getWatchlistById,
  addAnimeToWatchlist,
  updateWatchlistName,
  updateWatchlistPrivacy,
} from "@/services/index";

import {
  Constant_Var_starterWatchLists_recent,
  Constant_Var_success,
  Constant_Var_error,
} from "@/utils/constants";
import toast from "react-hot-toast";
import { create } from "zustand";

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

  loadLoggedInUserDataAndWatchLists: async () => {
    set({ loadingData: true });

    try {
      const [respUserInfo, respUserWatchLists] = await Promise.all([
        getUserData(),
        getUserWatchlists(),
      ]);

      if (
        respUserInfo.status === Constant_Var_success &&
        respUserWatchLists.status === Constant_Var_success
      ) {
        // Find recent watchlist — handle both Firebase and Cloudflare response shapes
        let recentWatchlistId = null;
        for (const ele of respUserWatchLists.response) {
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
      console.error("Error loading user data and watchlists:", error);
      set({
        loggedInUserData: null,
        loggedInUserId: null,
        isUserLoggedIn: false,
        loggedInUserWatchListsInfo: null,
        loadingData: false,
        RecentWatchListId: null,
      });
      toast.error("Error loading user data", { id: "1", duration: 3000 });
    }
  },

  loadLoggedInUserData: async () => {
    set({ loadingData: true });

    try {
      const respUserInfo = await getUserData();

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
        toast.error("Error loading User Data", { id: "1", duration: 3000 });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      set({
        loggedInUserData: null,
        isUserLoggedIn: false,
        loggedInUserId: null,
        loggedInUserWatchListsInfo: null,
        loadingData: false,
      });
      toast.error("Error loading User Data", { id: "1", duration: 3000 });
    }
  },

  loadLoggedInUserWatchLists: async () => {
    set({ loadingData: true });

    try {
      const respWatchLists = await getUserWatchlists();

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
        toast.error("Error loading User WatchLists", { id: "1", duration: 3000 });
      }
    } catch (error) {
      console.error("Error loading watchlists:", error);
      set({
        loggedInUserData: null,
        isUserLoggedIn: false,
        loggedInUserId: null,
        loggedInUserWatchListsInfo: null,
        loadingData: false,
      });
      toast.error("Error loading User WatchLists", { id: "1", duration: 3000 });
    }
  },

  loadLoggedInUserRecentWatchList: async () => {
    const { RecentWatchListId } = get();

    if (RecentWatchListId) {
      try {
        const resp = await getWatchlistById({
          watchListId: RecentWatchListId,
          getAll: true,
        });

        if (resp.status === Constant_Var_success) {
          set({ RecentWatchListData: resp.response });
        } else {
          set({ RecentWatchListData: null });
        }
      } catch (error) {
        console.error("Error loading recent watchlist:", error);
        set({ RecentWatchListData: null });
      }
    }
  },

  updateUserName: async ({ userName }) => {
    try {
      const resp = await updateUserName(userName);

      if (resp.status === Constant_Var_success) {
        toast.success("Name Updated Successfully", { id: "1", duration: 3000 });
        await get().loadLoggedInUserData();
      } else {
        toast.error("Error Updating name", { id: "1", duration: 3000 });
        console.error(resp.response);
      }
    } catch (error) {
      console.error("Error updating user name:", error);
      toast.error("Error Updating name", { id: "1", duration: 3000 });
    }
  },

  updateProfileImaeg: async ({ blob }) => {
    try {
      const resp = await updateProfileImage(blob);

      if (resp.status === Constant_Var_success) {
        toast.success("Profile Image Updated Successfully", { id: "1", duration: 3000 });
        await get().loadLoggedInUserData();
      } else {
        toast.error("Error Updating Profile Image", { id: "1", duration: 3000 });
        console.error(resp.response);
      }
    } catch (error) {
      console.error("Error updating profile image:", error);
      toast.error("Error Updating Profile Image", { id: "1", duration: 3000 });
    }
  },

  updateCoverImage: async ({ blob }) => {
    try {
      const resp = await updateCoverImage(blob);

      if (resp.status === Constant_Var_success) {
        toast.success("Cover Image Updated Successfully", { id: "1", duration: 3000 });
        await get().loadLoggedInUserData();
      } else {
        toast.error("Error Updating Cover Image", { id: "1", duration: 3000 });
        console.error(resp.response);
      }
    } catch (error) {
      console.error("Error updating cover image:", error);
      toast.error("Error Updating Cover Image", { id: "1", duration: 3000 });
    }
  },

  createWatchList: async ({ type, watchListName }) => {
    try {
      const resp = await createWatchlist({ watchListName, type });

      if (resp.status === Constant_Var_success) {
        toast.success("WatchList Created Successfully", { id: "1", duration: 3000 });
        await get().loadLoggedInUserWatchLists();
      } else {
        toast.error("Error Creating WatchList", { id: "1", duration: 3000 });
        console.error(resp.response);
      }
    } catch (error) {
      console.error("Error creating watchlist:", error);
      toast.error("Error Creating WatchList", { id: "1", duration: 3000 });
    }
  },

  deleteWatchList: async ({ watchListId }) => {
    try {
      const resp = await deleteWatchlist(watchListId);

      if (resp.status === Constant_Var_success) {
        toast.success("WatchList Deleted Successfully", { id: "1", duration: 3000 });
        await get().loadLoggedInUserWatchLists();
      } else {
        toast.error("Error Deleting WatchList", { id: "1", duration: 3000 });
        console.error(resp.response);
      }
    } catch (error) {
      console.error("Error deleting watchlist:", error);
      toast.error("Error Deleting WatchList", { id: "1", duration: 3000 });
    }
  },

  removeAnimeFromWatchList: async ({ animeId, watchListId }) => {
    try {
      const resp = await removeAnimeFromWatchlist({ watchListId, animeId });

      if (resp.status === Constant_Var_success) {
        toast.success("Anime Removed Successfully", { id: "1", duration: 3000 });
        await get().loadLoggedInUserWatchLists();
      } else {
        toast.error("Error Removing Anime", { id: "1", duration: 3000 });
        console.error(resp.response);
      }
    } catch (error) {
      console.error("Error removing anime:", error);
      toast.error("Error Removing Anime", { id: "1", duration: 3000 });
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
    }
  },

  login: async (callback) => {
    const res = await SignInGooglePopUp((res) => { callback(res); });

    if (res.status === Constant_Var_success) {
      await get().loadLoggedInUserDataAndWatchLists();
    } else {
      console.log(res);
    }
  },

  toggleHideWatchlistBar: () => set({ hideWatchlistBar: !(get().hideWatchlistBar) }),

  setSelectedId: (selectedId) => set({ selectedId }),

  setListData: (listData) => set({ listData }),

  addAnimeToWatchList: async ({ watchListId, animeId, animeData, url = null }) => {
    try {
      const resp = await addAnimeToWatchlist({ watchListId, animeId, animeData, url });
      return resp;
    } catch (error) {
      console.error("Error adding anime to watchlist:", error);
      return { status: Constant_Var_error, response: error.message };
    }
  },

  changeWatchListName: async ({ watchListId, newName }) => {
    try {
      const resp = await updateWatchlistName({ watchListId, newName });

      if (resp.status === Constant_Var_success) {
        toast.success("Watchlist name updated successfully", { id: "1", duration: 3000 });
        await get().loadLoggedInUserWatchLists();
      } else {
        toast.error("Error updating watchlist name", { id: "1", duration: 3000 });
      }

      return resp;
    } catch (error) {
      console.error("Error changing watchlist name:", error);
      toast.error("Error updating watchlist name", { id: "1", duration: 3000 });
      return { status: Constant_Var_error, response: error.message };
    }
  },

  updateWatchListPrivacy: async ({ watchListId, type }) => {
    try {
      const resp = await updateWatchlistPrivacy({ watchListId, type });

      if (resp.status === Constant_Var_success) {
        toast.success("Watchlist privacy updated successfully", { id: "1", duration: 3000 });
        await get().loadLoggedInUserWatchLists();
      } else {
        toast.error("Error updating watchlist privacy", { id: "1", duration: 3000 });
      }

      return resp;
    } catch (error) {
      console.error("Error updating watchlist privacy:", error);
      toast.error("Error updating watchlist privacy", { id: "1", duration: 3000 });
      return { status: Constant_Var_error, response: error.message };
    }
  },

  /**
   * Get other user's profile data (read-only — always Firebase for now)
   */
  getOtherUserData: async ({ userId }) => {
    try {
      const { default: GetOtherUserData } = await import('@/app/firebase/Profile/GetOtherUserData');
      const resp = await GetOtherUserData({ userId });
      return resp;
    } catch (error) {
      console.error("Error getting other user data:", error);
      return { status: Constant_Var_error, response: error.message };
    }
  },

  /**
   * Get other user's public watchlists (read-only — always Firebase for now)
   */
  getOtherUserWatchlists: async ({ userId }) => {
    try {
      const { default: GetOtherUserWatchListsInfo } = await import('@/app/firebase/WatchList/WatchListDocument/GetOtherUserWatchListsInfo');
      const resp = await GetOtherUserWatchListsInfo({ userId });
      return resp;
    } catch (error) {
      console.error("Error getting other user watchlists:", error);
      return { status: Constant_Var_error, response: error.message };
    }
  },

  /**
   * Get watchlist data by ID with pagination support
   */
  getWatchlistDataById: async ({ watchListId, offset = 0, pageSize = 10, getAll = false }) => {
    try {
      const resp = await getWatchlistById({ watchListId, offset, pageSize, getAll });
      return resp;
    } catch (error) {
      console.error("Error getting watchlist data by ID:", error);
      return { status: Constant_Var_error, response: error.message };
    }
  },
}));

export default useUserStore;
