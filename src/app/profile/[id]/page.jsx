"use client";
import React from "react";
import UserInfo from "./components/UserInfo";
import UserWatchLists from "./components/UserWatchLists";
import { Toaster } from "react-hot-toast";

const Profile = ({ params }) => {

  return (
    <div className="w-full min-h-screen">
      <UserInfo id={params.id} />
      <UserWatchLists id={params.id} />
      <Toaster
        toastOptions={{
          style: {
            borderRadius: "10px",
            background: "#b6d7d4",
            border: "1px solid ",
            color: "#041C32",
          },
        }}
      />
    </div>
  );
};

export default Profile;
