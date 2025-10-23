import RangeSlider2 from "@/components/utils/RangeSlider2";
import useAnimeSearchFilterStore from "@/ZustandStores/animeSearchFiltersStore";
import React, { useEffect, useState } from "react";

const ScoreRange = () => {
  const { setMinScore, setMaxScore, min_score, max_score } =
    useAnimeSearchFilterStore();

  // useEffect(() => {
  //   console.log(min_score, max_score, "score");
  // }, [min_score, max_score]);

  return (
    <div>
      <RangeSlider2
        heading={"Score Range"}
        range_Min={min_score ? min_score : 0}
        range_Max={max_score ? max_score : 10}
        set_max={setMaxScore}
        set_min={setMinScore}
        step={0.1}
        decimalPrecision={1}
      />
    </div>
  );
};

export default ScoreRange;
