import GetOtherUserWatchListsInfo from "@/app/firebase/WatchList/WatchListDocument/GetOtherUserWatchListsInfo";
import useUserStore from "@/components/ZustandStores/userStore";
import {
  Constant_Var_errorMessage_userDoesNotExistWithThisId,
  Constant_Var_starterWatchLists_recent,
  Constant_Var_success,
} from "@/utils/constants";
import { useRouter } from "next/navigation";

import React, { use, useEffect, useState } from "react";
import WatchListsTabs from "./WatchListsTabs";
import WatchListPagination from "./WatchListPagination";
import useGlobalLoader from "@/components/ZustandStores/useGlobalLoader";
import FailCaseLoader from "@/components/FailCaseLoader";
import toast from "react-hot-toast";

const UserWatchLists = ({ id }) => {
  const { isUserLoggedIn, loggedInUserId, loggedInUserWatchListsInfo } =
    useUserStore();
  const { setLoaderText, setIsLoaderVisible, setImageUrl } = useGlobalLoader();
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
      if (respUserWatchLists.status === Constant_Var_success) {
        let starter = [],
          custom = [];
        for (let i = 0; i < respUserWatchLists.response.length; ++i) {
          let obj = respUserWatchLists.response[i];
          if (!obj.isSpecialStarter) {
            custom.push(obj);
          } else if (
            obj.isSpecialStarter &&
            obj.watchListName != Constant_Var_starterWatchLists_recent
          ) {
            starter.push(obj);
          }
        }
        setUserCustomWatchLists(custom);
        setUserStarterWatchLists(starter);
        if (starter.length > 0) setSelectedWatchList(starter[0]);
        else if (custom.length > 0) setSelectedWatchList(custom[0]);
      } else if (
        respUserWatchLists.response.message ===
        Constant_Var_errorMessage_userDoesNotExistWithThisId
      )
        router.push("/404");
      else {
        // console.log("userInfoerror error", respUserWatchLists.response);
        throw new Error("Error Loading User Profile");
      }
    } catch (error) {
      //show toast
      toast.error("Error Loading Profile", {
        id: "4",
        duration: 3000,
      });
    }
  }

  useEffect(() => {
    //loading other user data
    async function loadUserData() {
      if (
        isUserLoggedIn !== null &&
        (isUserLoggedIn === false || loggedInUserId !== id)
      ) {
        await loadOtherUser();
      }
    }
    loadUserData();
  }, [loggedInUserId,isUserLoggedIn]);

  useEffect(() => {
    // loading loggedInuser Data
    async function loadUserData() {
      if (isUserLoggedIn && loggedInUserId === id) {
        let starter = [],
          custom = [];
        for (let i = 0; i < loggedInUserWatchListsInfo.length; ++i) {
          let obj = loggedInUserWatchListsInfo[i];
          if (!obj.isSpecialStarter) {
            custom.push(obj);
          } else if (
            obj.isSpecialStarter &&
            obj.watchListName != Constant_Var_starterWatchLists_recent
          ) {
            starter.push(obj);
          }
        }

        /* for keeping selectedWatchList same between rerenders due to anime removal, in case of delete watchlist the selectedWatchList is set with a new watchList */
        // console.log("he",selectedWatchList,custom,starter,userCustomWatchLists,userStarterWatchLists);
        if (
          selectedWatchList === null ||
          custom.length + starter.length !==
            userCustomWatchLists.length + userStarterWatchLists.length
        ) {
          setSelectedWatchList(starter[0]);
        } else {
          let sel = starter.filter((ele) => {
            return ele.id === selectedWatchList.id;
          });
          if (sel.length == 0)
            sel = custom.filter((ele) => {
              return ele.id === selectedWatchList.id;
            });
          // console.log(sel,"hello",selectedWatchList,starter,custom);
          if (sel.length > 0) setSelectedWatchList(sel[0]);
          else setSelectedWatchList(starter[0]);
        }

        setUserCustomWatchLists(custom);
        setUserStarterWatchLists(starter);
      }
    }
    loadUserData();
  }, [loggedInUserWatchListsInfo]);

  useEffect(() => {
    if (userStarterWatchLists == null || userCustomWatchLists == null) {
      setIsLoaderVisible(true);
      setImageUrl(" /userProfileImage7.jpg");
      setLoaderText("Loading User Data");
    } else {
      setIsLoaderVisible(false);
      setImageUrl(null);
      setLoaderText(null);
    }
  }, [userStarterWatchLists, userCustomWatchLists]);

  return (
    <>
      {
        userStarterWatchLists && userCustomWatchLists && selectedWatchList ? (
          <div>
            <div className="flex flex-row mt-5 mx-2">
              <WatchListsTabs
                StarterWatchLists={userStarterWatchLists}
                CustomWatchLists={userCustomWatchLists}
                setSelectedWatchList={setSelectedWatchList}
                selectedWatchList={selectedWatchList}
                paramsUserId={id}
              />
            </div>

            <WatchListPagination
              selectedWatchList={selectedWatchList}
              key={selectedWatchList.id}
            />
          </div>
        ) : (
          userStarterWatchLists &&
          userCustomWatchLists &&
          userStarterWatchLists.length === 0 &&
          userCustomWatchLists.length === 0 && (
            <div className="w-full h-[60vh]">
              {" "}
              <FailCaseLoader
                imageUrl={"/NoData.gif"}
                loaderText={
                  isUserLoggedIn && loggedInUserId === id
                    ? "No WatchLists Found"
                    : "No Public WatchLists Availabe"
                }
              />
            </div>
          )
        )
        // : (
        //   <div className="fixed inset-0 flex items-center justify-center text-center z-40 bg-white/30 backdrop-blur-sm text-white text-3xl ">
        //     {"...Loading"}
        //   </div>
        // )
      }
    </>
  );
};

export default UserWatchLists;
