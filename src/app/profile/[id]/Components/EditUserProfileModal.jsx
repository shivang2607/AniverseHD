import { Constant_Var_success } from "@/utils/constants";
import { IoMdClose } from "react-icons/io";
import React, { useState } from "react";
import Image from "next/image";
import UpdateProfileImage from "@/app/firebase/Profile/UpdateProfileImage";
import UpdateCoverImage from "@/app/firebase/Profile/UpdateCoverImage";
import UpdateName from "@/app/firebase/Profile/UpdateName";
import useUserStore from "@/components/utils/userStore";

const EditUserProfileModal = ({
  isOpen,
  onClose,
}) => {
  const {loadLoggedInUserData,loggedInUserData} = useUserStore();
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const tabs = ["Profile", "Cover", "Name"];
  const [selectedUserName, setSelectedUserName] = useState(loggedInUserData.userName);
  const [profileImage, setProfileImage] = useState({
    file: null,
    preview: loggedInUserData.photoUrl,
  });
  const [coverImage, setCoverImage] = useState({
    file: null,
    preview: loggedInUserData.coverUrl,
  });
  const [coverError, setCoverError] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  function handleProfileImagePreview(e) {
    if (!e || !e.target || !e.target.files[0]) return;

    const url = URL.createObjectURL(e.target.files[0]);
    setProfileImage({
      file: e.target.files[0],
      preview: url,
    });
  }

  function handleCoverImagePreview(e) {
    if (!e || !e.target || !e.target.files[0]) return;

    const url = URL.createObjectURL(e.target.files[0]);
    setCoverImage({
      file: e.target.files[0],
      preview: url,
    });
  }

  async function handleProfileImageSave(event) {
    event.preventDefault();
    if (profileImage.file === null) {
      setProfileError("Please Select a profile Image");
      return;
    }
    setProfileError(null);
    setLoading(true);
    const resp = await UpdateProfileImage({
      blob: profileImage.file,
      imageUrl: false,
    });

    if (resp.status === Constant_Var_success) {
      //success Toast
      setProfileImage({ file: null, preview: resp.response });
      console.log("Image Uploaded Succesfully", resp.response);
    } else {
      //error toast
      setProfileImage({ ...profileImage, file: null });
      console.log(resp.response, "error");
    }

    loadLoggedInUserData();
    setLoading(false);
    onClose();
  }

  async function handleCoverImageSave(event) {
    event.preventDefault();
    if (coverImage.file === null) {
      setCoverError("Please Select a profile Image");
      return;
    }
    setCoverError(null);
    setLoading(true);
    const resp = await UpdateCoverImage({
      blob: coverImage.file,
      imageUrl: false,
    });

    if (resp.status === Constant_Var_success) {
      //success Toast
      setCoverImage({ file: null, preview: resp.response });
      console.log("Image Uploaded Succesfully", resp.response);
    } else {
      //error toast
      setCoverImage({ ...coverImage, file: null });
      console.log(resp.response, "error");
    }
    loadLoggedInUserData();
    setLoading(false);
    onClose();
  }

  async function handleUserNameChange(event) {
    event.preventDefault();

    if (!selectedUserName.trim() || selectedUserName.trim() === "") return;

    setLoading(true);
    const resp = await UpdateName({ userName: selectedUserName });

    if (resp.status === Constant_Var_success) {
      //successs

      console.log("updated", resp.response);
    } else {
      //some error;
      console.log("error updating Name", resp.response);
    }

    loadLoggedInUserData();
    setLoading(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
      <div className="flex flex-col items-center bg-cbg-300 rounded-md shadow-lg md:w-[30rem] sm:w-[20rem] w-[17rem] max-w-[85vw] h-[27rem] pt-4 pb-6 space-y-4">
        <div className="w-full flex flex-row justify-between items-center mb-3 pb-3 px-6 border-b-[1px] border-cbg-400">
          <h2 className="sm:text-lg text-base">Edit Profile</h2>
          <div className="cursor-pointer" onClick={onClose}>
            <IoMdClose size={20} />
          </div>
        </div>

        <div className="px-6 w-full">
          <div className="relative flex flex-row items-center justify-center w-full bg-cbg-100 py-0.5 px-0.5 rounded-lg">
            {/* Sliding background */}
            <div
              className={`absolute top-[2px] left-[2px] h-[90%] bg-cbg-300 rounded-md shadow-md transition-transform duration-300 ease-in-out`}
              style={{
                width: "33%",
                transform: `translateX(${selectedTabIndex * 100}%)`,
              }}
            ></div>

            {/* Render the tabs */}
            {tabs &&
              tabs.map((val, index) => (
                <div
                  className={`w-[33.33%] text-center py-1 rounded-md cursor-pointer z-10`}
                  key={index}
                  onClick={() => setSelectedTabIndex(index)}
                >
                  {val}
                </div>
              ))}
          </div>
        </div>
        {selectedTabIndex == 0 && (
          <form
            onSubmit={handleProfileImageSave}
            autoComplete="off"
            className="px-6 flex flex-col items-center justify-center w-full"
          >
            <div className="flex flex-row w-fit mb-6">
              <div className="md:w-fit max-w-[100%] flex flex-col items-center ">
                <Image
                  src={profileImage.preview}
                  width={200}
                  height={200}
                  className="w-40 h-40 rounded-full object-cover object-center"
                  alt=""
                />
                {profileError && (
                  <p className="text-red-500 sm:text-xs text-[10px] mt-1 ml-1 !w-fit">
                    {profileError}
                  </p>
                )}
                <label
                  htmlFor="profile-image"
                  className="text-base ml-1 mt-4 cursor-pointer px-2.5 py-1 rounded-md bg-primary-100"
                >
                  Select Profile Image
                </label>
                <input
                  type="file"
                  id="profile-image"
                  name="profile-image"
                  accept="image/*"
                  className={`bg-cbg-400 md:px-3 md:py-2 px-2 py-2 md:text-base max-w-full text-sm rounded-md text-slate-100 outline-none focus-within:outline-slate-600 hidden`}
                  onChange={handleProfileImagePreview}
                />
              </div>
            </div>

            <div className="flex flex-row justify-end space-x-2 w-full">
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
        )}

        {selectedTabIndex == 1 && (
          <form
            onSubmit={handleCoverImageSave}
            autoComplete="off"
            className="px-6 flex flex-col items-center w-full h-full relative"
          >
            <div className="flex flex-row w-full my-6">
              <div className="w-full  flex flex-col items-center ">
                <div className="w-full h-fit bg-slate-300">
                  <Image
                    src={coverImage.preview}
                    width={300}
                    height={200}
                    className="w-[100%] h-32 object-cover object-center"
                    alt=""
                    priority
                  />
                </div>
                {coverError && (
                  <p className="text-red-500 sm:text-xs text-[10px] mt-1 ml-1 !w-fit">
                    {coverError}
                  </p>
                )}
                <label
                  htmlFor="cover-image"
                  className="text-base mt-2 ml-1 cursor-pointer px-2.5 py-1 rounded-md bg-primary-100"
                >
                  Select Cover Image
                </label>
                <input
                  type="file"
                  id="cover-image"
                  name="cover-image"
                  accept="image/*"
                  className={`bg-cbg-400 md:px-3 md:py-2 px-2 py-2 md:text-base max-w-full text-sm rounded-md text-slate-100 outline-none focus-within:outline-slate-600 hidden`}
                  onChange={handleCoverImagePreview}
                />
              </div>
            </div>

            <div className="flex flex-row justify-end space-x-2 w-full absolute bottom-4 px-6">
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
        )}

        {selectedTabIndex == 2 && (
          <form
            onSubmit={handleUserNameChange}
            autoComplete="off"
            className="px-6 flex flex-col items-center w-full h-full relative"
          >
            <div className="flex flex-row w-full mt-10">
              <div className="w-full flex flex-col">
                <label htmlFor="user-name" className="ml-2 text-sm">
                  Edit UserName
                </label>
                <input
                  type="text"
                  id="user-name"
                  name="user-name"
                  className={`bg-cbg-400 md:px-3 md:py-2 px-2 py-2 w-full  md:text-base text-sm rounded-md text-slate-100 outline-none focus-within:outline-slate-600`}
                  value={selectedUserName}
                  placeholder="Set Username"
                  onChange={(e) => {
                    setSelectedUserName(e.target.value);
                  }}
                />
                {selectedUserName.trim() === "" && (
                  <p className="text-red-500 sm:text-xs text-[10px] mt-1 ml-1 !w-fit">
                    User name cannot be empty
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-row justify-end absolute bottom-4 px-6 space-x-2 w-full">
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
        )}
      </div>
      {loading && (
        //full Screen Loader
        <div className="fixed inset-0 z-40 bg-white/30 backdrop-blur-sm text-black items-center">
          ..Loading
        </div>
      )}
    </div>
  );
};

export default EditUserProfileModal;
