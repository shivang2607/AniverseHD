import React, { useState } from "react";
import SearchComponent from "./SearchComponent";
import Link from "next/link";
import DescriptionBased from "./DescriptionBased";
import AnimeBased from "./AnimeBased";
import { FaInfoCircle, FaTimes } from "react-icons/fa";

export default function RecommendationPanel() {
  const [isDescription, setDescription] = useState(true);
  const [isInfo, setInfo] = useState(false);

  return (
    <div className=" flex-col flex gap-4 md:mt-16 mt-8 mb-4 ">
      <h1 className="text-primary-500 items-center justify-between flex md:px-4 px-2 font-semibold text-2xl tracking-wide">
        Recommendations Box{" "}
        <span className={`relative opacity-90 text-4xl  mr-3 md:hidden flex `}>
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full text-primary-500 bg-primary-500  opacity-75"></span>
          <button
            className="relative inline-flex bg-cbg-200 rounded-full  "
            onClick={() => setInfo((prev) => !prev)}
          >
            <FaInfoCircle className=" text-primary-500" />
          </button>
        </span>
      </h1>
      <div className="w-full bg-recommendation-box-banner bg-cover bg-center  bg-no-repeat h-fit min-h-[30vh]">
        <div className="panel bg-gradient-to-l backdrop-blur-sm   md:from-cbg-100 to-transparent shadow-md w-full h-fit min-h-[30vh]   flex flex-col p-4 md:px-6 px-2 bg-opacity-50 bg-black">
          <div className="toggle flex md:w-[30%] w-[80%] mx-auto overflow-hidden  rounded-lg">
            <button
              className={`w-1/2 items-center flex justify-center text-white  p-2 ${
                isDescription ? "bg-primary-100" : "bg-cbg-100"
              } `}
              onClick={() => setDescription(true)}
            >
              Description based
            </button>

            <button
              className={`w-1/2 items-center flex justify-center text-white p-2 ${
                !isDescription ? "bg-primary-100" : "bg-cbg-100 "
              }`}
              onClick={() => setDescription(false)}
            >
              Anime based
            </button>
          </div>

          <div className="main flex justify-between w-full h-full mt-8">
            <div className="description-results-block md:w-[65%] w-full ">
              {isDescription ? <DescriptionBased /> : <AnimeBased />}
            </div>

          
            <div
              className={`info absolute  top-0 md:static md:translate-y-0 ${
                isInfo
                  ? "opacity-100 translate-x-0"
                  : "opacity-0  -translate-x-full "
              } md:opacity-100 md:translate-x-0 md:flex text-sm md:w-[35%] w-[95%] md:text-left text-justify italic text-gray-300  tracking-wider transition-all duration-300 ease-in-out`}
            >
              <div className="relative w-full  md:p-4 py-8 px-4 bg-cbg-300 opacity-95 md:bg-transparent  rounded-md shadow-lg">
                <button
                  className="absolute top-2 block md:hidden right-2 text-xl text-primary-600"
                  onClick={() => setInfo(false)}
                >
                  <FaTimes className="text-2xl" />
                </button>
                <p>
                  Welcome to our <b>Recommendation Panel!</b> 🌟 Ever wished for
                  an anime that matches your exact taste? Well, now you can!
                  Just type in a description or select an anime, hit the{" "}
                  <b>Recommend</b> button, and voilà—our magic algorithm will
                  find you anime with the most similar vibes and storylines.
                  <br /> <br />
                  But wait, there&apos;s more! For even more awesome features and
                  filters, be sure to visit our full{" "}
                  <Link href="/recommendations" className="text-fuchsia-400">
                    {" "}
                    Recommendation Page{" "}
                  </Link>
                  . It&apos;s a treasure trove for anime lovers like you. 🎉
                  <br /> <br />
                  <b className="underline">Pro Tip:</b> While our system is
                  pretty smart, typing gibberish might lead to some...
                  interesting anime picks. So keep it real for the best results!
                  <br /> <br />
                  Ready to discover your next favorite anime? Dive in and start
                  exploring! 🚀
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
