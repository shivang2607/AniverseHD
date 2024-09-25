import { auth, db } from "../utils/firebaseinit";
import {
  deleteDoc,
  doc,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import getUserAuth from "../utils/GetCurrentUserAuth";
import { GetWatchListInfoById } from "./GetWatchListById";
import {
  Constant_Var_RecentWatchlistSize,
  Constant_Var_error,
  Constant_Var_errorMessage_notAuthenticatedUser,
  Constant_Var_success,
  Constant_Var_firebase_collectionName_watchLists,
  Constant_Var_errorMessage_missingParams,
  Constant_Var_firebase_collectionName_animeList,
} from "@/utils/constants";
import {
  addAnimeToUserWatchListCahed,
  removeAnimeFromUserWatchListCahed,
} from "../utils/CacheStorage";
import GetUserWatchLists from "./GetLoggedUserWatchListsInfo";

export async function AddAnimeToWatchList(
  watchListId,
  animeId,
  animeName,
  animePhoto,
  animeGenre,
  animeType,
  animeScore,
  animeAgeRating,
  animeStartYear,
  animeLength
) {
  try {
    // Check if user cookies exist
    if (
      !watchListId ||
      !animeId ||
      !animeAgeRating ||
      !animeGenre ||
      !animeLength ||
      !animeName ||
      !animePhoto ||
      !animeScore ||
      !animeStartYear ||
      !animeType
    ) {
      throw new Error(Constant_Var_errorMessage_missingParams);
    }
    const userData = await getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
    }

    const watchListInfo = await GetWatchListInfoById(watchListId);
    if (watchListInfo.status !== Constant_Var_success)
      throw watchListInfo.response;

    if (watchListInfo.response.ownerUid === userData.details.uid) {
      if (watchListInfo.response.isSpecialRecent) {
        const resp = await HandleRecentExcessAnime(watchListId);
        if (resp.status != Constant_Var_success) throw resp.response;
      }

      const docRef = doc(
        db,
        Constant_Var_firebase_collectionName_watchLists,
        watchListId,
        Constant_Var_firebase_collectionName_animeList,
        animeId
      );

      const animeObject = {
        animeId: animeId,
        animeName: animeName,
        animePhoto: animePhoto,
        animeGenre: animeGenre,
        animeType: animeType,
        animeScore: animeScore,
        animeAgeRating: animeAgeRating,
        animeStartYear: animeStartYear,
        animeLength: animeLength,
        timestamp: Timestamp.now(),
      };
      
      await setDoc(docRef, animeObject);

      addAnimeToUserWatchListCahed(watchListId, animeObject);

      return { status: Constant_Var_success, response: null };
    } else {
      if (watchListInfo.response.ownerUid !== userData.details.uid)
        throw new Error(
          Constant_Var_Constant_Var_Constant_Var_Constant_Var_errorMessage_notAuthorisedUser
        );
    }
  } catch (error) {
    return { response: error, status: Constant_Var_error };
  }
}

async function HandleRecentExcessAnime(watchListId) {
  //  No need of try and Catch as there are no custom throw errors here
  try {
    if (!watchListId) throw new Error(Constant_Var_errorMessage_missingParams);

    const watchLists = await GetUserWatchLists();
    let recentAnimeList = null;
    watchLists.response.forEach((element) => {
      if (element.id === watchListId) recentAnimeList = element.animeList;
    });

    if (recentAnimeList.length >= Constant_Var_RecentWatchlistSize) {
      const earliestAnime = recentAnimeList.reduce((earliest, current) => {
        return current.timestamp < earliest.timestamp ? current : earliest;
      });
      const resp = await RemoveAnimeFromWatchList(
        watchListId,
        earliestAnime.animeId
      );
      if (resp.status != Constant_Var_success) throw resp.response;
    }

    return { status: Constant_Var_success, response: null };
  } catch (error) {
    return { response: error, status: Constant_Var_error };
  }
}

export async function RemoveAnimeFromWatchList(watchListId, animeId) {
  try {
    // Check if user cookies exist
    if (!watchListId || !animeId) {
      throw new Error(Constant_Var_errorMessage_missingParams);
    }
    const userData = await getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
    }

    const watchListInfo = await GetWatchListInfoById(watchListId);
    if (watchListInfo.status !== Constant_Var_success)
      throw watchListInfo.response;

    if (watchListInfo.response.ownerUid === userData.details.uid) {
      const docRef = doc(
        db,
        Constant_Var_firebase_collectionName_watchLists,
        watchListId,
        Constant_Var_firebase_collectionName_animeList,
        animeId
      );
      await deleteDoc(docRef);

      removeAnimeFromUserWatchListCahed(watchListId, animeId);
      return { status: Constant_Var_success, response: null };
    } else {
      throw new Error(
        Constant_Var_Constant_Var_Constant_Var_Constant_Var_errorMessage_notAuthorisedUser
      );
    }
  } catch (error) {
    return { response: error, status: Constant_Var_error };
  }
}

export async function UpdatePublicPrivateWatchList(watchListId, type) {
  try {
    // Check if user cookies exist
    if (!watchListId || !type) {
      throw new Error("Missing Params in AddtoWatchList Function");
    }
    const userData = await getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
    }

    const watchListInfo = await GetWatchListInfoById(watchListId);
    if (watchListInfo.status !== Constant_Var_success)
      throw watchListInfo.response;

    if (
      watchListInfo.response.ownerUid === userData.details.uid &&
      watchListInfo.response.isSpecialRecent === false
    ) {
      const docRef = doc(
        db,
        Constant_Var_firebase_collectionName_watchLists,
        watchListId
      );
      await updateDoc(docRef, {
        type: type,
      });
      return { status: Constant_Var_success, response: null };
    } else {
      if (watchListInfo.response.ownerUid !== userData.details.uid)
        throw new Error(
          Constant_Var_Constant_Var_Constant_Var_Constant_Var_errorMessage_notAuthorisedUser
        );
      else throw new Error("Special Watchlist:-Recent Cannot be deleted");
    }
  } catch (error) {
    return { response: error, status: Constant_Var_error };
  }
}
