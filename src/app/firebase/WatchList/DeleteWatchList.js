import { auth, db } from "../utils/firebaseinit";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { GetWatchListInfoById } from "./GetWatchListById";
import getUserAuth from "../utils/GetCurrentUserAuth";
import {
  NotAuthenticatedUser,
  NotAuthorisedUser,
  success,
  errorStr,
} from "@/utils/constants";
import { deleteUserWatchlistCached } from "../utils/SessionStorage";

export default async function DeleteWatchListById(watchListId) {
  try {
    // Check if user cookies exist
    const userData = getUserAuth();

    if (!userData) {
      throw new Error(NotAuthenticatedUser);
    }
    const watchListInfo = await GetWatchListInfoById(watchListId);
    if (watchListInfo.status !== success) throw watchListInfo.error;

    if (
      watchListInfo.data.ownerUid === userData.details.uid &&
      watchListInfo.data.isSpecialRecent === false
    ) {
      let response = await deleteDoc(doc(db, "watchLists", watchListId));
      deleteUserWatchlistCached(watchListId);
      return { status: success, response: response };
    } else {
      if (watchListInfo.data.ownerUid !== userData.details.uid)
        throw new Error(NotAuthorisedUser);
      else throw new Error("Special Watchlist:-Recent Cannot be deleted");
    }
  } catch (error) {
    return { error, status: errorStr };
  }
}
