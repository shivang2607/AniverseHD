"use client";
import React, { Suspense, useRef, useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import {
  getSessionWithExpiry,
  setSessionWithExpiry,
} from "@/components/utils/storage";
import { IoMdAdd } from "react-icons/io";
import { PiBookmarkSimpleBold } from "react-icons/pi";
import ProviderContainer from "./ProviderContainer";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import useStreamStore from "@/components/utils/streamStore";
import GetLoggedUserWatchListsInfo from "@/app/firebase/WatchList/WatchListDocument/GetLoggedUserWatchListsInfo";
import ListDropDown from "@/components/utils/ListDropDown";
import toast, { Toaster } from "react-hot-toast";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import {
  AudioGainSlider,
  Captions,
  isHLSProvider,
  MediaPlayer,
  MediaProvider,
  Track,
  useMediaPlayer,
} from "@vidstack/react";
import {
  DefaultAudioLayout,
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";
import { ImCross } from "react-icons/im";
import { ThreeCircles } from "react-loader-spinner";
import {
  Constant_Var_errorMessage_notAuthenticatedUser,
  Constant_Var_success,
} from "@/utils/constants";
import SignInGooglePopUp from "@/app/firebase/SignIn/SignInGooglePopUp";
import Image from "next/image";
import useUserStore from "@/components/ZustandStores/userStore";
import UpdatePlayerOptions from "@/app/firebase/Profile/UpdatePlayerOptions";
import HandleUpdateMediaPlayerOptions from "./handleMediaPlayerOptions";
import Suggested from "@/app/anime/[id]/Suggested";
import AddAnimeToWatchList from "@/app/firebase/WatchList/UpdateWatchLists/AddAnimeToWatchList";
import { getAbsoluteURLPath } from "./utilFunctions";
import { TbPlayerTrackNextFilled } from "react-icons/tb";
import ShareModal from "@/components/utils/ShareModal";
import Metadata from "./Metadata";
<<<<<<< HEAD
=======
import { FaStepBackward, FaStepForward } from "react-icons/fa";
>>>>>>> 000c304d73503363c186d26c017eee5ef436bfa7

export default function Page({ params }) {
  const searchParams = useSearchParams();
  const zoroId = searchParams.get("z-id") || null;
  const gogoSubId = searchParams.get("g-sub-id") || null;
  const gogoDubId = searchParams.get("g-dub-id") || null;
  const provider = searchParams.get("provider") || "zoro";
  const serverV = searchParams.get("server");
  const dubV = searchParams.get("dub") || "";
  const startTime = Number(searchParams.get("t")) || 0;
  // const startTime = times.length > 0 ? Number(times[times.length - 1]) : 0;

  const [content, setContent] = useState();
  const [isWatchListOpen, setIsWatchListOpen] = useState(false);
  const [watchListData, setWatchListData] = useState();
  const [animeNotAvailable, setAnimeNotAvailable] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const player = useRef(null);
  const debounceMediaPlayerUpdate = HandleUpdateMediaPlayerOptions();

  const {
    episodesData,
    setEpisodesData,
    streamingData,
    setStreamingData,
    selectedProvider,
    setSelectedProvider,
    serverData,
    setServerData,
    server,
    setServer,
    zoroEpisodeId,
    setZoroEpisodeId,
    gogoSubEpisodeId,
    setGogoSubEpisodeId,
    gogoDubEpisodeId,
    setGogoDubEpisodeId,
    dub,
    setDub,
    setServerLoading,
    // isAutoSkip, setIsAutoSkip,
  } = useStreamStore();

  const {
    loggedInUserData,
    isUserLoggedIn,
    RecentWatchListId,
    loadLoggedInUserRecentWatchList,
  } = useUserStore();

  const [showSkipButton, setShowSkipButton] = useState("");
  const [mediaPlayerState, setMediaPlayerState] = useState({
    isAutoSkip: false,
    isAutoPlay: true,
    isAutoNext: true,
  });
  const [isNextEpisodeAvailable, setIsNextEpisodeAvailable] = useState(true);
  const [isPrevEpisodeAvailable, setIsPrevEpisodeAvailable] = useState(false);
  const [recentTimestamp, setRecentTimestamp] = useState(0);
  const [duration, setDuration] = useState();
  const currentAbsoluteURL = useRef("");
  const recentTimestampRef = useRef(recentTimestamp);
  const durationRef = useRef(duration);
  const contentRef = useRef(content);
  // const [isAutoSkip, setIsAutoSkip] = useState(true);

  useEffect(() => {
    const cachedPlayerOptions = JSON.parse(
      localStorage.getItem("player_options")
    );
    if (cachedPlayerOptions) {
      setMediaPlayerState(cachedPlayerOptions);
    }

    return () => {
      console.log(
        "cleanup of watch triggered, user logged in is ",
        isUserLoggedIn
      );
      const f = async () => {
        const content = contentRef.current;
        const result = await AddAnimeToWatchList({
          watchListId: RecentWatchListId,
          url: currentAbsoluteURL.current,
          episodeTimestamp: recentTimestampRef.current,
          duration: durationRef.current,
          animeId: `${params?.id}`,
          animeName: content?.title_english || content?.title,
          animePhoto: content?.main_picture || content?.images || {},
          animeGenre: content?.genres || [],
          animeType: content?.type || "NA",
          animeScore: content?.score || "NA",
          animeAgeRating: content?.rating || "NA",
          animeStartYear:
            Math.floor(
              content?.aired?.prop?.from?.year ||
                content?.start_year ||
                content?.year
            ) || "NA",
          animeLength: content?.episodes || content?.episode || null,
        });
        console.log("RESULT OF ADDING ANIME IN RECENT WATCHLIST ", result);
        // if (result?.status === Constant_Var_success) {
        //   toast.success("Watchlist Updated Successfully!!", {
        //     id: "1",
        //     duration: 3000,
        //   });
        //   setIsOpen(false);
        // } else {
        //   toast.error(result?.response?.message, { duration: 3000, id: "2 " });
        // }

        loadLoggedInUserRecentWatchList();
      };
      if (isUserLoggedIn) f();
    };
  }, []);

  useEffect(() => {
    recentTimestampRef.current = recentTimestamp;
  }, [recentTimestamp]);

  useEffect(() => {
    currentAbsoluteURL.current = getAbsoluteURLPath(pathname, searchParams);
  }, [searchParams, pathname]);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  useEffect(() => {
    const mediaPlayerOptions = loggedInUserData?.playerOptions;

    if (mediaPlayerOptions) {
      setMediaPlayerState({
        isAutoNext: mediaPlayerOptions?.autoNext,
        isAutoPlay: mediaPlayerOptions?.autoPlay,
        isAutoSkip: mediaPlayerOptions?.autoSkipIntro,
      });
      return;
    }
  }, [loggedInUserData]);

  useEffect(() => {
    if (!provider) {
      window.alert("No provider provided in params");
      router.back();
      return;
    }
    setServer(serverV);
    setZoroEpisodeId(zoroId);
    setGogoDubEpisodeId(gogoDubId);
    setSelectedProvider(provider);
    setGogoSubEpisodeId(gogoSubId);
    setDub(dubV);
    setRecentTimestamp(0);

    // console.log("Hello world!!",provider, episodeId, selectedEpisodeId);

    return () => {};
  }, [provider, zoroId, gogoSubId, gogoDubId, serverV, dubV]);

  useEffect(() => {
    if (!params?.id) return;

    setStreamingData(null);

    (async () => {
      const cachedData = getSessionWithExpiry(`watch-${params.id}`);
      if (cachedData) {
        setContent(cachedData);

        mergeProviderData(
          cachedData?.zoro,
          cachedData?.gogoDub,
          cachedData?.gogoSub
        );

        if (!zoroId && !gogoSubId && !gogoDubId) {
          setZoroEpisodeId(cachedData?.zoro?.episodes?.[0]?.episodeId);
          setGogoSubEpisodeId(cachedData?.gogoSub?.episodes?.[0]?.id);
          setGogoDubEpisodeId(cachedData?.gogoDub?.episodes?.[0]?.id);
        }
        // console.log(cachedData);

        return;
      }
      // console.log(params?.id)
      try {
        const response = await axios.get(`/api/v1/watch/${params?.id}`);
        const data = response?.data;

        // Check if the data object has an 'error' key
        if (data?.error) {
          console.error(`Error in response data: ${data.error}`);
          setAnimeNotAvailable(true);
          // Optionally, you could set some error state here or throw an error to handle it elsewhere
          return;
        }

        console.log(`data for /watch/${params?.id}`, data);
        setContent(data);
        // console.log("This is content data", response, data);

        // Set session with 30-minute expiry
        setSessionWithExpiry(`watch-${params.id}`, data, 1000 * 60 * 30);

        // Merge provider data only if keys are available in data
        mergeProviderData(data?.zoro, data?.gogoDub, data?.gogoSub);
        if (!zoroId && !gogoSubId && !gogoDubId) {
          setZoroEpisodeId(data?.zoro?.episodes?.[0]?.episodeId);
          setGogoSubEpisodeId(data?.gogoSub?.episodes?.[0]?.id);
          setGogoDubEpisodeId(data?.gogoDub?.episodes?.[0]?.id);
        }
        setAnimeNotAvailable(false);
      } catch (error) {
        // Log the error and handle it gracefully
        console.error(
          `Failed to fetch data for /watch/${params?.id}:`,
          error.message
        );
        setAnimeNotAvailable(true);
        return;
        // Optionally, update state to reflect error or notify the user
      }

      // console.log(data?.data);
    })();
  }, [params]);

  useEffect(() => {
    (async () => {
      const currentIndex = episodesData?.findIndex(
        (ep) =>
          ep?.episodeId === zoroEpisodeId ||
          ep?.gogoDubId === gogoDubEpisodeId ||
          ep?.gogoSubId === gogoSubEpisodeId
      );

      
      if (!provider) router.replace("/not-found");
      
      setIsNextEpisodeAvailable(true);
      setIsPrevEpisodeAvailable(true);
      if(currentIndex === 0) setIsPrevEpisodeAvailable(false);
      else if(currentIndex === episodesData?.length - 1) setIsNextEpisodeAvailable(false);

      if (provider === "zoro" && zoroEpisodeId) {
        const cachedServerData = getSessionWithExpiry(
          `serverData-${provider}-${zoroEpisodeId}`
        );
        if (cachedServerData) {
          // console.log("cached servers data : ", cachedServerData);
          // if sub is not available then cahnge the default server and dub flag to the raw
          const subLength = cachedServerData?.sub?.length;
          // console.log(
          //   "subLength is ",
          //   subLength,
          //   "condition is ",
          //   subLength && dub != "1"
          // );
          router.replace(
            updateParams(
              [{ key: "dub", val: updateDubVal(cachedServerData) }],
              false
            )
          );

          setServerData(cachedServerData);
          if (!serverV)
            setServer(
              cachedServerData?.sub?.[0]?.serverName ||
                cachedServerData?.raw?.[0]?.serverName
            );
          // return;
        } else {
          const serverData = await axios.get(
            `/api/v1/${provider}/servers/${zoroEpisodeId}`
          );

          router.replace(
            updateParams(
              [{ key: "dub", val: updateDubVal(serverData?.data?.data) }],
              false
            )
          );

          setServerData(serverData?.data?.data);
          setServer(
            serverData?.data?.data?.sub?.[0]?.serverName ||
              serverData?.data?.data?.raw?.[0]?.serverName
          );
          console.log("server", serverData?.data?.data?.sub?.[0]?.serverName);
          setSessionWithExpiry(
            `serverData-${provider}-${zoroEpisodeId}`,
            serverData?.data?.data,
            1000 * 60 * 60 * 24
          ); //24 hrs
        }
      }
    })();

    return () => {
      // setServerData(null);
    };
  }, [zoroEpisodeId, gogoDubEpisodeId, provider, gogoSubEpisodeId]);

  const updateParams = (paramsList, resetT = true) => {
    const newParams = new URLSearchParams(searchParams);
    if (resetT) newParams.delete("t");
    paramsList.forEach((par) => {
      newParams.set(par.key, par.val);
    });

    return pathname + "?" + newParams.toString();
  };


  const getPrevEpisode = () => {
    const currentIndex = episodesData?.findIndex(
      (ep) =>
        ep?.episodeId === zoroEpisodeId ||
        ep?.gogoDubId === gogoDubEpisodeId ||
        ep?.gogoSubId === gogoSubEpisodeId
    );

    

    if (currentIndex !== -1 && currentIndex > 0 ) {
      const ep = episodesData[currentIndex - 1]; // Return the prev episode's ID
      const url = updateParams([
        { key: "z-id", val: ep?.episodeId },
        { key: "g-sub-id", val: ep?.gogoSubId },
        { key: "g-dub-id", val: ep?.gogoDubId },
        { key: "n", val: currentIndex - 1 },
      ]);

      router.push(url);
    } else {
      setIsPrevEpisodeAvailable(false);
      return null; // No prev episodes available
    }

  }

  const getNextEpisode = () => {
    const currentIndex = episodesData?.findIndex(
      (ep) =>
        ep?.episodeId === zoroEpisodeId ||
        ep?.gogoDubId === gogoDubEpisodeId ||
        ep?.gogoSubId === gogoSubEpisodeId
    );

    if (currentIndex !== -1 && currentIndex < episodesData.length - 1) {
      const ep = episodesData[currentIndex + 1]; // Return the next episode's ID
      const url = updateParams([
        { key: "z-id", val: ep?.episodeId },
        { key: "g-sub-id", val: ep?.gogoSubId },
        { key: "g-dub-id", val: ep?.gogoDubId },
        { key: "n", val: currentIndex + 1 },
      ]);
      router.push(url);
    } else {
      setIsNextEpisodeAvailable(false);
      return null; // No more episodes available
    }
  };

  const updatePlayerOptions = (newOpt) => {
    localStorage.setItem("player_options", JSON.stringify(newOpt));
    setMediaPlayerState(newOpt);
    if (isUserLoggedIn) debounceMediaPlayerUpdate(newOpt);
    else {
      toast.success("Changes saved!");
    }
  };

  // console.log(episodesData);

  const mergeProviderData = (zoro, gogoDub, gogoSub) => {
    const gds = gogoDub?.episodes?.length; //gogo dub size
    const gss = gogoSub?.episodes?.length; //gogo sub size
    if (zoro?.episodes) {
      const newMergedData = zoro?.episodes?.map((ep, idx) => {
        return {
          ...ep,
          gogoSubId: gss > idx ? gogoSub?.episodes[idx].id : null,
          gogoDubId: gds > idx ? gogoDub?.episodes[idx].id : null,
        };
      });
      setEpisodesData(newMergedData);
      // console.log("this is merged data with zoro", newMergedData);
    } else if (gogoSub?.episodes) {
      const newMergedData = gogoSub?.episodes?.map((ep, idx) => {
        return {
          ...ep,
          gogoDubId: gds > idx ? gogoDub?.episodes[idx].id : null,
        };
      });
      setEpisodesData(newMergedData);
      // console.log("this is merged data with zoro", newMergedData);
    } else setEpisodesData(null);
  };

  const handleSkipIntro = () => {
    if (player) {
      const skipToTime =
        showSkipButton === "intro"
          ? streamingData?.intro?.end
          : streamingData?.outro?.end;

      if (typeof skipToTime === "number") {
        console.log("Current time before skip:", player.currentTime); // Should now work correctly
        player.currentTime = skipToTime; // Skip to the end of the intro or outro
        console.log("Current time after skip:", player.currentTime);
      } else {
        console.error("Invalid time value for skipping.");
      }

      setShowSkipButton(""); // Hide the button after skipping
    } else {
      console.error("Player not found!");
    }
  };

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

  const handleTimeUpdate = (v, event) => {
    if (!streamingData?.intro) return;
    const player = event.target;
    const currentTime = player?.currentTime;

    const t = currentTime;
    if (
      Math.floor(t) % 5 == 0 &&
      Math.floor(t) !== Math.floor(recentTimestamp)
    ) {
      //save timestamp after every 5 seconds
      console.log(recentTimestamp);
      setRecentTimestamp(t);
    }

    // console.log(currentTime, v);
    // Define the intro and outro timestamps
    const introStart = streamingData?.intro?.start;
    const introEnd = streamingData?.intro?.end;
    const outroStart = streamingData?.outro?.start;
    const outroEnd = streamingData?.outro?.end;

    if (!mediaPlayerState?.isAutoSkip) {
      if (currentTime < introEnd && currentTime > introStart) {
        setShowSkipButton("Intro");
      } else if (currentTime > outroStart && currentTime < outroEnd) {
        setShowSkipButton("Outro");
      } else setShowSkipButton("");

      return; //if auto skip intro flag is off then no need to autoskip the intro or outro
    }

    // Skip intro
    if (currentTime < introEnd && currentTime > introStart) {
      player.currentTime = introEnd;
    }

    // Skip outro
    if (currentTime > outroStart && currentTime < outroEnd) {
      player.currentTime = outroEnd; // Skip to the end
    }
  };

  const updateDubVal = (serData) => {
    const subLength = serData?.sub?.length;
    const dubLength = serData?.dub?.length;

    if (dub == "") {
      if (subLength) return "";
      return "-1";
    } else if (dub == "1") {
      if (dubLength) return "1";
      if (subLength) return "";
      return "-1";
    } else if (dub == "-1") {
      if (subLength) return "";
      return "-1";
    }
    return "";
  };

  return (
    <div className="py-16">
      <div className="content py-2 md:px-4 flex flex-col gap-4">
        {!animeNotAvailable && (
          <h1 className="text-2xl mx-2 md:mx-0 tracking-wide my-3 font-semibold  self-center">
            {" "}
            Currently Watching : {content?.title_english || content?.title}
          </h1>
        )}
        <div className="stream-container self-center md:w-[95%] w-full flex flex-col gap-12 ">
          <div className="bg-cbg-200 md:p-4 ">
            {animeNotAvailable ? (
              <div className=" mx-auto flex flex-col gap-4 h-72 w-72 justify-center items-center">
                <div className="relative overflow-hidden rounded h-full w-full flex flex-col gap-4 mx-auto object-cover object-center">
                  <Image
                    src="/anime-not-available.webp"
                    unoptimized
                    alt="Anime not Available for Streaming..."
                    fill
                    className=""
                  />
                </div>
                <div className="text-lg text-center mx-aut z-20">
                  Sorry! Not Available on this Provider !!
                </div>
              </div>
            ) : !streamingData ? (
              <div className="self-center flex gap-2 bg-black text-xl tracking-wider items-center justify-center text-sky-400 w-full h-72">
                <ThreeCircles
                  visible={true}
                  height="100"
                  width="100"
                  color="#0ea5e9"
                  // className="text-sky-500"
                  ariaLabel="three-circles-loading"
                  wrapperStyle={{}}
                  wrapperClass=""
                />
              </div>
            ) : streamingData?.status === 500 ? (
              <div className="self-center flex gap-2 bg-black text-xl tracking-wider items-center justify-center text-sky-400 w-full h-72">
                <ImCross color="red" /> {streamingData?.message}
              </div>
            ) : (
              <div className="stream block bg-black md:h-[85vh] h-fit w-full rounded my-4">
                <MediaPlayer
                  load="eager"
                  autoPlay={mediaPlayerState?.isAutoPlay ? true : false}
                  ref={player}
                  keyTarget="player"
                  storage="media-player"
                  buffer
                  title={streamingData?.malId}
                  src={
                    process.env.NEXT_PUBLIC_GOOD_PROXY +
                    encodeURIComponent(streamingData?.sources?.[0]?.url)
                  }
                  className="h-full"
                  playsInline
                  crossOrigin
                  streamType="on-demand"
                  onLoadedMetadata={(e) => {
                    console.log(
                      "duration of this episode is ",
                      e.target.duration
                    );
                    setDuration(e.target.duration);
                  }}
                  onProviderChange={(provider, event) => {
                    if (isHLSProvider(provider)) {
                      provider.config = {
                        nudgeMaxRetry: 5,
                        maxFragLookUpTolerance: 0.5,
                        fragLoadingTimeOut: 30000,
                        fragLoadingMaxRetry: 5,
                        maxMaxBufferLength: 600,
                        maxBufferLength: 20,
                      };
                    }
                  }}
                  // crossOrigin="anonymous"

                  currentTime={startTime}
                  onError={(e) =>
                    toast.error(`${e.message}, Try Another Server.`)
                  }
                  onEnded={() =>
                    mediaPlayerState?.isAutoNext && getNextEpisode()
                  } //only fetch next episode if the auto next state is set to true.
                  onTimeUpdate={(v, event) => {
                    handleTimeUpdate(v, event);
                  }}

                  // onHlsError={()=>{
                  //   toast.error("Error while loading the file, Try another Provider or try after some time.");
                  //   console.log("Some error occured in playing the file.");
                  // }}
                >
                  <MediaProvider>
                    {streamingData?.tracks
                      ?.filter((t) => t?.kind === "captions")
                      ?.map((tr, index) => {
                        return (
                          // <Captions key={tr?.file} src={tr?.file}  label={tr?.label} default={tr?.default} className="vds-captions"/>
                          <Track
                            key={tr?.file}
                            src={tr?.file}
                            kind="subtitles"
                            label={tr?.label}
                            // lang="en-US"
                            default={tr?.default}
                          />
                        );
                      })}
                  </MediaProvider>
                  <DefaultVideoLayout
                    thumbnails={
                      streamingData?.tracks?.filter(
                        (t) => t.kind === "thumbnails"
                      )?.[0]?.file
                    }
                    slots={{
                      beforeCaptionButton: (
                        <div className="change episodes flex gap-4 mx-4 text-xl">
                          <button
                            disabled={!isPrevEpisodeAvailable}
                            className="hover:scale-110 duration-150 ease-in disabled:text-gray-400"
                            onClick={getPrevEpisode}
                          >
                            <FaStepBackward />
                          </button>
                          <button
                            disabled={!isNextEpisodeAvailable}
                            className="hover:scale-110 duration-150 ease-in disabled:text-gray-400"
                            onClick={getNextEpisode}
                          >
                            <FaStepForward />
                          </button>
                        </div>
                      ),
                      afterCaptions: showSkipButton && (
                        <button
                          className="md:text-lg w-fit h-fit absolute right-4 bottom-8 md:right-12 md:bottom-24 px-2 py-1 border-white border-2 rounded-md font-semibold backdrop-blur-lg bg-black/10 flex"
                          onClick={() => {
                            console.log(
                              player?.current?.currentTime,
                              streamingData?.intro?.end
                            );
                            player.current.currentTime =
                              showSkipButton === "Intro"
                                ? streamingData?.intro?.end
                                : streamingData?.outro?.end; // Skip to the end of the intro
                            setShowSkipButton(""); // Hide the button after skipping
                          }}
                        >
                          Skip {showSkipButton}
                        </button>
                      ),
                    }}
                    icons={defaultLayoutIcons}
                  />
                </MediaPlayer>
              </div>
            )}
            <div className="flex mt-4 mx-1 md:mx-4 md:text-sm my-2  text-[10px] md:gap-1 gap-[0.20rem]">
              <button
                className="favorites flex items-center text-lg  md:mr-5 justify-center gap-1"
                onClick={handleOnClickWatchList}
              >
                {" "}
                <PiBookmarkSimpleBold className="font-bold text-2xl md:text-base" />
                <div className="flex flex-col">
                  <span className="text-sm hidden md:flex gap-2 items-center">
                    {" "}
                    Edit Watch List{" "}
                  </span>

                  {isWatchListOpen && (
                    <ListDropDown
                      anime={content}
                      isOpen={isWatchListOpen}
                      watchListData={watchListData}
                      setIsOpen={setIsWatchListOpen}
                    />
                  )}
                </div>
                {/* <Toaster
                  toastOptions={{
                    style: {
                      borderRadius: "10px",
                      background: "#b6d7d4",
                      border: "1px solid ",
                      color: "#041C32",
              
                    },
                  }}
                /> */}
              </button>

              {provider === "zoro" && (
                <button
                  className={`md:mx-1 ${
                    mediaPlayerState?.isAutoSkip
                      ? "text-sky-400 font-semibold"
                      : "font-[300]"
                  } `}
                  onClick={() =>
                    updatePlayerOptions({
                      ...mediaPlayerState,
                      isAutoSkip: !mediaPlayerState?.isAutoSkip,
                    })
                  }
                >
                  Auto Skip Intro ({mediaPlayerState?.isAutoSkip ? "on" : "off"}
                  )
                </button>
              )}

              <button
                className={`md:mx-1 ${
                  mediaPlayerState?.isAutoNext
                    ? "text-sky-400 font-semibold"
                    : "font-[300]"
                } `}
                onClick={() =>
                  updatePlayerOptions({
                    ...mediaPlayerState,
                    isAutoNext: !mediaPlayerState?.isAutoNext,
                  })
                }
              >
                Auto Next ({mediaPlayerState?.isAutoNext ? "on" : "off"})
              </button>

              <button
                className={`md:mx-1 ${
                  mediaPlayerState?.isAutoPlay
                    ? "text-sky-400 font-semibold"
                    : "font-[300]"
                } `}
                onClick={() =>
                  updatePlayerOptions({
                    ...mediaPlayerState,
                    isAutoPlay: !mediaPlayerState?.isAutoPlay,
                  })
                }
              >
                Auto Play ({mediaPlayerState?.isAutoPlay ? "on" : "off"})
              </button>

              <div className="md:ml-auto flex md:gap-2 ml-2 items-center">
                {/* {episodesData?.length > 1 && isNextEpisodeAvailable && <button className="nextEpisode flex gap-1 items-center" onClick={getNextEpisode}>
                  <TbPlayerTrackNextFilled /> Next Episode
                </button>} */}

                {recentTimestamp > 0 && (
                  <ShareModal
                    t={recentTimestamp}
                    buttonText="Share this Scene"
                    title={`Checkout this Amazing Scene from ${
                      content?.title_english || content?.title
                    }`}
                  />
                )}
                <ShareModal
                  buttonText="Share this episode"
                  title={`Checkout this Amazing Episode from ${
                    content?.title_english || content?.title
                  }`}
                />
              </div>
            </div>
          </div>

          {episodesData && (
            <ProviderContainer content={content} id={params?.id} />
          )}

          <div className="note text-sm flex text-nowrp items-center  self-center text-gray-400">
            *Note: Episode boxes with{" "}
            <div className="rounded w-5 h-3 bg-sky-400 mx-2"></div> color are
            filler episodes!
          </div>
        </div>

        <div className="md:hidden block my-12">
          <Metadata content={content} id={params?.id} />
        </div>
      </div>
      {params?.id && <Suggested id={params?.id} />}
    </div>
  );
}
