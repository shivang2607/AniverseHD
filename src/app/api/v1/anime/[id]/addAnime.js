import jikan from "@mateoaranda/jikanjs";
import { pipeline } from "@xenova/transformers";
import axios from "axios";
import Bottleneck from "bottleneck";
import redisClient from "@/lib/redis"; // Import the singleton Redis client instance

// This function simply turns a sentence into embeddings.
async function encodeText(text) {
    const extractor = await pipeline("feature-extraction", "Xenova/bge-small-en-v1.5");
    const encodings = await extractor(text, { pooling: "mean", normalize: true });
    return Object.values(encodings.data);
}

export async function addQdrantAnime(id) {
    const res = await jikan.loadAnime(id, 'full');
    const jikanResp = res?.data;
    console.log("Function add anime ran");

    const inputSentence = `Type is ${jikanResp?.type || ''},
                            genres are ${jikanResp.genres.map(genre => (genre.name || "")).join(" ")},
                            themes are ${jikanResp.themes.map(theme => (theme.name || "")).join(" ")}, 
                            studio is ${jikanResp.studios.map(studio => studio.name || "").join(" ")}, 
                            number of episodes are ${preprocess_episodes(jikanResp.episodes)}, 
                            start year is ${jikanResp.year || ""}, 
                            demographics are ${jikanResp.demographics.map(d => (d.name || "")).join(" ")}, 
                            ${jikanResp.synopsis || ''}, 
                            ${jikanResp.title_english}
                            `.replace(/\n/g, ' ').trim();

    // Get embeddings for the input sentence.
    const embeddings = await encodeText(inputSentence);

    // Initialize Bottleneck limiter
    const limiter = new Bottleneck({
        minTime: 666
    });

    // Use proxy if in dev mode else make call directly to the malSync api, check if the response contains gogo, or zoro mappings, if Yes then Add it to the payload.

    // *corsProxy url isint working plus you need to do error handling here, also iski vajah se jaha /anime/id vaali api call ho rahi h vaha undefined retuen ho raha h which should not happen at all to isko bhi address krna h
    
    const corsProxyUrl = process.env.ENV === "DEV" ? process.env.CUSTOM_PROXY_URL : '';
    const headers = { 'Origin': '*' };
    let payload = jikanResp;
    
    // Attempt to fetch malSyncData, catch any error, and provide a fallback
    let malSyncData = null;
    try {
        malSyncData = await limiter.schedule(() => axios.get(`${corsProxyUrl}https://api.malsync.moe/mal/anime/${id}`, { headers }));
    } catch (error) {
        console.error('Failed to fetch malSyncData:', error.message);
    }
    
    // Process jikanResp and handle cases where genres, themes, or demographics might be missing
    try {
        payload = {
            ...payload,
            "genres": jikanResp.genres?.map(genre => genre.name) || [],
            "themes": jikanResp.themes?.map(theme => theme.name) || [],
            "demographics": jikanResp.demographics?.map(demo => demo.name) || []
        };
    } catch (error) {
        console.error('Error processing jikanResp data:', error.message);
    }
    
    // Conditionally add Sites if present in malSyncData
    if (malSyncData?.data?.Sites?.Gogoanime || malSyncData?.data?.Sites?.Zoro) {
        payload = {
            ...payload,
            "Sites": malSyncData.data.Sites
        };
    } else {
        console.warn('Gogoanime or Zoro data not found in malSyncData.');
    }
    
    // Add the anime to the Qdrant database with its payload and embeddings.
    const uploadPoint = await axios.put(
        `${process.env.QDRANT_URL}/collections/Anime/points`,
        {
            "points": [
                {
                    "id": jikanResp.mal_id,
                    "payload": payload,
                    "vector": {
                        "fast-bge-small-en": embeddings
                    }
                }
            ]
        },
        {
            headers: {
                "api-key": process.env.QDRANT_API_KEY
            }
        },
    );

    if (uploadPoint.data.status === 'ok') {
        console.log("New anime added successfully!!");
        redisClient.set(`qdrant-anime-${id}`, JSON.stringify(payload), 'EX', 60 * 60 * 24 * 7); // Cache for 7 days.
    }

    // Return the payload as the response to the frontend.
    return payload;
}

// Helper function for preprocessing the number of episodes used in the input sentence.
function preprocess_episodes(episodes) {
    if (!episodes) return '';
    else if (episodes > 100) return "Huge";
    else if (episodes > 75) return "Very Large";
    else if (episodes > 50) return "Large";
    else if (episodes > 24) return "Decent";
    else if (episodes > 10) return "Normal";
    else if (episodes === 1) return "Movie";
    else return "Unknown";
}
