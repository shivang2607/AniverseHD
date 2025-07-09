import useStreamStore from "@/components/utils/streamStore";
import axios from "axios";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React, { useMemo, useState } from "react";
import { useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import { FaClosedCaptioning } from "react-icons/fa6";
import { FaMicrophoneAlt } from "react-icons/fa";
import Image from "next/image";
import { IoStar } from "react-icons/io5";
import { MdOutlineSportsScore } from "react-icons/md";
import { PiVideoFill } from "react-icons/pi";
import { IoMdTimer } from "react-icons/io";
import { RxDotFilled } from "react-icons/rx";
import toast, { Toaster } from "react-hot-toast";
import ShareModal from "@/components/utils/ShareModal";
import Metadata from "./Metadata";
import ProviderSelect from "./ProviderSelect";
import { providersConfig } from "./providersConfig";






const useDebouncedEffect = (callback, dependencies, delay, setStreamingData) => {
  useEffect(() => {
    const handler = setTimeout(() => {
      callback();
    }, delay);

    // Clean up timeout if dependencies change before the delay finishes
    return () => {
      clearTimeout(handler);
      // setStreamingData(null);
    };
  }, [...dependencies, delay]);
};









export default function ProviderContainer({
  content, id, setAnimeNotAvailable
  // episodes,
  // serverData,
  // // prov = "gogo",
  // provider,
  // setProvider,
  // dub,
  // server,
  // selectedEpisodeId,
  // setSelectedEpisodeId,
}) {

  const searchParams = useSearchParams();
  const provider = searchParams.get("provider") || "zoro";
  const n = searchParams.get("n") || 0;
  const pathname = usePathname();
  const episodesPerWindow = 50;


  const {
    episodes,
    setEpisodesData,
  serverData,
  // prov = "gogo",
  setSelectedProvider,
  episodeIds,
  zoroEpisodeId, setZoroEpisodeId,
  gogoSubEpisodeId, setGogoSubEpisodeId,
  gogoDubEpisodeId, setGogoDubEpisodeId,
  // dub,
  streamingData, setStreamingData,
  serverLoading, setServerLoading,
  setStreamLoading,
  server,
  // setServer,
  } = useStreamStore(state=>({
    ...state,
    episodes : state.episodesData
  }));

  // console.log(episodes);
  const serverV = searchParams.get('server');
  const dub = searchParams.get('dub');
  // const [server, setServer] = useState(searchParams.get('server'));
  // const [serverLoading, setServerLoading] = useState(false);
  
  const [episodeRangeIndex, setEpisodeRangeIndex] = useState(0); //according to this index range of episodes in the window will be shown , this will be changed through the dropdown of the select box, and the range is episodesPerWindow by default and is static for now, you can change this range statically or can make this range dynamic as well.


  useEffect(()=>{
    return () => {
      setEpisodesData([]);
      setStreamingData([]);
    };
  }, []);


  useEffect(()=>{
    // console.log(Math.floor(n/episodesPerWindow));
    setEpisodeRangeIndex(Math.floor(n/episodesPerWindow));
  }, [n]);

  // const memoizedDub = useMemo(() => dub, [dub]);
  // console.log("This is server data",serverData);

  useDebouncedEffect(() => {
    if (Object.values(episodeIds).every(val => val == null)) return; //this will check if all of the episodeIds are null

    // console.log("entering fetchingStreamingData with provider:", provider, "and episodeIds:", episodeIds);
    
    fetchStreamingData({
      episodeId: episodeIds.zoro,
      animepahe_id: episodeIds.animepahe,
    });
  }, [episodeIds, provider, dub, server], 100, setStreamingData); // 50ms delay
  
  
  const fetchStreamingData = async(ep)=>{

    setStreamLoading(true);
    try {

        if(provider && episodeIds[provider]){
          setAnimeNotAvailable(false);

          if(providersConfig[provider]?.hasServersApi){
          const data = await providersConfig[provider].streamingData(
            episodeIds[provider], 
            { dub: dub || '', server: providersConfig[provider].hasServersApi ? server || providersConfig[provider].defaultServer : undefined }
          );
          setStreamingData(data);
        }
        else { //for block providers like animepahe which don't have servers api
          const data = await providersConfig[provider].streamingData(
            episodeIds[provider], 
            { dub: dub === "-1" ? false : dub } //if dub is false means its raw means dub will be false, if dub is null then means its false also if dub is non empty or non null value then atutomatically means its true
          );
          // console.log("Streaming data fetched for provider:", provider, "data:", data);
          // console.log("This is the episode id for streaming data => ", episodeIds[provider]);
          setStreamingData(data);
        }
          setStreamLoading(false);
        }




      // if(provider==="zoro" && ep?.zoro_episodeId){
      //   setAnimeNotAvailable(false);
      //   const data = await axios.get(`/api/v1/${provider}/stream/${ep?.zoro_episodeId}`, {
      //     params: {
      //       category: dub ? dub==="-1" ? "raw" : "dub" : "sub",
      //       server: server || 'hd-2'
      //     }
      //   });
        
      //   if(data?.data?.status){
      //     return;
      //   }
      //   setStreamingData(data?.data);
      // }
      
      
    } catch (error) {
      console.log("couldn't fetch streaming data, ",error);
    }
    setStreamLoading(false);
  }


  

  const updateParams = (paramsList, resetT=true)=>{
    // console.log("this is paramsList :", paramsList);
    const newParams = new URLSearchParams(searchParams); 
    if(resetT) newParams.delete("t");
    paramsList.forEach(par => {
      newParams.set(par.key, par.val ? par.val : '');
    });

    return pathname + '?' + newParams.toString();
  }
  

  // console.log("this is console.logcontent  :", content);

  return (
    <div className="w-full rounded-lg bg-cbg-200/80 overflow-hidden  relative flex flex-col py-8 gap-2">
       <Image src={content?.images?.webp?.large_image_url} fill className=" h-full w-full blur-md  -z-10" alt={content?.title_english}/>
      <div className="md:w-[90%] w-full mx-auto justify-between md:gap-0 gap-12 flex mb-8  flex-col md:flex-row">
        
      <div className="hidden md:block"><Metadata content={content} id={id}/></div>
      

      <div className="provider-server-select self-center flex flex-col gap-8">
        <ProviderSelect/>

        <div className="availableServers mx self-center flex flex-col">
  {
    providersConfig[provider]?.hasServersApi ? (
      // console.log("This is server data just above the rendering component => ",serverData),
      <>
        {/* SUB or RAW */}
        {(serverData?.sub || serverData?.raw) && (
          <div className="sub flex font-semibold text-sm items-center p-2 gap-4">
            <h2 className="flex gap-2 items-center">
              <FaClosedCaptioning className="text-lg text-primary-300" />
              {serverData?.sub?.length > 0 ? "SUB:" : "RAW:"}
            </h2>
            <div className="flex gap-3 flex-wrap">
              {(serverData?.sub?.length > 0 ? serverData.sub : serverData.raw || []).map((ser) => (
                <Link
                  key={ser?.serverName || ser?.name}
                  href={updateParams(
                    [
                      { key: "dub", val: serverData.sub ? "" : "-1" },
                      { key: "server", val: ser?.serverName || ser?.name }
                    ],
                    false
                  )}
                  scroll={false}
                  className={`rounded px-2 py-1 items-center bg-cbg-400 ${
                    (!dub && serverData.sub && (server === ser?.serverName || server === ser?.name)) ||
                    (dub === "-1" && !serverData.sub && (server === ser?.serverName || server === ser?.name))
                      ? "bg-primary-100 text-gray-100"
                      : ""
                  }`}
                >
                  {ser?.serverName || ser?.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* DUB */}
        {serverData?.dub && (
          <div className="sub flex font-semibold text-sm items-center p-2 gap-4">
            <h2 className="flex gap-2 items-center">
              <FaMicrophoneAlt className="text-lg text-primary-300" /> DUB:
            </h2>
            <div className="flex gap-3 flex-wrap">
              {serverData.dub.map((ser) => (
                <Link
                  key={ser?.serverName || ser?.name}
                  href={updateParams(
                    [{ key: "dub", val: "1" }, { key: "server", val: ser?.serverName || ser?.name }],
                    false
                  )}
                  scroll={false}
                  className={`rounded px-2 py-1 whitespace-nowrap bg-cbg-400 ${
                    dub && (server === ser?.serverName || server === ser?.name)
                      ? "bg-primary-100 text-gray-100"
                      : ""
                  }`}
                >
                  {ser?.serverName || ser?.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </>
    ) : (
      // Providers like animepahe with direct stream links for sub/dub
      <div className="sub flex font-semibold text-sm items-center p-2 gap-4">
        <h2 className="flex gap-2 items-center">
          <FaClosedCaptioning className="text-lg text-primary-300" />
          Sub/Dub:
        </h2>
        <div className="flex gap-3 flex-wrap">
          <Link
            href={updateParams([{ key: "dub", val: "" }, { key: "server", val: "" }], false)}
            scroll={false}
            className={`rounded px-2 py-1 items-center bg-cbg-400 ${
              !dub ? "bg-primary-100 text-gray-100" : ""
            }`}
          >
            Sub
          </Link>
          <Link
            href={updateParams([{ key: "dub", val: "1" }, { key: "server", val: "" }], false)}
            scroll={false}
            className={`rounded px-2 py-1 items-center bg-cbg-400 ${
              dub ? "bg-primary-100 text-gray-100" : ""
            }`}
          >
            Dub
          </Link>
        </div>
      </div>
    )
  }
</div>

      </div>
      </div>

      <div className="w-52">
        <select
          className="rounded-md p-2 bg-cbg-300 mx-5 text-sm scrollbar-thin"
          value={episodeRangeIndex}
          onChange={(e) => setEpisodeRangeIndex(parseInt(e.target.value))}
        >
          {[...Array(Math.ceil(episodes?.length / episodesPerWindow))].map((e, i) => {
            // console.log(i);
            return (
              <option key={i} value={i} className="p-2 m-2">
                Eps {episodesPerWindow * i + 1} - {Math.min(episodes?.length, episodesPerWindow * (i + 1))}
              </option>
            );
          })}
        </select>
      </div>

      

      <div className="episode-list grid md:grid-cols-4 grid-cols-2 gap-2 m-3 md:max-h-screen max-h-[40vh]  overflow-y-scroll p-2 md:scrollbar-thin md:scrollbar-thumb-slate-500">
        {episodes
          ?.slice(
            (episodesPerWindow * episodeRangeIndex),
            Math.min(episodes?.length, episodesPerWindow * (episodeRangeIndex + 1))
          )
          ?.map((ep,i) => {
            // console.log("Episode data:", ep);
            return (
              <Link
                scroll={false}
                href={updateParams([
                  {key: "z-id", val: ep?.zoro_episodeId},
                  {key: "apahe-id", val: ep?.animepahe_id},
                  {key: "g-sub-id", val: ep?.gogoSubId},
                  {key: "g-dub-id", val: ep?.gogoDubId},
                  {key: "server", val:server},
                ])}
                key={ep?.zoro_episodeId}
                className={`w-full   text-xs p-4 cursor-pointer my-1 rounded-md  tracking-wider  flex gap-2 ${
                  (episodeIds.zoro === ep?.zoro_episodeId  && episodeIds.zoro) ||
                  (episodeIds.animepahe === ep?.animepahe_id && episodeIds.animepahe)
                  
                    ? ep?.isFiller ? "bg-sky-400/80 " : "text-primary-100 font-semibold bg-black/60" 
                    : "font-[350] bg-black/30"
                }
                    ${ep?.isFiller ? "bg-sky-400/30 " : ""} `}
                onClick={() =>{
                  // fetchStreamingData(ep);
                }
                  
                }
              >
                <div className="font-medium text-nowrap ">
                  {" "}
                  Ep {ep?.number || ep?.episodeIndex || i} :{" "}
                </div>{" "}
                {ep?.zoro_title || ep?.animepahe_title}
              </Link>
            );
          })}
      </div>
    </div>
  );
}
