"use client";
import React, { Suspense, useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import {
  getSessionWithExpiry,
  setSessionWithExpiry,
} from "@/components/utils/storage";
import { IoMdAdd } from "react-icons/io";
import { PiBookmarkSimpleBold } from "react-icons/pi";
import ProviderContainer from "./ProviderContainer";
import { useSearchParams } from "next/navigation";
import useStreamStore from "@/components/utils/streamStore";
import GetLoggedUserWatchListsInfo from "@/app/firebase/WatchList/WatchListDocument/GetLoggedUserWatchListsInfo";
import ListDropDown from "@/components/utils/ListDropDown";
import toast, { Toaster } from "react-hot-toast";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import { AudioGainSlider, Captions, isHLSProvider, MediaPlayer, MediaProvider, Track } from "@vidstack/react";
import {
  DefaultAudioLayout,
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";
import { ImCross } from "react-icons/im";
import { ThreeCircles } from "react-loader-spinner";

export default function Page({ params }) {
  const searchParams = useSearchParams();
  const zoroId = searchParams.get("z-id") || null;
  const gogoSubId = searchParams.get("g-sub-id") || null;
  const gogoDubId = searchParams.get("g-dub-id") || null;
  const provider = searchParams.get("provider") || "zoro";
  const serverV = searchParams.get("server");
  const dubV = searchParams.get("dub") || false;

  const [content, setContent] = useState();
  const [isWatchListOpen, setIsWatchListOpen] = useState(false);
  const [watchListData, setWatchListData] = useState();

  const {
    episodesData,
    setEpisodesData,
    streamingData, setStreamingData,
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
  } = useStreamStore();
  

  useEffect(() => {
    if (!provider) {
      window.alert("No provider provided in params");
      return;
    }
    setServer(serverV);
    setZoroEpisodeId(zoroId);
    setGogoDubEpisodeId(gogoDubId);
    setSelectedProvider(provider);
    setGogoSubEpisodeId(gogoSubId);
    setDub(dubV);
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
          setZoroEpisodeId(cachedData?.zoro?.episodes[0]?.episodeId);
          setGogoSubEpisodeId(cachedData?.gogoSub?.episodes[0]?.id);
          setGogoDubEpisodeId(cachedData?.gogoDub?.episodes[0]?.id);
        }
        // console.log(cachedData);

        return;
      }
      // console.log(params?.id)
      const data = await axios.get(`/api/v1/watch/${params?.id}`);
      console.log(`data for /watch/${params?.id}`, data?.data);
      setContent(data?.data);
      setSessionWithExpiry(`watch-${params.id}`, data?.data, 1000 * 60 * 30); // 30 min
      mergeProviderData(
        data?.data?.zoro,
        data?.data?.gogoDub,
        data?.data?.gogoSub
      );

      if (!zoroId && !gogoSubId && !gogoDubId) {
        setZoroEpisodeId(data?.data?.zoro?.episodes[0]?.episodeId);
        setGogoSubEpisodeId(data?.data?.gogoSub?.episodes[0]?.id);
        setGogoDubEpisodeId(data?.data?.gogoDub?.episodes[0]?.id);
      }
      // console.log(data?.data);
    })();
  }, [params]);

  const getVol = ()=>{
    return JSON.parse(localStorage.getItem('player-vol')) || 1;
  }

  const handleVolumeChange = (v)=>{
    localStorage.setItem('player-vol', JSON.stringify(v.volume));
  }

  console.log("main page steraming data", streamingData);

  useEffect(() => {
    (async () => {
      if (!provider) return;

      if (provider === "zoro" && zoroEpisodeId) {
        const cachedServerData = getSessionWithExpiry(
          `serverData-${provider}-${zoroEpisodeId}`
        );
        if (cachedServerData) {
          // console.log("cached servers data : ", cachedServerData);
          setServerData(cachedServerData);
          console.log("serverV", serverV);
          if (!serverV) setServer(cachedServerData?.sub[0].serverName);
          // return;
        } else {
          const serverData = await axios.get(
            `/api/v1/${provider}/servers/${zoroEpisodeId}`
          );

          console.log("servers data : ", serverData?.data?.data);
          setServerData(serverData?.data?.data);
          setServer(serverData?.data?.data?.sub[0].serverName);
          console.log("server", serverData?.data?.data?.sub[0].serverName);
          setSessionWithExpiry(
            `serverData-${provider}-${zoroEpisodeId}`,
            serverData?.data?.data,
            1000 * 60 * 60 * 24
          ); //24 hrs
        }
      }

      //   else if(provider==="gogo"){
      //     let dataGogoDub, dataGogoSub;
      //     if(gogoDubEpisodeId){
      //       dataGogoDub = await axios.get(
      //         `/api/v1/${provider}/servers/${gogoDubEpisodeId}`
      //       );
      //       // setServerData({dub : dataGogoDub?.data});

      //     }

      //     if(gogoSubEpisodeId){
      //       dataGogoSub = await axios.get(
      //         `/api/v1/${provider}/servers/${gogoSubEpisodeId}`
      //       );
      //       // setServerData({sub : dataGogoSub?.data});

      //     }
      //     setServerData({
      //       sub : dataGogoSub?.data,
      //       dub : dataGogoDub?.data,
      //   })

      //   if(!serverV){
      //   if(dataGogoSub?.data?.sub){
      //     setServer(dataGogoSub?.data?.sub[0]?.name);
      //   }
      //   else{
      //     setServer('Vidstreaming');
      //   }
      // }

      //   }  //!enable it when you need all the servers from gogo that is if you want to use embed urls

      // setServerLoading(false);
    })();

    return () => {
      // setServerData(null);
    };
  }, [zoroEpisodeId, gogoDubEpisodeId, provider, gogoSubEpisodeId]);

  console.log(episodesData);

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

  const handleOnClickWatchList = async () => {
    const result = await GetLoggedUserWatchListsInfo();
    console.log(result?.response);
    if (result.status === "success") {
      setWatchListData(result?.response);
      setIsWatchListOpen((prev) => !prev);
      return;
    }
    toast.error(result?.response?.message, { duration: 3000 });
  };

  return (
    <div className="py-16">
      <div className="content py-2 px-4 flex flex-col gap-4">
        <h1 className="text-2xl tracking-wide my-3 font-semibold  self-center">
          {" "}
          {content?.title_english || content?.title}
        </h1>
        <div className="stream-container self-center w-[95%] flex flex-col gap-12 ">
          <div className="bg-cbg-200 p-4 ">

            {
            
            !streamingData ? (
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
            ):
            streamingData?.status === 500 ? (
              <div className="self-center flex gap-2 bg-black text-xl tracking-wider items-center justify-center text-sky-400 w-full h-72">
                <ImCross color="red"/> {streamingData?.message}
              </div>
            ) :(
              <div className="stream block bg-black h-[85vh] w-full rounded my-4">
                <MediaPlayer
                  load="eager"
                  autoPlay
                  volume={getVol()}
                  onVolumeChange={(v, e)=>{
                    handleVolumeChange(v);
                  }}
                  title={streamingData?.malId}
                  src={streamingData?.sources?.[0]?.url}
                  className="h-full"
                  onProviderChange={(prov, eve)=>{
                    if(isHLSProvider(prov) && streamingData?.headers){
                      prov.config = {
                        xhrSetup(xhr){
                          xhr.setRequestHeader('Referer', streamingData?.headers?.Referer);
                          xhr.setRequestHeader('User-Agent', streamingData?.headers?.['User-Agent']);
                        }
                      }
                    }
                  }}
                  onError={e=>toast.error(`${e.message}, Try Another Server.`)}
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
                            default={tr?.default || index === 0}
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
                    
                    icons={defaultLayoutIcons}
                  />
                  
                  
                </MediaPlayer>
              </div>
            )}
            <div className="flex mt-4 mx-4 text-sm gap-1">
              <button
                className="favorites flex items-center text-lg  justify-center gap-1"
                onClick={handleOnClickWatchList}
              >
                {" "}
                <PiBookmarkSimpleBold className="font-bold" />
                <div className="flex flex-col">
                  <span className="text-sm flex gap-2 items-center">
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
              </button>
            </div>
          </div>

          {episodesData && (
            <ProviderContainer
            // episodes={episodesData}
            // selectedEpisodeId={selectedEpisodeId}
            // setSelectedEpisodeId={setSelectedEpisodeId}
            // provider={selectedProvider}
            // setProvider = {setSelectedProvider}
            // // prov = {provider}
            // dub = {dub}
            // server = {server}
            // serverData={serverData}
            />
          )}
        </div>
      </div>
    </div>
  );
}
