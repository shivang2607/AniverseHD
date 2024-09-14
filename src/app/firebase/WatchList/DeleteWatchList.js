import { auth, db } from "../utils/firebaseinit";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { GetWatchListInfoById } from "./GetWatchListById";
import getUserAuth from "../utils/GetCurrentUserAuth";
import {
  Constant_Var_NotAuthenticatedUser,
  Constant_Var_NotAuthorisedUser,
  Constant_Var_success,
  Constant_Var_error,
  Constant_Var_watchListsFirestoreCollection,
} from "@/utils/constants";
import { deleteUserWatchlistCached } from "../utils/SessionStorage";

export default async function DeleteWatchListById(watchListId) {
  try {
    // Check if user cookies exist
    const userData = getUserAuth();

    if (!userData) {
      throw new Error(Constant_Var_NotAuthenticatedUser);
    }
    const watchListInfo = await GetWatchListInfoById(watchListId);
    if (watchListInfo.status !== Constant_Var_success) throw watchListInfo.error;

    if (
      watchListInfo.data.ownerUid === userData.details.uid &&
      watchListInfo.data.isSpecialRecent === false
    ) {
      let response = await deleteDoc(doc(db, Constant_Var_watchListsFirestoreCollection, watchListId));
      deleteUserWatchlistCached(watchListId);
      return { status: Constant_Var_success, response: response };
    } else {
      if (watchListInfo.data.ownerUid !== userData.details.uid)
        throw new Error(Constant_Var_NotAuthorisedUser);
      else throw new Error("Special Watchlist:-Recent Cannot be deleted");
    }
  } catch (error) {
    return { error, status: Constant_Var_error };
  }
}
