import useStreamStore from "@/components/utils/streamStore";
import axios from "axios";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  const router = useRouter();
  const provider = searchParams.get("provider") || "megaplay";
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

  const serverV = searchParams.get('server');
  const dub = searchParams.get('dub');
  const activeEpFromUrl = searchParams.get('hn-ep') || searchParams.get('megaplay-ep') || null;
  // Fall back to episodeIds[provider] (which page.jsx defaults to "1" for the
  // active embed provider) so the episode list shows the correct selection on
  // initial load even when no episode URL param is present yet.
  const activeEpFromIds = ["megaplay", "hnembed"].includes(provider)
    ? episodeIds?.[provider]
    : null;
  const activeEpRaw = activeEpFromUrl || activeEpFromIds;
  const activeEpNum = activeEpRaw && /^\d+$/.test(String(activeEpRaw)) ? Number(activeEpRaw) : null;
  const hnSeasonOverride = searchParams.get('hn-season');
  const hnSeasonOverrideNum = hnSeasonOverride && /^\d+$/.test(hnSeasonOverride) ? Number(hnSeasonOverride) : null;
  // const [server, setServer] = useState(searchParams.get('server'));
  // const [serverLoading, setServerLoading] = useState(false);
  
  const [episodeRangeIndex, setEpisodeRangeIndex] = useState(0); //according to this index range of episodes in the window will be shown , this will be changed through the dropdown of the select box, and the range is episodesPerWindow by default and is static for now, you can change this range statically or can make this range dynamic as well.
  const [manualEpInput, setManualEpInput] = useState("");


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
    if (!provider || !episodeIds?.[provider]) {
      setStreamingData(null);
      return;
    }
    setStreamingData(null);
    fetchStreamingData();
  }, [episodeIds, provider, dub, server, hnSeasonOverrideNum], 100, setStreamingData);


  const fetchStreamingData = async () => {
    setStreamLoading(true);
    try {
      if (!provider || !episodeIds?.[provider]) return;
      setAnimeNotAvailable(false);

      const cfg = providersConfig[provider];
      let data = null;

      if (cfg?.hasServersApi) {
        data = await cfg.streamingData(
          episodeIds[provider],
          { dub: dub || '', server: server || cfg.defaultServer }
        );
      } else if (cfg?.isEmbed) {
        const embedOpts = { dub: dub === "-1" ? false : dub, malId: id };
        if (provider === "hnembed" && hnSeasonOverrideNum) {
          embedOpts.season = hnSeasonOverrideNum;
        }
        data = await cfg.streamingData(episodeIds[provider], embedOpts);
      } else {
        data = await cfg.streamingData(
          episodeIds[provider],
          { dub: dub === "-1" ? false : dub }
        );
      }

      setStreamingData(data);
    } catch (err) {
      console.error("fetchStreamingData failed:", err?.message);
      setStreamingData(null);
    } finally {
      setStreamLoading(false);
    }
  };




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

  {provider === "hnembed" && streamingData?.kind !== "movie" && (() => {
    const autoSeason = Number(streamingData?.season) || 1;
    const activeSeason = hnSeasonOverrideNum || autoSeason;
    // Show 1..max(autoSeason+1, 5) so the user has at least 5 options and a buffer
    // past the auto-resolved season in case the resolver under-counted.
    const maxShown = Math.max(autoSeason + 1, 5);
    const seasonOptions = Array.from({ length: maxShown }, (_, i) => i + 1);
    return (
      <div className="sub flex font-semibold text-sm items-center p-2 gap-4 flex-wrap">
        <h2 className="flex gap-2 items-center whitespace-nowrap">
          <PiVideoFill className="text-lg text-primary-300" />
          Season:
        </h2>
        <div className="flex gap-2 flex-wrap items-center">
          {seasonOptions.map((s) => (
            <Link
              key={s}
              href={updateParams([{ key: "hn-season", val: String(s) }], false)}
              scroll={false}
              className={`rounded px-2 py-1 bg-cbg-400 ${
                s === activeSeason ? "bg-primary-100 text-gray-100" : ""
              }`}
            >
              S{s}
            </Link>
          ))}
          {hnSeasonOverrideNum && (
            <Link
              href={updateParams([{ key: "hn-season", val: "" }], false)}
              scroll={false}
              className="rounded px-2 py-1 bg-cbg-400 text-xs text-gray-400 hover:text-gray-200"
              title="Clear override and use auto-detected season"
            >
              Auto (S{autoSeason})
            </Link>
          )}
        </div>
        {streamingData?.seasonSource && (
          <span className="text-xs text-gray-400 font-normal">
            {hnSeasonOverrideNum
              ? `override active`
              : `auto: ${streamingData.seasonSource}`}
          </span>
        )}
      </div>
    );
  })()}
</div>

      </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mx-5">
        <div className="w-52">
          <select
            className="rounded-md p-2 bg-cbg-300 text-sm scrollbar-thin w-full"
            value={episodeRangeIndex}
            onChange={(e) => setEpisodeRangeIndex(parseInt(e.target.value))}
          >
            {[...Array(Math.ceil(episodes?.length / episodesPerWindow))].map((e, i) => {
              return (
                <option key={i} value={i} className="p-2 m-2">
                  Eps {episodesPerWindow * i + 1} - {Math.min(episodes?.length, episodesPerWindow * (i + 1))}
                </option>
              );
            })}
          </select>
        </div>

        {/* Manual episode-number jump. The episode list is built from MAL/Jikan
            which returns episodes:null for ongoing/long-running shows (One Piece,
            Conan, etc.) — our route now estimates from air date, but the estimate
            won't be exact. This input lets users jump to any episode regardless
            of what the list shows. Also useful when MAL's count is stale. */}
        {(provider === "megaplay" || provider === "hnembed") && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const n = parseInt(manualEpInput, 10);
              if (!Number.isFinite(n) || n < 1) return;
              const updates = [
                { key: "hn-ep", val: String(n) },
                { key: "megaplay-ep", val: String(n) },
                { key: "n", val: String(Math.max(0, n - 1)) },
              ];
              router.push(updateParams(updates, false), { scroll: false });
              setManualEpInput("");
            }}
            className="flex items-center gap-2"
          >
            <label className="text-sm text-gray-300 whitespace-nowrap">
              Jump to ep:
            </label>
            <input
              type="number"
              min="1"
              inputMode="numeric"
              placeholder="e.g. 1089"
              value={manualEpInput}
              onChange={(e) => setManualEpInput(e.target.value)}
              className="rounded-md p-2 bg-cbg-300 text-sm w-24 border-0 outline-none focus:ring-2 focus:ring-primary-300"
            />
            <button
              type="submit"
              className="rounded-md px-3 py-2 bg-primary-100 text-cbg-100 text-sm font-semibold hover:bg-primary-200 disabled:opacity-50"
              disabled={!manualEpInput || !/^\d+$/.test(manualEpInput)}
            >
              Go
            </button>
          </form>
        )}

        {content?.episodesEstimated && (
          <span className="text-xs text-amber-300/90 italic">
            Episode count is estimated — use &quot;Jump to ep&quot; for any episode beyond the list.
          </span>
        )}
      </div>

      

      {activeEpNum !== null && (provider === "hnembed" || provider === "megaplay") && (
        <div className="text-sm text-gray-300 mx-5 mb-1">
          Now playing:{" "}
          <span className="text-primary-200 font-semibold">
            Episode {activeEpNum}
          </span>
        </div>
      )}

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
                  {key: "hn-ep", val: String(ep?.number || ep?.episodeIndex || (i + 1))},
                  {key: "megaplay-ep", val: String(ep?.number || ep?.episodeIndex || (i + 1))},
                  {key: "g-sub-id", val: ep?.gogoSubId},
                  {key: "g-dub-id", val: ep?.gogoDubId},
                  {key: "server", val:server},
                ])}
                key={ep?.zoro_episodeId || ep?.animepahe_id || `ep-${ep?.number || i}`}
                data-active={
                  (episodeIds.zoro === ep?.zoro_episodeId && !!episodeIds.zoro) ||
                  (episodeIds.animepahe === ep?.animepahe_id && !!episodeIds.animepahe) ||
                  ((provider === "hnembed" || provider === "megaplay") &&
                    activeEpNum !== null &&
                    Number(ep?.number || ep?.episodeIndex || (i + 1)) === activeEpNum)
                }
                className={`w-full text-xs p-4 cursor-pointer my-1 rounded-md tracking-wider flex gap-2 transition-colors ${
                  (episodeIds.zoro === ep?.zoro_episodeId && !!episodeIds.zoro) ||
                  (episodeIds.animepahe === ep?.animepahe_id && !!episodeIds.animepahe) ||
                  ((provider === "hnembed" || provider === "megaplay") &&
                    activeEpNum !== null &&
                    Number(ep?.number || ep?.episodeIndex || (i + 1)) === activeEpNum)
                    ? (ep?.isFiller || ep?.zoro_isFiller)
                      ? "bg-sky-400 text-cbg-100 ring-2 ring-primary-100"
                      : "bg-primary-100 text-cbg-100 font-semibold ring-2 ring-primary-300"
                    : (ep?.isFiller || ep?.zoro_isFiller)
                      ? "bg-sky-400/30 hover:bg-sky-400/50"
                      : "font-[350] bg-black/30 hover:bg-black/60"
                }`}
                onClick={() =>{
                  // fetchStreamingData(ep);
                }
                  
                }
              >
                <div className="font-medium text-nowrap">
                  Ep {ep?.number || ep?.episodeIndex || (i + 1)}
                </div>
                {(ep?.zoro_title || ep?.animepahe_title) && (
                  <span className="truncate text-gray-300">
                    : {ep?.zoro_title || ep?.animepahe_title}
                  </span>
                )}
              </Link>
            );
          })}
      </div>
    </div>
  );
}
