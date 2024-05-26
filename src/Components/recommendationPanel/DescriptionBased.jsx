"use client";
import React, { useState } from "react";
import SharinganLoader from "../sharinganLoader";
import { TypeAnimation } from "react-type-animation";
import { Hourglass } from "react-loader-spinner";
import { RxReset } from "react-icons/rx";
import { GiStarSwirl } from "react-icons/gi";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

export default function DescriptionBased() {
  const [description, setDescription] = useState();
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState();

  const getRecommendations = async () => {
    if (description && description?.trim() === "") {
      toast.error("Description cannot be empty!", {
        duration: 2000,
        id: "error",
      });
      return;
    } else if (description?.trim().split(" ").length < 5) {
      toast.error("Description should have at least 5 words!", {
        id: "word-limit-error",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/api/v1/recommend", {
        description,
        limit: 50,
      });
      console.log(response);
      setRecommendations(response?.data);
      setLoading(false);
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          error?.message ||
          "Something Went Wrong",
        {
          id: "catch-error",
        }
      );
      setLoading(false);
    }
  };

  const reset = () => {
    setRecommendations();
    setLoading(false);
    setDescription();
  };

  return (
    <div className="description-block flex flex-col gap-3 pl-8 pr-16">
      <textarea
        maxLength={300}
        value={description || ""}
        placeholder="Enter Description, eg: Anime with demons and monster and swords fights in it and suspense thriller action packed."
        class=" block w-full p-2  outline-none rounded-md shadow-sm scrollbar-thin bg-cbg-200"
        onChange={(e) => setDescription(e.target.value)}
      ></textarea>
      <span className="remaininglength flex ml-auto text-xs text-gray-400 relative -translate-y-2">
        {300 - description?.length || 0}/300
      </span>

      <div className="button-sets flex justify-end gap-2">
        <button
          className="rounded-md font-semibold  text-primary-300 hover:text-primary-400  p-1 px-2 flex items-center gap-1"
          onClick={reset}
        >
          {" "}
          <RxReset size={18} /> Reset
        </button>
        <button
          disabled={loading}
          className="rounded-md hover:bg-primary-300 bg-primary-200 text-cbg-100 font-semibold p-1 px-3 flex items-center gap-1"
          onClick={getRecommendations}
        >
          {loading ? (
            <Hourglass
              visible={true}
              wrapperClass="h-5 "
              colors={["#041C32", "#421fa3"]}
            />
          ) : (
            <>
              <GiStarSwirl size={18} /> Recommend{" "}
            </>
          )}
        </button>
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

      {loading ? (
        <div className="loading items-center gap-3 flex flex-col">
          <div className=" w-36 h-36 mx-auto mt-8 flex ">
            <SharinganLoader />
          </div>
          <h3 className="text- text-red-500 italic backdrop-brightness-0 p-1 font-semibold">
            <TypeAnimation
              sequence={[
                "Sharingan in action...",
                2000,
                "Analyzing and finding your ideal anime picks!",
                2000,
                "Unleashing the power of the Sharingan...",
                2000,
                "This may take a while, Hang tight",
                2000,
                "Your personalized anime list is on its way!",
                2000,
              ]}
              speed={60}
              repeat={Infinity}
            />
          </h3>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
