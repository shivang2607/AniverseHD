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
  const [isCreatingProfile,setIsCreatingProfile]=useState(false);
  const [isLoadingData,setIsLoadingData]=useState(false);
  const router= useRouter();

  async function loadLoggedInUserData() {
    const respUserInfo = GetLoggedUserData(params.id);
    const respUserWatchLists = GetLoggedUserWatchListsInfo(params.id);
    setIsLoggedInUser(true);

    const resp = await Promise.all([respUserInfo, respUserWatchLists]);

    if (resp[0].status === Constant_Var_success) setUserInfo(resp[0].response);
    else if (
      resp[0].response.message ===
      Constant_Var_errorMessage_loggedInUserDoesNostExistsYet
    ) {

      // Creating New LoggedIn user Profile
      setIsCreatingProfile(true);
      const resp = await CreateNewProfile();
      setIsCreatingProfile(false);

      if (resp.status === Constant_Var_success) loadLoggedInUserData();
      else {
        //some error
        console.log("error Creating Profile", resp.response);
      }
      return;
    }
    //setting watchLists for both case logged In user and other user
    if (resp[1].status === Constant_Var_success)
      setUserWatchListsInfo(resp[1].response);
    else {
      //some error
      console.log("Load watchlists error", resp[1].response);
    }
  }

  async function loadOtherUser() {
    const respUserInfo = GetOtherUserData(params.id);
    const respUserWatchLists = GetOtherUserWatchListsInfo(params.id);
    setIsLoggedInUser(false);

    const resp = await Promise.all([respUserInfo, respUserWatchLists]);

    if (resp[0].status === Constant_Var_success) setUserInfo(resp[0].response);
    else {
      //some error
      if(resp[0].response.message===Constant_Var_errorMessage_userDoesNotExistWithThisId) router.push("/404")

      console.log("userInfoerror error", resp[0].response);
      return;
    }

    //setting watchLists for other user
    if (resp[1].status === Constant_Var_success)
      setUserWatchListsInfo(resp[1].response);
    else {
      //some error
      console.log("watchlists error", resp[1].response);
    }
  }

  useEffect(() => {
    async function loadUserData() {
      const loggedInUser = await getUserAuth();
      // setIsLoadingData(true);
      if (loggedInUser && loggedInUser.details.uid === params.id) {
       await loadLoggedInUserData();
      } else {
       await  loadOtherUser();
      }
      // setIsLoadingData(false);
    }
    loadUserData();
  }, []);

  return (
    <div className="w-[100vw] h-[100vh] relative">
      {userInfo && userWatchListsInfo ? (
        <UserInfo userInfo={userInfo} reloadUserInfo={loadLoggedInUserData} isLoggedInUser={isLoggedInUser} />
      ) : (     
          <div className="fixed inset-0 flex items-center justify-center text-center z-40 bg-white/30 backdrop-blur-sm text-white text-3xl ">
           {isCreatingProfile? "...Creating Profile":"...Loading"}

           {/* hellloooooo */}
          </div>
      )}
    </div>
  );
};

export default Profile;
