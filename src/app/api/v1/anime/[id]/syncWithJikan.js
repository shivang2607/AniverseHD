import Bottleneck from "bottleneck";
import axios from "axios";
import jikan from "@mateoaranda/jikanjs";
import redisClient from "@/lib/redis"; // Use the singleton instance directly
import { GiphyFetch } from "@giphy/js-fetch-api";

export async function syncQdrant(id, resPayload) {
    // console.log(resPayload)
    
    const limiter = new Bottleneck({
        minTime: 666
    });

    const jikanLimiter = new Bottleneck({minTime: 500})

    const jikanResp = await jikanLimiter.schedule(() => jikan.loadAnime(id, 'full')); // Use when not using caching
    // const jikanResp = await jikan.loadAnime(id, 'full');
    
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

    // https://cors-anywhere.herokuapp.com/ (old proxy)
    //https://api.allorigins.win/raw?url= (another proxy)
    // cors.sh , (other proxy , only needed in development phase)
    console.log("Sites", resPayload.Sites);

    // *corsProxy url isint working plus you need to do error handling here, also iski vajah se jaha /anime/id vaali api call ho rahi h vaha undefined return ho raha h which should not happen at all to isko bhi address krna h, yhi cheez addAnime function m bhi anjaam deni h, I can just create a proxy server of my own and deploy it to the netlify or onrender, its just a basic page after all.
    

    if (!(resPayload.Sites)) {
        // console.log("HI")
        
        const corsProxyUrl = process.env.ENV === 'DEV' ? 'https://cors-anywhere.herokuapp.com/' : '';
        const headers = {
            'Origin': '*'
        };
        const malSyncData = await limiter.schedule(() => axios.get(`${corsProxyUrl}https://api.malsync.moe/mal/anime/${id}`, { headers }));
        updatePayload = {
            ...updatePayload,
            "Sites": malSyncData?.data?.Sites
        };
        // console.log(updatePayload.Sites);
        console.log("malsync data",malSyncData);
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
    console.log("cache miss for anime id");

    const responsePayload = {
        ...jikanData,
        "genres": jikanData.genres.map(genre => genre.name),
        "themes": jikanData.themes.map(theme => theme.name),
        "demographics": jikanData.demographics?.map(demo => demo.name),
        "Sites": updatePayload?.Sites || resPayload?.Sites,    
        "gif_images": updatePayload?.gif_images || resPayload?.gif_images || null,
    };

    await redisClient.set(`qdrant-anime-${id}`, JSON.stringify(responsePayload), 'EX', 60 * 60 * 24 * 7); // 7 days
    console.log("response sent after updating Qdrant");
    // console.log(responsePayload.Sites);
    return responsePayload;
}
