"use client";
import React, { Suspense, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import {
  getSessionWithExpiry,
  setSessionWithExpiry,
} from "@/components/utils/storage";
import { MEDIA_KEY_SHORTCUTS } from "@vidstack/react";
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
import { MdRefresh, MdSwapHoriz } from "react-icons/md";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";
import { LuExternalLink } from "react-icons/lu";
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
import { getAbsoluteURLPath, mergeAnimeEpisodesData } from "./utilFunctions";
import { TbPlayerTrackNextFilled } from "react-icons/tb";
import ShareModal from "@/components/utils/ShareModal";
import Metadata from "./Metadata";
import { FaDownload, FaStepBackward, FaStepForward } from "react-icons/fa";
import Link from "next/link";
import CommentsContainer from "@/components/comments/CommentsContainer";
import { uniqueId } from "lodash";
import Script from "next/script";
import { GlobalScripts } from "@/components/GlobalScripts";
import { providersConfig } from "./providersConfig";
import ArtVideoPlayer from "./ArtVideoPlayer";

export default function Page({ params }) {
  const searchParams = useSearchParams();
  const zoroId = searchParams.get("z-id") || null;
  const animepaheId = searchParams.get("apahe-id") || null;
  const hnembedEp = searchParams.get("hn-ep") || null;
  const megaplayEp = searchParams.get("megaplay-ep") || null;
  const tryembedEp = searchParams.get("tryembed-ep") || null;
  const gogoSubId = searchParams.get("g-sub-id") || null;
  const gogoDubId = searchParams.get("g-dub-id") || null;
  const provider = searchParams.get("provider") || "tryembed";
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
    episodeIds,
    setEpisodeIds,
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
    loggedInUserId,
    isUserLoggedIn,
    RecentWatchListId,
    loadLoggedInUserRecentWatchList,
    loadLoggedInUserWatchLists,
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
  const [downloadLink, setDownloadLink] = useState();
  const [duration, setDuration] = useState();
  const [epNo, setEpNo] = useState(1);
  const [embedStatus, setEmbedStatus] = useState("loading");
  const [iframeReloadKey, setIframeReloadKey] = useState(0);
  const currentAbsoluteURL = useRef("");
  const iframeLoadTimerRef = useRef(null);
  // Track auto-retry attempts per (provider, src). Embed providers (megaplay/hnembed)
  // sometimes proxy to upstreams that fail DNS or 5xx — a quick reload usually picks
  // a different upstream and works. We allow ONE silent auto-retry before surfacing
  // the "unavailable" overlay, so transient routing flakes don't show users an error.
  const autoRetryAttemptsRef = useRef({ key: null, count: 0 });
  // Timestamp when the current iframe attempt was mounted. An onLoad firing very
  // quickly after mount usually means the iframe served an error page (DNS fail,
  // CORS, instant 4xx) rather than a real player bootstrap.
  const iframeMountedAtRef = useRef(0);
  const recentTimestampRef = useRef(recentTimestamp);
  const durationRef = useRef(duration);
  const contentRef = useRef(content);
  const isUserLoggedInRef = useRef(isUserLoggedIn);
  const RecentWatchListIdRef = useRef(RecentWatchListId);
  // const [isAutoSkip, setIsAutoSkip] = useState(true);

  //cleanup function saves the timestamp and url to the user Recent watchlist thereby adding the current episode with current timestamp in the Recent watchlist of the user
  useEffect(() => {
    const cachedPlayerOptions = JSON.parse(
      localStorage.getItem("player_options")
    );
    if (cachedPlayerOptions) {
      setMediaPlayerState(cachedPlayerOptions);
    }

    return () => {
      const f = async () => {
        const content = contentRef.current;
        const animeName = content?.title_english || content?.title;
        if (!animeName) return;

        const result = await AddAnimeToWatchList({
          watchListId: RecentWatchListIdRef.current,
          url: currentAbsoluteURL.current,
          episodeTimestamp: recentTimestampRef.current,
          duration: durationRef.current,
          animeId: `${params?.id}`,
          animeName: animeName,
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

        loadLoggedInUserRecentWatchList();
        loadLoggedInUserWatchLists();
      };
      if (isUserLoggedInRef.current) f();
    };
  }, []);

  useEffect(() => {
    isUserLoggedInRef.current = isUserLoggedIn;
  }, [isUserLoggedIn]);

  useEffect(() => {
    RecentWatchListIdRef.current = RecentWatchListId;
  }, [RecentWatchListId]);

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

  //just updates the useState values from streamStore  to the params value of the corresponding variables
  useEffect(() => {
    if (!provider) {
      window.alert("No provider provided in params");
      router.back();
      return;
    }
    setServer(serverV);
    setEpisodeIds({
      zoro: zoroId,
      animepahe: animepaheId,
      hnembed: hnembedEp || (provider === "hnembed" ? "1" : null),
      megaplay: megaplayEp || (provider === "megaplay" ? "1" : null),
      tryembed: tryembedEp || (provider === "tryembed" ? "1" : null),
    });
    setZoroEpisodeId(zoroId);
    setGogoDubEpisodeId(gogoDubId);
    setSelectedProvider(provider);
    setGogoSubEpisodeId(gogoSubId);
    setDub(dubV);
    setRecentTimestamp(0);

    return () => {};
  }, [provider, zoroId, animepaheId, hnembedEp, megaplayEp, tryembedEp, gogoSubId, gogoDubId, serverV, dubV]);

  //below functions gets the necessary data from both provider like episodes content at the page load, mergeProviderData is used in this useEffect
  useEffect(() => {
    if (!params?.id) return;

    setStreamingData(null);

    (async () => {
      const cachedData = getSessionWithExpiry(`watch-v2-${params.id}`);
      if (cachedData) {
        setContent(cachedData);
        setEpisodesData(cachedData?.episodesData || []);

        if (!zoroId && !animepaheId && !hnembedEp && !megaplayEp && !tryembedEp) {
          setEpisodeIds({
            zoro: cachedData?.episodesData?.[0]?.zoro_episodeId,
            animepahe: cachedData?.episodesData?.[0]?.animepahe_id,
            hnembed: "1",
            megaplay: "1",
            tryembed: "1",
          });
        }

        return;
      }
      try {
        const response = await axios.get(`/api/v2/vidsrc/watch/${params?.id}`);
        const data = response?.data;

        if (data?.error) {
          console.error("vidsrc watch error:", data.error);
          setAnimeNotAvailable(true);
          return;
        }

        const refinedData = {
          ...data,
          episodesData: (data?.episodeList || []).map((ep, i) => ({
            number: ep.number,
            episodeIndex: i + 1,
            zoro_title: null,
            animepahe_title: null,
            vidsrc_id: ep.id,
          })),
        };

        setContent(refinedData);
        setEpisodesData(refinedData.episodesData);
        setSessionWithExpiry(`watch-v2-${params.id}`, refinedData, 1000 * 60 * 30);

        if (!zoroId && !animepaheId && !hnembedEp && !megaplayEp && !tryembedEp) {
          setEpisodeIds({
            zoro: null,
            animepahe: null,
            hnembed: "1",
            megaplay: "1",
            tryembed: "1",
          });
        }
        setAnimeNotAvailable(false);
      } catch (error) {
        console.error(`Failed to fetch /api/v2/vidsrc/watch/${params?.id}:`, error.message);
        setAnimeNotAvailable(true);
        return;
      }

      // console.log(data?.data);
    })();
  }, [params]);

  //below useEffect updates the server data whenever any of the dependency changes
  useEffect(() => {
    (async () => {
      setAnimeNotAvailable(false);
      const currentIndex = content?.episodesData?.findIndex(
        (ep) =>
          //!new
          (episodeIds.zoro && ep.zoro_episodeId === episodeIds.zoro) ||
          (episodeIds.animepahe && ep.animepahe_id === episodeIds.animepahe) ||
          (provider === "hnembed" && episodeIds.hnembed && String(ep?.number || ep?.episodeIndex) === String(episodeIds.hnembed)) ||
          (provider === "megaplay" && episodeIds.megaplay && String(ep?.number || ep?.episodeIndex) === String(episodeIds.megaplay)) ||
          (provider === "tryembed" && episodeIds.tryembed && String(ep?.number || ep?.episodeIndex) === String(episodeIds.tryembed))
        //!new
      );

      setEpNo(currentIndex + 1); //this will set the current episode number which will be used for commenting the comment for this episode number.

      if (!provider) router.replace("/not-found");

      setIsNextEpisodeAvailable(true);
      setIsPrevEpisodeAvailable(true);
      if (currentIndex === 0) setIsPrevEpisodeAvailable(false);
      if (currentIndex === episodesData?.length - 1)
        setIsNextEpisodeAvailable(false);

      if (providersConfig[provider]?.hasServersApi) {
        const cachedServerData = getSessionWithExpiry(
          `serverData-${provider}-${episodeIds[provider]}` // episodeIds[provider] yaani ki episode id us provider ki for example agar provider zoro h to zoro ki episode id
        );
        if (cachedServerData) {
          // console.log("cached servers data : ", cachedServerData);
          // if sub is not available then cahnge the default server and dub flag to the raw
          router.replace(
            updateParams(
              [{ key: "dub", val: updateDubVal(cachedServerData) }],
              false
            )
          );
          setServerData(cachedServerData);
          if (!serverV)
            setServer(
              cachedServerData?.sub?.[2]?.serverName ||
                cachedServerData?.raw?.[0]?.serverName
            );
          // return;
        } else {
          // console.log(
          //   `entered ${provider} server fetch block with data => `,
          //   provider,
          //   episodeIds
          // );
          if (episodeIds[provider]) {
            try {
              // Make the API call to get the server data
              const serverData = await axios.get(
                providersConfig[provider]?.serverApiUrl(episodeIds[provider])
              );
              // console.log(`This is ${provider} server data: `, serverData);

              // Ensure the server data exists and has the expected structure
              // ! the new api returns the data in a different format
              if (serverData?.data) {
                // Update the router URL parameters (e.g., dub value)
                router.replace(
                  updateParams(
                    [{ key: "dub", val: updateDubVal(serverData?.data) }],
                    false
                  )
                );

                // Set the server data and server name
                setServerData(serverData?.data);
                setServer(
                  serverData?.data?.sub?.[2]?.serverName ||
                    serverData?.data?.raw?.[0]?.serverName
                );

                // Cache the server data with an expiry of 2 hours
                setSessionWithExpiry(
                  `serverData-${provider}-${episodeIds[provider]}`,
                  serverData?.data,
                  1000 * 60 * 60 * 2 // 2 hours expiry
                );
              } else {
                // Handle the case where serverData doesn't have the expected structure

                toast.error("Failed to fetch server data. Please try again.");
              }
            } catch (error) {
              // Catch any errors that occur during the API request or data handling
              console.error("Error fetching Zoro server data:", error);
              // toast.error(" Error occurred while fetching server data. Please try again.");
            }
          }
        }
      } else if (providersConfig[provider]?.hasServersApi === false) {
        setServer(null);
        setServerData(null);
      } else {
        if (content?.title) {
          toast.error("Anime not available");
          setAnimeNotAvailable(true);
        }
      }
    })();

    return () => {
      // setServerData(null);
    };
  }, [episodeIds, provider]);

  //this function update the url params, it has resetT as true which will remove timestamp t parameter by default
  const updateParams = (paramsList, resetT = true) => {
    const newParams = new URLSearchParams(searchParams);
    if (resetT) newParams.delete("t");
    paramsList.forEach((par) => {
      newParams.set(par.key, par.val ? par.val : "");
    });

    return pathname + "?" + newParams.toString();
  };

  //self explainatory
  const getPrevEpisode = () => {
    const { episodesData } = content;
    const currentIndex = episodesData?.findIndex(
      (ep) =>
        //!new
        (episodeIds.zoro && ep.zoro_episodeId === episodeIds.zoro) ||
        (episodeIds.animepahe && ep.animepahe_id === episodeIds.animepahe)
      //!new
    );

    if (currentIndex !== -1 && currentIndex > 0) {
      const ep = episodesData[currentIndex - 1]; // Return the prev episode's ID
      const url = updateParams([
        { key: "z-id", val: ep?.zoro_episodeId },
        { key: "apahe-id", val: ep?.animepahe_id },
        { key: "hn-ep", val: String(ep?.number || ep?.episodeIndex || 1) },
        { key: "megaplay-ep", val: String(ep?.number || ep?.episodeIndex || 1) },
        { key: "tryembed-ep", val: String(ep?.number || ep?.episodeIndex || 1) },
        { key: "n", val: currentIndex - 1 },
      ]);

      router.push(url);
    } else {
      setIsPrevEpisodeAvailable(false);
      return null; // No prev episodes available
    }
  };

  //self explainatory
  const getNextEpisode = () => {
    const { episodesData } = content;
    const currentIndex = episodesData?.findIndex(
      (ep) =>
        (episodeIds.zoro && ep?.zoro_episodeId === episodeIds.zoro) ||
        (episodeIds.animepahe && ep.animepahe_id === episodeIds.animepahe)
    );

    if (currentIndex !== -1 && currentIndex < episodesData?.length - 1) {
      const ep = episodesData?.[currentIndex + 1]; // Return the next episode's ID
      const url = updateParams([
        { key: "z-id", val: ep?.zoro_episodeId },
        { key: "apahe-id", val: ep?.animepahe_id },
        { key: "hn-ep", val: String(ep?.number || ep?.episodeIndex || 1) },
        { key: "megaplay-ep", val: String(ep?.number || ep?.episodeIndex || 1) },
        { key: "tryembed-ep", val: String(ep?.number || ep?.episodeIndex || 1) },
        { key: "n", val: currentIndex - 1 },
      ]);
      router.push(url);
    } else {
      setIsNextEpisodeAvailable(false);
      return null; // No more episodes available
    }
  };

  //this function updates player options in firebase and in local storage like skip intro, auto next and autoplay
  const updatePlayerOptions = (newOpt) => {
    localStorage.setItem("player_options", JSON.stringify(newOpt));
    setMediaPlayerState(newOpt);
    if (isUserLoggedIn) debounceMediaPlayerUpdate(newOpt);
    else {
      toast.success("Changes saved!");
    }
  };

  // console.log(episodesData);

  //since zoro data has few things like zoroId episodes data like title etc and gogo data has data like gogodub and gogo sub...this function merges both of the providers episodes data into one object
  //?not needed=>
  //  const mergeProviderData = (zoro, gogoDub, gogoSub) => {
  //   const gds = gogoDub?.episodes?.length; //gogo dub size
  //   const gss = gogoSub?.episodes?.length; //gogo sub size
  //   if (zoro?.episodes?.length > 0) {
  //     const newMergedData = zoro?.episodes?.map((ep, idx) => {
  //       return {
  //         ...ep,
  //         gogoSubId: gss > idx ? gogoSub?.episodes[idx].id : null,
  //         gogoDubId: gds > idx ? gogoDub?.episodes[idx].id : null,
  //       };
  //     });
  //     // setEpisodesData(newMergedData);
  //     console.log("this is merged data with zoro", newMergedData);
  //   } else if (gogoSub?.episodes?.length > 0) {
  //     const newMergedData = gogoSub?.episodes?.map((ep, idx) => {
  //       return {
  //         ...ep,
  //         gogoDubId: gds > idx ? gogoDub?.episodes[idx].id : null,
  //       };
  //     });
  //     // setEpisodesData(newMergedData);
  //     // console.log("this is merged data with zoro", newMergedData);
  //   } else setEpisodesData(null);
  // };

  //self explainatory
  const handleOnClickWatchList = async () => {
    const result = await GetLoggedUserWatchListsInfo();

    if (result.status === Constant_Var_success) {
      setWatchListData(result?.response);
      setIsWatchListOpen((prev) => !prev);
      return;
    } else if (
      result.response.message === Constant_Var_errorMessage_notAuthenticatedUser
    ) {
      const signInResp = await SignInGooglePopUp((status) => {});

      if (signInResp.status === Constant_Var_success) return;
      else toast.error(signInResp?.response?.message, { duration: 3000 });
    }
    toast.error(result?.response?.message, { duration: 3000 });
  };

  //for each timestamp this function is triggered
  const handleTimeUpdate = (v, event) => {
    const player = event.target;
    const currentTime = player?.currentTime;

    const t = currentTime;
    if (
      Math.floor(t) % 5 == 0 &&
      Math.floor(t) !== Math.floor(recentTimestamp)
    ) {
      //save timestamp after every 5 seconds

      setRecentTimestamp(t);
    }

    if (!streamingData?.intro) {
      setShowSkipButton("");
      return;
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

  //below function and usememo is to get src url of m3u8 file according to the provider
  const getStreamingSource = () => {
    const config = providersConfig[provider];
    if (config?.isEmbed || streamingData?.isEmbed) {
      return streamingData?.sources?.[0]?.url || null;
    }
    if (config.needsServerSideStreaming) {
      return `/api/v1/streamingProxy?url=${
        encodeURIComponent(streamingData?.sources?.[0]?.url)
      }`;
    } else {
      const qualityOrder = ["1080p", "720p", "480p", "360p"];
      for (const quality of qualityOrder) {
        const match = streamingData?.sources?.find((src) =>
          src?.quality?.includes(quality)
        );

        if (match?.url) return match.url;
      }

      return null;
    }
  };
  //* using use Memo to cache the streaming url result, because apparantly media player was calling this function after every few seconds
  const streamingSrc = useMemo(
    () => getStreamingSource(),
    [provider, streamingData]
  );

  // Clear download link whenever provider/streamingData changes — embed providers
  // don't expose downloadable URLs. Doing this in an effect avoids a setState-in-render
  // anti-pattern (the previous version called setDownloadLink() inside useMemo).
  useEffect(() => {
    const config = providersConfig[provider];
    if (config?.isEmbed || streamingData?.isEmbed || config?.needsServerSideStreaming) {
      setDownloadLink();
    }
  }, [provider, streamingData]);

  const isEmbed = providersConfig[provider]?.isEmbed || streamingData?.isEmbed;

  useEffect(() => {
    if (!isEmbed || !streamingSrc) {
      setEmbedStatus("loading");
      return;
    }
    setEmbedStatus("loading");

    // 20s instead of 8s. Embed providers (megaplay especially) often load the
    // wrapper iframe quickly but take time to bootstrap their internal player —
    // a tighter watchdog flips the UI to "unavailable" while the player is
    // genuinely still loading. iframe `onLoad` will mark loaded-unverified well
    // before this timeout in the normal case.
    // Reset the retry counter when the streamingSrc itself changes (new episode,
    // new provider, or sub/dub flip). Within a single src we allow ONE silent
    // auto-retry; iframeReloadKey changes alone don't reset the counter, so a
    // user-clicked "Retry" after the auto-retry already used its budget will
    // still go through the normal manual flow.
    if (autoRetryAttemptsRef.current.key !== streamingSrc) {
      autoRetryAttemptsRef.current = { key: streamingSrc, count: 0 };
    }
    iframeMountedAtRef.current = Date.now();

    const TIMEOUT_MS = 20000;
    const watchdog = setTimeout(() => {
      setEmbedStatus((prev) => {
        if (prev !== "loading") return prev;
        const attempts = autoRetryAttemptsRef.current;
        if (attempts.key === streamingSrc && attempts.count < 1) {
          // First failure for this src — try one silent reload before showing
          // the error overlay. Embed providers like megaplay sometimes route
          // to upstreams (e.g. hnembed.cc) that DNS-fail; reloading the iframe
          // typically picks a different upstream that works.
          attempts.count += 1;
          setIframeReloadKey((k) => k + 1);
          return "loading";
        }
        return "unavailable";
      });
    }, TIMEOUT_MS);

    // Clear any leftover onLoad timer from a previous iframe — when the user
    // switches episodes/providers mid-load, the previous iframe's queued
    // setTimeout would otherwise fire on the new iframe and mistakenly flip
    // its still-loading state to "loaded-unverified".
    if (iframeLoadTimerRef.current) {
      clearTimeout(iframeLoadTimerRef.current);
      iframeLoadTimerRef.current = null;
    }

    const onMessage = (event) => {
      try {
        const origin = event?.origin || "";
        if (
          origin.includes("2embed.cc") ||
          origin.includes("hnembed.cc") ||
          origin.includes("hnembed.com") ||
          origin.includes("megaplay.buzz") ||
          origin.includes("anikotoapi.site") ||
          origin.includes("tryembed.us.cc")
        ) {
          setEmbedStatus("loaded");
          clearTimeout(watchdog);
        }
      } catch {}
    };
    window.addEventListener("message", onMessage);

    return () => {
      clearTimeout(watchdog);
      window.removeEventListener("message", onMessage);
    };
  }, [isEmbed, streamingSrc, iframeReloadKey]);

  const retryEmbed = () => {
    setEmbedStatus("loading");
    setIframeReloadKey((k) => k + 1);
  };


  //In case if dub is not available for a episode the we will automatically change the router to the sub..this function utility handles the dub val (either 1, 0, -1)
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

  // console.log(streamingData);

  return (
    <>
      <div className="py-12 w-full">
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
              ) : !streamingSrc ? (
                <div className="self-center flex flex-col gap-4 bg-black text-base md:text-lg tracking-wider items-center justify-center text-gray-200 w-full h-72 px-4 text-center">
                  <ImCross color="#f87171" />
                  <div>
                    Couldn&apos;t load this episode on{" "}
                    <span className="text-primary-300 font-semibold">
                      {providersConfig[provider]?.displayName || provider}
                    </span>
                    .
                  </div>
                  <div className="text-sm text-gray-400">
                    Source might be missing for this title or episode. Try another provider.
                  </div>
                  <div className="flex gap-2 flex-wrap justify-center">
                    {Object.values(providersConfig)
                      .filter((p) => p.id !== provider)
                      .map((p) => (
                        <Link
                          key={p.id}
                          href={updateParams([{ key: "provider", val: p.id }], false)}
                          className="px-3 py-1 rounded bg-primary-100 text-cbg-100 text-sm font-medium hover:bg-primary-200"
                        >
                          Try {p.name}
                        </Link>
                      ))}
                  </div>
                </div>
              ) : (
                streamingSrc && (
                  <>
                    <div  className="pm_video flex h-fit">
                      <div className="stream block bg-black md:h-[85vh] h-[40vh] w-full justify-center items-center rounded my-4">
                        {isEmbed ? (
                          <div className="relative w-full h-full bg-black">
                            <iframe
                              key={`${provider}-${streamingSrc}-${iframeReloadKey}`}
                              src={streamingSrc}
                              title={`${providersConfig[provider]?.displayName || provider} - ${content?.title_english || content?.title || "Watch"}${epNo ? ` Ep${epNo}` : ""}`}
                              className="w-full h-full border-0"
                              allow="autoplay; fullscreen; encrypted-media; picture-in-picture; clipboard-write"
                              allowFullScreen
                              referrerPolicy="origin"
                              onLoad={() => {
                                // Suspiciously fast onLoad (< 250ms) usually means the iframe
                                // served an instant error page — DNS fail on a sub-iframe, CORS
                                // block, instant 4xx — rather than a real player bootstrap.
                                // Trigger one silent retry instead of marking the iframe as loaded.
                                const elapsed = Date.now() - (iframeMountedAtRef.current || 0);
                                if (elapsed > 0 && elapsed < 250) {
                                  const attempts = autoRetryAttemptsRef.current;
                                  if (attempts.key === streamingSrc && attempts.count < 1) {
                                    attempts.count += 1;
                                    setIframeReloadKey((k) => k + 1);
                                    return;
                                  }
                                }

                                if (iframeLoadTimerRef.current) {
                                  clearTimeout(iframeLoadTimerRef.current);
                                }
                                iframeLoadTimerRef.current = setTimeout(() => {
                                  setEmbedStatus((prev) =>
                                    prev === "loading" || prev === "unavailable"
                                      ? "loaded-unverified"
                                      : prev
                                  );
                                  iframeLoadTimerRef.current = null;
                                }, 800);
                              }}
                            />
                            {embedStatus === "loading" && (
                              <>
                                <style>{`@keyframes embedShimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
                                <div className="pointer-events-none absolute top-0 left-0 right-0 h-1 overflow-hidden bg-cbg-300/40 z-10">
                                  <div className="h-full w-1/3 bg-primary-300" style={{ animation: "embedShimmer 1.2s ease-in-out infinite" }} />
                                </div>
                              </>
                            )}
                            {embedStatus === "unavailable" && (
                              <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center text-gray-100 px-6 text-center gap-4 z-10">
                                <HiOutlineExclamationTriangle className="text-amber-400 text-6xl" />
                                <div className="text-xl md:text-2xl font-semibold">
                                  This anime isn&apos;t available right now
                                </div>
                                <div className="text-sm md:text-base text-gray-400 max-w-xl">
                                  <span className="text-primary-300 font-medium">
                                    {providersConfig[provider]?.displayName || provider}
                                  </span>{" "}
                                  couldn&apos;t find a source for this episode. This usually
                                  happens with very new releases or niche titles that
                                  haven&apos;t been indexed yet.
                                </div>
                                <div className="text-xs text-gray-500 max-w-md">
                                  Note: When playback works, audio is whatever the provider serves
                                  (usually English dub). Original Japanese audio with
                                  subtitles isn&apos;t selectable on these embed providers.
                                </div>
                                <div className="flex gap-2 flex-wrap justify-center mt-2">
                                  <button
                                    onClick={retryEmbed}
                                    className="flex items-center gap-2 px-4 py-2 rounded bg-cbg-300 text-gray-100 text-sm font-medium hover:bg-cbg-400"
                                  >
                                    <MdRefresh className="text-lg" /> Retry
                                  </button>
                                  {Object.values(providersConfig)
                                    .filter((p) => p.id !== provider)
                                    .map((p) => (
                                      <Link
                                        key={p.id}
                                        href={updateParams([{ key: "provider", val: p.id }], false)}
                                        className="flex items-center gap-2 px-4 py-2 rounded bg-primary-100 text-cbg-100 text-sm font-medium hover:bg-primary-200"
                                      >
                                        <MdSwapHoriz className="text-lg" /> Try {p.displayName || p.name}
                                      </Link>
                                    ))}
                                  <a
                                    href={streamingSrc}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 rounded bg-cbg-200 text-gray-300 text-sm font-medium hover:text-gray-100 hover:bg-cbg-300 border border-cbg-400"
                                  >
                                    <LuExternalLink /> Open in new tab
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                        <ArtVideoPlayer
                        key={uniqueId("art-video-")}
                        getNextEpisode={getNextEpisode}
                        getPrevEpisode={getPrevEpisode}
                          src={streamingSrc}
                          setDuration={setDuration}
                          sources = {streamingData?.sources}
                          intro={streamingData?.intro}
                          outro={streamingData?.outro}
                          isAutoSkip={mediaPlayerState?.isAutoSkip}
                          title={"Monster Ep3" || content?.episodesData?.[epNo-1]?.zoro_title}
                          thumbnail={
                            process.env.NEXT_PUBLIC_GOOD_PROXY +
                              streamingData?.tracks?.filter(
                                (t) => t.kind === "thumbnails"
                              )?.[0]?.file
                            }
                            subtitles={streamingData?.tracks?.filter(tr => tr?.kind === 'captions')?.map(tr => {
                              return {
                              ...tr,
                              file:`/api/v1/streamingProxy?url=${encodeURIComponent(tr?.file)}`,        // zoro api subtitles require referes as well, by using straming proxy which automatically adds the referer based on the domain of the url, we are just adding the referer to the subtitles file.
                            }
                          }
                        )}
                            startTime={startTime}
                            recentTimestampRef={recentTimestampRef}
                            setAnimeNotAvailable = {setAnimeNotAvailable}
                            mediaPlayerState={mediaPlayerState}

                        />
                        )}

                        {/* <MediaPlayer
                          load="eager"
                          keyShortcuts={{
                            ...MEDIA_KEY_SHORTCUTS,
                            nextEpisode: {
                              keys: ["n", "N"],
                              onKeyDown: ({ event }) => {
                                event.preventDefault();
                                getNextEpisode();
                              },
                            },
                            prevEpisode: {
                              keys: ["p", "P"],
                              onKeyDown: ({ event }) => {
                                event.preventDefault();
                                getPrevEpisode();
                              },
                            },
                            skip: {
                              keys: ["s", "S"],
                              onKeyDown: ({ event }) => {
                                event.preventDefault();
                                if (showSkipButton) {
                                  player.current.currentTime =
                                    showSkipButton === "Intro"
                                      ? streamingData?.intro?.end
                                      : streamingData?.outro?.end; // Skip to the end of the intro or outro
                                  setShowSkipButton(""); // Hide the button after skipping
                                }
                              },
                            },
                          }}
                          autoPlay={mediaPlayerState?.isAutoPlay ? true : false}
                          ref={player}
                          keyTarget="player"
                          storage="media-player"
                          buffer
                          title={streamingData?.malId}
                          src={
                            "https://aniversehd.com/api/v1/streamingProxy?url=https://vault-11.padorupado.ru/hls/11/06/cda74eaebce25a12f5e548f7c220bb5dc245700b0280bdb45ff98b2fe4803d2b/owo.m3u8" ||
                            streamingSrc
                          }
                          className="h-full"
                          playsInline={true}
                          crossOrigin
                          streamType="on-demand"
                          onLoadedMetadata={(e) => {
                            setDuration(e.target.duration);
                          }}
                          onProviderChange={(provider, event) => {
                            if (isHLSProvider(provider)) {
                              provider.config = {
                                nudgeMaxRetry: 5,
                                maxFragLookUpTolerance: 0.5,
                                fragLoadingTimeOut: 3000,
                                fragLoadingMaxRetry: 5,
                                maxMaxBufferLength: 200,
                                maxBufferLength: 20,
                                enableWorker: true,
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
                              process.env.NEXT_PUBLIC_GOOD_PROXY +
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
                              downloadButton: downloadLink && (
                                <Link
                                  href={downloadLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xl items-center flex mx-3"
                                >
                                  <FaDownload />
                                </Link>
                              ),
                            }}
                            icons={defaultLayoutIcons}
                          />
                        </MediaPlayer> */}
                      </div>
                    </div>
                  </>
                )
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
                    Auto Skip Intro (
                    {mediaPlayerState?.isAutoSkip ? "on" : "off"})
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

                  {/* { (
                    <ShareModal
                      t={recentTimestamp}
                      buttonText="Share this Scene"
                      modalTitle="Share this anime scene"
                      title={`Checkout this Amazing Scene from ${
                        content?.title_english || content?.title
                      }`}
                      onClick={()=>setRecentTimestamp(recentTimestampRef.current)}
                    />
                  )} */}
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
              <ProviderContainer
                content={content}
                id={params?.id}
                setAnimeNotAvailable={setAnimeNotAvailable}
              />
            )}

            <div className="note text-sm flex text-nowrp items-center  self-center text-gray-400">
              *Note: Episode boxes with{" "}
              <div className="rounded w-5 h-3 bg-sky-400 mx-2"></div> color are
              filler episodes!
            </div>
          </div>

          
          {/* {params?.id  && <CommentsContainer animeId={params?.id} loggedInUserId={loggedInUserId} loggedInUserData={loggedInUserData} epNo={epNo} zoroEpId={zoroEpisodeId} gogoEpId={`${gogoSubId ? gogoSubId:''}|${gogoDubId?gogoDubId:''}`}/>} */}
        </div>

        <div className="md:hidden block my-12">
          <Metadata content={content} id={params?.id} />
        </div>
        {params?.id && (
          <CommentsContainer
            key={uniqueId}
            animeId={params?.id}
            loggedInUserId={loggedInUserId}
            loggedInUserData={loggedInUserData}
            epNo={epNo}
            zoroEpId={episodeIds.zoro}
            animepaheEpId={episodeIds.animepahe} //!new
            gogoEpId={`${gogoSubId ? gogoSubId : ""}|${
              gogoDubId ? gogoDubId : ""
            }`}
          />
        )}

        <Suggested id={params?.id} />
      </div>
    </>
  );
}
