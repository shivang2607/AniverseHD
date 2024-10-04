import { db } from "../utils/firebaseinit";
import { collection, getDocs, query, where } from "firebase/firestore";
import getUserAuth from "../utils/GetUserAuth";
import {
  Constant_Var_errorMessage_notAuthenticatedUser,
  Constant_Var_success,
  Constant_Var_error,
  Constant_Var_firebase_collectionName_watchLists,
  Constant_Var_errorMessage_noWatchListExists,
  Constant_Var_firebase_collectionName_animeList,
  Constant_Var_firebase_fieldName_ownerUid,
} from "@/utils/constants";
import {
  getUserWatchListsInfoCached,
  setUserWatchListsInfoCached,
  setWatchListInfoByIdInfoCached,
} from "../utils/CacheStorage";

export default async function GetLoggedUserWatchListsInfo() {
  try {
    // Check if user cookies exist
    const userData = await getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
    }

    const cachedUserWatchlists = getUserWatchListsInfoCached({
      userId:userData.details.uid
    });

    if (cachedUserWatchlists != null) 
      return { status: Constant_Var_success, response :cachedUserWatchlists };

    const watchListquery = query(
      collection(db, Constant_Var_firebase_collectionName_watchLists),
      where(
        Constant_Var_firebase_fieldName_ownerUid,
        "==",
        userData.details.uid
      )
    );

    let userwatchLists = await getDocs(watchListquery);

    // // Create an array of promises for fetching each watchList's animeList subcollection
    // const promises = [];
    // const watchListMetadata = [];
    // //getting animeList subcollection from all watchLists of this user using async call with promise all
    // userwatchLists.forEach((item) => {
    //   // Get watchList metadata
    //   watchListMetadata.push(item.data());
    //   // Fetch the animeList subcollection for each watchList
    //   const collectionRef = collection(db, Constant_Var_firebase_collectionName_watchLists, item.data().id, Constant_Var_firebase_collectionName_animeList);
    //   promises.push(getDocs(collectionRef));
    // });

    //  // handeling case if user Profile not created yet
    //    if(promises.length==0) throw new Error(Constant_Var_errorMessage_noWatchListExists);

    //   // Wait for all animeList queries to resolve
    //   const animeListResponses = await Promise.all(promises);

    //   // Combine the metadata and the animeList data
    //   const result = animeListResponses.map((animeList, index) => {
    //     return {
    //       ...watchListMetadata[index], // Include the metadata (name, ownerEmail, etc.)
    //       animeList: animeList.docs.map((doc) => doc.data()), // Include the animeList data
    //     };
    //   });
    
    const result = userwatchLists.docs.map((doc) => {
      setWatchListInfoByIdInfoCached({watchListInfo:doc.data(),watchListId: doc.id});
      return doc.data();
    });

    if (result.length > 0) 
      setUserWatchListsInfoCached({watchLists:result,userId: userData.details.uid});

    return { status: Constant_Var_success, response: result };
  } catch (error) {
    return { response: error, status: Constant_Var_error };
  }
}
