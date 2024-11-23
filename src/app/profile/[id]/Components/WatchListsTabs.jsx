import DeleteWatchListById from "@/app/firebase/WatchList/DeleteWatchList";
import UpdatePublicPrivateWatchList from "@/app/firebase/WatchList/UpdateWatchLists/UpdatePublicPrivateWatchList";
import useUserStore from "@/components/ZustandStores/userStore";
import {
  Constant_Var_firebase_fieldValue_private,
  Constant_Var_firebase_fieldValue_public,
  Constant_Var_success,
} from "@/utils/constants";
import React, { useEffect, useState } from "react";

const WatchListsTabs = ({
  StarterWatchLists,
  CustomWatchLists,
  setSelectedWatchList,
  selectedWatchList,
  paramsUserId,
}) => {
  const { isUserLoggedIn, loggedInUserId, loadLoggedInUserWatchLists } =
    useUserStore();
  const [publicOrPrivate, setPublicOrPrivate] = useState(
    selectedWatchList.type
  );

  async function DeleteCurrentWatchList() {
    const resp = await DeleteWatchListById({
      watchListId: selectedWatchList.id,
    });

    if (resp.status === Constant_Var_success) {
      console.log(resp.status);
      loadLoggedInUserWatchLists();
    } else {
      console.error("error", resp.response);
    }
  }

  async function UpdatePublicPrivate(e) {
    const type = e.target.value;
    setPublicOrPrivate(type);
    const resp = await UpdatePublicPrivateWatchList({
      watchListId: selectedWatchList.id,
      type: type,
    });

    if (resp.status === Constant_Var_success) {
      console.log(resp.status);
      loadLoggedInUserWatchLists();
    } else {
      console.error("error", resp.response);
    }
  }

  return (
    <div className="flex flex-row w-full justify-between">
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

      {isUserLoggedIn && loggedInUserId === paramsUserId && (
        <div>
          {!selectedWatchList.isSpecialStarter && (
            <button
              className="px-4 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 transition-all"
              onClick={DeleteCurrentWatchList}
            >
              Delete Watchlist
            </button>
          )}
          <select defaultValue={publicOrPrivate} onChange={UpdatePublicPrivate}>
            <option value={Constant_Var_firebase_fieldValue_private}>
              {Constant_Var_firebase_fieldValue_private}
            </option>
            <option value={Constant_Var_firebase_fieldValue_public}>
              {Constant_Var_firebase_fieldValue_public}
            </option>
          </select>
        </div>
      )}
    </div>
  );
};

export default WatchListsTabs;
