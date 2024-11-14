import GetLoggedUserData from "@/app/firebase/Profile/GetLoggedUserData";
import SignInGooglePopUp from "@/app/firebase/SignIn/SignInGooglePopUp";
import SignOut from "@/app/firebase/SignIn/SignOut";
import getUserAuth from "@/app/firebase/utils/GetUserAuth";
import GetWatchListDataById from "@/app/firebase/WatchList/WatchListAnimeList/GetWatchListDataById";
import GetLoggedUserWatchListsInfo from "@/app/firebase/WatchList/WatchListDocument/GetLoggedUserWatchListsInfo";
import { Constant_Var_starterWatchLists_recent, Constant_Var_success } from "@/utils/constants";
import { create } from "zustand";

const useUserStore = create((set, get) => ({
  isUserLoggedIn: false,
  loggedInUserId: null,
  loggedInUserData: null,
  loggedInUserWatchListsInfo: null,
  loadingData: false,
  RecentWatchListId:null,
  RecentWatchListData:null,
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
      for(let i=0; i<respUserWatchLists.response.length;++i){
        let ele=respUserWatchLists.response[i];

        if(ele.isSpecialStarter && ele.watchListName===Constant_Var_starterWatchLists_recent){
          set({
            loggedInUserData: respUserInfo.response,
            loggedInUserId: respUserInfo.response.uid,
            loggedInUserWatchListsInfo: respUserWatchLists.response,
            isUserLoggedIn: true,
            loadingData: false,
            RecentWatchListId:ele.id,
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
        RecentWatchListId:null
      });
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
    }
  },

 
  loadLoggedInUserRecentWatchList: async () => {
  
    let {RecentWatchListId}=get();

    if (RecentWatchListId) {
      const resp = await GetWatchListDataById({
        watchListId: RecentWatchListId,
        getAll:true,
      });

      if (resp.status === Constant_Var_success) {
        set({ RecentWatchListData: resp.response });
      }else{
        set({RecentWatchListData: null });
      }
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

  login: async () => {
    const res = await SignInGooglePopUp();

    if (res.status === Constant_Var_success) {
      await get().loadLoggedInUserDataAndWatchLists(); // Use get() to call the function
      // shhow success toast
    } else {
      // show error toast
    }
  },
}));

export default useUserStore;
