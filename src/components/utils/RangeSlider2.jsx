"use client";
import React from "react";
import "rc-slider/assets/index.css";
import Slider from "rc-slider";

export default function RangeSlider2({
  heading,
  min = 0,
  max = 10,
  decimalPrecision = 0,
  step = 0.5,
  range_Min,
  range_Max,
  set_min,
  set_max,
  
}) {
  const handleRangeChange = (values) => {
    set_min(values[0].toFixed(decimalPrecision));
    set_max(values[1].toFixed(decimalPrecision))
  };

  return (
    <div className="score flex flex-col gap-3 px-6 py-4 bg-gray-800 shadow-lg rounded-lg border-[0.5px] border-slate-700">
      <h1 className="text-lg font-bold text-white">{heading}</h1>
      <div className="flex justify-between text-sm text-white">
        <span className="font-medium text-md">Min: {range_Min}</span>
        <span className="font-medium text-md">Max: {range_Max}</span>
      </div>
      <div className="custom-slider">
        <Slider
          range
          min={min}
          max={max}
          step={step}
          value={[range_Min,range_Max]}
          onChange={handleRangeChange}
          trackStyle={[
            { backgroundColor: "rgb(59, 130, 246)", height: "4px" }, // Tailwind blue-500
          ]}
          railStyle={{ backgroundColor: "rgb(229, 231, 235)", height: "4px" }} // Tailwind gray-300
          handleStyle={[
            {
              borderColor: "rgb(59, 130, 246)", // Tailwind blue-500
              backgroundColor: "#ffffff",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
              width: "16px",
              height: "16px",
              marginTop: "-5px",
            },
          ]}
        />
      </div>
    </div>
  );
}
