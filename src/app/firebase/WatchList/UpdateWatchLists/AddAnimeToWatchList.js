import { auth, db } from "../../utils/firebaseinit";
import { arrayUnion, doc, Timestamp, writeBatch } from "firebase/firestore";
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
import RemoveAnimeFromWatchList from "./RemoveAnimeFromWatchList";
import GetWatchListInfoById from "../WatchListDocument/GetWatchListInfoById";

/**
 * Adds an anime to a specified watchlist, handling special starter watchlists such as recent or favourite,
 * ensuring the anime is not duplicated in multiple watchlists, and managing Firestore updates and cache synchronization.
 *
 * @param {Object} params - The input parameters for adding an anime.
 * @param {string} params.watchListId - The ID of the watchlist to which the anime will be added.
 * @param {string} params.animeId - The unique ID of the anime to be added.
 * @param {string} params.animeName - The name of the anime.
 * @param {Object|null} params.animePhoto - The photo URL or image path of the anime (can be null).
 * @param {Array|null} params.animeGenre - The genre of the anime (can be null).
 * @param {string|null} params.animeType - The type or category of the anime (can be null).
 * @param {number|null} params.animeScore - The score of the anime (can be null).
 * @param {string|null} params.animeAgeRating - The age rating of the anime (can be null).
 * @param {number|null} params.animeStartYear - The starting year of the anime (can be null).
 * @param {number|null} params.animeLength - The number of episodes or runtime of the anime (can be null).
 * @param {string|null} params.url - Url of episode for recent watchlist 
 * @param {object|null} params.episodeTimestamp - Timestamp of episode for recent watchlist
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
 *   animePhoto: {webp:"rias-gremory.webp",jpg:"akeno-himejima.jpg"},
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
  animePhoto = null,
  animeGenre = null,
  animeType = null,
  animeScore = null,
  animeAgeRating = null,
  animeStartYear = null,
  animeLength = null,
  url = null,
  episodeTimestamp=null,
  duration=null
}) {
  try {
    console.log(watchListId,
      animeId,
      animeName,
      animePhoto ,
      animeGenre ,
      animeType ,
      animeScore ,
      animeAgeRating ,
      animeStartYear ,
      animeLength ,
      url ,
      episodeTimestamp,)
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
      url,
      episodeTimestamp,
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
      url: url,
      episodeTimestamp:episodeTimestamp,
      duration:duration,
    });
    const currTimestamp = animeObject.addedAt;

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

          if (url === null ||episodeTimestamp==null || duration==null)
            throw new Error(
              "Url and episodeTimestamp cannot be null when watchlist is starter recent"
            );

          const doesExists = watchListInfo.response.animeList?.find(
            (obj) => obj.animeId === animeId
          );

          if (doesExists !== undefined) {
            //if already exists in recent, then update
            const respUpdate = await updateAnimeInWatchList({
              animeObject: animeObject,
              animeId: animeId,
              watchListId: watchListId,
              watchListInfo: watchListInfo.response,
              currTimestamp: currTimestamp,
            });

            if (respUpdate.status !== Constant_Var_success)
              throw respUpdate.response;

            removeAnimeFromUserWatchListCached({
              animeId: animeId,
              userId: userData.details.uid,
              watchListId: watchListId,
              updatedAt: currTimestamp,
            });
          } else {
            //if does not exists in recent, then add to it.
            const addRecentResp = await addToStarterRecentWatchList({
              animeId: animeId,
              animeObject: animeObject,
              userId: userData.details.uid,
              watchListId: watchListId,
              watchListInfo: watchListInfo.response,
              currTimestamp: currTimestamp,
            });

            if (addRecentResp.status === Constant_Var_error)
              throw addRecentResp.response;
          }
        } else {
          // for starter special Anime, they can't exists in more than one special watchLists except Recent WatchList
          const addAnimeResp = await addStarterNonRecentAnime({
            animeId: animeId,
            animeObject: animeObject,
            userId: userData.details.uid,
            watchListId: watchListId,
            watchListInfo: watchListInfo.response,
            currTimestamp: currTimestamp,
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
          currTimestamp: currTimestamp,
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
      updatedAt: currTimestamp,
    });
    return { status: Constant_Var_success, response: null };
  } catch (error) {
    return { response: error, status: Constant_Var_error };
  }
}

async function addAnime({
  animeObject,
  watchListInfo,
  watchListId,
  animeId,
  currTimestamp,
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
    const newAnimeList=watchListInfo.animeList;
    newAnimeList.push({animeId:animeId,addedAt:animeObject.addedAt});

    if (animeObject2 == undefined) {
      const docRef = doc(
        db,
        Constant_Var_firebase_collectionName_watchLists,
        watchListId
      );
      batch.update(docRef, {
        animeList:newAnimeList,
        updatedAt: currTimestamp,
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
  currTimestamp,
  userId
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
          currTimestamp: currTimestamp,
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
        currTimestamp: currTimestamp,
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
        updatedAt:currTimestamp,
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
  currTimestamp,
  userId
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
          currTimestamp: currTimestamp,
        }),
        addAnime({
          animeObject: animeObject,
          animeId: animeId,
          watchListId: watchListId,
          watchListInfo: watchListInfo,
          withBatch: batch,
          currTimestamp: currTimestamp,
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
        updatedAt:currTimestamp
      });
    } else {
      const respAdd = await addAnime({
        animeObject: animeObject,
        animeId: animeId,
        watchListId: watchListId,
        watchListInfo: watchListInfo,
        withBatch: batch,
        currTimestamp: currTimestamp,
      });

      if (respAdd.status !== Constant_Var_success) throw respAdd.response;

      await batch.commit();
    }

    return { status: Constant_Var_success, response: null };
  } catch (error) {
    return { response: error, status: Constant_Var_error };
  }
}

async function updateAnimeInWatchList({
  animeObject,
  watchListId,
  watchListInfo,
  animeId,
  withBatch = false,
  currTimestamp,
}) {
  try {
    const batch = writeBatch(db);
    const docRef = doc(
      db,
      Constant_Var_firebase_collectionName_watchLists,
      watchListId,
      Constant_Var_firebase_collectionName_animeList,
      animeId
    );

    // Filter out fields that are null or undefined and exclude 'addedAt'
    let filteredAnimeObject = Object.fromEntries(
      Object.entries(animeObject).filter(
        ([key, value]) => value != null && key !== "addedAt"
      )
    );
    filteredAnimeObject.updatedAt = currTimestamp;

    // Update only the fields that are not null
    batch.update(docRef, filteredAnimeObject);

    // Modify the animeList array by updating the `addedAt` for the matching `animeId`
    const updatedAnimeList = watchListInfo.animeList.map((anime) => {
      if (anime.animeId === animeId) {
        return { ...anime, addedAt: animeObject.addedAt };
      }
      return anime;
    });

    batch.update(
      doc(db, Constant_Var_firebase_collectionName_watchLists, watchListId),
      { animeList: updatedAnimeList, addedAtAt: currTimestamp }
    );

    if (withBatch) return { status: Constant_Var_success, response: null };

    await batch.commit();

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
  url,
}) {
  if (!watchListId || typeof watchListId !== "string") {
    throw new Error("Invalid or missing watchListId (should be a string)");
  }

  if (!animeId || typeof animeId !== "string") {
    throw new Error("Invalid or missing animeId (should be a string)");
  }

  if (!animeName || typeof animeName !== "string") {
    throw new Error("Invalid or missing animeName (should be a string)");
  }

  // Anime Photo can be null
  if (animePhoto !== null && typeof animePhoto !== "object" && typeof animePhoto !== "string") {
    throw new Error("Invalid animePhoto (should be an object or string)");
  }

  // Anime Genre can be null
  if (animeGenre !== null && !Array.isArray(animeGenre)) {
    throw new Error("Invalid animeGenre (should be an array )");
  }

  // Anime Type can be null
  if (animeType !== null && typeof animeType !== "string") {
    throw new Error("Invalid animeType (should be a string)");
  }

  // Anime Score can be null
  if (animeScore !== null && typeof animeScore !== "number") {
    throw new Error("Invalid animeScore (should be a number or null)");
  }

  // Anime Age Rating can be null
  if (animeAgeRating !== null && typeof animeAgeRating !== "string") {
    throw new Error("Invalid animeAgeRating (should be a string or null)");
  }

  // Anime Start Year can be null
  if (animeStartYear !== null && typeof animeStartYear !== "number" && typeof animeStartYear !== "string") {
    throw new Error("Invalid animeStartYear (should be a number or null)");
  }

  // Anime Length can be null
  if (animeLength !== null && typeof animeLength !== "number") {
    throw new Error("Invalid animeLength (should be a number or null)");
  }

  // Anime episode url can be null
  // if (url!== null && typeof url !== 'object') {
  //   throw new Error("Invalid animePhoto (should be an object or null)");
  // }
}
