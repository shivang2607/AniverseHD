
import { auth, db } from "../../utils/firebaseinit";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import {
  Constant_Var_success,
  Constant_Var_error,
  Constant_Var_firebase_collectionName_watchLists,
  Constant_Var_errorMessage_missingParams,

} from "@/utils/constants";
import {
  getWatchListInfoByIdInfoCached,
  setWatchListInfoByIdInfoCached,
} from "../../utils/CacheStorage";


/**
 * Retrieves the information of a watchlist by its ID, optionally from cache.
 *
 * @param {Object} params - Parameters for the function.
 * @param {string} params.watchListId - The ID of the watchlist to retrieve.
 * @param {boolean} [params.getFromCache=true] - Indicates whether to retrieve the data from cache if available.
 * @returns {Promise<{status:string,response:any}>} - A promise that resolves to an object containing:
 *   - `status` {string}: A constant representing the status of the operation. Will be `Constant_Var_success` on success or `Constant_Var_error` on failure.
 *   - `response` {Object|null}: The watchlist object if successful; otherwise, null.
 *
 * @example
 * const result = await GetWatchListInfoById({ watchListId: 'someWatchListId' });
 * if (result.status === Constant_Var_success) {
 *   console.log('Watchlist info:', result.response);
 * } else {
 *   console.error('Error:', result.response);
 * }
 */
const GetWatchListInfoById = async ({watchListId, getFromCache = true}) => {
    try {

      if(!watchListId) throw new Error(Constant_Var_errorMessage_missingParams);

      // Check if user cookies exist
      const cachedWatchListInfo = getWatchListInfoByIdInfoCached({watchListId:watchListId});
  
      if (cachedWatchListInfo != null && getFromCache)
        return { status: Constant_Var_success, response: cachedWatchListInfo };
  
      const docRef = doc(
        db,
        Constant_Var_firebase_collectionName_watchLists,
        watchListId
      );
      const dataWatchlist = await getDoc(docRef);
  
      if (dataWatchlist.exists()) {
        setWatchListInfoByIdInfoCached({watchListInfo:dataWatchlist.data(), watchListId:watchListId});
        return { status: Constant_Var_success, response: dataWatchlist.data() };
      } else {
        throw new Error(`Watchlist with id=${watchListId} does not exists`);
      }
    } catch (error) {
      return { response: error, status: Constant_Var_error };
    }
  };
  
  export default  GetWatchListInfoById;