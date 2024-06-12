"use client";
import React, { useState } from "react";
import RangeSlider from "./RangeSlider";
import MultipleSelect from "./MultipleSelect";
import { colorsList, demographics, genres, themes } from "./genre-themes-list";
import { ImCancelCircle } from "react-icons/im";
import toast, { Toaster } from "react-hot-toast";
import useRecommendationStore from "./store";


export default function FilterPanel() {
  const [matchType, setMatchType] = useState("any");

  const {selectedGenre, setSelectedDemographics, selectedDemographics, selectedTheme, setSelectedTheme, setSelectedGenre} = useRecommendationStore(state=>({
    selectedGenre : state.selectedGenre,
    setSelectedGenre: state.setSelectedGenre,
    selectedTheme: state.selectedTheme,
    setSelectedTheme: state.setSelectedTheme,
    selectedDemographics: state.selectedDemographics,
    setSelectedDemographics: state.setSelectedDemographics

  }))

  // const [selectedGenre, setSelectedGenre] = useState([]);
  // const [selectedTheme, setSelectedTheme] = useState([]);
  // const [selectedDemographics, setSelectedDemographics] = useState([]);

 

  const [checkboxes, setCheckboxes] = useState({
    all: true,
    tv: false,
    movie: false,
    ona: false,
    ova: false,
    specials: false,
  });

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;

    if (name === "all" && checked) {
      setCheckboxes({
        all: true,
        tv: false,
        movie: false,
        ona: false,
        ova: false,
        specials: false,
      });
    } else if (name !== "all" && checked) {
      setCheckboxes((prevCheckboxes) => ({
        ...prevCheckboxes,
        all: false,
        [name]: true,
      }));
    } else {
      setCheckboxes((prevCheckboxes) => ({
        ...prevCheckboxes,
        [name]: false,
      }));
    }
  };

  const handleChange = (event) => {
    setMatchType(event.target.value);
  };

  return (
    <div className=" py-2  z-0 bg-cbg-200 ml-2  items-start   right-0 w-[25%] ">
      <h1 className="w-full justify-center text-2xl flex my-4 bg-cbg-100 text-pretty text-primary-400 font-bold tracking-wide py-2 ">Filters</h1>
      <div className=" h-fit  top-0 relative  scrollbar-thin flex flex-col gap-6 p-2">
      <h1 className="flex items-center  text-xl font-semibold tracking-wide text-sky-300 flex-wrap">
        Results should match
        <select
          value={matchType}
          onChange={handleChange}
          className="ml-2 bg-cbg-200 text-primary-400 border-0 text-xl focus:outline-none"
        >
          <option value="all">all</option>
          <option value="any">any</option>
        </select>
        of the filters
      </h1>

      <div className="type flex gap-2 flex-col">
        <h1 className="text-lg px-2 font-semibold text-primary-600">Type</h1>

        <div className="checkboxes px-2 flex flex-col gap-4 text-sm w-full">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="all"
              checked={checkboxes.all}
              onChange={handleCheckboxChange}
              className="form-checkbox h-3 w-3 text-primary-600 border-gray-300 rounded-lg focus:ring-primary-500"
            />
            <span className="text-primary-700">All</span>
          </label>
          <div className="typesoptions grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="tv"
                checked={checkboxes.tv}
                onChange={handleCheckboxChange}
                className="form-checkbox h-3 w-3 text-primary-600 border-gray-300 rounded-lg focus:ring-primary-500"
              />
              <span className="text-primary-700">TV</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="movie"
                checked={checkboxes.movie}
                onChange={handleCheckboxChange}
                className="form-checkbox h-3 w-3 text-primary-600 border-gray-300 rounded-lg focus:ring-primary-500"
              />
              <span className="text-primary-700">Movie</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="ona"
                checked={checkboxes.ona}
                onChange={handleCheckboxChange}
                className="form-checkbox h-3 w-3 text-primary-600 border-gray-300 rounded-lg focus:ring-primary-500"
              />
              <span className="text-primary-700">ONA</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="ova"
                checked={checkboxes.ova}
                onChange={handleCheckboxChange}
                className="form-checkbox h-3 w-3 text-primary-600 border-gray-300 rounded-lg focus:ring-primary-500"
              />
              <span className="text-primary-700">OVA</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="specials"
                checked={checkboxes.specials}
                onChange={handleCheckboxChange}
                className="form-checkbox h-3 w-3 text-primary-600 border-gray-300 rounded-lg focus:ring-primary-500"
              />
              <span className="text-primary-700">Specials</span>
            </label>
          </div>
        </div>

        <RangeSlider heading={"Score Range"} minInit={6.5} decimalPrecision={1}/>
        <RangeSlider heading={"Starting Year Range"}  min={1960} max={new Date().getFullYear()} step={5}/>
        
        <div className="genre my-4 flex flex-col gap-4 p-4 bg-cbg-100 rounded-md">
          <MultipleSelect 
          options={genres}
          selectedOptions={selectedGenre}
          setSelectedOptions={setSelectedGenre}
          buttonLabel={"Genres"}
          />
          <div className="flex flex-wrap gap-2 text-[0.70rem]">
          {selectedGenre?.map((sel, idx)=>{
            return (
              <button
                  key={sel}
                  className={`rounded-full p-1 border-[1.5px] bg-cbg-200 flex gap-1 items-center`}
                  style={{color: colorsList[idx % colorsList.length],
                          borderColor: colorsList[idx % colorsList.length],
                  }}
                  onClick={() => {
                    if(selectedGenre.length===1){
                      toast.error(`Genres cannot be empty!`);
                      return;
                  }
                  setSelectedGenre(selectedGenre.filter(s => s !== sel))
                  } }
              >
                  {sel} <ImCancelCircle />
              </button>
            )
          })
          }
          </div>
        </div>

        <div className="genre my-4 flex flex-col gap-4 p-4 bg-cbg-100 rounded-md">
          <MultipleSelect 
          options={themes}
          selectedOptions={selectedTheme}
          setSelectedOptions={setSelectedTheme}
          buttonLabel={"Themes"}
          showSearchPanel={true}
          />
          <div className="flex flex-wrap gap-2 text-[0.70rem]">
          {selectedTheme?.map((sel, idx)=>{
            return (
              <button
                  key={sel}
                  className={`rounded-full p-1 border-[1.5px] bg-cbg-200 flex gap-1 items-center`}
                  style={{color: colorsList[idx % colorsList.length],
                          borderColor: colorsList[idx % colorsList.length],
                  }}
                  onClick={() => {
                    if(selectedTheme.length===1){
                      toast.error(`Themes cannot be empty!`);
                      return;
                  }
                  setSelectedTheme(selectedTheme.filter(s => s !== sel))
                  } }
              >
                  {sel} <ImCancelCircle />
              </button>
            )
          })
          }
          </div>
        </div>

        <div className="genre my-4 flex flex-col gap-4 p-4 bg-cbg-100 rounded-md">
          <MultipleSelect 
          options={demographics}
          selectedOptions={selectedDemographics}
          setSelectedOptions={setSelectedDemographics}
          buttonLabel={"Demographics"}
          />
          <div className="flex flex-wrap gap-2 text-[0.70rem]">
          {selectedDemographics?.map((sel, idx)=>{
            return (
              <button
                  key={sel}
                  className={`rounded-full p-1 border-[1.5px] bg-cbg-200 flex gap-1 items-center`}
                  style={{color: colorsList[idx % colorsList.length],
                          borderColor: colorsList[idx % colorsList.length],
                  }}
                  onClick={() => {
                    if(selectedDemographics.length===1){
                      toast.error(`Demographics cannot be empty!`);
                      return;
                  }
                  setSelectedDemographics(selectedDemographics.filter(s => s !== sel))
                  } }
              >
                  {sel} <ImCancelCircle />
              </button>
            )
          })
          }
          </div>
        </div>
        
      </div>
    </div>
    <Toaster
          toastOptions={{
            style: {
              borderRadius: "10px",
              background: "#b6d7d4",
              border: "1px solid ",
              color: "#041C32",
            },
          }}
        />
    </div>
  );
}
