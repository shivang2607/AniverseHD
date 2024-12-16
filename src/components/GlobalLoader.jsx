"use client";
import React from "react";
import useGlobalLoader from "./ZustandStores/useGlobalLoader";

const GlobalLoader = () => {
  const { isLoaderVisible, imageUrl, loaderText } = useGlobalLoader();

  return (
    <div
      className={`${
        isLoaderVisible
          ? "fixed inset-0 z-50 flex items-center justify-center bg-white/5 backdrop-blur-md"
          : "hidden"
      }`}
    >
      <div className="text-center space-y-2 w-full">
        {imageUrl  && (
          <img
            src={imageUrl }
            alt="Loading"
            className="w-28 h-28 mx-auto rounded-full animate-bounce"
          />
        )}
        {loaderText  && (
          <p className="text-xl font-semibold text-white">{loaderText + ".."}</p>
        )}
        <div className="max-w-40 w-[50%] h-1 mx-auto bg-blue-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default GlobalLoader;
