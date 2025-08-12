import axios from "axios";
import { NextResponse } from "next/server";


function convertUserWatchlist(watchlistData){

    //This function converts the user watchlist data into a map format, where keys are anime ids and value are the name of the watchlists...This function firstly just converts the watchlist already existing in the database

    const nameToKeyMap = {
        "Completed": "completed",
        "Watching": "watching",
        "On Hold": "on_hold",
        "Dropped": "dropped",
        "Plan To Watch": "plan_to_watch"
    };

    let dataMap = {};

    watchlistData?.forEach(item => {
        const key = nameToKeyMap[item.name];
        if(key){
        item?.animeList?.forEach(entry => {
            dataMap[entry?.a] = {name: key, s: ""};
        });
    }
    })

  
    return dataMap;
}

function mergeBothWatchlists(MALWatchlist, userWatchlistMap) {

    //This function merges the MAL watchlist with the map that we created in the above function, so basically it iterates through the MAL watchlist (there are 5 watchlists in the MALWathclist, each is an array of anime ids), and iterate through the array of anime ids, in the map the anime id is added as the key with the watchlist name as the value , watchlist name is of the MALWatchlist, so that even if the user already has the  anime in a different watchlist, it will be overwritten by this method.
    const mergedWatchlistMap = userWatchlistMap;

    Object.entries(MALWatchlist).forEach(([key, animeList]) => {
       animeList.forEach(animeId => {
            if(mergedWatchlistMap[animeId] && mergedWatchlistMap[animeId]?.name != key) {
                mergedWatchlistMap[animeId] = {
                    name: key,
                    t: new Date().toISOString(),
                    s: 'MAL',
                };
            }
            else if(!mergedWatchlistMap[animeId]) {
                mergedWatchlistMap[animeId] = {
                    name: key,
                    t: new Date().toISOString(),
                    s: 'MAL',
                };
            }
        })
    });

    const mergedWatchlistData = {};
    Object.entries(mergedWatchlistMap).forEach(([animeId, watchlistEntry]) => {
        const name = watchlistEntry.name;

         if (!mergedWatchlistData[name]) {
        mergedWatchlistData[name] = [];
    }
        mergedWatchlistData[name].push({a: animeId, t: watchlistEntry.t, s: watchlistEntry?.s});
    });

    const finalMergedWatchlistData = {};
    Object.entries(mergedWatchlistData).forEach(([name, animeList]) => {
        finalMergedWatchlistData[name] = animeList.map(entry => ({
            a: entry.a,
            t: entry.t,
            s: entry?.s
        }));
    });

    return finalMergedWatchlistData;
}

export async function POST(req) {
    const payload = await req.json();
    const { userId, MALWatchlists } = payload;

    // Validate required fields
    if (!userId || !MALWatchlists) {
        return NextResponse.json(
            { error: 'userId and MALWatchlists are required' },
            { status: 400 }
        );
    }

    try {
        // console.log("Received MAL Data:", { userId, MALWatchlists });

        const userWatchlists = await axios.get(
            `${process.env.WORKER_URL}/api/${process.env.WORKER_VERSION}/getUserWatchLists/${userId}`);


        if (userWatchlists?.data?.status != 'success') {
            return NextResponse.json(
                { error: 'Failed to fetch user watchlists, Could not import the MAL list' },
                { status: 500 }
            );
        }

        const convertedUserWatchlistMap = convertUserWatchlist(userWatchlists?.data?.data);
        // console.log("Converted User Watchlist map:", convertedUserWatchlistMap);
        

        //Merge MAL watchlist with existing user watchlist
        const mergedWatchlistData = mergeBothWatchlists(
            MALWatchlists,
            convertedUserWatchlistMap,
        );

        
        //send the merged data in the cloudflare worker so that it can be inserted into the database
        const response = await axios.post(
            `${process.env.WORKER_URL}/api/${process.env.WORKER_VERSION}/addAnimeListToWatchlist`,
            { mergedDataObj: mergedWatchlistData, userId }
        );
        console.log("Response from worker:", response);
        if(response?.data?.status == 'success'){
        return NextResponse.json({ message: 'MAL data imported successfully'}, { status: 200 });
        }
        return NextResponse.json(response, { status: 500 });
    } catch (error) {
        console.error("Error importing MAL data:", error);
        return NextResponse.json(
            { error: 'Failed to import MAL data' },
            { status: 500 }
        );
    }
}