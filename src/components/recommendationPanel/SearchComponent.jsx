// components/SearchComponent.js
"use client";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaChevronRight } from "react-icons/fa6";
import { MagnifyingGlass } from "react-loader-spinner";

//* custom hook for debouncing
const useDebouncedValue = (inputValue, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(inputValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(inputValue.trim());
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, delay]);

  return debouncedValue;
};

const SearchComponent = ({viewAll=true}) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchRes, setSearchRes] = useState();
  const debouncedSearchTerm = useDebouncedValue(query, 1500);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;
    setLoading(true);

    (async () => {
      try {
        if(debouncedSearchTerm==="")return;
        const response = await axios.get(
          `/api/v1/search?q=${debouncedSearchTerm}&limit=10`,
          { signal } // Link the signal
        );

        if (response.status === 200) {
          // console.log(response?.data);
          setSearchRes(response?.data?.points);
          setLoading(false);
        } else {
          setLoading(false);
          console.error(`HTTP error! Status: ${response.status}`);
        }
      } catch (error) {
        setLoading(false);
        if (!axios.isCancel(error)) {
          console.error(error);
        }
      }
    })();

    return () => {
      // Cancel the request when the component unmounts
      abortController.abort();
      // setLoading(true);
    };
  }, [debouncedSearchTerm]);

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  return (
    <>
      <div className="h-full w-full relative flex gap-1 z-40 flex-col">
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={handleChange}
          className=" tracking-wide  text-gray-700 outline-primary-200 px-3 py-2.5 rounded-lg h-full w-full"
        />
        {debouncedSearchTerm !== "" && (
          <div className="absolute !scrollbar-track-rounded-full scrollbar-thumb-rounded-full scrollbar-thin scrollbar-track-rounded-full top-full mt-2 left-0 w-full p-2 bg-cbg-300 max-h-[20vh] md:max-h-[50vh] overflow-y-scroll  rounded-md flex flex-col z-20 text-gray-800  ">
            {loading ? (
              <MagnifyingGlass
                visible={true}
                height="80"
                className="flex mx-auto"
                mar
                width="80"
                ariaLabel="magnifying-glass-loading"
                wrapperStyle={{}}
                wrapperClass="magnifying-glass-wrapper"
                glassColor="#c0efff"
                color="#e15b64"
              />
            ) : (
              searchRes?.length>0 ? <> {searchRes?.map((anime) => {
                const {title_english, images, main_picture, type, rating, score, start_year} = anime?.payload;
                return (
                  <Link href={`/anime/${anime.id}`} onClick={()=>{
                    setQuery("");
                    setSearchRes(null);
                  }} className="flex result-card-container   border-y-[1px] border-gray-500  hover:text-[whitesmoke] rounded-sm cursor-pointer hover:bg-cbg-400 gap-3 px-1 py-2 text-white" key={anime?.id}>

                      <div className="relative  h-16 w-12 flex-shrink-0">
                      <Image className="object-cover "
                        src={images?.webp?.image_url || main_picture || images?.webp?.small_image_url} alt="poster image"
                        fill={true}
                        sizes="(max-width: 768px) 25vw, (max-width: 1024px) 20vw, 15vw"/>
                      </div>

                      <div className="flex flex-col gap-2">
                      <span className="line-clamp-1 text-left text-ellipsis ">{title_english || "NA"}</span>

                      <div className="metadata flex text-xs gap-2 items-center text-sky-300">
                        <span className="flex gap-1 ">
                          <b className="flex items-center text-gray-300">&bull;</b>
                          {(type && type?.toUpperCase()) || "NA"}
                        </span>

                        <span className="flex gap-1  text-primary-400">
                          <b className="flex items-center text-gray-300">&bull;</b>
                          {Math.floor(start_year) || "NA"}
                          </span>

                        <span className="flex gap-1  ">
                          <b className="flex items-center text-gray-300">&bull;</b>
                          {(rating && rating?.split(" ")[0].toUpperCase()) || "NA"}</span>

                          <span className="flex gap-1  text-primary-400">
                          <b className="flex items-center text-gray-300">&bull;</b>
                          {score? score.toFixed(2) : "NA"}
                          </span>


                      </div>
                      </div>
                  </Link>
                )
              }) }
              {
               viewAll && <Link href={`./catalog?q=${query}`} className="w-full py-2 items-center gap-2 flex rounded-md mt-4 bg-primary-500 text-cbg-200 justify-center " onClick={()=>setQuery("")}>View All <FaChevronRight size={13}/></Link>
                
                }</>:
              <div className="text-gray-200 flex mx-auto">No Results found !!</div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default SearchComponent;
