"use client";
import React, { useState, useEffect } from "react";
import UserInfo from "./Components/UserInfo";
import GetUserWatchLists from "../../firebase/WatchList/GetUserWatchLists";
import GetLoggedUserData from "../../firebase/Profile/GetLoggedUserData";
import {
  Constant_Var_errorMessage_noWatchListExists,
  Constant_Var_success,
} from "@/utils/constants";
import getUserAuth from "@/app/firebase/utils/GetCurrentUserAuth";
import GetOtherUserData from "@/app/firebase/Profile/GetOtherUserData";
import GetOtherUserWatchLists from "@/app/firebase/WatchList/GetOtherUserWatchLists";

const Profile = ({ params }) => {
  const [userData, setUserData] = useState(null);
  const [userWatchLists, setUserWatchLists] = useState(null);
  const [isLoggedInUser, setIsLoggedInUser] = useState(false);

  useEffect(() => {
    async function loadUserData() {
      const loggedInUser = await getUserAuth();

      let respUserInfo = null,
        respUserWatchLists = null;

      if (loggedInUser && loggedInUser.details.uid === params.id) {
        respUserInfo = GetLoggedUserData();
        respUserWatchLists = GetUserWatchLists();
        setIsLoggedInUser(true);
      } else {
        respUserInfo = GetOtherUserData(params.id);
        respUserWatchLists = GetOtherUserWatchLists(params.id);
        setIsLoggedInUser(false);
      }

      const resp = await Promise.all([respUserInfo, respUserWatchLists]);

      if (resp[0].status === Constant_Var_success)
        setUserData(resp[0].response);
      else {
        //some error
        console.log(resp[0], "userInfoerror error");
      }

      //setting watchLists for both case logged In user and other user
      if (resp[1].status === Constant_Var_success)
        setUserWatchLists(resp[1].response);
      else if (resp[1].response.message === Constant_Var_errorMessage_noWatchListExists) {
        //in case of creating profile
        const retry = await GetUserWatchLists();

        if (retry.status === Constant_Var_success)
          setUserWatchLists(retry.response);
        else {
          // some error
          console.log(retry, "retry watchlists");
        }
      } else {
        //some error
        console.log(resp[1], "watchlists error");
      }
    }
    loadUserData();
  }, []);

  return (
    <div className="w-[100vw] h-[100vh]">
      {userData && userWatchLists ? (
        <UserInfo userData={userData} isLoggedInUser={isLoggedInUser} />
      ) : (
        <div className="h-full w-full bg-black text-white flex items-center justify-center text-4xl">
          Loading...
        </div>
      )}
    </div>
  );
};

export default Profile;
