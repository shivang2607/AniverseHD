import { auth, db } from "../utils/firebaseinit";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import getUserAuth from "../utils/GetCurrentUserAuth";
import {
  Constant_Var_errorMessage_notAuthenticatedUser,
  Constant_Var_success,
  Constant_Var_error,
  Constant_Var_firebase_collectionName_watchLists,
  Constant_Var_firebase_fieldValue_public,
  Constant_Var_errorMessage_missingParams,
  Constant_Var_firebase_collectionName_animeList,
  Constant_Var_errorMessage_privateWatchList,
} from "@/utils/constants";

export default async function GetWatchListById(watchListId) {
  try {
    if(!watchListId) throw new Error(Constant_Var_errorMessage_missingParams);
    
    // Check if user cookies exist
    const userData = await getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
    }

    let watchListInfo = await GetWatchListInfoById(watchListId, userData);

    if (watchListInfo.status !== Constant_Var_success) throw watchListInfo.response;

    //Checking if the watchList is public or current user is the owner
    if (
      watchListInfo.response.ownerUid === userData.details.uid ||
      watchListInfo.response.type === Constant_Var_firebase_fieldValue_public
    ) {
      const collectionRef = collection(
        db,
        Constant_Var_firebase_collectionName_watchLists,
        watchListId,
        Constant_Var_firebase_collectionName_animeList
      );
      const animeList = await getDocs(collectionRef);
      let animeListArr = [];

      animeList.forEach((anime) => {
        animeListArr.push(anime.data());
      });

      let result = { ...watchListInfo.response, animeList: animeListArr };
      return { status: Constant_Var_success, response: result };
    } else {
      throw new Error(Constant_Var_errorMessage_privateWatchList);
    }
  } catch (error) {
    return { response: error, status: Constant_Var_error };
  }
}

export const GetWatchListInfoById = async (watchListId,userData1=null) => {
  try {
    // Check if user cookies exist
    const userData = userData1? userData1 :await getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
    }
    const docRef = doc(
      db,
      Constant_Var_firebase_collectionName_watchLists,
      watchListId
    );
    const dataWatchlist = await getDoc(docRef);

    if (dataWatchlist.exists()) {
      return { status: Constant_Var_success, response: dataWatchlist.data() };
    } else {
      throw new Error(`Watchlist with id=${watchListId} does not exists`);
    }
  } catch (error) {
    return { response: error, status: Constant_Var_error };
  }
};
