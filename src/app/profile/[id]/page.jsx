"use client";
import React, { useState, useEffect } from "react";
import UserInfo from "./Components/UserInfo";
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
import GetLoggedUserWatchListsInfo from "../../firebase/WatchList/GetLoggedUserWatchListsInfo";
import GetOtherUserWatchListsInfo from "@/app/firebase/WatchList/GetOtherUserWatchListsInfo";

const Profile = ({ params }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [userWatchListsInfo, setUserWatchListsInfo] = useState(null);
  const [isLoggedInUser, setIsLoggedInUser] = useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const router = useRouter();

  async function loadLoggedInUserData() {
    try {
      // Fetching in parallel
      const [respUserInfo, respUserWatchLists] = await Promise.all([
        GetLoggedUserData(params.id),
        GetLoggedUserWatchListsInfo(params.id),
      ]);

       // # Setting User Info #
      if (respUserInfo.status === Constant_Var_success) {
        setUserInfo(respUserInfo.response);
      } else if (
        respUserInfo.response.message ===
        Constant_Var_errorMessage_loggedInUserDoesNostExistsYet
      ) {

        // Create new profile if user doesn't exist
        setIsCreatingProfile(true);
        const profileCreationResponse = await CreateNewProfile();
        setIsCreatingProfile(false);

        if (profileCreationResponse.status === Constant_Var_success) {
          loadLoggedInUserData(); // Retry loading after profile creation
          return;
        } else {
          console.log("Error creating profile", profileCreationResponse.response);
          throw new Error("Error Creating Profile");
        }

      } else {
        console.log("Error loading user info", respUserInfo.response);
        throw new Error("Error Loading Profile");
      }


      // # Setting User WatchLists #
      if (respUserWatchLists.status === Constant_Var_success) {
        setUserWatchListsInfo(respUserWatchLists.response);
      } else {
        console.log("Load watchlists error", respUserWatchLists.response);
        throw new Error("Error Loading WatchLists");
      }

    } catch (error) {
      // show toast of error
    }
  }

  async function loadOtherUser() {
    try {
      const [respUserInfo, respUserWatchLists] = await Promise.all([
        GetOtherUserData(params.id),
        GetOtherUserWatchListsInfo(params.id),
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
      const loggedInUser = await getUserAuth();
      if (loggedInUser && loggedInUser.details.uid === params.id) {
        setIsLoggedInUser(true);
        await loadLoggedInUserData();
      } else {
        setIsLoggedInUser(false);
        await loadOtherUser();
      }
    }

    loadUserData();
  }, []);

  return (
    <div className="w-[100vw] h-[100vh] relative">
      {userInfo && userWatchListsInfo ? (
        <UserInfo
          userInfo={userInfo}
          reloadUserInfo={loadLoggedInUserData}
          isLoggedInUser={isLoggedInUser}
        />
      ) : (
        <div className="fixed inset-0 flex items-center justify-center text-center z-40 bg-white/30 backdrop-blur-sm text-white text-3xl ">
          {isCreatingProfile ? "...Creating Profile" : "...Loading"}

          {/* hellloooooo */}
        </div>
      )}
    </div>
  );
};

export default Profile;
