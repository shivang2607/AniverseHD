import RangeSlider2 from "@/components/utils/RangeSlider2";
import useAnimeSearchFilterStore from "@/components/ZustandStores/animeSearchFiltersStore";
import React, { useEffect, useState } from "react";

const YearRange = () => {
  const { setStartDate, setEndDate, start_date, end_date } =
    useAnimeSearchFilterStore();

//   useEffect(() => {
//     //console.log(start_date,end_date, "year");
//   }, [start_date, end_date]);
  
  return (
    <div>
      <RangeSlider2
        heading={"Year Range"}
        range_Min={start_date ? start_date : 1980}
        range_Max={end_date? end_date : 2024}
        set_max={setEndDate}
        set_min={setStartDate}
        step={1}
        decimalPrecision={0}
        min={1980}
        max={2024}
      />
    </div>
  );
};

export default YearRange;
