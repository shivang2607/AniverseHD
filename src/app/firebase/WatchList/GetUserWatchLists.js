import { auth, db } from "../utils/firebaseinit";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import getUserAuth from "../utils/GetCurrentUserAuth";
import { NotAuthenticatedUser, success, errorStr } from "@/utils/constants";
import { getUserWatchlistsCached, setUserWatchlistsCached } from "../utils/SessionStorage";

export default async function GetUserWatchLists() {
  try {
    // Check if user cookies exist
    const userData = getUserAuth();
    if (!userData) {
      throw new Error(NotAuthenticatedUser);
    }

    const cachedUserWatchlists=getUserWatchlistsCached();
    if(cachedUserWatchlists!=null) return { status: success, data: cachedUserWatchlists };
    
    const watchListquery = query(
      collection(db, "watchLists"),
      where("ownerUid", "==", userData.details.uid)
    );
    let userwatchLists = await getDocs(watchListquery);

    // Create an array of promises for fetching each watchList's animeList subcollection
    const promises = [];
    const watchListMetadata = [];
    //getting animeList subcollection from all watchLists of this user using async call with promise all
    userwatchLists.forEach((item) => {
      // Get watchList metadata
      watchListMetadata.push(item.data());
      // Fetch the animeList subcollection for each watchList
      const collectionRef = collection(db, "watchLists", item.data().id, "animeList");
      promises.push(getDocs(collectionRef));
    });

    // Wait for all animeList queries to resolve
    const animeListResponses = await Promise.all(promises);

    // Combine the metadata and the animeList data
    const result = animeListResponses.map((animeList, index) => {
      return {
        ...watchListMetadata[index], // Include the metadata (name, ownerEmail, etc.)
        animeList: animeList.docs.map((doc) => doc.data()), // Include the animeList data
      };
    });

    setUserWatchlistsCached(result);
    return { status: success, data: result };
  } catch (error) {
    return { error, status: errorStr };
  }
}
