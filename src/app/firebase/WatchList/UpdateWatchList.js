import { auth, db } from "../utils/firebaseinit";
import { doc, getDoc } from "firebase/firestore";
import getUserAuth from "../utils/GetCurrentUserAuth";
import { GetWatchListInfoById } from "./GetWatchListById";
import { errorStr, NotAuthenticatedUser, success } from "@/utils/constants";

export async function AddToWatchList(
  watchlistId,
  anime
) {
  try {
    // Check if user cookies exist
    if (!watchlistId || !anime) {
      throw new Error("Missing Params in AddtoWatchList Function");
    }
    const userData = getUserAuth();
    if (!userData) {
      throw new Error(NotAuthenticatedUser);
    }

    const watchlistInfo= await GetWatchListInfoById(watchlistId);
    if(watchlistInfo.status!==success) throw watchlistInfo.error;
    
    

   

  } catch (error) {
    return { error, status: errorStr };
  }
}

