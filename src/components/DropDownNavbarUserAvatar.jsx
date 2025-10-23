import Link from "next/link";
import React, { useState } from "react";
import useUserStore from "@/ZustandStores/userStore";
import Image from "next/image";


const DropDownNavbarUserAvatar = () => {
  const { logout, loggedInUserData, hideWatchlistBar, toggleHideWatchlistBar} = useUserStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleDropdownToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleLogOut= async ()=>{
   setIsOpen(false);
   logout();
  }

  return (
    <div className="relative z-50 text-primary-600 items-center flex">
      <button onClick={handleDropdownToggle} className="focus:outline-none">
        <div className="relative md:!w-11 md:!h-11 w-10 h-10 mx-3 items-center border-white border-2 rounded-full">
          {/* Example Profile Image, replace with actual image */}
          <Image
            src={loggedInUserData?.photoUrl}
            alt="User Profile"
            fill
            className="rounded-full object-cover"
          />
        </div>
      </button>
      <div
        className={`absolute  -right-4 mt-1 w-48 top-12 bg-cbg-200 rounded-md shadow-lg py-1 z-50 border border-cbg-300 transform transition-all duration-300 ease-in-out ${
          isOpen
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-4 scale-95 pointer-events-none"
        }`}
      >
        <Link
          href={`/profile/${loggedInUserData?.uid}`}
          onClick={() => setIsOpen(false)}
          className="block px-4 py-2  text-sm text-gray-500 hover:bg-cbg-300 hover:text-white transition-colors"
        >
          Profile
        </Link>
        
        <button className="flex w-full px-4 py-2 text-sm text-gray-500 hover:bg-cbg-300 hover:text-white transition-colors" onClick={()=>{
          toggleHideWatchlistBar();
          setIsOpen(false);
          }}>
          {hideWatchlistBar ? "Show" : "Hide"} Watchlist Bar
        </button>
        <button
          onClick={() => {handleLogOut()}}
          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-cbg-300 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default DropDownNavbarUserAvatar;
