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
import { Constant_Var_NotAuthenticatedUser, Constant_Var_success, Constant_Var_error, Constant_Var_watchListsFirestoreCollection } from "@/utils/constants";
import { getUserWatchlistsCached, setUserWatchlistsCached } from "../utils/SessionStorage";

export default async function GetUserWatchLists() {
  try {
    // Check if user cookies exist
    const userData = getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_NotAuthenticatedUser);
    }

    const cachedUserWatchlists=getUserWatchlistsCached();
    if(cachedUserWatchlists!=null) return { status: Constant_Var_success, data: cachedUserWatchlists };
    
    const watchListquery = query(
      collection(db, Constant_Var_watchListsFirestoreCollection),
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
      const collectionRef = collection(db, Constant_Var_watchListsFirestoreCollection, item.data().id, "animeList");
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
    return { status: Constant_Var_success, data: result };
  } catch (error) {
    return { error, status: Constant_Var_error };
  }
}
