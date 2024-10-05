import SignOut from "@/app/firebase/SignIn/SignOut";
import { Constant_Var_success } from "@/utils/constants";
import Link from "next/link";
import React, { useState } from "react";

const DropDownNavbarUserAvatar = ({ loggedInUserData }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDropdownToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleLogOut= async ()=>{
   setIsOpen(false);
   const resp= await SignOut();
   if(resp.status===Constant_Var_success){
    console.log("signed-Out")
    window.location.reload();
   }else{
    // show some toast for error
   }
  }

  return (
    <div className="relative">
      <button onClick={handleDropdownToggle} className="focus:outline-none">
        <div className="relative !w-14 !h-14 border-white border-2 rounded-full">
          {/* Example Profile Image, replace with actual image */}
          <img
            src={loggedInUserData?.photoUrl}
            alt="User Profile"
            className="rounded-full"
          />
        </div>
      </button>
      <div
        className={`absolute right-0 mt-1 w-48 bg-cbg-200 rounded-md shadow-lg py-1 z-10 border border-cbg-300 transform transition-all duration-300 ease-in-out ${
          isOpen
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-4 scale-95 pointer-events-none"
        }`}
      >
        <Link
          href={`/profile/${loggedInUserData.uid}`}
          onClick={() => setIsOpen(false)}
          className="block px-4 py-2 text-sm text-cbg-500 hover:bg-cbg-300 hover:text-white transition-colors"
        >
          Profile
        </Link>
        <Link
          href="/feedback"
          onClick={() => setIsOpen(false)}
          className="block px-4 py-2 text-sm text-cbg-500 hover:bg-cbg-300 hover:text-white transition-colors"
        >
          Feedback
        </Link>
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
