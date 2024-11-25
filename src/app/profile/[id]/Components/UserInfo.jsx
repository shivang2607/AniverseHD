"use client";
import React, { useEffect, useState } from "react";
import { FaRegEdit } from "react-icons/fa";
import Image from "next/image";
import CreateWatchListModal from "./CreateWatchListModal";
import EditUserProfileModal from "./EditUserProfileModal";
import useUserStore from "@/components/ZustandStores/userStore";
import GetOtherUserData from "@/app/firebase/Profile/GetOtherUserData";
import {
  Constant_Var_errorMessage_userDoesNotExistWithThisId,
  Constant_Var_success,
} from "@/utils/constants";
import { useRouter } from "next/navigation";

const UserInfo = ({ id }) => {
  const { isUserLoggedIn, loggedInUserId, loggedInUserData } = useUserStore();
  const [isCreateWatchListModalOpen, setIsCreateWatchListModalOpen] =
    useState(false);
  const [iseditUserProfileModalOpen, setIsEditUserProfileModalOpen] =
    useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const router = useRouter();

  async function loadOtherUser() {
    try {
      const respUserInfo = await GetOtherUserData({ userId: id });

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
        setUserInfo(loggedInUserData);
      }
    }

    loadUserData();
  }, [loggedInUserData]);

  const handleOpenEditUserProfileModal = () => {
    setIsEditUserProfileModalOpen(true);
  };

  const handleCloseEditUserProfileModal = () => {
    setIsEditUserProfileModalOpen(false);
  };

  const handleOpenCreateWatchListModal = () => {
    setIsCreateWatchListModalOpen(true);
  };

  const handleCloseCreateWatchListModal = () => {
    setIsCreateWatchListModalOpen(false);
  };

  return (
    <>
      {userInfo ? (
        <div
          style={{
            backgroundImage: `url('${userInfo.coverUrl}')`,
            backgroundColor: "#1f3146", // Fallback background color
          }}
          className={`w-full md:h-72 h-60 bg-no-repeat bg-cover bg-center `}
        >
          <div className="h-full w-full flex flex-row justify-between ">
            <div className="flex flex-row h-fit items-center mt-24 lg:ml-24 md:ml-14 sm:ml-10 ml-5">
              <Image
                height={200}
                width={200}
                src={userInfo.photoUrl}
                alt={"profile Image"}
                priority
                className="rounded-full lg:h-44 lg:w-44 md:h-44 md:w-44 sm:w-32 sm:h-32 w-28 h-28 border-2 border-white bg-cbg-400 object-cover object-center"
              />
              <div className="flex flex-col sm:ml-5 ml-3">
                <div className="w-auto sm:text-3xl text-2xl font-extrabold md:px-3 md:py-2 py-1 px-0 rounded-md backdrop-blur-0 ">
                  {userInfo.userName}
                </div>

                {isUserLoggedIn && loggedInUserId === id && (
                  <div className="flex flex-row w-fit sm:mt-2 mt-1 sm:hidden">
                    <button
                      className="bg-primary-100 md:py-2 md:px-3 py-1 px-2 mr-2 rounded-md w-fit h-fit text-primary-600 md:text-lg  sm:text-sm text-xs font-bold"
                      onClick={handleOpenCreateWatchListModal}
                    >
                      Create WatchList
                    </button>
                    <div className="bg-primary-100 md:pt-1.5 md:pr-1.5 md:pl-2.5 md:pb-2.5 sm:pt-1 sm:pr-1 sm:pl-2 sm:pb-2  pt-1 pr-0.5 pl-1.5 pb-1.5 md:text-lg sm:text-sm text-xs rounded-md cursor-pointer text-primary-600 h-fit font-bold">
                      <FaRegEdit onClick={handleOpenEditUserProfileModal} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {isUserLoggedIn && loggedInUserId === id && (
              <div className="sm:flex sm:flex-row mr-4 w-fit mt-24 hidden">
                <button
                  className="bg-primary-100 md:py-2 md:px-3 md:mr-2 py-1.5 px-2.5 mr-2.5 rounded-md w-fit h-fit text-primary-600 md:text-md  sm:text-sm font-bold"
                  onClick={handleOpenCreateWatchListModal}
                >
                  Create WatchList
                </button>
                <div
                  className="flex cursor-pointer flex-row items-center bg-sky-500 md:py-2 md:px-3 md:mr-2 py-1.5 px-2.5 mr-2.5 rounded-md w-fit h-fit text-primary-600 md:text-md  sm:text-sm font-bold"
                  onClick={handleOpenEditUserProfileModal}
                >
                  Edit Profile <FaRegEdit className="ml-2" />
                </div>
              </div>
            )}
          </div>

          {isUserLoggedIn && loggedInUserId === id && (
            <>
              <CreateWatchListModal
                isOpen={isCreateWatchListModalOpen}
                onClose={handleCloseCreateWatchListModal}
              />
              <EditUserProfileModal
                isOpen={iseditUserProfileModalOpen}
                onClose={handleCloseEditUserProfileModal}
              />
            </>
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

export default UserInfo;
