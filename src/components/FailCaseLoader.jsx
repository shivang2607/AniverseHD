"use client";
import React from "react";


const FailCaseLoader= ({imageUrl,loaderText}) => {

  return (
    <div
      className={`${
        "flex items-center justify-center h-full w-full"
      }`}
    >
      <div className="text-center space-y-2 w-full">
        {imageUrl  && (
          <img
            src={imageUrl }
            alt="Loading"
            className="w-28 h-28 mx-auto rounded-full "
          />
        )}
        {loaderText  && (
          <p className="text-xl font-semibold text-white">{loaderText}</p>
        )}
      </div>
    </div>
  );
};

export default FailCaseLoader;
