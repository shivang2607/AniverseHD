
import { auth, db } from "../../utils/firebaseinit";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import {
  Constant_Var_success,
  Constant_Var_error,
  Constant_Var_firebase_collectionName_watchLists,

} from "@/utils/constants";
import {
  getWatchListInfoByIdInfoCached,
  setWatchListInfoByIdInfoCached,
} from "../../utils/CacheStorage";


const GetWatchListInfoById = async ({watchListId, getFromCache = true}) => {
    try {
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