"use client";
import React, { useEffect, useState } from "react";
import { FaRegEdit } from "react-icons/fa";
import Image from "next/image";
import CreateWatchListModal from "./CreateWatchListModal";

const UserInfo = ({ userData, isLoggedInUser }) => {
  const [isCreateWatchListModalOpen,setIsCreateWatchListModalOpen]= useState(false);
  const handleOpenModal = () => {
    setIsCreateWatchListModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateWatchListModalOpen(false);
  };
  return (
    <div
      style={{
        backgroundImage: `url('${userData.coverUrl}')`,
        backgroundColor: "#1f3146", // Fallback background color
      }}
      className={`w-full h-72 bg-no-repeat bg-cover bg-center `}
    >
      <div className="h-full w-full flex flex-row justify-between ">
        <div className="flex flex-row h-fit items-center mt-24 lg:ml-24 md:ml-14 sm:ml-10 ml-5">
          <Image
            height={200}
            width={200}
            src={userData.photoUrl}
            alt={"profile Image"}
            priority
            className="rounded-full lg:h-44 lg:w-44 md:h-44 md:w-44 sm:w-32 sm:h-32 w-28 h-28 border-2 border-primary-100 bg-gray-300"
          />
          <div className="flex flex-col sm:ml-5 ml-3">
            <div className="w-auto sm:text-3xl text-2xl  font-extrabold rounded-lg">
              {userData.userName}
            </div>

            {isLoggedInUser && (
              <div className="flex flex-row w-fit sm:mt-2 mt-1 sm:hidden">
                <button className="backdrop-blur-md bg-white/30 md:py-2 md:px-3 py-1 px-2 mr-2 rounded-md w-fit h-fit text-primary-600 md:text-lg  sm:text-sm text-xs font-bold">
                  Create WatchList
                </button>
                <div className="md:pt-1.5 md:pr-1.5 md:pl-2.5 md:pb-2.5 sm:pt-1 sm:pr-1 sm:pl-2 sm:pb-2  pt-1 pr-0.5 pl-1.5 pb-1.5 md:text-lg sm:text-sm text-xs rounded-md backdrop-blur-md bg-white/30 cursor-pointer text-primary-600 h-fit font-bold">
                  <FaRegEdit />
                </div>
              </div>
            )}
          </div>
        </div>

        {isLoggedInUser && (
          <div className="sm:flex sm:flex-row mr-4 w-fit mt-24 hidden">
            <button className="backdrop-blur-md bg-white/30 md:py-2 md:px-3 md:mr-2 py-1.5 px-2.5 mr-2.5 rounded-md w-fit h-fit text-primary-600 md:text-md  sm:text-sm font-bold" onClick={handleOpenModal}>
              Create WatchList
            </button>
            <div className="md:pt-1.5 md:pr-1.5 md:pl-2.5 md:pb-2.5 sm:pt-1 sm:pr-1 sm:pl-2 sm:pb-2 md:text-xl sm:text-lg rounded-md backdrop-blur-md bg-white/30 cursor-pointer text-primary-600 h-fit font-bold" onClick={handleCloseModal}>
              <FaRegEdit />
            </div>
          </div>
        )}
      </div>
     <CreateWatchListModal isOpen={isCreateWatchListModalOpen} onClose={handleCloseModal}/>
    </div>
  );
};

export default UserInfo;
