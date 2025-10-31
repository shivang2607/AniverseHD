import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const streamStore = (set, get)=>({
    selectedProvider : "zoro",
    episodeIds: {
        'zoro': null,
        'animepahe': null,
    },
    zoroEpisodeId : null,
    gogoSubEpisodeId: null,
    gogoDubEpisodeId: null,
    server : null,
    dub: false,
    content : null,
    episodesData : [],
    serverData : null,
    streamingData : null,
    serverLoading : false,
    streamLoading : false,

    setSelectedProvider : (prov)=> set({selectedProvider : prov}),

    setEpisodeIds : (ids)=> set({episodeIds : ids}),

    setZoroEpisodeId : (id)=> set({zoroEpisodeId : id}),

    setGogoSubEpisodeId : (id)=> set({gogoSubEpisodeId: id}),

    setGogoDubEpisodeId : (id)=> set({gogoDubEpisodeId: id}),

    setServer : (server)=> set({server}),

    setDub : (dub)=>set({dub}),

    setContent : (data)=> set({content : data}),

    setEpisodesData : (episodesData)=> set({episodesData}),

    setServerData : (serverData) => set({serverData}),

    setStreamingData : (streamingData) => set({streamingData}),

    setServerLoading : (serverLoading) => set({serverLoading}),

    setStreamLoading : (streamLoading) => set({streamLoading}),




});


const useStreamStore = create(
   streamStore
);

  
  export default useStreamStore;
  