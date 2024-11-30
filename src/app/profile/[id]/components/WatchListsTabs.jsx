import DeleteWatchListById from "@/app/firebase/WatchList/DeleteWatchList";
import UpdatePublicPrivateWatchList from "@/app/firebase/WatchList/UpdateWatchLists/UpdatePublicPrivateWatchList";
import ShareModal from "@/components/utils/ShareModal";
import useUserStore from "@/components/ZustandStores/userStore";
import {
  Constant_Var_firebase_fieldValue_private,
  Constant_Var_firebase_fieldValue_public,
  Constant_Var_success,
  starterWatchLists,
} from "@/utils/constants";
import React, { useEffect, useState } from "react";
import { FaRegEdit } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import EditWatchlistModal from "./EditWatchlistModal";

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
    <div className="flex flex-col-reverse mx-auto   md:flex-row w-full justify-center md:justify-between z-20">
      <div className="watchlist-tabs  flex bg-gradient-to-l bg-primary-400/10 flex-row w-full my-2 md:w-4/5 scrollbar-none overflow-x-scroll  gap-3 py-2 shadow-inner  rounded-xl md:px-2 border-r-[1px] border-primary-300 shadow-primay-100 ">
        {StarterWatchLists?.map((ele, ind) => (
          <div
            key={ele.id}
            className={`px-4 py-1 flex items-center gap-2 rounded-lg cursor-pointer text-nowrap text-sm font-semibold transition-all duration-200 ease-in-out text-cbg-200 transform ${selectedWatchList.id === ele.id
                ? "bg-primary-200  border-gray-500 shadow-md"
                : "bg-gray-300  border border-gray-600   hover:shadow-lg hover:scale-105"
              }`}
            onClick={() => setSelectedWatchList(ele)}
          >
            {ele.watchListName}
          </div>
        ))}

        {CustomWatchLists.map((ele, ind) => (
          <div
            key={ele.id}
            className={`px-4 py-1 flex items-center gap-2 rounded-lg cursor-pointer text-nowrap text-sm font-semibold transition-all duration-200 ease-in-out text-cbg-200 transform ${selectedWatchList.id === ele.id
                ? "bg-primary-200  border-gray-500 shadow-md"
                : "bg-gray-300  border border-gray-600   hover:shadow-lg hover:scale-105"
              }`}
            onClick={() => setSelectedWatchList(ele)}
          >
            {ele.watchListName}
          </div>
        ))}
      </div>

      {isUserLoggedIn && loggedInUserId === paramsUserId && (
        <div className="flex my-2 md:my-auto md:mx-4 text-sm gap-2">
          <select value={selectedWatchList?.type} onChange={UpdatePublicPrivate} className="px-2 cursor-pointer py-1 rounded-lg bg-cbg-300 text-gray-200">
            <option value={Constant_Var_firebase_fieldValue_private}>
              {Constant_Var_firebase_fieldValue_private}
            </option>
            <option value={Constant_Var_firebase_fieldValue_public} className="m-2">
              {Constant_Var_firebase_fieldValue_public}
            </option>
          </select>


          {!selectedWatchList.isSpecialStarter && (
            <>
              <button
                className="px-2 py-1 flex items-center gap-2 bg-sky-500 text-white rounded-md font-semibold hover:bg-sky-600 transition-all"
                onClick={() => setIsEditModalOpen(true)}
              >
                <FaRegEdit /> Edit
              </button>
              <button
                className="px-2 py-1 flex items-center gap-2 bg-red-500 text-white rounded-md font-semibold hover:bg-red-600 transition-all"
                onClick={DeleteCurrentWatchList}
              >
                <IoMdClose className="text-lg" />Delete
              </button>

            </>
          )}
          {Constant_Var_firebase_fieldValue_public === selectedWatchList.type && 
          
          <ShareModal buttonText="Share" modalTitle="Share this Watchlist" title="Checkout this Awesome Watchlist :" url={window.location.origin + `/watchlist/${selectedWatchList.id}`} />}
        </div>
      )}
      <EditWatchlistModal isOpen={isEditModalOpen} id={selectedWatchList.id} onClose={() => setIsEditModalOpen(false)} oldName={selectedWatchList?.watchListName} />
    </div>
  );
};

export default WatchListsTabs;
