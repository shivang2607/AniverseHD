import { auth, db } from "../../utils/firebaseinit";
import {
  arrayUnion,
  doc,
  writeBatch,
} from "firebase/firestore";
import getUserAuth from "../../utils/GetUserAuth";
import {
  Constant_Var_RecentWatchlistSize,
  Constant_Var_error,
  Constant_Var_errorMessage_notAuthenticatedUser,
  Constant_Var_success,
  Constant_Var_firebase_collectionName_watchLists,
  Constant_Var_errorMessage_missingParams,
  Constant_Var_firebase_collectionName_animeList,
  Constant_Var_errorMessage_notAuthorisedUser,
  Constant_Var_starterWatchLists_recent,
  Constant_Var_starterWatchLists_favourite,
} from "@/utils/constants";
import {
  addAnimeToUserWatchListCached,
  removeAnimeFromUserWatchListCached,
} from "../../utils/CacheStorage";
import GetLoggedUserWatchListsInfo from "../WatchListDocument/GetLoggedUserWatchListsInfo";
import AnimeModel from "../../DocumentModels/AnimeModel";
import  RemoveAnimeFromWatchList  from "./RemoveAnimeFromWatchList";
import GetWatchListInfoById from "../WatchListDocument/GetWatchListInfoById";


/**
 * Adds an anime to a specified watchlist, handling special starter watchlists such as recent or favourite,
 * ensuring the anime is not duplicated in multiple watchlists, and managing Firestore updates and cache synchronization.
 *
 * @param {Object} params - The input parameters for adding an anime.
 * @param {string} params.watchListId - The ID of the watchlist to which the anime will be added.
 * @param {string} params.animeId - The unique ID of the anime to be added.
 * @param {string} params.animeName - The name of the anime.
 * @param {Object} params.animePhoto - The photo URL or image path of the anime.
 * @param {Array} params.animeGenre - The genre of the anime.
 * @param {string} params.animeType - The type or category of the anime.
 * @param {number} params.animeScore - The score of the anime.
 * @param {string} params.animeAgeRating - The age rating of the anime.
 * @param {number} params.animeStartYear - The starting year of the anime.
 * @param {number} params.animeLength - The number of episodes or runtime of the anime.
 *
 * @returns {Promise<{status:string,response:any}>} - Returns a promise that resolves to an object containing:
 *   - {string} status - Indicates the success or failure of the operation, will be Constant_Var_success on success or Constant_Var_error on failure.
 *   - {null|string|Error} response - Will be null on success, or an error message if the operation fails.
 *
 * @throws {Error} - Throws an error if the user is not authenticated, not authorized, or if required parameters are missing.
 *
 * @example
 * const result = await AddAnimeToWatchList({
 *   watchListId: 'exampleWatchListId',
 *   animeId: 'exampleAnimeId',
 *   animeName: 'Attack on Titan',
 *   animePhoto: 'url_to_anime_photo',
 *   animeGenre: ['Action'],
 *   animeType: 'TV',
 *   animeScore: 9.2,
 *   animeAgeRating: 'PG-13',
 *   animeStartYear: 2013,
 *   animeLength: 25,
 * });
 * if (result.status === Constant_Var_success) {
 *   console.log('Anime added successfully');
 * } else {
 *   console.error('Error:', result.response);
 * }
 */
export default async function AddAnimeToWatchList({
  watchListId,
  animeId,
  animeName,
  animePhoto,
  animeGenre,
  animeType,
  animeScore,
  animeAgeRating,
  animeStartYear,
  animeLength,
}) {
  try {
    // Validate the parameters
    validateParams({
      watchListId,
      animeId,
      animeName,
      animePhoto,
      animeGenre,
      animeType,
      animeScore,
      animeAgeRating,
      animeStartYear,
      animeLength,
    });

    const userData = await getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
    }

    let watchListInfo = await GetWatchListInfoById({
      watchListId: watchListId,
    });

    if (watchListInfo.status !== Constant_Var_success)
      throw watchListInfo.response;

    const animeObject = AnimeModel({
      animeId: animeId,
      animeName: animeName,
      animePhoto: animePhoto,
      animeGenre: animeGenre,
      animeType: animeType,
      animeScore: animeScore,
      animeAgeRating: animeAgeRating,
      animeStartYear: animeStartYear,
      animeLength: animeLength,
    });


    if (watchListInfo.response.ownerUid === userData.details.uid) {
      if (
        watchListInfo.response.isSpecialStarter &&
        watchListInfo.response.watchListName !==
          Constant_Var_starterWatchLists_favourite
      ) {
        if (
          watchListInfo.response.watchListName ===
          Constant_Var_starterWatchLists_recent
        ) {
          // for special recent watch list, it have a fixed size

          const addRecentResp = await addToStarterRecentWatchList({
            animeId: animeId,
            animeObject: animeObject,
            userId: userData.details.uid,
            watchListId: watchListId,
            watchListInfo: watchListInfo.response,
          });

          if (addRecentResp.status === Constant_Var_error)
            throw addRecentResp.response;
        } else {
          // for starter special Anime, they can't exists in more than one special watchLists except Recent WatchList
          const addAnimeResp = await addStarterNonRecentAnime({
            animeId: animeId,
            animeObject: animeObject,
            userId: userData.details.uid,
            watchListId: watchListId,
            watchListInfo: watchListInfo.response,
          });

          if (addAnimeResp.status === Constant_Var_error)
            throw addAnimeResp.response;
        }
      } else {
        //for custom watchLists, a anime can exists in multiple custom watchLists
        const addAnimeResp = await addAnime({
          animeObject: animeObject,
          watchListInfo: watchListInfo.response,
          watchListId: watchListId,
          animeId: animeId,
        });

        if (addAnimeResp.status === Constant_Var_error)
          throw addAnimeResp.response;
      }
    } else {
      throw new Error(Constant_Var_errorMessage_notAuthorisedUser);
    }

    addAnimeToUserWatchListCached({
      anime: animeObject,
      userId: userData.details.uid,
      watchListId: watchListId,
    });
    return { status: Constant_Var_success, response: null };
  } catch (error) {
    return { response: error, status: Constant_Var_error };
  }
}

function validateParams({
  watchListId,
  animeId,
  animeName,
  animePhoto,
  animeGenre,
  animeType,
  animeScore,
  animeAgeRating,
  animeStartYear,
  animeLength,
}) {
  if (!watchListId || typeof watchListId !== 'string') {
    throw new Error("Invalid or missing watchListId (should be a string)");
  }

  if (!animeId || typeof animeId !== 'string') {
    throw new Error("Invalid or missing animeId (should be a string)");
  }

  if (!animeName || typeof animeName !== 'string') {
    throw new Error("Invalid or missing animeName (should be a string)");
  }

  if (!animePhoto || typeof animePhoto !== 'object') {
    throw new Error("Invalid or missing animePhoto (should be a object)");
  }

  if (!animeGenre || !Array.isArray(animeGenre)) {
    throw new Error("Invalid or missing animeGenre (should be an array)");
  }

  if (!animeType || typeof animeType !== 'string') {
    throw new Error("Invalid or missing animeType (should be a string)");
  }

  if (typeof animeScore !== 'number') {
    throw new Error("Invalid or missing animeScore (should be a number)");
  }

  if (!animeAgeRating || typeof animeAgeRating !== 'string') {
    throw new Error("Invalid or missing animeAgeRating (should be a string)");
  }

  if (typeof animeStartYear !== 'number') {
    throw new Error("Invalid or missing animeStartYear (should be a number)");
  }

  if (typeof animeLength !== 'number') {
    throw new Error("Invalid or missing animeLength (should be a number)");
  }
}

async function addAnime({
  animeObject,
  watchListInfo,
  watchListId,
  animeId,
  withBatch = false,
}) {
  try {
    const batch = withBatch || writeBatch(db);
    const docRef = doc(
      db,
      Constant_Var_firebase_collectionName_watchLists,
      watchListId,
      Constant_Var_firebase_collectionName_animeList,
      animeId
    );

    batch.set(docRef, animeObject);

    const animeObject2 = watchListInfo.animeList.find(
      (obj) => obj.animeId === animeId
    );

    if (animeObject2 == undefined) {
      const docRef = doc(
        db,
        Constant_Var_firebase_collectionName_watchLists,
        watchListId
      );
      batch.update(docRef, {
        animeList: arrayUnion({
          animeId: animeId,
          addedAt: animeObject.addedAt,
        }),
      });
    } else {
      throw new Error("Anime already Exists in WatchList");
    }

    if (withBatch) return { status: Constant_Var_success, response: null };

    await batch.commit();

    return { status: Constant_Var_success, response: null };
  } catch (error) {
    return { response: error, status: Constant_Var_error };
  }
}

async function addStarterNonRecentAnime({
  animeObject,
  animeId,
  watchListInfo,
  watchListId,
  userId,
}) {
  try {
    const userWatchLists = (await GetLoggedUserWatchListsInfo()) || [];

    if (userWatchLists.status === Constant_Var_error)
      throw userWatchLists.response;

    const removeFrom = [];

    //Checking if any other Special watchList have this anime
    userWatchLists.response.forEach((item) => {
      if (
        !item.isSpecialStarter ||
        item.watchListName === Constant_Var_starterWatchLists_recent ||
        item.watchListName === Constant_Var_starterWatchLists_favourite
      )
        return;

      const resp = item.animeList.find((obj) => obj.animeId === animeId);

      if (resp != undefined) {
        removeFrom.push(item.id);
      }
    });

    const batch = writeBatch(db);


    // Create an array to hold the promises
    const promises = [];

    // Remove from the special watchLists if anime exists there
    for (const item of removeFrom) {
      promises.push(
        RemoveAnimeFromWatchList({
          watchListId: item,
          animeId: animeId,
          batchFromAddfunc: batch,
        })
      );
    }

    // Add anime to the required watchList
    promises.push(
      addAnime({
        animeId: animeId,
        animeObject: animeObject,
        watchListId: watchListId,
        watchListInfo: watchListInfo,
        withBatch: batch,
      })
    );

    // Wait for all the promises to resolve concurrently
    const results = await Promise.all(promises);

    // Check the results of all promises
    for (const result of results) {
      if (result.status === Constant_Var_error) throw result.response;
    }

    await batch.commit();

    removeFrom.forEach((item) => {
      removeAnimeFromUserWatchListCached({
        animeId: animeId,
        userId: userId,
        watchListId: item,
      });
    });

    return { status: Constant_Var_success, response: null };
  } catch (error) {
    return { response: error, status: Constant_Var_error };
  }
}


async function addToStarterRecentWatchList({
  animeObject,
  animeId,
  watchListInfo,
  watchListId,
  userId,
}) {

  try {
    if (!watchListId) throw new Error(Constant_Var_errorMessage_missingParams);

    const batch = writeBatch(db);

  
    if (watchListInfo.animeList.length >= Constant_Var_RecentWatchlistSize) {

      const earliestAnimeObj = watchListInfo.animeList.reduce((prev, curr) => {
        // Compare based on seconds first, then nanoseconds if seconds are equal
        if (
          curr.addedAt.seconds < prev.addedAt.seconds ||
          (curr.addedAt.seconds === prev.addedAt.seconds &&
            curr.addedAt.nanoseconds < prev.addedAt.nanoseconds)
        ) {
          return curr;
        }
        return prev;
      });

      const promises = [
        RemoveAnimeFromWatchList({
          watchListId: watchListId,
          animeId: earliestAnimeObj.animeId,
          batchFromAddfunc: batch,
        }),
        addAnime({
          animeObject: animeObject,
          animeId: animeId,
          watchListId: watchListId,
          watchListInfo: watchListInfo,
          withBatch: batch,
        }),
      ];

      const [respRemove, respAdd] = await Promise.all(promises);

      // Check if both were successful
      if (respRemove.status !== Constant_Var_success) throw respRemove.response;

      if (respAdd.status !== Constant_Var_success) throw respAdd.response;

      await batch.commit();

      removeAnimeFromUserWatchListCached({
        animeId: earliestAnimeObj.animeId,
        userId: userId,
        watchListId: watchListId,
      });
    } else {
      const respAdd = await addAnime({
        animeObject: animeObject,
        animeId: animeId,
        watchListId: watchListId,
        watchListInfo: watchListInfo,
        withBatch: batch,
      });

      if (respAdd.status !== Constant_Var_success) throw respAdd.response;

      await batch.commit();
    }

    return { status: Constant_Var_success, response: null };
  } catch (error) {
    return { response: error, status: Constant_Var_error };
  }
}


