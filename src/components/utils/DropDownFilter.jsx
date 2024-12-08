"use client";
import React, { useState } from "react";

export default function AnimeFilterDropdown({
  options,
  heading = "Ratings",
  selected,
  setSelected,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (option) => {
    setSelected(option.value);
    setIsOpen(false);
  };

  return (
    <div className="w-full relative ">
      {heading && (
        <h3 className="text-primary-500 text-sm font-semibold mb-2">
          {heading}
        </h3>
      )}

      <button
        className="w-full px-4 py-2 bg-gray-800 text-gray-200 border border-gray-700 rounded-lg shadow-md focus:outline-none flex justify-between items-center hover:bg-gray-900 transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{options.filter((e) => e.value === selected)[0].key}</span>

        <svg
          className={`w-5 h-5 text-gray-400 transform transition-transform ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Options */}
      {isOpen && (
        <ul className="w-full mt-2 z-10 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto scrollbar-none absolute">
          {options.map((option, index) => (
            <li
              key={index}
              onClick={() => handleOptionClick(option)}
              className={`px-2 py-2 mx-2 my-1 rounded-md text-gray-200 cursor-pointer hover:bg-gray-600 hover:text-white transition-all duration-200 ease-in-out ${
                selected === option.value ? "bg-primary-300 text-white" : ""
              }`}
            >
              {option.key}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
