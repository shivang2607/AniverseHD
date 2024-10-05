"use client";
import axios from "axios";
import ResponsiveCarousal from "../components/Carousal";
import React, { useEffect } from "react";
import TopAiringCarousal from "@/components/TopAiringCarousal";
import RecommendationPanel from "@/components/recommendationPanel/RecommendationPanel";
import AllTop from "@/components/AllTop";
import GetLoggedUserData from "./firebase/Profile/GetLoggedUserData";
import { Constant_Var_errorMessage_loggedInUserDoesNostExistsYet, Constant_Var_success } from "@/utils/constants";
import SignOut, { ClearSessionandCookies } from "./firebase/SignIn/SignOut";
import getUserAuth from "./firebase/utils/GetUserAuth";
import useUserStore from "@/Components/utils/userStore";


export default function Page() {
  const { setIsUserLoggedIn, setLoggedInUserData, isUserLoggedIn, loggedInUserData} = useUserStore((state)=>({
    setIsUserLoggedIn: state.setIsUserLoggedIn,
    setLoggedInUserData: state.setLoggedInUserData,
    isUserLoggedIn:state.isUserLoggedIn,
    loggedInUserData: state.loggedInUserData,
  }));

  useEffect(() => {
    async function f() {
      const res2 = await axios.get("api/v1/anime/31490");
      const res = await axios.get("/api/v1/watch/1");
      console.log("response for watch anime api : ", res.data);
      const streamingData = await axios.get(
        `/api/v1/gogo/stream/${res.data.gogoSub.episodes[0].id}`
      );
      const streamingZoro = await axios.get(
        `api/v1/zoro/stream/${res.data.zoro.episodes[0].episodeId}`,
        {
          params: {
            // server:"vidstreaming",  //both parameters are optional parameters : vidstreaming is working, streamtape is working as well, other servers cant be guranteed to work
            category: "sub", //default is sub, other options are "dub", "raw"
          },
        }
      );
      console.log("streaming data :: ", streamingData?.data);
      console.log("zoro streaming data:", streamingZoro?.data);
    }
    // f()
  }, []);

  async function loadLoggedInUserData() {
    try {
      // Fetching
      const respUserInfo = await GetLoggedUserData();

      // # Setting User Info #
      if (respUserInfo.status === Constant_Var_success) {
        console.log("hellllo",respUserInfo.response);
        setIsUserLoggedIn(true);
        setLoggedInUserData(respUserInfo.response);
      } else if (
        respUserInfo.response.message ===
        Constant_Var_errorMessage_loggedInUserDoesNostExistsYet
      ) {

        throw respUserInfo.response; //LoggedIn but user Data is not created

      } else {
        console.log("Error loading user info", respUserInfo.response);
        throw new Error("Error Loading Profile");
      }
      
    } catch (error) {
      if(error.message===Constant_Var_errorMessage_loggedInUserDoesNostExistsYet) await SignOut();
      else{
         // show toast of error

      }
    }
  }

  useEffect(() => {
    async function loadUserData() {
      const loggedInUser = await getUserAuth();
      console.log("loading",loggedInUser);
      if (loggedInUser) await loadLoggedInUserData();
      else {
        ClearSessionandCookies();
      }
    }
    loadUserData();
  }, []);

  useEffect(()=>{
    console.log( isUserLoggedIn, loggedInUserData,"hhhhhhhhhhhh");
   },[ isUserLoggedIn, loggedInUserData])

  return (
    <div>
      <ResponsiveCarousal />
      <TopAiringCarousal />
      <RecommendationPanel />
      <AllTop />
    </div>
  );
}
