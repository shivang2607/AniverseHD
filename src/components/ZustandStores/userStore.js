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
import {
  Constant_Var_starterWatchLists_recent,
  Constant_Var_success,
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
  hideWatchlistBar : true, 
  selectedId : null,
  listData : [],
  

  setIsUserLoggedIn: (status) => set({ isUserLoggedIn: status }),
  setLoggedInUserData: (data) => set({ loggedInUserData: data }),

  loadLoggedInUserDataAndWatchLists: async () => {
    set({ loadingData: true });
    const [respUserInfo, respUserWatchLists] = await Promise.all([
      GetLoggedUserData(),
      GetLoggedUserWatchListsInfo(),
    ]);

    if (
      respUserInfo.status === Constant_Var_success &&
      respUserWatchLists.status === Constant_Var_success
    ) {
      for (let i = 0; i < respUserWatchLists.response.length; ++i) {
        let ele = respUserWatchLists.response[i];

        if (
          ele.isSpecialStarter &&
          ele.watchListName === Constant_Var_starterWatchLists_recent
        ) {
          set({
            loggedInUserData: respUserInfo.response,
            loggedInUserId: respUserInfo.response.uid,
            loggedInUserWatchListsInfo: respUserWatchLists.response,
            isUserLoggedIn: true,
            loadingData: false,
            RecentWatchListId: ele.id,
          });
          break;
        }
      }
    } else {
      set({
        loggedInUserData: null,
        loggedInUserId: null,
        isUserLoggedIn: false,
        loggedInUserWatchListsInfo: null,
        loadingData: false,
        RecentWatchListId: null,
      });
      // console.log("userinfo",respUserInfo.response, "userWatchlist:",respUserWatchLists.response)
    }
  },

  loadLoggedInUserData: async () => {
    set({ loadingData: true });
    const respUserInfo = await GetLoggedUserData();

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
  },

  loadLoggedInUserWatchLists: async () => {
    set({ loadingData: true });
    const respWatchLists = await GetLoggedUserWatchListsInfo();

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
      toast.error("Error loading User WathLists", {
        id: "1",
        duration: 3000,
      });
    }
  },

  loadLoggedInUserRecentWatchList: async () => {
    let { RecentWatchListId } = get();

    if (RecentWatchListId) {
      const resp = await GetWatchListDataById({
        watchListId: RecentWatchListId,
        getAll: true,
      });

      if (resp.status === Constant_Var_success) {
        set({ RecentWatchListData: resp.response });
      } else {
        set({ RecentWatchListData: null });
      }
    }
  },

  updateUserName: async ({ userName }) => {
    // console.log("userName",userName);
    const resp = await UpdateName({ userName: userName });

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
  },

  updateProfileImaeg: async ({ blob }) => {
    const { loadLoggedInUserData } = get();
    const resp = await UpdateProfileImage({ blob: blob });
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
  },

  updateCoverImage: async ({ blob }) => {
    const resp = await UpdateCoverImage({ blob: blob });
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
  },

  createWatchList: async ({ type, watchListName }) => {
    const resp = await CreateWatchList({
      type: type,
      watchListName: watchListName,
    });
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
  },

  deleteWatchList: async ({ watchListId }) => {
    const resp = await DeleteWatchListById({ watchListId: watchListId });
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
  },

  removeAnimeFromWatchList: async ({ animeId, watchListId }) => {
    const resp = await RemoveAnimeFromWatchList({
      watchListId: watchListId,
      animeId: animeId,
    });
    if (resp.status === Constant_Var_success) {
      toast.success("Anime Rmoved Successfully", {
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

  toggleHideWatchlistBar : () => set({hideWatchlistBar: !(get().hideWatchlistBar)}),

  setSelectedId : (selectedId) => set({selectedId}),

  setListData : (listData) => set({listData}),
}));

export default useUserStore;
