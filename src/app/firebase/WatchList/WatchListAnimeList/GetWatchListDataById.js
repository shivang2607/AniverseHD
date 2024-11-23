import { auth, db } from "../../utils/firebaseinit";
import {
  collection,
  doc,
  endAt,
  endBefore,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  startAfter,
  startAt,
  Timestamp,
} from "firebase/firestore";
import getUserAuth from "../../utils/GetUserAuth";
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

import GetWatchListInfoById from "../WatchListDocument/GetWatchListInfoById";
import {
  addAnimeToWatchListByIdCachedInBatch,
  getWatchListAnimeListByIdCached,
  removeWatchlistAnimeListCached,
} from "../../utils/CacheStorage";
import _ from "lodash";

/**
 * Retrieves a specific watchlist by its ID, with options for pagination or fetching the full list.
 * The function checks if the watchlist is public or owned by the current user before returning data.
 * If the watchlist is updated, it clears outdated cached data.
 *
 * @async
 * @function
 * @param {Object} params - The parameters for fetching the watchlist.
 * @param {string} params.watchListId - The ID of the watchlist to retrieve.
 * @param {number|null} [params.offset=null] - The offset for paginated retrieval.
 *                                             Required if `getAll` is false.
 * @param {number|null} [params.pageSize=null] - The number of items to retrieve per page.
 *                                               Required if `getAll` is false.
 * @param {boolean} [params.getAll=false] - Whether to fetch the entire list of items.
 *                                          Overrides offset and pageSize if true.
 *
 * @returns {Promise<Object>} - An object with a `status` key, which is
 *                              `Constant_Var_success` on success and
 *                              `Constant_Var_error` on error, and a `response`
 *                              key with the retrieved watchlist data or an error message.
 *
 * @throws Will throw an error if required parameters are missing.
 *
 * @example
 * // Fetching with pagination (getAll: false)
 * const result = await GetWatchListById({
 *   watchListId: 'abc123',
 *   offset: 0,
 *   pageSize: 10,
 *   getAll: false
 * });
 * if (result.status === Constant_Var_success) {
 *   console.log("Paginated Watchlist Data:", result.response);
 * } else {
 *   console.error("Error fetching paginated watchlist:", result.response);
 * }
 *
 * @example
 * // Fetching the complete watchlist (getAll: true)
 * const result = await GetWatchListById({
 *   watchListId: 'abc123',
 *   getAll: true
 * });
 * if (result.status === Constant_Var_success) {
 *   console.log("Complete Watchlist Data:", result.response);
 * } else {
 *   console.error("Error fetching complete watchlist:", result.response);
 * }
 */
export default async function GetWatchListDataById({
  watchListId,
  offset = null,
  pageSize = null,
  getAll = false,
}) {
  try {
    if (!(watchListId && ((offset != null && pageSize != null) || getAll)))
      throw new Error(Constant_Var_errorMessage_missingParams);

    // console.log(offset,pageSize,"start");
    let watchlistInfoCache = await GetWatchListInfoById({
      watchListId: watchListId,
      getFromCache: true,
    });
    let watchListInfo = await GetWatchListInfoById({
      watchListId: watchListId,
      getFromCache: false,
    });

    if (watchListInfo.status !== Constant_Var_success)
      throw watchListInfo.response;

    if (watchlistInfoCache.status !== Constant_Var_success)
      throw watchlistInfoCache.response;

    if (
      compareTimestamp(
        watchlistInfoCache.response.updatedAt,
        watchListInfo.response.updatedAt
      )
    ) {
      // Clear watchlistAnimelist cache
      removeWatchlistAnimeListCached({ watchListId: watchListId });
    }

    let response = null;
    //Checking if the watchList is public or current user is the owner
    if (
      watchListInfo.response.type === Constant_Var_firebase_fieldValue_public ||
      (await getUserAuth())?.details.uid === watchListInfo.response.ownerUid
    ) {

        response = await Helper({
          watchListInfo: watchListInfo.response,
          offset: offset,
          pageSize: pageSize,
          getAll: getAll
        });
    } else {
      throw new Error(Constant_Var_errorMessage_privateWatchList);
    }

    return { response: response, status: Constant_Var_success };
  } catch (error) {
    return { response: error, status: Constant_Var_error };
  }
}

async function Helper({ watchListInfo, offset, pageSize, getAll=false }) {
  const { animeList, id } = watchListInfo;
 
  let startAnime = null,
    endAnime = null;
  if (getAll) {
    if(animeList.length==0) return [];

    startAnime=animeList[0];
    endAnime=animeList[animeList.length-1];
  } else {
    if (offset >= animeList.length) return [];

    startAnime = animeList[offset];
    endAnime = animeList[Math.min(animeList.length - 1, offset + pageSize - 1)];
  }

  let animeListCache = getWatchListAnimeListByIdCached({
    watchListId: id,
  });

  // console.log(startAnime, endAnime, "hh");
  let startIndex = Search({
    arrayofObjects: animeListCache,
    attribute: "addedAt",
    key: startAnime.addedAt,
  });

  let endIndex = Search({
    arrayofObjects: animeListCache,
    attribute: "addedAt",
    key: endAnime.addedAt,
  });

  // console.log(startIndex, endIndex);

  if (startIndex !== -1 && endIndex !== -1) {
    return animeListCache.slice(startIndex, endIndex + 1);
  } else if (startIndex !== -1 && endIndex === -1) {
    let arr = animeListCache.slice(startIndex, animeListCache.length);
    let arr2 = await GetFromFirestore({
      watchListId: id,
      startTimestamp: animeListCache[animeListCache.length - 1].updatedAt,
      endTimestamp: endAnime.addedAt,
      startInclude: false,
    });
    addAnimeToWatchListByIdCachedInBatch({
      watchListId: id,
      animeList: arr2,
    });
    return arr.concat(arr2);
  } else if (endIndex !== -1 && startIndex === -1) {
    let arr = animeListCache.slice(0, endIndex + 1);
    let arr2 = await GetFromFirestore({
      watchListId: id,
      startTimestamp: startAnime.addedAt,
      endTimestamp: animeListCache[0].updatedAt,
      endInclude: false,
    });
    addAnimeToWatchListByIdCachedInBatch({
      watchListId: id,
      animeList: arr2,
    });
    return arr.concat(arr2);
  } else {
    let arr = [];
    let arr2 = await GetFromFirestore({
      watchListId: id,
      startTimestamp: startAnime.addedAt,
      endTimestamp: endAnime.addedAt,
    });
    addAnimeToWatchListByIdCachedInBatch({
      watchListId: id,
      animeList: arr2,
    });
    return arr.concat(arr2);
  }
}

function Search({ arrayofObjects, attribute, key }) {
  if (!arrayofObjects || !attribute || !key) return -1;

  for (let ind = 0; ind < arrayofObjects.length; ind++) {
    const ele = arrayofObjects[ind];
    if (
      ele[attribute].seconds === key.seconds &&
      ele[attribute].nanoseconds === key.nanoseconds
    ) {
      return ind;
    }
  }
  // console.log(arrayofObjects);
  // let l = 0,
  //   h = arrayofObjects.length-1;
  // while (l <= h) {
  //   let mid = Math.floor(l + (h - l) / 2);
  //   console.log("inside",mid,arrayofObjects[mid]);
  //   if (arrayofObjects[mid].addedAt == key) return mid;

  //   if (arrayofObjects[mid].addedAt > key) h = mid - 1;
  //   else l = mid + 1;
  // }

  return -1;
}

async function GetFromFirestore({
  watchListId,
  startTimestamp,
  endTimestamp,
  startInclude = true,
  endInclude = true,
  getAll = false,
}) {
  let queryResult;

  if (getAll) {
    queryResult = await getDocs(
      query(
        collection(
          db,
          Constant_Var_firebase_collectionName_watchLists,
          watchListId,
          Constant_Var_firebase_collectionName_animeList
        ),
        orderBy("updatedAt")
      )
    );
  } else if (startInclude && endInclude) {
    queryResult = await getDocs(
      query(
        collection(
          db,
          Constant_Var_firebase_collectionName_watchLists,
          watchListId,
          Constant_Var_firebase_collectionName_animeList
        ),
        orderBy("updatedAt"),
        startAt(
          new Timestamp(startTimestamp.seconds, startTimestamp.nanoseconds)
        ),
        endAt(new Timestamp(endTimestamp.seconds, endTimestamp.nanoseconds))
      )
    );
  } else if (startInclude) {
    queryResult = await getDocs(
      query(
        collection(
          db,
          Constant_Var_firebase_collectionName_watchLists,
          watchListId,
          Constant_Var_firebase_collectionName_animeList
        ),
        orderBy("updatedAt"),
        startAt(
          new Timestamp(startTimestamp.seconds, startTimestamp.nanoseconds)
        ),
        endBefore(new Timestamp(endTimestamp.seconds, endTimestamp.nanoseconds))
      )
    );
  } else if (endInclude) {
    queryResult = await getDocs(
      query(
        collection(
          db,
          Constant_Var_firebase_collectionName_watchLists,
          watchListId,
          Constant_Var_firebase_collectionName_animeList
        ),
        orderBy("updatedAt"),
        startAfter(
          new Timestamp(startTimestamp.seconds, startTimestamp.nanoseconds)
        ),
        endAt(new Timestamp(endTimestamp.seconds, endTimestamp.nanoseconds))
      )
    );
  } else {
    queryResult = await getDocs(
      query(
        collection(
          db,
          Constant_Var_firebase_collectionName_watchLists,
          watchListId,
          Constant_Var_firebase_collectionName_animeList
        ),
        orderBy("updatedAt"),
        startAfter(
          new Timestamp(startTimestamp.seconds, startTimestamp.nanoseconds)
        ),
        endBefore(new Timestamp(endTimestamp.seconds, endTimestamp.nanoseconds))
      )
    );
  }
  // console.log(
  //   queryResult.docs.map((doc) => doc.data()),
  //   "firestore"
  // );
  // Map through the docs and return an array of document data
  return queryResult.docs.map((doc) => doc.data());
}

function compareTimestamp(timestamp1, timestamp2) {
  const time1 = timestamp1.seconds * 1000 + timestamp1.nanoseconds / 1e6;
  const time2 = timestamp2.seconds * 1000 + timestamp2.nanoseconds / 1e6;

  return time1 < time2;
}
