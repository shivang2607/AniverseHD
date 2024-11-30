import useAnimeSearchFilterStore from "@/components/ZustandStores/animeSearchFiltersStore";
import { Constant_Var_genresList } from "@/utils/constants";
import { RiArrowDropDownLine } from "react-icons/ri";
import React, { useState } from "react";

const GenreFilter = () => {
  const { genres, toggleGenre } = useAnimeSearchFilterStore();
  const [isOpen, setIsOpen] = useState(false); // State to toggle dropdown visibility

  return (
    <div className="flex flex-col w-64">
    <div
      onClick={() => setIsOpen(!isOpen)}
      className="flex items-center justify-between cursor-pointer px-4 py-2 rounded-md text-white"
    >
      <h3 className="text-lg font-medium">Genre</h3>
      <i
        className={`transform transition-transform ${
          isOpen ? "rotate-180" : "rotate-0"
        }`}
      >
        <RiArrowDropDownLine />
      </i>
    </div>
  
    <div
      className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className="flex flex-col p-4 rounded-md space-y-2 shadow-lg">
        {Constant_Var_genresList.map((ele) => (
          <label
            key={ele.value}
            className="flex items-center space-x-2 cursor-pointer text-sm text-white"
          >
            <input
              type="checkbox"
              checked={genres?.includes(ele.value)} // Bind the state
              onChange={() => toggleGenre(ele.value)} // Toggle genre on change
              className="cursor-pointer"
            />
            <span>{ele.key}</span>
          </label>
        ))}
      </div>
    </div>
  </div>  
  );
};

export default GenreFilter;
