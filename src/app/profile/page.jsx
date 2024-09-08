'use client'
import React, { useEffect } from "react";
import GetUserData from "../firebase/Profile/GetUserData";

const page = () => {
  useEffect(() => {
    async function loadUserData() {
      await GetUserData();
    }
    loadUserData();
  }, []);
  return <div>page</div>;
};

export default page;
