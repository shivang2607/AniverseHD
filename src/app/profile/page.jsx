"use client"
import React, { useState,useEffect } from "react";
import UserInfo from "./Components/UserInfo";
import GetUserWatchLists from "../firebase/WatchList/GetUserWatchLists";
import GetLoggedUserData from "../firebase/Profile/GetLoggedUserData";
import { Constant_Var_success } from "@/utils/constants";


const Profile = () => {
  const [loggedInUserData,setLoggedInUserData]=useState(null);
  const [loggedInUserWatchLists,setLoggedInUserWatchLists]=useState(null);


  useEffect(() => {
    async function loadUserData() {
    const respUserInfo= GetLoggedUserData();
    const respUserWatchLists= GetUserWatchLists();
    
    const resp= await Promise.all([respUserInfo,respUserWatchLists]);
    
    if(resp[0].status===Constant_Var_success) setLoggedInUserData(resp[0].response);
    else{
      // show error Toast
    }

    if(resp[1].status===Constant_Var_success) setLoggedInUserWatchLists(resp[1].response);
    else{
      // show error Toast
    } 
    }
    loadUserData();
  }, []);
  return (
    <div className="w-[100vw] h-[100vh]">

    { (loggedInUserData && loggedInUserWatchLists )?(
       <UserInfo loggedInUserData={loggedInUserData}/>
    ):(
      <div className="h-full w-full bg-black text-white flex items-center justify-center text-4xl">Loading...</div>
    )}
   
    </div>
  ) ;
};

export default Profile;
