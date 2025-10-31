"use client";
import React, { useState } from "react";
import "rc-slider/assets/index.css";
import Slider from "rc-slider";

export default function RangeSlider({
  heading,
  min = 0,
  max = 10,
  decimalPrecision = 0,
  step = 0.5,
  range,
  setRange,
}) {
  

  const handleRangeChange = (values) => {
    setRange([
      values[0].toFixed(decimalPrecision),
      values[1].toFixed(decimalPrecision),
    ]);
    
  };

  return (
    <div className="score my-4 flex flex-col gap-4 p-4 bg-cbg-100 rounded-md">
      <h1 className="text-lg font-semibold text-primary-600">{heading}</h1>
      <div className="flex items-center text-sm gap-4">
        <span className="text-primary-600 font-medium">Min: {range[0]}</span>
        <span className="text-primary-600 font-medium">Max: {range[1]}</span>
      </div>
      <Slider
        range
        min={min}
        max={max}
        step={step}
        defaultValue={range}
        value={range}
        onChange={handleRangeChange}
        className="bg-cbg-100"
        styles={{
          track: { backgroundColor: "#3182ce", height: "6px" },
          handle: {
            borderColor: "#3182ce",
            backgroundColor: "#3182ce",
            width: "14px",
            height: "14px",
            marginTop: "-4px", // centers the handle with the track
          },
          rail: { backgroundColor: "#2d3748", height: "6px" },
        }}
      />
    </div>
  );
}
