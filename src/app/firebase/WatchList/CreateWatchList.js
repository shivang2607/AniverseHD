import { auth, db } from "@/app/firebase/utils/firebaseinit";
import {
  doc,
  collection,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import getUserAuth from "../utils/GetUserAuth";
import { Constant_Var_error, Constant_Var_errorMessage_missingParams, Constant_Var_errorMessage_notAuthenticatedUser, Constant_Var_success, Constant_Var_firebase_collectionName_watchLists } from "@/utils/constants";
import { addUserWatchlistCached } from "../utils/CacheStorage";
import WatchListModel from "../DocumentModels/WatchListModel";


/**
 * Creates a new watchlist for the authenticated user.
 *
 * @param {Object} params - Parameters for creating the watchlist.
 * @param {string} params.watchListName - The name of the watchlist to be created.
 * @param {string} params.type - The type of the watchlist (e.g., public or private).
 * @returns {Promise<Object>} - A promise that resolves to an object containing:
 *   - `status` {string}: A constant representing the status of the operation. Will be `Constant_Var_success` on success or `Constant_Var_error` on failure.
 *   - `response` {null}: Null on success; contains an error message on failure.
 *
 * @example
 * const result = await CreateWatchList({ watchListName: 'My Favorites', type: 'public' });
 * if (result.status === Constant_Var_success) {
 *   console.log('Watchlist created successfully!');
 * } else {
 *   console.error('Error:', result.response);
 * }
 */
export default async function CreateWatchList({watchListName, type}) {
  try {
    // Check if user cookies exist
    if (!watchListName || !type) {
      throw new Error(Constant_Var_errorMessage_missingParams);
    }

    const userData = await getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
    }

    const docRef = doc(collection(db, Constant_Var_firebase_collectionName_watchLists));
    const watchListInfo = WatchListModel({
      ownerUid: userData.details.uid,
      watchListName: watchListName,
      type: type,
      isSpecialStarter: false,
      id: docRef.id,
    });

    await setDoc(docRef, watchListInfo);

    addUserWatchlistCached({watchListInfo:watchListInfo,watchListId:docRef.id,userId:userData.details.uid});
    
    return { status: Constant_Var_success , response:null};
  } catch (error) {
    return { response: error, status: Constant_Var_error };
  }
}
