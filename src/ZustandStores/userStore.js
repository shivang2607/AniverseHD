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
import AddAnimeToWatchList from "@/app/firebase/WatchList/UpdateWatchLists/AddAnimeToWatchList";
import ChangeWatchListName from "@/app/firebase/WatchList/UpdateWatchLists/ChangeWatchListName";
import UpdatePublicPrivateWatchList from "@/app/firebase/WatchList/UpdateWatchLists/UpdatePublicPrivateWatchList";

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
  getWatchlistById as getHybridWatchlistById,
  addAnimeToWatchlist as addHybridAnimeToWatchlist,
  updateWatchlistName as updateHybridWatchlistName,
  updateWatchlistPrivacy as updateHybridWatchlistPrivacy
} from "@/services/hybrid/watchlistService";

// Cloudflare imports (for future cloudflare-only mode)
import {
  getLoggedUserData as getCloudflareUserData,
  createOrUpdateUserProfile as createCloudflareUserProfile,
  updateUserName as updateCloudflareUserName,
  updateUserProfileImage as updateCloudflareUserProfileImage,
  updateUserCoverImage as updateCloudflareUserCoverImage
} from "@/services/api/userService";
import {
  getUserWatchlists as getCloudflareWatchlists,
  createWatchlist as createCloudflareWatchlist,
  deleteWatchlist as deleteCloudflareWatchlist,
  removeAnimeFromWatchlist as removeCloudflareAnimeFromWatchlist,
  getWatchlistById as getCloudflareWatchlistById,
  addAnimeToWatchlist as addCloudflareAnimeToWatchlist,
  updateWatchlist as updateCloudflareWatchlist
} from "@/services/api/watchlistService";

import {
  Constant_Var_starterWatchLists_recent,
  Constant_Var_success,
} from "@/utils/constants";
import toast from "react-hot-toast";
import { create } from "zustand";
import { getDataSource } from "@/config/dataSource";

/**
 * Data source modes:
 * - 'firebase': Original Firebase-only mode (default)
 * - 'hybrid': Dual-write to both Firebase and Cloudflare, read from Cloudflare only (no fallback)
 * - 'cloudflare': Cloudflare-only mode (future)
 */

const uploadImageToStorage = async (blob, type) => {
  // For now, use Firebase Storage even in Cloudflare mode
  // You can replace this with Cloudflare R2 or other storage later
  const { default: UploadImageToFirebaseStorage } = await import('@/app/firebase/utils/UploadImageToFirebaseStorage');
  const result = await UploadImageToFirebaseStorage({
    blob,
    folderName: type === 'profile' ? 'profileImages' : 'coverImages'
  });

  if (result.status === Constant_Var_success) {
    return result.response;
  } else {
    throw new Error('Image upload failed');
  }
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

  // Data source state
  dataSource: getDataSource(),
  lastHybridResults: null,


  loadLoggedInUserDataAndWatchLists: async () => {
    set({ loadingData: true });
    const mode = get().dataSource;

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
      } else if (mode === 'cloudflare') {
        // Cloudflare mode: use Cloudflare-only services
        [respUserInfo, respUserWatchLists] = await Promise.all([
          getCloudflareUserData(),
          getCloudflareWatchlists(),
        ]);
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
    const mode = get().dataSource;

    try {
      let respUserInfo;

      console.log("jelloooooooo", mode);

      if (mode === 'hybrid') {
        respUserInfo = await getHybridUserData();
        set({ lastHybridResults: { userInfo: respUserInfo.hybridResults } });
      } else if (mode === 'cloudflare') {
        respUserInfo = await getCloudflareUserData();
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
    const mode = get().dataSource;

    try {
      let respWatchLists;

      if (mode === 'hybrid') {
        respWatchLists = await getHybridWatchlists();
        set({ lastHybridResults: { watchlists: respWatchLists.hybridResults } });
      } else if (mode === 'cloudflare') {
        respWatchLists = await getCloudflareWatchlists();
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
    let { RecentWatchListId, dataSource } = get();

    if (RecentWatchListId) {
      try {
        let resp;

        if (dataSource === 'hybrid') {
          resp = await getHybridWatchlistById({
            watchListId: RecentWatchListId,
            getAll: true,
          });
        } else if (dataSource === 'cloudflare') {
          resp = await getCloudflareWatchlistById(RecentWatchListId);
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
    const mode = get().dataSource;

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
      } else if (mode === 'cloudflare') {
        resp = await updateCloudflareUserName(userName);
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
    const mode = get().dataSource;

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
      } else if (mode === 'cloudflare') {
        // For Cloudflare mode, we need to upload image first, then update profile
        // This is a simplified version - you might want to implement proper image upload
        const imageUrl = await uploadImageToStorage(blob, 'profile');
        resp = await updateCloudflareUserProfileImage(imageUrl);
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
    const mode = get().dataSource;

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
      } else if (mode === 'cloudflare') {
        // For Cloudflare mode, we need to upload image first, then update profile
        const imageUrl = await uploadImageToStorage(blob, 'cover');
        resp = await updateCloudflareUserCoverImage(imageUrl);
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
    const mode = get().dataSource;

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
      } else if (mode === 'cloudflare') {
        resp = await createCloudflareWatchlist({
          watchListName: watchListName,
          type: type,
        });
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
    const mode = get().dataSource;

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
      } else if (mode === 'cloudflare') {
        resp = await deleteCloudflareWatchlist(watchListId);
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
    const mode = get().dataSource;

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
      } else if (mode === 'cloudflare') {
        resp = await removeCloudflareAnimeFromWatchlist(watchListId, animeId);
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

    const res = await SignInGooglePopUp((res) => { callback(res) });

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

  // Additional watchlist operations
  addAnimeToWatchList: async ({ watchListId, animeId, animeData, url = null }) => {
    const mode = get().dataSource;

    try {
      let resp;

      if (mode === 'hybrid') {
        resp = await addHybridAnimeToWatchlist({ watchListId, animeData, url });
        set({ lastHybridResults: { addAnime: resp.hybridResults } });

        if (resp.hybridResults && (!resp.hybridResults.firebase || !resp.hybridResults.cloudflare)) {
          const failedSystem = !resp.hybridResults.firebase ? 'Firebase' : 'Cloudflare';
          toast.warning(`Warning: ${failedSystem} add failed, but operation succeeded`, {
            id: "hybrid-warning",
            duration: 5000,
          });
        }
      } else if (mode === 'cloudflare') {
        resp = await addCloudflareAnimeToWatchlist(watchListId, animeData, url);
      } else {
        resp = await AddAnimeToWatchList({ watchListId, animeId, animeData, url });
      }

      return resp;
    } catch (error) {
      console.error('Error adding anime to watchlist:', error);
      return { status: Constant_Var_error, response: error.message };
    }
  },

  changeWatchListName: async ({ watchListId, newName }) => {
    const mode = get().dataSource;

    try {
      let resp;

      if (mode === 'hybrid') {
        resp = await updateHybridWatchlistName({ watchListId, newName });
        set({ lastHybridResults: { changeName: resp.hybridResults } });

        if (resp.hybridResults && (!resp.hybridResults.firebase || !resp.hybridResults.cloudflare)) {
          const failedSystem = !resp.hybridResults.firebase ? 'Firebase' : 'Cloudflare';
          toast.warning(`Warning: ${failedSystem} name change failed, but operation succeeded`, {
            id: "hybrid-warning",
            duration: 5000,
          });
        }
      } else if (mode === 'cloudflare') {
        resp = await updateCloudflareWatchlist(watchListId, { watchListName: newName });
      } else {
        resp = await ChangeWatchListName({ watchListId, newName });
      }

      if (resp.status === Constant_Var_success) {
        toast.success("Watchlist name updated successfully", {
          id: "1",
          duration: 3000,
        });
        await get().loadLoggedInUserWatchLists();
      } else {
        toast.error("Error updating watchlist name", {
          id: "1",
          duration: 3000,
        });
      }

      return resp;
    } catch (error) {
      console.error('Error changing watchlist name:', error);
      toast.error("Error updating watchlist name", {
        id: "1",
        duration: 3000,
      });
      return { status: Constant_Var_error, response: error.message };
    }
  },

  updateWatchListPrivacy: async ({ watchListId, type }) => {
    const mode = get().dataSource;

    try {
      let resp;

      if (mode === 'hybrid') {
        resp = await updateHybridWatchlistPrivacy({ watchListId, type });
        set({ lastHybridResults: { updatePrivacy: resp.hybridResults } });

        if (resp.hybridResults && (!resp.hybridResults.firebase || !resp.hybridResults.cloudflare)) {
          const failedSystem = !resp.hybridResults.firebase ? 'Firebase' : 'Cloudflare';
          toast.warning(`Warning: ${failedSystem} privacy update failed, but operation succeeded`, {
            id: "hybrid-warning",
            duration: 5000,
          });
        }
      } else if (mode === 'cloudflare') {
        resp = await updateCloudflareWatchlist(watchListId, { type });
      } else {
        resp = await UpdatePublicPrivateWatchList({ watchListId, type });
      }

      if (resp.status === Constant_Var_success) {
        toast.success("Watchlist privacy updated successfully", {
          id: "1",
          duration: 3000,
        });
        await get().loadLoggedInUserWatchLists();
      } else {
        toast.error("Error updating watchlist privacy", {
          id: "1",
          duration: 3000,
        });
      }

      return resp;
    } catch (error) {
      console.error('Error updating watchlist privacy:', error);
      toast.error("Error updating watchlist privacy", {
        id: "1",
        duration: 3000,
      });
      return { status: Constant_Var_error, response: error.message };
    }
  },

  /**
   * Get other user's profile data (for viewing other users' profiles)
   * @param {string} userId - User ID to fetch
   * @returns {Promise<{status: string, response: any}>}
   */
  getOtherUserData: async ({ userId }) => {
    const mode = get().dataSource;

    try {
      // Import Firebase function for other user data
      const { default: GetOtherUserData } = await import('@/app/firebase/Profile/GetOtherUserData');

      // For now, always use Firebase for other user data (read-only operation)
      // TODO: Add Cloudflare support when public user profiles API is ready
      const resp = await GetOtherUserData({ userId });
      return resp;
    } catch (error) {
      console.error('Error getting other user data:', error);
      return { status: Constant_Var_error, response: error.message };
    }
  },

  /**
   * Get other user's public watchlists (for viewing other users' profiles)
   * @param {string} userId - User ID to fetch watchlists for
   * @returns {Promise<{status: string, response: any}>}
   */
  getOtherUserWatchlists: async ({ userId }) => {
    const mode = get().dataSource;

    try {
      // Import Firebase function for other user watchlists
      const { default: GetOtherUserWatchListsInfo } = await import('@/app/firebase/WatchList/WatchListDocument/GetOtherUserWatchListsInfo');

      // For now, always use Firebase for other user watchlists (read-only operation)
      // TODO: Add Cloudflare support when public watchlists API is ready
      const resp = await GetOtherUserWatchListsInfo({ userId });
      return resp;
    } catch (error) {
      console.error('Error getting other user watchlists:', error);
      return { status: Constant_Var_error, response: error.message };
    }
  },

  /**
   * Get watchlist data by ID with pagination support
   * @param {Object} params - Parameters
   * @param {string} params.watchListId - Watchlist ID
   * @param {number} params.offset - Offset for pagination (optional)
   * @param {number} params.pageSize - Page size for pagination (optional)
   * @param {boolean} params.getAll - Whether to get all data
   * @returns {Promise<{status: string, response: any}>}
   */
  getWatchlistDataById: async ({ watchListId, offset = null, pageSize = null, getAll = false }) => {
    const mode = get().dataSource;

    try {
      let resp;

      if (mode === 'hybrid') {
        resp = await getHybridWatchlistById({ watchListId, offset, pageSize, getAll });
      } else if (mode === 'cloudflare') {
        resp = await getCloudflareWatchlistById(watchListId);

        // Apply client-side pagination if needed
        if (!getAll && offset !== null && pageSize !== null && resp.status === Constant_Var_success) {
          const animeList = resp.response?.animeList || resp.response || [];
          const paginatedList = animeList.slice(offset, offset + pageSize);
          resp = {
            status: Constant_Var_success,
            response: paginatedList
          };
        }
      } else {
        resp = await GetWatchListDataById({ watchListId, offset, pageSize, getAll });
      }

      return resp;
    } catch (error) {
      console.error('Error getting watchlist data by ID:', error);
      return { status: Constant_Var_error, response: error.message };
    }
  },
}));

export default useUserStore;
