import Bottleneck from "bottleneck";
import axios from "axios";
import jikan from "@mateoaranda/jikanjs";
import redisClient from "@/lib/redis"; // Use the singleton instance directly

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
    // cors.sh , (other proxy , only needed in development phase)
    // console.log(resPayload.Sites);
    if (!(resPayload.Sites)) {
        // console.log("HI")
        const corsProxyUrl = process.env.ENV === 'DEV' ? 'https://api.allorigins.win/raw?url=' : '';
        const headers = {
            'Origin': '*'
        };
        const malSyncData = await limiter.schedule(() => axios.get(`${corsProxyUrl}https://api.malsync.moe/mal/anime/${id}`, { headers }));
        updatePayload = {
            ...updatePayload,
            "Sites": malSyncData?.data?.Sites
        };
        // console.log(updatePayload.Sites);
        // console.log(malSyncData);
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
        "Sites": updatePayload.Sites || resPayload?.Sites
    };

    await redisClient.set(`qdrant-anime-${id}`, JSON.stringify(responsePayload), 'EX', 60 * 60 * 24 * 7); // 7 days
    console.log("response sent after updating Qdrant");
    // console.log(responsePayload.Sites);
    return responsePayload;
}
