import CreateWatchList from "@/app/firebase/WatchList/CreateWatchList";
import {
  Constant_Var_firebase_fieldValue_private,
  Constant_Var_firebase_fieldValue_public,
  Constant_Var_success,
} from "@/utils/constants";
import { IoMdClose } from "react-icons/io";
import React, { useEffect, useState } from "react";
import useUserStore from "@/components/ZustandStores/userStore";
import toast from "react-hot-toast";
import ChangeWatchListName from "@/app/firebase/WatchList/UpdateWatchLists/ChangeWatchListName";

export default function EditWatchlistModal({isOpen, onClose, id, oldName}) {


    const {loadLoggedInUserWatchLists} = useUserStore();
  const [watchlistName, setWatchlistName] = useState();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    setWatchlistName(oldName);
  }, [oldName]);

  if (!isOpen) return null;

  const handleChange = (newName) => {
    if(newName?.length > 50){
        toast.error("Watchlist name cannot exceed 50 characters.", {id: 2});
        return;
    }
    setWatchlistName(newName);
  }

  async function handleSubmit(event) {
    event.preventDefault(); // Prevent form from reloading the page

    // Validate watchlist name
    if (watchlistName.trim() === "") {
      setError("Watchlist name cannot be empty");
      return;
    }
    setLoading(true);
    setError(""); // Clear any previous errors

    const formData = new FormData();
    formData.set("watchlist-name", watchlistName);

    // Start loader for creating
    const resp = await ChangeWatchListName({
           watchListId: id,
           watchListName: watchlistName,
         });

    if (resp.status === Constant_Var_success) {
      // Show Toast (Success)
      console.log("Success", resp.response);
    } else {
      // Show Toast (Error)
      console.log("Error", resp.response);
    }
    setError("");
    setWatchlistName("");
    setLoading(false);
    loadLoggedInUserWatchLists();
    onClose();
  }


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 ">
      <div className="bg-cbg-300 rounded-md shadow-lg sm:max-w-md max-w-[85vw] pt-4 pb-6 space-y-4">
        <div className="w-full flex flex-row justify-between items-center mb-3 pb-3 px-6 border-b-[1px] border-cbg-400">
          <h2 className="sm:text-lg text-base">Edit WatchList Name</h2>
          <div className="cursor-pointer" onClick={onClose}>
            <IoMdClose size={20} />
          </div>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off" className="px-6">
          <div className="flex flex-row md:gap-x-3 gap-x-2 w-full mb-6 flex-wrap gap-y-2">
            <div className="md:w-fit w-[65%] min-w-60">
              <input
                type="text"
                id="watchlist-name"
                name="watchlist-name"
                className={`bg-cbg-400 w-full md:px-3 md:py-2 px-2 py-2 md:text-base max-w-full text-sm rounded-md text-slate-100 outline-none focus-within:outline-slate-600 ${
                  error ? "border-red-500" : ""
                }`}
                placeholder={oldName}
                defaultValue={oldName}
                value={watchlistName}
                onChange={(e) => handleChange(e.target.value)}
              />
              {error && watchlistName.trim() === "" && (
                <p className="text-red-500 sm:text-xs text-[10px] mt-1 ml-1 !w-fit">
                  {error}
                </p>
              )}
            </div>
            
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="bg-cbg-400 rounded-md sm:px-3 sm:py-1 px-2 py-1 sm:text-base text-sm"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary-100 rounded-md sm:px-3 sm:py-1 px-2 py-1 sm:text-base text-sm"
            >
              Save
            </button>
          </div>
        </form>
      </div>
      {loading && (
        <div className="fixed inset-0 z-40 bg-white/30 backdrop-blur-sm text-black items-center">
          Loading
        </div>
      )}
    </div>
  )
}
