"use client";
import React, { useEffect, useState } from "react";
import useAnimeStore from "@/components/utils/animeStore";
import Image from "next/image";
import { FaPlay, FaPlayCircle } from "react-icons/fa";
import { MdPlayDisabled } from "react-icons/md";
import { RxDotFilled } from "react-icons/rx";
import { MdOutlineSportsScore } from "react-icons/md";
import { PiVideoFill } from "react-icons/pi";
import { IoMdAdd, IoMdTimer } from "react-icons/io";
import Link from "next/link";
import Details from "./Details";
import Synopsis from "./Synopsis";
import Relations from "./Relations";
import Suggested from "./Suggested";
import Skeleton from "react-loading-skeleton";
import toast, { Toaster } from "react-hot-toast";
import GetLoggedUserWatchListsInfo from "@/app/firebase/WatchList/WatchListDocument/GetLoggedUserWatchListsInfo";
import ListDropDown from "@/components/utils/ListDropDown";
import {
  Constant_Var_errorMessage_loggedInUserDoesNostExistsYet,
  Constant_Var_errorMessage_notAuthenticatedUser,
  Constant_Var_errorMessage_userDoesNotExistWithThisId,
  Constant_Var_success,
} from "@/utils/constants";
import SignInGooglePopUp from "@/app/firebase/SignIn/SignInGooglePopUp";
import { useRouter } from "next/navigation";
import useUserStore from "@/components/ZustandStores/userStore";
import ShareModal from "@/components/utils/ShareModal";

export default function Anime({ params }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWatchListOpen, setIsWatchListOpen] = useState(false);
  const [watchListData, setWatchListData] = useState();
  const [recentData, setRecentData] = useState();
  const { anime, fetchAnime } = useAnimeStore((state) => ({
    fetchAnime: state.fetchAnime,
    anime: state.getAnimeById(params.id),
  }));

  const router = useRouter();

  const { RecentWatchListData } = useUserStore();

  useEffect(() => {
    const fetchData = async () => {

      if (!params?.id || anime) return;

      const res = await fetchAnime(params.id);

      // Check if the response status is 404, then redirect to /not-found
      if (res?.status === 404) {
        router.replace("/not-found");
      }
    };

    fetchData();

    return () => {};
  }, [params?.id, anime]);

  useEffect(() => {
    const filteredData = RecentWatchListData?.filter(
      (obj) => obj?.animeId === `${params?.id}`
    );
    if(filteredData?.length > 0){
      setRecentData(filteredData[0]);
      // console.log(filteredData[0]);
    }
    
  }, [RecentWatchListData]);

  const filteredRelations = anime?.relations
    ?.map((item) => ({
      ...item,
      entry: item.entry.filter((entryItem) => entryItem.type === "anime"),
    }))
    .filter((item) => item.entry.length > 0);

  const handleOnClickWatchList = async () => {
    const result = await GetLoggedUserWatchListsInfo();

    if (result.status === Constant_Var_success) {
      setWatchListData(result?.response);
      setIsWatchListOpen((prev) => !prev);
      return;
    } else if (
      result.response.message === Constant_Var_errorMessage_notAuthenticatedUser
    ) {
      const signInResp = await SignInGooglePopUp((status) => {
        console.log("login status:", status);
      });

      if (signInResp.status === Constant_Var_success) return;
      else toast.error(signInResp?.response?.message, { duration: 3000 });
    }
    toast.error(result?.response?.message, { duration: 3000 });
  };

  return (
    <div className="w-full h-full">
      {
        // anime &&
        <div
          className={`trailer w-full ${
            isPlaying ? "md:h-[90vh] h-60" : "h-64"
          } relative`}
        >
          {!isPlaying ? (
            <>
              <div className="w-full h-full absolute backdrop-blur-md bg-black/30 z-10"></div>
              <div className="relative h-full w-full object-cover  ">
                {anime?.trailer ? (
                  <Image
                    src={
                      anime?.trailer?.images?.image_url ||
                      anime?.images?.webp?.image_url
                    }
                    alt="YouTube Thumbnail"
                    fill
                    className=" object-cover  "
                  />
                ) : (
                  <Skeleton containerClassName="w-full h-full flex" />
                )}
              </div>
            </>
          ) : (
            <div className=" w-full h-full">
              <iframe
                src={anime?.trailer?.embed_url} // Assuming `anime.trailer.url` contains the direct video URL
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          )}
        </div>
      }
      <div className="playbutton flex w-full h-14 ml-auto ">
        {anime?.trailer?.embed_url && (
          <button
            className="rounded-md  flex ml-auto mx-4 bg-primary-100 text-cbg-100 gap-1 font-semibold py-1 px-2 items-center my-2"
            onClick={() => setIsPlaying((prev) => !prev)}
          >
            {!isPlaying ? (
              <>
                <FaPlay className="text-sm" /> <span>Show Trailer</span>
              </>
            ) : (
              <>
                <MdPlayDisabled className="text-2xl" />{" "}
                <span> Hide Trailer </span>
              </>
            )}
          </button>
        )}
      </div>

      {
        // anime &&
        <div className="">
          <div className="first-container w-full md:gap-16 gap-12 flex md:flex-row flex-col  md:px-12 px-4">
            <div className="image-and-details md:w-[28%] w-3/5 mx-auto md:mx-1 flex flex-col">
              <div
                className={`relative mt-12 md:mt-auto md:mb-8 self-center  image flex h-96 ${
                  isPlaying
                    ? "md:translate-y-0 mb-4 md:mb-12"
                    : "md:-translate-y-32"
                }  z-10 w-full shadow-xl to-cbg-100/65  overflow-hidden rounded-md   `}
              >
                {anime?.title ? (
                  <Image
                    src={
                      anime?.images?.webp?.large_image_url ||
                      anime?.images?.jpg?.large_image_url ||
                      anime?.images?.jpg?.image_url ||
                      anime?.images?.webp?.image_url
                    }
                    fill
                    className="shadow-lg "
                    alt={anime?.title_english || anime?.title}
                  />
                ) : (
                  <Skeleton containerClassName="w-full h-full flex" />
                )}
              </div>
            </div>

            <div className="md:flex gap-4 w-full ">
              <div className="primary-content flex flex-col md:w-2/3 w-full">
                <h1 className="w-full text-4xl md:text-left text-center font-semibold tracking-wide">
                  {anime?.title_english || anime?.title || (
                    <Skeleton containerClassName="w-full h-full flex" />
                  )}
                </h1>

                {/* //!below div contains data like episodes, type, duration etc */}
                <div className="additional-data justify-center md:justify-start flex gap-2 md:text-sm my-8">
                  {anime && (
                    <>
                      {anime?.score && (
                        <div className="score rounded flex items-center bg-sky-400 p- px-1 text-cbg-200 font-semibold">
                          <MdOutlineSportsScore className="text-xl" />{" "}
                          {typeof anime?.score === "number" ? anime.score.toFixed(2) :( anime?.score || "NA")}
                        </div>
                      )}
                      <div className="episodes flex gap-1 bg-primary-300 text-cbg-200 font-semibold rounded px-1 items-center">
                        <PiVideoFill /> {anime?.episodes || "?"}
                      </div>
                      <div className="flex gap-1 items-center bg-cbg-400 rounded px-1">
                        <IoMdTimer />{" "}
                        {anime?.duration || anime?.episode_duration || "?"}
                      </div>
                      <div className="type flex  items-center">
                        <RxDotFilled /> {anime?.type?.toUpperCase() || "?"}
                      </div>
                      <div className="flex "> 
                      <ShareModal />
                    </div>
                    </>
                  )}
                </div>

                {anime ? (
                  <div className="flex mt-4 gap-4 justify-center md:justify-start">
                    {anime?.Sites && (
                      <Link
                        href={
                          recentData
                            ? `${recentData?.url}&t=${recentData?.episodeTimestamp}`
                            : `/watch/${params?.id}?provider=${process.env.NEXT_PUBLIC_PROVIDER || "zoro"}`
                        }
                        className="watchnow flex gap-2 items-center bg-primary-500  rounded-full font-sembold px-3 py-1 text-cbg-100 text-lg"
                      >
                        <FaPlayCircle />
                        Watch Now
                      </Link>
                    )}
                    <div className="flex flex-col">
                      <button
                        className="watchnow flex gap-2 items-center bg-gray-200  rounded-full font-sembold px-3 py-1 text-cbg-100 text-lg"
                        onClick={handleOnClickWatchList}
                      >
                        <IoMdAdd /> Edit Watch List
                      </button>

                      {isWatchListOpen && (
                        <ListDropDown
                          anime={anime}
                          isOpen={isWatchListOpen}
                          watchListData={watchListData}
                          setIsOpen={setIsWatchListOpen}
                        />
                      )}
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
                ) : (
                  <div className="flex mt-4 gap-4 w-full h-20">
                    <Skeleton
                      containerClassName="w-full gap-4 p-5 h-full  flex"
                      borderRadius={"1rem"}
                      className="rounded-md"
                      count={2}
                    />
                  </div>
                )}

                {anime?.gif_images && (
                  <div className="gif py-16  items-center  flex gap-4">
                    <div className="relative overflow-hidden rounded-full  md:w-20 w-28 h-20 object-cover object-center">
                      <Image
                        src={
                          anime.gif_images?.original?.webp ||
                          anime.gif_images?.fixed_height?.webp ||
                          anime.gif_images?.fixed_width?.webp
                        }
                        alt={anime.title_english || anime.title}
                        fill
                        className=""
                        unoptimized
                      />
                    </div>

                    <div className="gifcontent md:w-3/5 w-full">
                      Check out our{" "}
                      <Link
                        href="/recommendations"
                        className="text-fuchsia-500 font-semibold italic"
                      >
                        Recommendations
                      </Link>{" "}
                      page for more similar Anime like{" "}
                      <div className="text-primary-300 w-full    overflow-hidden text-ellipsis text-nowrap italic  font-semibold ">
                        {anime.title_english || anime.title}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {anime?.streaming?.length > 0 && (
                <div className="stream w-full md:w-1/3 flex flex-col justify-center ">
                  <h2 className="font-semibold text-xl mb-4 md:-mt-8 text-gray-200">
                    Also Stream On:
                  </h2>
                  <div className="content  grid md:grid-cols-1 grid-cols-2 flex-col gap-5">
                    {anime?.streaming?.map((stream) => {
                      if (
                        ![
                          "Netflix",
                          "Crunchyroll",
                          "Hulu",
                          "Funimation",
                        ].includes(stream?.name)
                      )
                        return;

                      return (
                        <Link
                          key={stream?.name}
                          href={stream?.url}
                          target="_blank"
                          className={`flex items-baseline object-cover object-center  w-32 h-6`}
                        >
                          <img
                            src={`/${stream?.name}.png`}
                            alt={stream?.name}
                            className="h-full object-contain w-full"
                          />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {anime && (
            <>
              <div
                className="bgimage  bg-cover bg-bottom object-cover w-full h-full bg-no-repeat"
                style={{
                  backgroundImage: `url(${
                    anime?.trailer?.images?.large_image_url ||
                    anime?.images?.webp?.large_image_url
                  })`,
                }}
              >
                <div className="second-container py-4  md:bg-cbg-100 bg-black md:bg-opacity-80 backdrop-blur-lg justify-around md:flex px-4 md:px-12 w-full my-8">
                  {/* //? details component */}
                  <Details anime={anime} />
                  <Synopsis
                    description={anime?.synopsis}
                    background={anime?.background}
                    theme={anime?.theme}
                  />
                </div>
              </div>

              {Array.isArray(filteredRelations) &&
                filteredRelations?.length > 0 && (
                  <Relations relations={filteredRelations} />
                )}
              <Suggested id={params?.id} />
            </>
          )}
        </div>
      }
    </div>
  );
}
