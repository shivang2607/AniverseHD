import { auth, db } from "../utils/firebaseinit";
import { deleteDoc, doc} from "firebase/firestore";
import { GetWatchListInfoById } from "./GetWatchListById";
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

export default async function DeleteWatchListById(watchListId) {
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
      else throw new Error("Special Watchlist:-Recent Cannot be deleted");
    }

  } catch (error) {
    return { response: error, status: Constant_Var_error };
  }
}
