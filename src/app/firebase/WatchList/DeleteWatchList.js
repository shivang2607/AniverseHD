import { auth, db } from "../utils/firebaseinit";
import { doc, getDoc } from "firebase/firestore";
import  { GetWatchListInfoById } from "./GetWatchListById";
import getUserAuth from "../utils/GetCurrentUserAuth";
import { NotAuthenticatedUser, NotAuthorisedUser, success, errorStr } from "@/utils/constants";

export default async function DeleteWatchList(watchlistId) {
  try {
    // Check if user cookies exist
    const userData = getUserAuth();

    if (!userData) {
      throw new Error(NotAuthenticatedUser);
    }

    const watchlistInfo= await GetWatchListInfoById(watchlistId);
    if(watchlistInfo.status!==success) throw watchlistInfo.error;


    if(watchlistInfo.data.ownerUid===userData.details.uid && watchlistInfo.data.isSpecialRecent===false){
      await deleteDoc(doc(db, "watchlists", watchlistId));
    }else{
      if(watchlistInfo.data.ownerUid!==userData.details.uid) throw new Error(NotAuthorisedUser);
      else throw new Error("Special Watchlist Recent Cannot be deleted");
    }

    return { status: success };
  } catch (error) {
    return { error, status: errorStr };
  }
}
