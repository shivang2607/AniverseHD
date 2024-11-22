"use client";
import React, { useState, useEffect } from "react";
import UserInfo from "./Components/UserInfo";
import UserWatchLists from "./Components/UserWatchLists";
import { Toaster } from "react-hot-toast";

const Profile = ({ params }) => {
  // const [userInfo, setUserInfo] = useState(null);
  // const [userWatchListsInfo, setUserWatchListsInfo] = useState(null);
  // const router = useRouter();

  // async function loadOtherUser() {
  //   try {
  //     const [respUserInfo, respUserWatchLists] = await Promise.all([
  //       GetOtherUserData({ userId: params.id }),
  //       GetOtherUserWatchListsInfo({ userId: params.id }),
  //     ]);

  //     // # Setting User Info #
  //     if (respUserInfo.status === Constant_Var_success)
  //       setUserInfo(respUserInfo.response);
  //     else if (
  //       respUserInfo.response.message ===
  //       Constant_Var_errorMessage_userDoesNotExistWithThisId
  //     )
  //       router.push("/404");
  //     else {
  //       console.log("userInfoerror error", respUserInfo.response);
  //       throw new Error("Error Loading User Profile");
  //     }

  //     // # Setting User WatchLists #
  //     if (respUserWatchLists.status === Constant_Var_success)
  //       setUserWatchListsInfo(respUserWatchLists.response);
  //     else {
  //       console.log("watchlists error", respUserWatchLists.response);
  //       throw new Error("Error Loading User WatchList");
  //     }
  //   } catch (error) {
  //     //show toast
  //   }
  // }

  // useEffect(() => {
  //   async function loadUserData() {
  //     if (!isUserLoggedIn || loggedInUserId !== params.id) {
  //       await loadOtherUser();
  //     }else if(isUserLoggedIn){
  //        setUserInfo(loggedInUserData);
  //        setUserWatchListsInfo(loggedInUserWatchListsInfo);
  //     }
  //   }
  //   loadUserData();
  // }, []);

  return (
    <div className="w-full min-h-[100vh]">
      <UserInfo id={params.id} />
      <UserWatchLists id={params.id} />
      <Toaster
        toastOptions={{
          style: {
            borderRadius: "10px",
            background: "#b6d7d4",
            border: "1px solid ",
            color: "#041C32",
          },
        }}
      />
    </div>
  );
};

export default Profile;
