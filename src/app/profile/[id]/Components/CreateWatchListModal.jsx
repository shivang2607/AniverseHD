// CreateWatchListModal.js
import CreateWatchList from "@/app/firebase/WatchList/CreateWatchList";
import {
  Constant_Var_firebase_fieldValue_private,
  Constant_Var_firebase_fieldValue_public,
  Constant_Var_success,
} from "@/utils/constants";
import React from "react";

const CreateWatchListModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  async function handleSubmit(formData) {
    //start loader for creating
    const resp = await CreateWatchList(
      formData.get("watchlist-name"),
      formData.get("watchlist-type")
    );

    if (resp.status === Constant_Var_success) {
      //show Toast
      console.log("success", resp.response);
    } else {
      //show Toast
      console.log("error", resp.response);
    }
    onClose();
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-cbg-200 rounded-lg shadow-lg w-full max-w-md mx-auto p-6 space-y-4">

        <div className="w-full flex flex-row justify-between mb-5">
          <h2 className="text-xl font-bold text-primary-300">
            Create New WatchList
          </h2>
          <div className="cursor-pointer" onClick={onClose}>
            X
          </div>
        </div>

        <form action={handleSubmit}>

          <div className="flex flex-row gap-x-3 w-full mb-4">
            <div className="w-full">
              <label
                htmlFor="watchlist-name"
                className="block text-sm font-medium text-primary-300"
              >
                Name
              </label>
              <input
                type="text"
                id="watchlist-name"
                name="watchlist-name"
                className="mt-1 w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 outline-none text-primary-300"
                placeholder="Enter watchlist name"
              />
            </div>
            <div className="w-full">
              <label
                htmlFor="watchlist-name"
                className="block text-sm font-medium text-primary-300"
              >
                Type
              </label>
              <select
                type="text"
                id="watchlist-type"
                name="watchlist-type"
                className="mt-1 w-full border border-gray-300 rounded-md shadow-sm py-2.5 px-3 outline-none text-primary-300"
                placeholder="Enter watchlist name"
              >
                <option value={Constant_Var_firebase_fieldValue_public}>
                  {Constant_Var_firebase_fieldValue_public}
                </option>
                <option value={Constant_Var_firebase_fieldValue_private}>
                  {Constant_Var_firebase_fieldValue_private}
                </option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary-600 text-white px-4 py-2 rounded-md"
            >
              Create
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default CreateWatchListModal;
