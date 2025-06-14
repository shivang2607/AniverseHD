import axios from "axios";

export const providersConfig = {
  'zoro' : {
    id: 'zoro',
    name: 'Provider-Z',
    displayName: 'Zoro Provider',
    hasServersApi: true,
    hasMultipleIdsPerEpisode: false,
    needsServerSideStreaming: true, // Zoro requires server-side streaming
    serverApiUrl: (episodeId) =>   `/api/v1/zoro/servers/${episodeId}`,
    streamingData : async (episodeId, { dub = '', server = 'hd-2' } = {}) => {
      try {
        const category = dub === "-1" ? "raw" : "dub" || "sub";
        const response = await axios.get(`/api/v1/zoro/stream/${episodeId}`, {
          params: { category, server }
        });

        const data = response?.data;
        
        if (!data?.status) {
          return {
            sources: data?.sources || [],
            tracks: data?.tracks || [],
            intro: data?.intro || null,
            outro: data?.outro || null,
            headers: data?.headers || null,
          };
        }

        return null; // anime not available
      } catch (err) {
        console.error("Zoro Streaming Error:", err);
        return null;
      }
    }

  },
  'animepahe': {
    id: 'animepahe',
    name: 'Provider-A',
    displayName: 'Animepahe Provider',
    hasServersApi: false,
    hasMultipleIdsPerEpisode: false,
    serverApiUrl: null, // Animepahe does not have a servers API, it uses episode IDs directly,
    needsServerSideStreaming: true,
    streamingData: async (episodeId, {dub = false} = {}) => {
      try {
        const response = await axios.get(`/api/v2/animepahe/watch/${encodeURIComponent(episodeId)}`, {
          
        });

        const data = response?.data;
        if (data) {
          return {
            sources: data?.sources?.filter(src=>  src.isDub === (dub ==='1')) || [],
            tracks: data?.tracks || [],
            intro: data?.intro || null,
            outro: data?.outro || null,
            headers: data?.headers || null,
          };
        }

        return null; // anime not available
      } catch (err) {
        console.error("AnimePahe Streaming Error:", err);
        return null;
      }
    }

  },
};