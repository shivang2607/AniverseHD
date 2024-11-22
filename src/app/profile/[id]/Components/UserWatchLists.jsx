import GetOtherUserWatchListsInfo from "@/app/firebase/WatchList/WatchListDocument/GetOtherUserWatchListsInfo";
import useUserStore from "@/Components/ZustandStores/userStore";
import {
  Constant_Var_errorMessage_userDoesNotExistWithThisId,
  Constant_Var_starterWatchLists_recent,
  Constant_Var_success,
} from "@/utils/constants";
import { useRouter } from "next/navigation";

import React, { useEffect, useState } from "react";
import WatchListsTabs from "./WatchListsTabs";
import WatchListPagination from "./WatchListPagination";

const UserWatchLists = ({ id }) => {
  const { isUserLoggedIn, loggedInUserId, loggedInUserWatchListsInfo } =
    useUserStore();
  const [userStarterWatchLists, setUserStarterWatchLists] = useState(null);
  const [userCustomWatchLists, setUserCustomWatchLists] = useState(null);
  const [selectedWatchList, setSelectedWatchList] = useState(null);
  const router = useRouter();

  async function loadOtherUser() {
    try {
      const respUserWatchLists = await GetOtherUserWatchListsInfo({
        userId: id,
      });
      // console.log(respUserWatchLists, "hello");
      // # Setting User Info #
      if (respUserWatchLists.status === Constant_Var_success){
        let starter=[],custom=[];
        for(let i=0; i<respUserWatchLists.response.length;++i){
            let obj= respUserWatchLists.response[i];
            if(!obj.isSpecialStarter){
              custom.push(obj);
            }else if(obj.isSpecialStarter && obj.watchListName!=Constant_Var_starterWatchLists_recent){
              starter.push(obj);
            }
        }
        setUserCustomWatchLists(custom);
        setUserStarterWatchLists(starter);
        if(starter.length>0)
        setSelectedWatchList(starter[0]);
        else setSelectedWatchList(custom[0]);
      }
      else if (
        respUserWatchLists.response.message ===
        Constant_Var_errorMessage_userDoesNotExistWithThisId
      )
        router.push("/404");
      else {
        console.log("userInfoerror error", respUserWatchLists.response);
        throw new Error("Error Loading User Profile");
      }
    } catch (error) {
      //show toast
    }
  }

  useEffect(() => {
    //loading other user data
    async function loadUserData() {
      if (!isUserLoggedIn || loggedInUserId !== id) {
        await loadOtherUser();
      }
    }
    loadUserData();
  }, [loggedInUserWatchListsInfo]);

  useEffect(() => {
    // loading loggedInuser Data
    async function loadUserData() {
      if (isUserLoggedIn && loggedInUserId === id) {
        let starter=[],custom=[];
        for(let i=0; i<loggedInUserWatchListsInfo.length;++i){
            let obj= loggedInUserWatchListsInfo[i];
            if(!obj.isSpecialStarter){
              custom.push(obj);
            }else if(obj.isSpecialStarter && obj.watchListName!=Constant_Var_starterWatchLists_recent){
              starter.push(obj);
            }
        }
        // console.log(starter,custom);
        setUserCustomWatchLists(custom);
        setUserStarterWatchLists(starter);
        setSelectedWatchList(starter[0]);
        // console.log(loggedInUserWatchListsInfo, "hello");
      }
    }

    loadUserData();
  }, [loggedInUserWatchListsInfo]);


  return (
    <>
      {userStarterWatchLists && userCustomWatchLists && selectedWatchList ? (
        <div>
          <div className="flex flex-row mt-5 ml-5">
            <WatchListsTabs
              StarterWatchLists={userStarterWatchLists}
              CustomWatchLists={userCustomWatchLists}
              setSelectedWatchList={setSelectedWatchList}
              selectedWatchList={selectedWatchList}
            />
          </div>
          
          <WatchListPagination selectedWatchList={selectedWatchList} />
     
        </div>
      ) : (
        <div className="fixed inset-0 flex items-center justify-center text-center z-40 bg-white/30 backdrop-blur-sm text-white text-3xl ">
          {"...Loading"}
        </div>
      )}
    </>
  );
};

export default UserWatchLists;
