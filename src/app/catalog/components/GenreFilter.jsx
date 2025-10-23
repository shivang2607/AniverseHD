import useAnimeSearchFilterStore from "@/ZustandStores/animeSearchFiltersStore";
import { Constant_Var_genresList } from "@/utils/constants";
import { RiArrowDropDownLine } from "react-icons/ri";
import React, { useEffect } from "react";

const GenreFilter = ({ currOpened, setCurrOpened }) => {
  const { genres, toggleGenre } = useAnimeSearchFilterStore();

  useEffect(() => {
    // console.log("generes updated", genres);
  }, [genres]);
  return (
    <div className="flex flex-col w-full bg-gray-800 p-2 rounded-lg shadow-lg relative border-[0.5px] border-slate-700">
      <div
        onClick={() => {
          currOpened === "genres" ?  setCurrOpened(null) : setCurrOpened("genres");
        }}
        className="flex items-center justify-between cursor-pointer px-2 rounded-md text-white hover:bg-gray-700 transition duration-200"
      >
        <h3 className="text-md font-semibold">Genre</h3>
        <i
          className={`transform transition-transform ${
            currOpened == "genres" ? "rotate-180" : "rotate-0"
          }`}
        >
          <RiArrowDropDownLine size={30} />
        </i>
      </div>

      <div
        className={`absolute mt-11 z-10 left-0 bg-gray-800 shadow-gray-600 shadow-md w-full   p-2 rounded-lg transition-all duration-700 ease-in-out overflow-hidden ${
          currOpened == "genres"
            ? " opacity-100 visible "
            : " opacity-0 invisible"
        }`}
      >
        <div
          className={`flex flex-wrap gap-2 p-4  bg-gray-900 rounded-md transition-all
        ${
          currOpened == "genres"
            ? "max-h-96  overflow-y-scroll scrollbar-none"
            : "max-h-0 "
        }
        `}
        >
          {Constant_Var_genresList.map((ele) => (
            <span
              key={ele.value}
              className={`cursor-pointer px-3 py-1 rounded-full text-sm border transition duration-200 
          ${
            genres?.includes(ele.value)
              ? "text-primary-200 border-primary-200 bg-cbg-200" // Selected state
              : "bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white" // Unselected state
          }`}
              onClick={() => toggleGenre(ele.value)}
            >
              {genres?.includes(ele.value) && (
                <span className="mr-1 text-primary-200">✕</span> // Close icon for selected genres
              )}
              {ele.key}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GenreFilter;
