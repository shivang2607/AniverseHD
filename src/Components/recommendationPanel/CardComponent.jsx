import React from "react";
import { FaPlay } from "react-icons/fa6";
import Image from "next/image";
import { BsDot } from "react-icons/bs";

export default function CardComponent() {
  return (
    <>
      <div className="relative group gap-2 h-52 w-32  flex flex-col  ">
        <div
          className="relative w-full h-full bg-cover overflow-hidden bg-center rounded-md"
          style={{ backgroundImage: 'url("/download.jpeg")' }}
        >
          <div className="absolute top-0 right-0 bg-red-500 px-1   justify-center text-xs  rounded-sm m-1 z-10 items-center">
            R+
          </div>
          <div className="absolute bottom-0 left-0 flex z-10 gap-1 p-1 text-[0.65rem] rounded-sm overflow-hidden">
            <div className="bg-sky-700 text-gray-200 font-semibold px-1   rounded-sm">
              8.67
            </div>
            <div className="bg-primary-300 text-cbg-100 font-semibold px-1  rounded-sm">
              2009
            </div>
          </div>
          <div className="blured-on-hover flex absolute inset-0 items-center justify-center backdrop-blur-sm hover:opacity-100 opacity-0 transition-all duration-300 ease-in-out z-0">
            <FaPlay size={32} style={{ color: "#6bb0ab" }} />
          </div>
        </div>

        {/*******DETAILS */}
        <div className="card-content  ">
          <h3 className="text-sm font-semibold text-gray-200  line-clamp-1 hover:text-primary-600">
            Oblivion Battery
          </h3>
          <div className="details flex  items-center text-gray-400">
            <p className=" text-sm">TV </p>
            <div>
              <BsDot size={18} />
            </div>
            <p className=" text-sm ">23 min</p>
          </div>
        </div>
      </div>
    </>
  );
}
