import axios from "axios";

export const providersConfig = {
  'zoro' : {
    id: 'zoro',
    name: 'Provider-Z',
    displayName: 'Zoro Provider',
    hasServersApi: true,
    isSubtitleNeedReferer: true,
    defaultServer: 'HD-2',
    hasMultipleIdsPerEpisode: false,
    needsServerSideStreaming: true,
    serverApiUrl: (episodeId) =>   `/api/v2/zoro/servers/${episodeId}`,
    streamingData : async (episodeId, { dub = '', server = 'hd-2' } = {}) => {
      try {
        const category = dub === "-1" ? "raw" : dub ? "dub" : "sub";
        const response = await axios.get(`/api/v2/zoro/watch/${episodeId}`, {
          params: { type: category, server }
        });
        const data = response?.data;

        if (data?.sources?.length>0) {
          return {
            sources: data?.sources || [],
            tracks: data?.tracks || [],
            intro: data?.intro || null,
            outro: data?.outro || null,
            headers: data?.headers || null,
          };
        }

        return null;
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
    defaultServer: null,
    isSubtitleNeedReferer: false,
    hasMultipleIdsPerEpisode: false,
    serverApiUrl: null,
    needsServerSideStreaming: true,
    streamingData: async (episodeId, {dub = false} = {}) => {
      try {
        const dubFlag = dub === '1' || dub === true ? '1' : '0';
        const response = await axios.get(
          `/api/v2/animepahe/watch/${encodeURIComponent(episodeId)}`,
          { params: { dub: dubFlag } }
        );

        const data = response?.data;
        if (data?.sources?.length > 0) {
          return {
            sources: data.sources,
            tracks: [],
            intro: null,
            outro: null,
            headers: data?.headers || null,
          };
        }
        return null;
      } catch (err) {
        console.error("AnimePahe Streaming Error:", err);
        return null;
      }
    }
  },
  'vidsrc': {
    id: 'vidsrc',
    name: 'Provider-V',
    displayName: 'VidSrc Provider',
    hasServersApi: false,
    defaultServer: null,
    isSubtitleNeedReferer: false,
    hasMultipleIdsPerEpisode: false,
    serverApiUrl: null,
    needsServerSideStreaming: false,
    isEmbed: true,
    streamingData: async (episodeRef, { dub = false, malId } = {}) => {
      try {
        if (!malId) return null;
        const dubFlag = dub === '1' || dub === true ? '1' : '0';
        const ep = typeof episodeRef === 'object' ? episodeRef?.episodeNumber : Number(episodeRef);
        const epNum = Number.isFinite(ep) && ep > 0 ? ep : 1;
        const { data } = await axios.get(`/api/v2/vidsrc/embed/${malId}`, {
          params: { ep: epNum, dub: dubFlag },
        });
        if (!data?.embedUrl) return null;
        return {
          sources: [{ url: data.embedUrl, type: 'iframe', isDub: data.dub }],
          tracks: [],
          intro: null,
          outro: null,
          headers: null,
          isEmbed: true,
        };
      } catch (err) {
        console.error("VidSrc Embed Error:", err);
        return null;
      }
    }
  },
  'hnembed': {
    id: 'hnembed',
    name: 'Provider-H',
    displayName: 'HNEmbed Provider',
    hasServersApi: false,
    defaultServer: null,
    isSubtitleNeedReferer: false,
    hasMultipleIdsPerEpisode: false,
    serverApiUrl: null,
    needsServerSideStreaming: false,
    isEmbed: true,
    streamingData: async (episodeRef, { dub = false, malId } = {}) => {
      try {
        if (!malId) return null;
        const ep = typeof episodeRef === 'object' ? episodeRef?.episodeNumber : Number(episodeRef);
        const epNum = Number.isFinite(ep) && ep > 0 ? ep : 1;
        const { data } = await axios.get(`/api/v2/hnembed/embed/${malId}`, {
          params: { ep: epNum },
        });
        if (!data?.embedUrl) return null;
        return {
          sources: [{ url: data.embedUrl, type: 'iframe', isDub: Boolean(dub) }],
          tracks: [],
          intro: null,
          outro: null,
          headers: null,
          isEmbed: true,
        };
      } catch (err) {
        console.error("HNEmbed Error:", err);
        return null;
      }
    }
  },
};
