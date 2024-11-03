"use client";
import React, { useState, useEffect } from "react";
import LoggedInUserInfo from "./Components/LoggedInUserInfo";
import GetLoggedUserData from "../../firebase/Profile/GetLoggedUserData";
import {
  Constant_Var_errorMessage_loggedInUserDoesNostExistsYet,
  Constant_Var_errorMessage_userDoesNotExistWithThisId,
  Constant_Var_success,
} from "@/utils/constants";
import getUserAuth from "@/app/firebase/utils/GetUserAuth";
import GetOtherUserData from "@/app/firebase/Profile/GetOtherUserData";
import CreateNewProfile from "@/app/firebase/Profile/CreateNewProfile";
import { useRouter } from "next/navigation";
import GetLoggedUserWatchListsInfo from "../../firebase/WatchList/WatchListDocument/GetLoggedUserWatchListsInfo";
import GetOtherUserWatchListsInfo from "@/app/firebase/WatchList/WatchListDocument/GetOtherUserWatchListsInfo";
import useUserStore from "@/components/utils/userStore";

const Profile = ({ params }) => {
  const { isUserLoggedIn, loggedInUserId } = useUserStore();
  const [userInfo, setUserInfo] = useState(null);
  const [userWatchListsInfo, setUserWatchListsInfo] = useState(null);
  const router = useRouter();

  async function loadOtherUser() {
    try {
      const [respUserInfo, respUserWatchLists] = await Promise.all([
        GetOtherUserData({ userId: params.id }),
        GetOtherUserWatchListsInfo({ userId: params.id }),
      ]);

      // # Setting User Info #
      if (respUserInfo.status === Constant_Var_success)
        setUserInfo(respUserInfo.response);
      else if (
        respUserInfo.response.message ===
        Constant_Var_errorMessage_userDoesNotExistWithThisId
      )
        router.push("/404");
      else {
        console.log("userInfoerror error", respUserInfo.response);
        throw new Error("Error Loading User Profile");
      }

      // # Setting User WatchLists #
      if (respUserWatchLists.status === Constant_Var_success)
        setUserWatchListsInfo(respUserWatchLists.response);
      else {
        console.log("watchlists error", respUserWatchLists.response);
        throw new Error("Error Loading User WatchList");
      }
    } catch (error) {
      //show toast
    }
  }

  useEffect(() => {
    async function loadUserData() {
      if (!isUserLoggedIn || loggedInUserId !== params.id) {
        await loadOtherUser();
      }
    }
    loadUserData();
  }, []);

  return (
    <div className="w-[100vw] h-[100vh] relative">
      {isUserLoggedIn && loggedInUserId == params.id ? (
        <LoggedInUserInfo />
      ) : (
        <div className="fixed inset-0 flex items-center justify-center text-center z-40 bg-white/30 backdrop-blur-sm text-white text-3xl ">
          {"...Loading"}

          {/* hellloooooo */}
        </div>
      )}
    </div>
  );
};

export default Profile;
