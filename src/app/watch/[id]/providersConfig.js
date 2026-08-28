import axios from "axios";
import { resolveEpisodeNumber, toDubFlag, buildEmbedStream } from "@/utils/embedStreaming";

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
  'megaplay': {
    id: 'megaplay',
    name: 'Provider-M',
    displayName: 'MegaPlay Provider',
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
        const { data } = await axios.get(`/api/v2/megaplay/embed/${malId}`, {
          params: { ep: resolveEpisodeNumber(episodeRef), dub: toDubFlag(dub) },
        });
        return buildEmbedStream(data, dub);
      } catch (err) {
        console.error("MegaPlay Embed Error:", err);
        return null;
      }
    }
  },
  'tryembed': {
    id: 'tryembed',
    name: 'Provider-T',
    displayName: 'TryEmbed Provider',
    hasServersApi: false,
    defaultServer: null,
    isSubtitleNeedReferer: false,
    hasMultipleIdsPerEpisode: false,
    serverApiUrl: null,
    needsServerSideStreaming: false,
    isEmbed: true,
    streamingData: async (episodeRef, { dub = false, malId, startTime = 0 } = {}) => {
      try {
        if (!malId) return null;
        const params = {
          ep: resolveEpisodeNumber(episodeRef),
          dub: toDubFlag(dub),
        };
        if (startTime > 0) params.t = Math.floor(startTime);
        const { data } = await axios.get(`/api/v2/tryembed/embed/${malId}`, { params });
        return buildEmbedStream(data, dub);
      } catch (err) {
        console.error("TryEmbed Error:", err);
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
    streamingData: async (episodeRef, { dub = false, malId, season } = {}) => {
      try {
        if (!malId) return null;
        const params = { ep: resolveEpisodeNumber(episodeRef) };
        if (Number.isFinite(Number(season)) && Number(season) > 0) {
          params.season = Number(season);
        }
        const { data } = await axios.get(`/api/v2/hnembed/embed/${malId}`, {
          params,
        });
        return {
          ...buildEmbedStream(data, dub),
          season: data?.season ?? null,
          seasonSource: data?.seasonSource ?? null,
          kind: data?.kind ?? null,
        };
      } catch (err) {
        console.error("HNEmbed Error:", err);
        return null;
      }
    }
  },
};
