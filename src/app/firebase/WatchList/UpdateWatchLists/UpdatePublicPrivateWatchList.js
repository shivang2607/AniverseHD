
import { auth, db } from "../../utils/firebaseinit";
import {
  doc,
  updateDoc,
} from "firebase/firestore";
import getUserAuth from "../../utils/GetUserAuth";
import {
  Constant_Var_error,
  Constant_Var_errorMessage_notAuthenticatedUser,
  Constant_Var_success,
  Constant_Var_firebase_collectionName_watchLists,
  Constant_Var_starterWatchLists_recent,
} from "@/utils/constants";
import {
  updatePublicPrivateCached,
} from "../../utils/CacheStorage";
import GetWatchListInfoById from "../WatchListDocument/GetWatchListInfoById";


export default async function UpdatePublicPrivateWatchList({ watchListId, type }) {
    try {
      // Check if user cookies exist
      if (!watchListId || !type) {
        throw new Error("Missing Params in AddtoWatchList Function");
      }
      const userData = await getUserAuth();
      if (!userData) {
        throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
      }
  
      const watchListInfo = await GetWatchListInfoById({
        watchListId: watchListId,
      });
      if (watchListInfo.status !== Constant_Var_success)
        throw watchListInfo.response;
  
      if (
        watchListInfo.response.ownerUid === userData.details.uid &&
        watchListInfo.response.watchListName !==
          Constant_Var_starterWatchLists_recent
      ) {
        const docRef = doc(
          db,
          Constant_Var_firebase_collectionName_watchLists,
          watchListId
        );
        await updateDoc(docRef, {
          type: type,
        });
  
        updatePublicPrivateCached({ watchListId: watchListId, type: type });
  
        return { status: Constant_Var_success, response: null };
      } else {
        if (watchListInfo.response.ownerUid !== userData.details.uid)
          throw new Error(
            Constant_Var_Constant_Var_Constant_Var_Constant_Var_errorMessage_notAuthorisedUser
          );
        else throw new Error("Special Watchlist:-Recent Cannot be public");
      }
    } catch (error) {
      return { response: error, status: Constant_Var_error };
    }
  }
  