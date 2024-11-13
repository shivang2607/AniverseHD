import GetOtherUserWatchListsInfo from "@/app/firebase/WatchList/WatchListDocument/GetOtherUserWatchListsInfo";
import useUserStore from "@/components/ZustandStores/userStore";
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
  const [userWatchLists, setUserWatchLists] = useState(null);
  const [selectedWatchList, setSelectedWatchList] = useState(null);
  const router = useRouter();

  async function loadOtherUser() {
    try {
      const respUserWatchLists = await GetOtherUserWatchListsInfo({
        userId: id,
      });
      console.log(respUserWatchLists, "hello");
      // # Setting User Info #
      if (respUserWatchLists.status === Constant_Var_success)
        setUserWatchLists(respUserWatchLists.response);
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
  }, []);

  useEffect(() => {
    // loading loggedInuser Data
    async function loadUserData() {
      if (isUserLoggedIn && loggedInUserId === id) {
        setUserWatchLists(loggedInUserWatchListsInfo);
        // console.log(loggedInUserWatchListsInfo, "hello");
      }
    }

    loadUserData();
  }, [loggedInUserWatchListsInfo]);

  return (
    <>
      {userWatchLists ? (
        <div>
          <div className="flex flex-row mt-5 ml-5">
            <WatchListsTabs
              WatchLists={userWatchLists}
              setSelectedWatchList={setSelectedWatchList}
              selectedWatchList={selectedWatchList}
            />
          </div>
          {selectedWatchList && (
            <WatchListPagination selectedWatchList={selectedWatchList} />
          )}
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
