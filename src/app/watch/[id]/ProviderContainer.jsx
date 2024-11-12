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
  content
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
  const pathname = usePathname();


  const {
    episodes,
  serverData,
  // prov = "gogo",
  setSelectedProvider,
  zoroEpisodeId, setZoroEpisodeId,
  gogoSubEpisodeId, setGogoSubEpisodeId,
  gogoDubEpisodeId, setGogoDubEpisodeId,
  dub,
  streamingData, setStreamingData,
  serverLoading, setServerLoading,
  setStreamLoading,
  server,
  // setServer,
  } = useStreamStore(state=>({
    ...state,
    episodes : state.episodesData
  }));

  const serverV = searchParams.get('server');
  // const [server, setServer] = useState(searchParams.get('server'));
  // const [serverLoading, setServerLoading] = useState(false);
  const [episodeRangeIndex, setEpisodeRangeIndex] = useState(0); //according to this index range of episodes in the eindow will be shown this will be changed through the dropdown of the select box, and the range is 50 by default and is static for now, you can change this range statically or can make this range dynamic as well.


  // const memoizedDub = useMemo(() => dub, [dub]);
  console.log("This is server data",serverData);

  useDebouncedEffect(() => {
    if (!zoroEpisodeId && !gogoDubEpisodeId && !gogoSubEpisodeId) return;
    
    fetchStreamingData({
      episodeId: zoroEpisodeId,
      gogoSubId: gogoSubEpisodeId,
      gogoDubId: gogoDubEpisodeId,
    });
  }, [zoroEpisodeId, gogoSubEpisodeId, gogoDubEpisodeId, provider, dub, server], 50, setStreamingData); // 50ms delay
  
  
  const fetchStreamingData = async(ep)=>{

    setStreamLoading(true);
    try {
      if(provider==="zoro"){
        console.log(ep?.episodeId)
        console.log(provider, dub, server);
        const data = await axios.get(`/api/v1/${provider}/stream/${ep?.episodeId}`, {
          params: {
            category: dub ? "dub" : "sub",
            server: server || 'hd-1'
          }
        });
        
        setStreamingData(data?.data);
        console.log("zoro ka streaming api vaala data",data?.data);
      }
      else{
        const data = await axios.get(`/api/v1/${provider}/stream/${dub?ep?.gogoDubId:ep?.gogoSubId}?server=${server}`);
        setStreamingData(data?.data);
        console.log("gogo ki streaming api vaala data", data?.data);
      }
    } catch (error) {
      console.log("couldn't fetch streaming data, ",error);
    }
    setStreamLoading(false);
  }


  

  const updateParams = (paramsList)=>{
    const newParams = new URLSearchParams(searchParams); 
    paramsList.forEach(par => {
      newParams.set(par.key, par.val);
    });

    return pathname + '?' + newParams.toString();
  }
  
  // console.log("this is server:", server);

  return (
    <div className="w-full rounded-lg bg-cbg-200/80 overflow-hidden  relative flex flex-col py-8 gap-2">
      <Image src={content?.images?.webp?.large_image_url} fill className=" h-full w-full blur-md  -z-10"/>
      <div className="provider-server-select self-center flex flex-col gap-8">
        <div className="button self-center flex gap-2 text-gray-200 ">
          <Link
            href = {updateParams([{key:"provider", val: "zoro"},{ key:"server", val:''}])}
            scroll={false}
            className={` text-lg font-semibold p-1 px-2 rounded-md ${
              provider === "zoro" ? "bg-primary-100" : ""
            }  `} 
            onClick={() => {
              setSelectedProvider("zoro");
              // setServerLoading(true);
            }}
          >
            Provider-Z
          </Link>
          <Link
            href = {updateParams([{key:"provider", val: "gogo"},{ key:"server", val:"hd-1"}])}
            scroll={false}
            className={` text-lg font-semibold p-1 px-2 rounded-md  ${
              provider === "gogo" ? "bg-primary-100" : ""
            } `}
            onClick={() => {
              setSelectedProvider("gogo");
              // setServerLoading(true);
            }}
          >
            Provider-G
          </Link>
        </div>

        <div className="availableServers self-center flex flex-col">
        {(serverData?.sub || provider==="gogo") &&<div className="sub flex font-semibold text-sm items-center p-2 gap-4">
               <h2 className="flex gap-2 items-center"><FaClosedCaptioning className="text-lg text-primary-300"/> SUB:</h2>
              <div className="flex gap-3">
                {provider==="gogo" && 
                <Link
                href={updateParams([{key: "dub", val:''}, {key:"server", val: "default-sub"}])} 
                scroll={false} 
                aria-disabled = {serverLoading}
                className={`rounded px-2 py-1 items-center bg-cbg-400 ${!dub ? "bg-primary-100 text-gray-100":""}`}
                // onClick={()=>fetchStreamingData({
                //   episodeId : zoroEpisodeId,
                //   gogoSubId: gogoSubEpisodeId,
                //   gogoDubId: gogoDubEpisodeId
                // })}
                >Default</Link>
                }
                {
                  provider==="zoro" && serverData?.sub?.map(ser=>{
                    // console.log("ser first", ser);
                    return (
                      <Link 
                      key={ser?.serverName || ser?.name}
                      href={updateParams([{key: "dub", val:''}, {key:"server", val: ser?.serverName || ser?.name}])} 
                      scroll={false} 
                      className={`rounded px-2 py-1 items-center bg-cbg-400 ${!dub && (server===ser?.serverName || server===ser?.name) ? "bg-primary-100 text-gray-100":""}`}
                      // onClick={()=>fetchStreamingData({
                      //   episodeId : zoroEpisodeId,
                      //   gogoSubId: gogoSubEpisodeId,
                      //   gogoDubId: gogoDubEpisodeId
                      // })}
                      >{ser?.serverName || ser?.name}</Link>
                    )
                  })
                }
              </div>
            </div>
        }

            {(serverData?.dub || provider==="gogo") && <div className="sub flex font-semibold text-sm items-center p-2 gap-4">
              <h2 className="flex gap-2 items-center"><FaMicrophoneAlt className="text-lg text-primary-300"/> DUB:</h2>
              <div className="flex gap-3">

              {provider==="gogo" && 
                <Link
                href={updateParams([{key: "dub", val:'1'}, {key:"server", val: "default-dub"}])} 
                scroll={false} 
                className={`rounded px-2 py-1 items-center bg-cbg-400 ${dub  ? "bg-primary-100 text-gray-100":""}`}
                // onClick={()=>fetchStreamingData({
                //   episodeId : zoroEpisodeId,
                //   gogoSubId: gogoSubEpisodeId,
                //   gogoDubId: gogoDubEpisodeId
                // })}
                >Default</Link>
                }


              {
                  provider==="zoro" && serverData?.dub?.map(ser=>{
                    return (
                      <Link key={ser?.serverName || ser?.name} 
                      scroll={false} 
                      href={updateParams([{key: "dub", val:'1'}, {key:"server", val: ser?.serverName || ser?.name}])} 
                      className={`rounded px-2 py-1 items-center bg-cbg-400 ${dub && (server===ser?.serverName || server===ser?.name) ? "bg-primary-100 text-gray-100":""}`}
                      // onClick={()=>fetchStreamingData({
                      //   episodeId : zoroEpisodeId,
                      //   gogoSubId: gogoSubEpisodeId,
                      //   gogoDubId: gogoDubEpisodeId
                      // })}
                      >{ser?.serverName || ser?.name}</Link>
                    )
                  })
              }
              </div>

            </div>
                }
        </div>
      </div>

      <div className="w-52">
        <select
          className="rounded-md p-2 bg-cbg-300 mx-5 text-sm scrollbar-thin"
          value={episodeRangeIndex}
          onChange={(e) => setEpisodeRangeIndex(parseInt(e.target.value))}
        >
          {[...Array(Math.ceil(episodes?.length / 50))].map((e, i) => {
            // console.log(i);
            return (
              <option key={i} value={i} className="p-2 m-2">
                Eps {50 * i + 1} - {Math.min(episodes?.length, 50 * (i + 1))}
              </option>
            );
          })}
        </select>
      </div>

      <div className="episode-list grid grid-cols-4 gap-2 m-3 max-h-screen overflow-y-scroll p-2 md:scrollbar-thin md:scrollbar-thumb-slate-500">
        {episodes
          ?.slice(
            50 * episodeRangeIndex,
            Math.min(episodes?.length, 50 * (episodeRangeIndex + 1))
          )
          ?.map((ep,i) => {
            return (
              <Link
                scroll={false}
                href={updateParams([
                  {key: "z-id", val: ep?.episodeId},
                  {key: "g-sub-id", val: ep?.gogoSubId},
                  {key: "g-dub-id", val: ep?.gogoDubId},
                  {key: "server", val:server},
                ])}
                key={ep?.episodeId}
                className={`w-full   text-xs p-4 cursor-pointer my-1 rounded-md  tracking-wider  flex gap-2 ${
                  zoroEpisodeId === ep?.episodeId ||
                  gogoSubEpisodeId === ep?.gogoSubId ||
                  gogoDubEpisodeId === ep?.gogoDubId
                    ? "text-primary-100 font-semibold bg-black/50"
                    : "font-[350] bg-black/30"
                }
                    ${ep?.isFiller ? "bg-sky-400" : ""} `}
                onClick={() =>{
                  // fetchStreamingData(ep);
                }
                  
                }
              >
                <div className="font-medium text-nowrap ">
                  {" "}
                  Ep {ep?.number} :{" "}
                </div>{" "}
                {ep?.title}
              </Link>
            );
          })}
      </div>
    </div>
  );
}
