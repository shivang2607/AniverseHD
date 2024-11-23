import useAnimeStore from "@/components/utils/animeStore";
import useAnimeSearchFilterStore from "@/components/ZustandStores/animeSearchFiltersStore";
import { Constant_Var_genresList } from "@/utils/constants";
import { Checkbox } from "@nextui-org/react";
import React, { useState } from "react";

const GenreFilter = () => {
  const { genres, toggleGenre } = useAnimeSearchFilterStore();
  const [open,setOpen]=useState(false);

  return (
    <div className="flex flex-col">
      {Constant_Var_genresList.map((ele) => (
        <checkbox
          key={ele.value}
          
          onClick={() => toggleGenre(ele.value)}
          className={`${
            genres && genres.some((e) => e == ele.value)
              ? " "
              : " "
          } text-white text-sm  cursor-pointer my-1`}
        >
         {ele.key} 
        </checkbox>
      ))}
    </div>
  );
};

export default GenreFilter;
