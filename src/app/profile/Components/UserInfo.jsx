'use client'
import React ,{useEffect,useState} from 'react'
import { Constant_Var_success } from "@/utils/constants";
import GetLoggedUserData from '../../firebase/Profile/GetLoggedUserData';
import GetUserWatchLists from '@/app/firebase/WatchList/GetUserWatchLists';

const UserInfo = ({loggedInUserData}) => {
   
return (  
  <div className="h-full w-full bg-black text-white flex items-center justify-center text-4xl"> Got dataaaaa</div>
  
  )
}

export default UserInfo