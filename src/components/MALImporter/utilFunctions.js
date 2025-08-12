import axios from "axios";
import toast from "react-hot-toast";

const malBase = "https://myanimelist.net";
const proxy = process.env.NEXT_PUBLIC_GOOD_PROXY; // Ends with /fetch?url=

const watchListArray = ['', 'watching', 'completed', 'on_hold', 'dropped', '', 'plan_to_watch'];

export async function MergeMALData(malUserId, userId) {
    try {
        let offset = 0;
        let res = [];
        const watchlists = {
            "watching": [],
            "completed": [],
            "on_hold": [],
            "dropped": [],
            "plan_to_watch": []
        };

        do {
            const targetUrl = `${malBase}/animelist/${malUserId}/load.json?status=7&offset=${offset}`;
            const fullProxyUrl = `${proxy}${encodeURIComponent(targetUrl)}`;
            try{
            res = await axios.get(fullProxyUrl);
            }
            catch (error) {
                toast.error("Failed to fetch MAL data, please check username and try again.");
                console.error("Error fetching MAL data:", error);
                return;
            }
            console.log("MAL Data Fetched:", res?.data);

            res?.data?.forEach(item => {
                const key = watchListArray[item?.status];
                if (key) watchlists[key].push(item?.anime_id);
            });

            offset += 300;
        } while (res?.data?.length > 0);

        console.log("Final Watchlists:", watchlists);

        // const  serializedWatchlistData = JSON.stringify(watchlists);

        const response = await axios.post('/api/v2/mal/import', {
            userId,
            MALWatchlists: watchlists
        });
        console.log("Response is => , ", response);
        if(response.status == 200) {
            toast.success("MAL data imported successfully!");
            sessionStorage.removeItem(`userwatchLists/${userId}`);
        }

    } catch (error) {
        toast.error("Failed to import MAL data! Please try again later.");
        console.error("Failed to fetch MAL data:", error);
    }
}
