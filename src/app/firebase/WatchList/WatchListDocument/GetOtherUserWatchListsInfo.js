import { db } from "../../utils/firebaseinit";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import {Constant_Var_success, Constant_Var_error, Constant_Var_firebase_collectionName_watchLists, Constant_Var_firebase_fieldName_ownerUid, Constant_Var_firebase_fieldValue_public, Constant_Var_firebase_fieldName_type, Constant_Var_errorMessage_missingParams, Constant_Var_firebase_collectionName_animeList } from "@/utils/constants";
import { getUserWatchListsInfoCached, setUserWatchListsInfoCached, setWatchListInfoByIdInfoCached } from "../../utils/CacheStorage";

/**
 * Retrieves the public watchlists of a specified user.
 *
 * @param {Object} params - Parameters for the function.
 * @param {string} params.userId - The ID of the user whose watchlists are to be retrieved.
 * @returns {Promise<{status:string,response:any}>} - A promise that resolves to an object containing:
 *   - `status` {string}: A constant representing the status of the operation. Will be `Constant_Var_success` on success or `Constant_Var_error` on failure.
 *   - `response` {Array|null}: An array of watchlist objects if successful; otherwise, null.
 * 
 * @example
 * const result = await GetOtherUserWatchListsInfo({ userId: 'someUserId' });
 * if (result.status === Constant_Var_success) {
 *   console.log('Other user\'s watchlists:', result.response);
 * } else {
 *   console.error('Error:', result.response);
 * }
 */
export default async function GetOtherUserWatchListsInfo({userId}) {
  try {

    validateParams({ userId:userId });
    
    const cachedUserWatchlists = getUserWatchListsInfoCached({
      userId:userId
    });

    if (cachedUserWatchlists != null) 
      return { status: Constant_Var_success, response :cachedUserWatchlists };
    
    const watchListquery = query(
      collection(db, Constant_Var_firebase_collectionName_watchLists),
      where(Constant_Var_firebase_fieldName_ownerUid, "==", userId), 
      where(Constant_Var_firebase_fieldName_type,"==",Constant_Var_firebase_fieldValue_public)
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

    // // Wait for all animeList queries to resolve
    // const animeListResponses = await Promise.all(promises);

    // // Combine the metadata and the animeList data
    // const result = animeListResponses.map((animeList, index) => {
    //   return {
    //     ...watchListMetadata[index], // Include the metadata (name, ownerEmail, etc.)
    //     animeList: animeList.docs.map((doc) => doc.data()), // Include the animeList data
    //   };
    // });
      
    const result = userwatchLists.docs.map((doc) => {
      setWatchListInfoByIdInfoCached({watchListInfo:doc.data(),watchListId: doc.id});
      return doc.data();
    });

    if (result.length > 0) 
      setUserWatchListsInfoCached({watchLists:result,userId: userId});

    return { status: Constant_Var_success, response: result };
  } catch (error) {
    return { response: error, status: Constant_Var_error };
  }
}

function validateParams({ userId }) {
  if (!userId  || typeof userId  !== 'string') {
    throw new Error("Invalid or missing userId  (should be a string)");
  }
}