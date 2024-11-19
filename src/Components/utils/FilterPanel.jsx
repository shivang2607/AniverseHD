"use client";
import React from "react";
import RangeSlider from "./RangeSlider";
import MultipleSelect from "./MultipleSelect";
import { colorsList, demographics, genres, themes } from "./genre-themes-list";
import { ImCancelCircle } from "react-icons/im";
import toast, { Toaster } from "react-hot-toast";
import useRecommendationStore from "./store";
import { MdElectricBolt } from "react-icons/md";
import { Hourglass } from "react-loader-spinner";
import { IoMdCloseCircle } from "react-icons/io";

export default function FilterPanel() {
  const {
    isFilterOpen,
    toggleFilterOpen,
    matchType,
    loading,
    setMatchType,
    checkboxes,
    setCheckboxes,
    ratings,
    setRatings,
    scoreRange,
    setScoreRange,
    yearRange,
    setYearRange,
    selectedGenre,
    setSelectedGenre,
    selectedTheme,
    setSelectedTheme,
    setSelectedDemographics,
    selectedDemographics,
    getRecommendations
  } = useRecommendationStore((state) => state);



 

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
      setCheckboxes({
        ...checkboxes,
        all: false,
        [name]: true,
      });
    } else {
      setCheckboxes({
        ...checkboxes,
        [name]: false,
      });
    }
  };


  const handleRatingChange = (event) => {
    const { name, checked } = event.target;

    if (name === "all" && checked) {
      setRatings({
        all : true,
        g: false,
        pg: false,
        pg_13: false,
        r: false,
        rplus : false,
      });
    } else if (name !== "all" && checked) {
      setRatings({
        ...ratings,
        all: false,
        [name]: true,
      });
    } else {
      setRatings({
        ...ratings,
        [name]: false,
      });
    }
  };

  const handleChange = (event) => {
    setMatchType(event.target.value);
  };

  return (
    <div className={`py-2  md:z-0 z-20 bg-cbg-200 ml-2  items-start md:static  top-0 md:h-fit fixed h-screen overflow-y-scroll md:scrollbar-thin md:overflow-auto  backdrop-blur-sm ${isFilterOpen? "translate-x-0":"-translate-x-full"}  w-3/4 transition-all ease-in duration-300 -left-2 md:translate-x-0  md:right-0 md:w-[25%] `} >
      <h1 className="w-full justify-center items-center  px-2 text-2xl flex my-4 bg-cbg-100 text-pretty text-primary-400 font-bold tracking-wide py-2 ">
        Filters <button className="ml-auto self-end md:hidden flex items-center text-3xl my-auto" onClick={toggleFilterOpen}><IoMdCloseCircle/></button>
      </h1>
      <div className=" h-fit  top-0 relative  scrollbar-thin flex flex-col gap-6 p-2">
        <h1 className="flex items-center  text-xl font-semibold tracking-wide text-sky-300 flex-wrap">
          Results should match
          <select
            value={matchType}
            onChange={handleChange}
            className="ml-2 bg-cbg-200 text-primary-400 border-0 text-xl focus:outline-none"
          >
            <option value="must">all</option>
            <option value="should">any</option>
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

          <h1 className="text-lg px-2 mt-6 font-semibold text-primary-600">Rating</h1>

          <div className="checkboxes px-2 flex flex-col gap-4 text-sm w-full">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="all"
                checked={ratings.all}
                onChange={handleRatingChange}
                className="form-checkbox h-3 w-3 text-primary-600 border-gray-300 rounded-lg focus:ring-primary-500"
              />
              <span className="text-primary-700">All</span>
            </label>
            <div className="typesoptions grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="g"
                  checked={ratings.g}
                  onChange={handleRatingChange}
                  className="form-checkbox h-3 w-3 text-primary-600 border-gray-300 rounded-lg focus:ring-primary-500"
                />
                <span className="text-primary-700">G</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="pg"
                  checked={ratings.pg}
                  onChange={handleRatingChange}
                  className="form-checkbox h-3 w-3 text-primary-600 border-gray-300 rounded-lg focus:ring-primary-500"
                />
                <span className="text-primary-700">PG</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="pg_13"
                  checked={ratings.pg_13}
                  onChange={handleRatingChange}
                  className="form-checkbox h-3 w-3 text-primary-600 border-gray-300 rounded-lg focus:ring-primary-500"
                />
                <span className="text-primary-700">PG-13</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="r"
                  checked={ratings.r}
                  onChange={handleRatingChange}
                  className="form-checkbox h-3 w-3 text-primary-600 border-gray-300 rounded-lg focus:ring-primary-500"
                />
                <span className="text-primary-700">R</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="rplus"
                  checked={ratings.rplus}
                  onChange={handleRatingChange}
                  className="form-checkbox h-3 w-3 text-primary-600 border-gray-300 rounded-lg focus:ring-primary-500"
                />
                <span className="text-primary-700">R+</span>
              </label>
            </div>
          </div>

          <RangeSlider
            heading={"Score Range"}
            decimalPrecision={1}
            range={scoreRange}
            setRange={setScoreRange}
          />
          <RangeSlider
            heading={"Starting Year Range"}
            min={1960}
            max={new Date().getFullYear()}
            step={5}
            range={yearRange}
            setRange={setYearRange}
          />

          <div className="genre my-4 flex flex-col gap-4 p-4 bg-cbg-100 rounded-md">
            <MultipleSelect
              options={genres}
              selectedOptions={selectedGenre}
              setSelectedOptions={setSelectedGenre}
              buttonLabel={"Genres"}
            />
            <div className="flex flex-wrap gap-2 text-[0.70rem]  max-h-86 overflow-y-scroll md:scrollbar-thin scrollbar-track-transparent">
              {selectedGenre?.map((sel, idx) => {
                return (
                  <button
                    key={sel}
                    className={`rounded-full p-1 border-[1.5px] bg-cbg-200 flex gap-1 items-center`}
                    style={{
                      color: colorsList[idx % colorsList.length],
                      borderColor: colorsList[idx % colorsList.length],
                    }}
                    onClick={() => {
                      // if (selectedGenre.length === 1) {
                      //   toast.error(`Genres cannot be empty!`);
                      //   return;
                      // }
                      setSelectedGenre(selectedGenre.filter((s) => s !== sel));
                    }}
                  >
                    {sel} <ImCancelCircle />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="genre my-4 flex flex-col gap-4 p-4 bg-cbg-100 rounded-md ">
            <MultipleSelect
              options={themes}
              selectedOptions={selectedTheme}
              setSelectedOptions={setSelectedTheme}
              buttonLabel={"Themes"}
              showSearchPanel={true}
            />
            <div className="flex flex-wrap gap-2 text-[0.70rem] max-h-80 overflow-y-scroll md:scrollbar-thin scrollbar-track-transparent">
              {selectedTheme?.map((sel, idx) => {
                return (
                  <button
                    key={sel}
                    className={`rounded-full p-1 border-[1.5px] bg-cbg-200 flex gap-1 items-center`}
                    style={{
                      color: colorsList[idx % colorsList.length],
                      borderColor: colorsList[idx % colorsList.length],
                    }}
                    onClick={() => {
                      // if (selectedTheme.length === 1) {
                      //   toast.error(`Themes cannot be empty!`);
                      //   return;
                      // }
                      setSelectedTheme(selectedTheme.filter((s) => s !== sel));
                    }}
                  >
                    {sel} <ImCancelCircle />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="demographics my-4 flex flex-col gap-4 p-4 bg-cbg-100 rounded-md">
            <MultipleSelect
              options={demographics}
              selectedOptions={selectedDemographics}
              setSelectedOptions={setSelectedDemographics}
              buttonLabel={"Demographics"}
            />
            <div className="flex flex-wrap gap-2 text-[0.70rem]">
              {selectedDemographics?.map((sel, idx) => {
                return (
                  <button
                    key={sel}
                    className={`rounded-full p-1 border-[1.5px] bg-cbg-200 flex gap-1 items-center`}
                    style={{
                      color: colorsList[idx % colorsList.length],
                      borderColor: colorsList[idx % colorsList.length],
                    }}
                    onClick={() => {
                      // if (selectedDemographics.length === 1) {
                      //   toast.error(`Demographics cannot be empty!`);
                      //   return;
                      // }
                      setSelectedDemographics(
                        selectedDemographics.filter((s) => s !== sel)
                      );
                    }}
                  >
                    {sel} <ImCancelCircle />
                  </button>
                );
              })}
            </div>
          </div>

        </div>
          <button disabled={loading} className="button w-1/2  font-semibold italic flex items-center justify-center self-center text-xl rounded-md bg-primary-400 text-cbg-200 py-1 " onClick={getRecommendations}>
          {loading ? (
            <Hourglass
              visible={true}
              wrapperClass="h-5 "
              colors={["#041C32", "#421fa3"]}
            />
          ) : (
            <>
             Go <MdElectricBolt />
            </>
          )}
          </button>
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
