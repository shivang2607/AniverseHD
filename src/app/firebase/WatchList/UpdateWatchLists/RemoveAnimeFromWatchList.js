import { auth, db } from "../../utils/firebaseinit";
import { doc, Timestamp, writeBatch } from "firebase/firestore";
import getUserAuth from "../../utils/GetUserAuth";
import {
  Constant_Var_error,
  Constant_Var_errorMessage_notAuthenticatedUser,
  Constant_Var_success,
  Constant_Var_firebase_collectionName_watchLists,
  Constant_Var_errorMessage_missingParams,
  Constant_Var_firebase_collectionName_animeList,
  Constant_Var_errorMessage_notAuthorisedUser,
} from "@/utils/constants";
import { removeAnimeFromUserWatchListCached } from "../../utils/CacheStorage";
import GetWatchListInfoById from "../WatchListDocument/GetWatchListInfoById";

/**
 * Removes an anime from the specified user's watchlist.
 *
 * @param {Object} params - Parameters for removing an anime.
 * @param {string} params.watchListId - The ID of the watchlist from which to remove the anime.
 * @param {string} params.animeId - The ID of the anime to remove.
 * @param {boolean} [params.batchFromAddfunc=false] - Optional (IMP- Not to be used from frontend !!!). Indicates if the batch is coming from a parent function.
 * @param {Timestamp} [params.currTimestamp=null] - Optional (IMP- Not to be used from frontend !!!). Indicates if the timestamp is coming from a parent function.
 * @returns {Promise<{status:string,response:any}>} - Returns a promise that resolves to an object containing:
 *   - {string} status - Indicates the success or failure of the operation.
 *   - {Object|null} response - Contains error details if the operation fails; otherwise, null.
 * @throws {Error} - Throws an error if the user is not authenticated, not authorized, or if required parameters are missing.
 *
 * @example
 * const result = await RemoveAnimeFromWatchList({
 *   watchListId: 'exampleWatchListId',
 *   animeId: 'exampleAnimeId',
 * });
 * if (result.status === Constant_Var_success) {
 *   console.log('Anime removed successfully');
 * } else {
 *   console.error('Error:', result.response);
 * }
 */
export default async function RemoveAnimeFromWatchList({
  watchListId,
  animeId,
  batchFromAddfunc = false,
  currTimestamp=null
}) {
  try {
    
    // Validate the parameters
    validateParams({ watchListId, animeId, batchFromAddfunc });
  
    const userData = await getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
    }

    if(currTimestamp==null) currTimestamp=Timestamp.now();

    const watchListInfo = await GetWatchListInfoById({
      watchListId: watchListId,
    });
    if (watchListInfo.status !== Constant_Var_success)
      throw watchListInfo.response;

    // Ensure the user owns the watchlist
    if (watchListInfo.response.ownerUid === userData.details.uid) {
      let batch = batchFromAddfunc || writeBatch(db); // see if batch is comming from parent
      
      let animeExistsInWatchList= false;
      const animeListNew=[];
      for(let i=0; i<watchListInfo.response.animeList.length;++i){
        let obj=watchListInfo.response.animeList[i];
        if(obj.animeId!==animeId){
          animeListNew.push(obj);
        }else{
          animeExistsInWatchList=true;
        }
      }

      if(!animeExistsInWatchList)   return { status: Constant_Var_success, response: null };
     
      // Deleteing from animeList Field
      const docRef = doc(
        db,
        Constant_Var_firebase_collectionName_watchLists,
        watchListId
      );
      batch.update(docRef, {
        animeList: animeListNew,
        updatedAt:currTimestamp,
      });

      // Deleting from Subcollection
      const animeDocRef = doc(
        db,
        Constant_Var_firebase_collectionName_watchLists,
        watchListId,
        Constant_Var_firebase_collectionName_animeList,
        animeId
      );

      batch.delete(animeDocRef);

      // If batch came from parent, so it will be committed in parent only
      if (batchFromAddfunc !== false) {
        return { status: Constant_Var_success, response: null };
      }

      await batch.commit();
      removeAnimeFromUserWatchListCached({
        animeId: animeId,
        userId: userData.details.uid,
        watchListId: watchListId,
        updatedAt: currTimestamp,
      });

     


      return { status: Constant_Var_success, response: null };
    } else {
      throw new Error(Constant_Var_errorMessage_notAuthorisedUser);
    }
  } catch (error) {
    return { response: error, status: Constant_Var_error };
  }
}

function validateParams({ watchListId, animeId, batchFromAddfunc }) {
  if (!watchListId || typeof watchListId !== 'string') {
    throw new Error("Invalid or missing watchListId (should be a string)");
  }

  if (!animeId || typeof animeId !== 'string') {
    throw new Error("Invalid or missing animeId (should be a string)");
  }

  // if (batchFromAddfunc !== undefined && typeof batchFromAddfunc !== 'boolean') {
  //   throw new Error("Invalid batchFromAddfunc (should be a boolean if provided)");
  // }
}
