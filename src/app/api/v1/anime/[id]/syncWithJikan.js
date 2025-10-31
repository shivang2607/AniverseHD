import Bottleneck from "bottleneck";
import axios from "axios";
import jikan from "@mateoaranda/jikanjs";
import redisClient from "@/lib/redis"; // Use the singleton instance directly
import { GiphyFetch } from "@giphy/js-fetch-api";
import { fetchMappingsByMalId } from "./mappings";

// Function to fetch data from MalSync API
async function fetchMalSyncData(id, limiter) {
  const corsProxyUrl = process.env.ENV === 'DEV' ? process.env.CUSTOM_PROXY_URL : '';
  const headers = { 'Origin': '*' };
  
  try {
    const malSyncData = await limiter.schedule(() =>
      axios.get(`${corsProxyUrl}https://api.malsync.moe/mal/anime/${id}`, { headers })
    );
    
    if (malSyncData?.data?.Sites) {
      console.log(`✅ Fetched MalSync data for anime ID: ${id}`);
      return malSyncData.data.Sites;
    }
    return null;
  } catch (error) {
    console.error(`❌ Error fetching MalSync data for anime ID ${id}:`, error.message);
    return null;
  }
}

// Function to fetch data from API v2 mappings endpoint
export async function fetchApiV2Data(malId) {
  try {
    const data = await fetchMappingsByMalId(malId);
    if (!data) throw new Error("No data returned");

    console.log(`✅ Fetched API v2 data for MAL ID: ${malId}`);
    return data;
  } catch (error) {
    console.error(`❌ Error fetching API v2 data for MAL ID ${malId}:`, error.message);
    return null;
  }
}

// Helper function to convert API v2 response to Sites format
function convertApiV2ToSites(apiV2Data) {
  const sites = {};
  
  // Site name mapping for consistency (optional - can be removed if you want exact names)
  const siteNameMapping = {
    // 'gogoanime': 'Gogoanime',
    // 'zoro': 'Zoro'
  };
  
  // Convert ALL keys from API v2 format - everything is a mapping
  Object.keys(apiV2Data).forEach(key => {
    // Use mapped name if available, otherwise use original key name
    const siteName = siteNameMapping[key.toLowerCase()] || key;
    
    // Store all mapping data directly - everything is a mapping
    sites[siteName] = apiV2Data[key];
  });
  
  return sites;
}

// Function to merge Sites data from both APIs (API v2 takes precedence)
function mergeSitesData(malSyncSites, apiV2Data) {
  if (!malSyncSites && !apiV2Data) return null;
  if (!apiV2Data) return malSyncSites;
  if (!malSyncSites) return convertApiV2ToSites(apiV2Data);

  const apiV2Sites = convertApiV2ToSites(apiV2Data);

  // Start with malSyncSites
  const mergedSites = { ...malSyncSites };


  // Override/add sites from apiV2Sites
  for (const siteName in apiV2Sites) {
    mergedSites[siteName] = apiV2Sites[siteName]; // Replace if exists, add if not
  }

  return mergedSites;
}


export async function syncQdrant(id, resPayload) {
    // console.log(resPayload)
    
    const limiter = new Bottleneck({
        minTime: 666
    });

    const jikanLimiter = new Bottleneck({minTime: 500})

    const jikanResp = await jikanLimiter.schedule(() => jikan.loadAnime(id, 'full')); // Use when not using caching
    // const jikanResp = await jikan.loadAnime(id, 'full');
    // console.log(jikanResp.data.title);
    
    const jikanData = jikanResp.data;
    let updatePayload = {
        "aired": jikanData.aired,
        "airing": jikanData.airing,
        "episode_duration": jikanData.episode_duration,
        "duration": jikanData.duration,
        "favorites": jikanData.favorites,
        "members": jikanData.members,
        "popularity": jikanData.popularity,
        "rank": jikanData.rank,
        "rating": jikanData.rating,
        "score": jikanData.score,
        "scored_by": jikanData.scored_by,
        "start_date": jikanData.start_date,
        "start_season": jikanData.start_season,
        "status": jikanData.status,
        "title_english": jikanData.title_english || jikanData.title,
    };

    // Handle Sites data synchronization with dual API logic
    let sitesData = null;
    
    //checks if Sites is undefined, null or falsy or {} i.e. empty object
    if (!resPayload.Sites || (Object.keys(resPayload.Sites).length === 0 && resPayload.Sites.constructor === Object)) {
        console.log("📡 Case 1: Sites data is empty, fetching from both APIs...");
        
        // Fetch from both APIs simultaneously
        const [malSyncSites, apiV2Data] = await Promise.all([
            fetchMalSyncData(id, limiter),
            fetchApiV2Data(id)
        ]);
        
        // Merge data with API v2 preference
        sitesData = mergeSitesData(malSyncSites, apiV2Data);
        
        if (sitesData) {
            updatePayload.Sites = sitesData;
            console.log("✅ Successfully merged data from both APIs");
        } else {
            console.log("⚠️ No Sites data found from either API");
        }
    } 
    else if (resPayload.Sites.animepahe?.sub) {

      if(!resPayload.Sites.Zoro){
        console.log(" Case 2 part a -> Sites data has mal_id(animepahe) but no Zoro(from malSync), fetching from MalSync...");
        const malSyncSites = await fetchMalSyncData(id, limiter);
       sitesData = mergeSitesData(resPayload.Sites, malSyncSites);
       if (sitesData) {
            updatePayload.Sites = sitesData;
            console.log("✅ Successfully updated Sites data with Malsyc Zoro");
        } else {
            console.log("⚠️ Failed to fetch malsync api data, using existing Sites");
            sitesData = resPayload.Sites;
        }
      }
      else{
        console.log("✅ Case 2: Sites data is complete (has mal_id), using existing data");
        sitesData = resPayload.Sites;
      }
    } 
    else {
        console.log("📡 Case 3: Sites data exists but incomplete, fetching API v2 data...");
        
        // Fetch only from API v2
        const apiV2Data = await fetchApiV2Data(id);
        
        // Merge existing Sites with API v2 data
        sitesData = mergeSitesData(resPayload.Sites, apiV2Data);
        
        if (sitesData) {
            updatePayload.Sites = sitesData;
            console.log("✅ Successfully updated Sites data with API v2");
        } else {
            console.log("⚠️ Failed to fetch API v2 data, using existing Sites");
            sitesData = resPayload.Sites;
        }
    }

    if (!(resPayload?.relations)) {
        updatePayload = {
            ...updatePayload,
            "images": jikanData.images,
            "trailer": jikanData.trailer,
            "titles": jikanData.titles,
            "relations": jikanData.relations,
            "theme": jikanData.theme,
        };
    }

    
    //? below code is for adding giphy images to the qdrant database 
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    if (!(resPayload?.gif_images) || !(resPayload?.gif_images?.last_updated) || (Date.now() - new Date(resPayload.gif_images.last_updated).getTime()) > oneWeek) {
        const giphy_keys = process.env.GIPHY_API_KEYS.split('|') || [];
        const rank = jikanData?.rank || 1000;
        const searchTerm = rank <= 300 ? `Anime : ${(jikanData?.title_english || jikanData?.title || '').substring(0, 42)}` : "Anime girls"; // Truncate to 50 characters
        const searchLimit =  rank <= 300 ? 5 : 30;
    
        for (const key of giphy_keys) {
            const gf = new GiphyFetch(key);
            try {
                const { data } = await gf.search(searchTerm, { sort: 'relevant', limit: searchLimit });
                if (Array.isArray(data) && data.length > 0) {
                    const randomIndex = Math.floor(Math.random() * data.length);
                    updatePayload = {
                        ...updatePayload,
                        gif_images: {
                            last_updated: new Date().toISOString(),
                            fixed_height: data[randomIndex].images.fixed_height,
                            fixed_width: data[randomIndex].images.fixed_width,
                            original: data[randomIndex].images.original,
                            preview: data[randomIndex].images.preview,
                            fixed_height_still: data[randomIndex].images.fixed_height_still,
                            fixed_width_still: data[randomIndex].images.fixed_width_still
                        }
                    };
                    console.log("giphy added");
                    break; // Stop iterating once we have found valid data
                }
            } catch (error) {
                console.error(`Error fetching data with key ${key}:`, error);
            }
        }
    }
    

    await axios.post(`${process.env.QDRANT_URL}/collections/Anime/points/payload`,
        {
            "payload": updatePayload,
            "points": [Number(id)]
        },
        {
            headers: {
                "api-key": process.env.QDRANT_API_KEY
            }
        });
    // console.log("response payload update when relations is found", updatePayloadRes);
    // console.log("cache miss for anime id");

    const responsePayload = {
        ...jikanData,
        "genres": jikanData.genres.map(genre => genre.name),
        "themes": jikanData.themes.map(theme => theme.name),
        "demographics": jikanData.demographics?.map(demo => demo.name),
        "Sites": updatePayload?.Sites || resPayload?.Sites,    
        "gif_images": updatePayload?.gif_images || resPayload?.gif_images || null,
    };

    if(responsePayload){
        await redisClient.set(`qdrant-anime-${id}`, JSON.stringify(responsePayload), 'EX', 60 * 60 * 24 * 7); // 7 days
        console.log("response sent after updating Qdrant");
    }
    // console.log(responsePayload.Sites);
    return responsePayload;
}






// import Bottleneck from "bottleneck";
// import axios from "axios";
// import jikan from "@mateoaranda/jikanjs";
// import redisClient from "@/lib/redis"; // Use the singleton instance directly
// import { GiphyFetch } from "@giphy/js-fetch-api";

// export async function syncQdrant(id, resPayload) {
//     // console.log(resPayload)
    
//     const limiter = new Bottleneck({
//         minTime: 666
//     });

//     const jikanLimiter = new Bottleneck({minTime: 500})

//     const jikanResp = await jikanLimiter.schedule(() => jikan.loadAnime(id, 'full')); // Use when not using caching
//     // const jikanResp = await jikan.loadAnime(id, 'full');
//     // console.log(jikanResp.data.title);
    
//     const jikanData = jikanResp.data;
//     let updatePayload = {
//         "aired": jikanData.aired,
//         "airing": jikanData.airing,
//         "episode_duration": jikanData.episode_duration,
//         "duration": jikanData.duration,
//         "favorites": jikanData.favorites,
//         "members": jikanData.members,
//         "popularity": jikanData.popularity,
//         "rank": jikanData.rank,
//         "rating": jikanData.rating,
//         "score": jikanData.score,
//         "scored_by": jikanData.scored_by,
//         "start_date": jikanData.start_date,
//         "start_season": jikanData.start_season,
//         "status": jikanData.status,
//         "title_english": jikanData.title_english || jikanData.title,
//     };

//     // https://cors-anywhere.herokuapp.com/ (old proxy)
//     //https://api.allorigins.win/raw?url= (another proxy)
//     // cors.sh , (other proxy , only needed in development phase)
//     // console.log("Sites", resPayload.Sites);

    
    
//     //checks if Sites is undefined, null or falsy or {} i.e. empty object
//     if (!resPayload.Sites || (Object.keys(resPayload.Sites).length === 0 && resPayload.Sites.constructor === Object)) {
//         const corsProxyUrl = process.env.ENV === 'DEV' ? process.env.CUSTOM_PROXY_URL : '';
//         const headers = { 'Origin': '*' };
    
//         try {
//             // Attempt to fetch the data through the proxy
//             const malSyncData = await limiter.schedule(() =>
//                 axios.get(`${corsProxyUrl}https://api.malsync.moe/mal/anime/${id}`, { headers })
//             );
    
//             // Check if malSyncData exists and contains the expected data
//             if (malSyncData?.data?.Sites?.Gogoanime || malSyncData?.data?.Sites?.Zoro ) {
//                 updatePayload = {
//                     ...updatePayload,
//                     "Sites": malSyncData.data.Sites
//                 };
//             } else {
//                 console.error('No Sites data found in the response.');
//                 // Optional: Set a default value for Sites if required
//                 // updatePayload.Sites = {}; // or [] based on your requirements
//             }
    
//             // console.log("malsync data of zoro", malSyncData?.data?.Sites?.zoro);
//         } catch (error) {
//             // Log the error and set error response
//             console.error('Failed to fetch data from the site:', error.message);
//             // updatePayload.Sites = {}; // Optional: Provide fallback/default data
//         }
//     }
    

//     if (!(resPayload?.relations)) {
//         updatePayload = {
//             ...updatePayload,
//             "images": jikanData.images,
//             "trailer": jikanData.trailer,
//             "titles": jikanData.titles,
//             "relations": jikanData.relations,
//             "theme": jikanData.theme,
//         };
//     }

    
//     //? below code is for adding giphy images to the qdrant database 
//     const oneWeek = 7 * 24 * 60 * 60 * 1000;
//     if (!(resPayload?.gif_images) || !(resPayload?.gif_images?.last_updated) || (Date.now() - new Date(resPayload.gif_images.last_updated).getTime()) > oneWeek) {
//         const giphy_keys = process.env.GIPHY_API_KEYS.split('|') || [];
//         const rank = jikanData?.rank || 1000;
//         const searchTerm = rank <= 300 ? `Anime : ${(jikanData?.title_english || jikanData?.title || '').substring(0, 42)}` : "Anime girls"; // Truncate to 50 characters
//         const searchLimit =  rank <= 300 ? 5 : 30;
    
//         for (const key of giphy_keys) {
//             const gf = new GiphyFetch(key);
//             try {
//                 const { data } = await gf.search(searchTerm, { sort: 'relevant', limit: searchLimit });
//                 if (Array.isArray(data) && data.length > 0) {
//                     const randomIndex = Math.floor(Math.random() * data.length);
//                     updatePayload = {
//                         ...updatePayload,
//                         gif_images: {
//                             last_updated: new Date().toISOString(),
//                             fixed_height: data[randomIndex].images.fixed_height,
//                             fixed_width: data[randomIndex].images.fixed_width,
//                             original: data[randomIndex].images.original,
//                             preview: data[randomIndex].images.preview,
//                             fixed_height_still: data[randomIndex].images.fixed_height_still,
//                             fixed_width_still: data[randomIndex].images.fixed_width_still
//                         }
//                     };
//                     console.log("giphy added");
//                     break; // Stop iterating once we have found valid data
//                 }
//             } catch (error) {
//                 console.error(`Error fetching data with key ${key}:`, error);
//             }
//         }
//     }
    

    
    

//     await axios.post(`${process.env.QDRANT_URL}/collections/Anime/points/payload`,
//         {
//             "payload": updatePayload,
//             "points": [Number(id)]
//         },
//         {
//             headers: {
//                 "api-key": process.env.QDRANT_API_KEY
//             }
//         });
//     // console.log("response payload update when relations is found", updatePayloadRes);
//     // console.log("cache miss for anime id");

//     const responsePayload = {
//         ...jikanData,
//         "genres": jikanData.genres.map(genre => genre.name),
//         "themes": jikanData.themes.map(theme => theme.name),
//         "demographics": jikanData.demographics?.map(demo => demo.name),
//         "Sites": updatePayload?.Sites || resPayload?.Sites,    
//         "gif_images": updatePayload?.gif_images || resPayload?.gif_images || null,
//     };

//     if(responsePayload){
//     await redisClient.set(`qdrant-anime-${id}`, JSON.stringify(responsePayload), 'EX', 60 * 60 * 24 * 7); // 7 days
//     console.log("response sent after updating Qdrant");
//     }
//     // console.log(responsePayload.Sites);
//     return responsePayload;
// }
