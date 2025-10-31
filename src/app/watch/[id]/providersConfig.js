import axios from "axios";


/**
 * Transforms an array of server entries into an object grouped by type.
 *
 * Server api Output format:
 * {
 *     sub: [ // All 'sub' type entries
 *       {
 *         type: "sub",           // original type
 *         serverName: "HD-1"     // human-readable server name
 *        ...other data 
 *       },
 *       ...
 *     ],
 *     dub: [ // All 'dub' type entries
 *       {
 *         type: "dub",           // original type
 *         serverName: "HD-1"     // human-readable server name
 *        ...other data 
 *       },
 *       ...
 *     ],
 *     raw: [ // All 'raw' type entries if available 
 *       {
 *         type: "raw",           // original type
 *         serverName: "HD-1"     // human-readable server name
 *        ...other data 
 *       ...
 *      }], 
 *  }
 *   
 * 
 */


export const providersConfig = {
  'zoro' : {
    id: 'zoro',
    name: 'Provider-Z',
    displayName: 'Zoro Provider',
    hasServersApi: true,
    isSubtitleNeedReferer: true, // Zoro requires referer for subtitles
    defaultServer: 'HD-2',
    hasMultipleIdsPerEpisode: false,
    needsServerSideStreaming: true, // Zoro requires server-side streaming
    serverApiUrl: (episodeId) =>   `/api/v2/zoro/servers/${episodeId}`,
    streamingData : async (episodeId, { dub = '', server = 'hd-2' } = {}) => {
      try {
        const category = dub === "-1" ? "raw" : dub ? "dub" : "sub";
        const response = await axios.get(`/api/v2/zoro/watch/${episodeId}`, {
          params: { type: category, server }
        });

        //below is the response from the api of v1 version which was aniwatch-api scraper by Ritesh
        // const response = await axios.get(`/api/v1/zoro/stream/${episodeId}`, {
        //   params: { category, server }
        // });
        // console.log("Zoro Streaming Response from providers config:", response?.data);
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
    defaultServer: null, 
    isSubtitleNeedReferer: false, // Animepahe does not require subtitles let alone subtitles
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