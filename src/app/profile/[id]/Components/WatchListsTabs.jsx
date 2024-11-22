import useUserStore from "@/Components/ZustandStores/userStore";
import React, { useEffect, useState } from "react";

const WatchListsTabs = ({
  StarterWatchLists,
  CustomWatchLists,
  setSelectedWatchList,
  selectedWatchList,
}) => {
  const { isUserLoggedIn, loggedInUserId} =
  useUserStore();
  return (
    <div className="flex flex-row w-full">
      <div className="watchlist-tabs flex flex-row w-[60%] overflow-x-auto no-scrollbar space-x-3 py-2">
        {StarterWatchLists.map((ele, ind) => (
          <div
            key={ind}
            className={`px-4 py-2 rounded-lg cursor-pointer text-nowrap text-sm font-semibold transition-all duration-200 ease-in-out transform ${
              selectedWatchList.id === ele.id
                ? "bg-primary-100 text-white border border-gray-500 shadow-md"
                : "bg-primary-500 text-gray-300 border border-gray-600 hover:bg-gray-700 hover:text-white hover:shadow-lg hover:scale-105"
            }`}
            onClick={() => setSelectedWatchList(ele)}
          >
            {ele.watchListName}
          </div>
        ))}

        {CustomWatchLists.map((ele, ind) => (
          <div
            key={ind}
            className={`px-4 py-2 rounded-lg cursor-pointer text-nowrap text-sm font-semibold transition-all duration-200 ease-in-out transform ${
              selectedWatchList.id === ele.id
                ? "bg-gray-700 text-white border border-gray-500 shadow-md"
                : "bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700 hover:text-white hover:shadow-lg hover:scale-105"
            }`}
            onClick={() => setSelectedWatchList(ele)}
          >
            {ele.watchListName}
          </div>
        ))}
      </div>

      <div>
        
      </div>
    </div>
  );
};

export default WatchListsTabs;
