import { auth, db } from "../utils/firebaseinit";
import {
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import getUserAuth from "../utils/GetCurrentUserAuth";
import { GetWatchListInfoById } from "./GetWatchListById";
import {
  Constant_Var_RecentWatchlistSize,
  errorStr,
  NotAuthenticatedUser,
  success,
} from "@/utils/constants";
import {
  addAnimeToUserWatchListCahed,
  removeAnimeFromUserWatchListCahed,
} from "../utils/SessionStorage";
import GetUserWatchLists from "./GetUserWatchLists";

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
      throw new Error("Missing Params in AddtoWatchList Function");
    }
    const userData = getUserAuth();
    if (!userData) {
      throw new Error(NotAuthenticatedUser);
    }

    const watchListInfo = await GetWatchListInfoById(watchListId);
    if (watchListInfo.status !== success) throw watchListInfo.error;

    if (watchListInfo.data.ownerUid === userData.details.uid) {
      if (watchListInfo.data.isSpecialRecent) {
        const resp = await HandleRecentExcessAnime(watchListId);
        if (resp.status != success) throw resp.error;
      }

      const docRef = doc(db, "watchLists", watchListId, "animeList", animeId);
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

      return { status: success };
    } else {
      if (watchListInfo.data.ownerUid !== userData.details.uid)
        throw new Error(NotAuthorisedUser);
    }
  } catch (error) {
    return { error, status: errorStr };
  }
}

async function HandleRecentExcessAnime(watchListId) {
  //  No need of try and Catch as there are no custom throw errors here
  try {
    const watchLists = await GetUserWatchLists();
    let recentAnimeList = null;
    watchLists.data.forEach((element) => {
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
      if (resp.status != success) throw resp.error;
    }

    return { status: success };
  } catch (error) {
    return { error, status: errorStr };
  }
}
export async function RemoveAnimeFromWatchList(watchListId, animeId) {
  try {
    // Check if user cookies exist
    if (!watchListId || !animeId) {
      throw new Error("Missing Params in RemoveAnimeFromWatchList Function");
    }
    const userData = getUserAuth();
    if (!userData) {
      throw new Error(NotAuthenticatedUser);
    }

    const watchListInfo = await GetWatchListInfoById(watchListId);
    if (watchListInfo.status !== success) throw watchListInfo.error;

    if (watchListInfo.data.ownerUid === userData.details.uid) {
      const docRef = doc(db, "watchLists", watchListId, "animeList", animeId);
      await deleteDoc(docRef);

      removeAnimeFromUserWatchListCahed(watchListId, animeId);
      return { status: success };
    } else {
      throw new Error(NotAuthorisedUser);
    }
  } catch (error) {
    return { error, status: errorStr };
  }
}

export async function UpdatePublicPrivateWatchList(watchListId, type) {
  try {
    // Check if user cookies exist
    if (!watchListId || !type) {
      throw new Error("Missing Params in AddtoWatchList Function");
    }
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
      const docRef = doc(db, "watchLists", watchListId);
      await updateDoc(docRef, {
        type: type,
      });
      return { status: success };
    } else {
      if (watchListInfo.data.ownerUid !== userData.details.uid)
        throw new Error(NotAuthorisedUser);
      else throw new Error("Special Watchlist:-Recent Cannot be deleted");
    }
  } catch (error) {
    return { error, status: errorStr };
  }
}
