import { auth, db } from "../utils/firebaseinit";
import { deleteDoc, doc} from "firebase/firestore";
import getUserAuth from "../utils/GetUserAuth";
import {
  Constant_Var_errorMessage_notAuthenticatedUser,
  Constant_Var_errorMessage_notAuthorisedUser,
  Constant_Var_success,
  Constant_Var_error,
  Constant_Var_firebase_collectionName_watchLists,
  Constant_Var_errorMessage_missingParams,
} from "@/utils/constants";
import { deleteUserWatchlistCached } from "../utils/CacheStorage";
import GetWatchListInfoById from "./WatchListDocument/GetWatchListInfoById";


/**
 * Deletes a watchlist by its ID if the authenticated user is authorized to do so.
 *
 * @param {Object} params - Parameters for deleting the watchlist.
 * @param {string} params.watchListId - The ID of the watchlist to be deleted.
 * @returns {Promise<{status:string,response:any}>} - A promise that resolves to an object containing:
 *   - `status` {string}: A constant representing the status of the operation. Will be `Constant_Var_success` on success or `Constant_Var_error` on failure.
 *   - `response` {null|Object}: Null on successful deletion, or an error object on failure.
 *
 * @example
 * const result = await DeleteWatchListById({ watchListId: '12345' });
 * if (result.status === Constant_Var_success) {
 *   console.log('Watchlist deleted successfully!');
 * } else {
 *   console.error('Error:', result.response);
 * }
 */
export default async function DeleteWatchListById({watchListId}) {
  try {
    if(!watchListId) throw new Error(Constant_Var_errorMessage_missingParams);
    // Check if user cookies exist
    const userData = await getUserAuth();

    if (!userData) {
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
    }
    
    const watchListInfo = await GetWatchListInfoById(watchListId,false);
    if (watchListInfo.status !== Constant_Var_success) throw watchListInfo.response;

    if (
      watchListInfo.response.ownerUid === userData.details.uid &&
      watchListInfo.response.isSpecialStarter === false
    ) {
      let response = await deleteDoc(doc(db, Constant_Var_firebase_collectionName_watchLists, watchListId));
      deleteUserWatchlistCached({watchListId:watchListId});
      return { status: Constant_Var_success, response: response };

    } else {
      if (watchListInfo.response.ownerUid !== userData.details.uid)
        throw new Error(Constant_Var_errorMessage_notAuthorisedUser);
      else throw new Error("Special Starter Watchlist:- Cannot be deleted");
    }

  } catch (error) {
    return { response: error, status: Constant_Var_error };
  }
}
