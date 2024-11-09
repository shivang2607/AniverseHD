import { auth, db } from "../../utils/firebaseinit";
import {
  collection,
  doc,
  endAt,
  endBefore,
  getDoc,
  getDocs,
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

//NOT READY YET
export default async function GetWatchListById({
  watchListId,
  offset,
  pageSize,
}) {
  try {
    if (!watchListId) throw new Error(Constant_Var_errorMessage_missingParams);

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
      watchlistInfoCache.response.updatedAt < watchListInfo.response.updatedAt
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
      });
    } else {
      throw new Error(Constant_Var_errorMessage_privateWatchList);
    }

    return { response: response, status: Constant_Var_success };
  } catch (error) {
    return { response: error, status: Constant_Var_error };
  }
}

async function Helper({ watchListInfo, offset, pageSize }) {
  const { animeList, id } = watchListInfo;
  if (offset >= animeList.length) return [];

  let startAnime = animeList[offset];
  let endAnime =
    animeList[Math.min(animeList.length - 1, offset + pageSize - 1)];

  let animeListCache = getWatchListAnimeListByIdCached({
    watchListId: id,
  });

  // console.log(startAnime,endAnime,"hh");
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

  console.log(startIndex, endIndex);

  if (startIndex !== -1 && endIndex !== -1) {
    return animeListCache.slice(startIndex, endIndex+1);
  } else if (startIndex !== -1 && endIndex === -1) {
    let arr = animeListCache.slice(startIndex, animeListCache.length);
    let arr2 = await GetFromFirestore({
      watchListId: id,
      startTimestamp: animeListCache[animeListCache.length - 1].updatedAt,
      endTimestamp: endAnime.addedAt,
      startInclude:false,
    });
    addAnimeToWatchListByIdCachedInBatch({
      watchListId: id,
      animeList: arr2,
    });
    return arr.concat(arr2);
  } else if (endIndex !== -1 && startIndex === -1) {
    let arr = animeListCache.slice(0, endIndex+1);
    let arr2 = await GetFromFirestore({
      watchListId: id,
      startTimestamp: startAnime.addedAt,
      endTimestamp: animeListCache[0].updatedAt,
      endInclude:false,
    });
    addAnimeToWatchListByIdCachedInBatch({
      watchListId:id,
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
  endInclude=true,
}) {
  let queryResult;

  if (startInclude  && endInclude) {
    queryResult = await getDocs(
      query(
        collection(
          db,
          Constant_Var_firebase_collectionName_watchLists,
          watchListId,
          Constant_Var_firebase_collectionName_animeList
        ),
        orderBy("updatedAt"),
        startAt(new Timestamp( startTimestamp.seconds,startTimestamp.nanoseconds)),
        endAt(new Timestamp( endTimestamp.seconds,endTimestamp.nanoseconds))
      )
    );
   
  } else if(startInclude){
    queryResult = await getDocs(
      query(
        collection(
          db,
          Constant_Var_firebase_collectionName_watchLists,
          watchListId,
          Constant_Var_firebase_collectionName_animeList
        ),
        orderBy("updatedAt"),
        startAt(new Timestamp( startTimestamp.seconds,startTimestamp.nanoseconds)),
        endBefore(new Timestamp( endTimestamp.seconds,endTimestamp.nanoseconds))
      )
    );
  }else if(endInclude){
    queryResult = await getDocs(
      query(
        collection(
          db,
          Constant_Var_firebase_collectionName_watchLists,
          watchListId,
          Constant_Var_firebase_collectionName_animeList
        ),
        orderBy("updatedAt"),
        startAfter(new Timestamp( startTimestamp.seconds,startTimestamp.nanoseconds)),
        endAt(new Timestamp( endTimestamp.seconds,endTimestamp.nanoseconds))
      )
    );
  }else{
    queryResult = await getDocs(
      query(
        collection(
          db,
          Constant_Var_firebase_collectionName_watchLists,
          watchListId,
          Constant_Var_firebase_collectionName_animeList
        ),
        orderBy("updatedAt"),
        startAfter(new Timestamp( startTimestamp.seconds,startTimestamp.nanoseconds)),
        endBefore(new Timestamp( endTimestamp.seconds,endTimestamp.nanoseconds))
      )
    );
  }
  // console.log(queryResult.docs, startTimestamp,
  //   endTimestamp, "result firestore");
  // Map through the docs and return an array of document data
  return queryResult.docs.map((doc) => doc.data());
}

// const collectionRef = collection(
//   db,
//   Constant_Var_firebase_collectionName_watchLists,
//   watchListId,
//   Constant_Var_firebase_collectionName_animeList
// );
// // query(collectionRef, orderBy("createdAt"), startAt(offset));
// const animeList = await getDocs(collectionRef);
// let animeListArr = [];

// animeList.forEach((anime) => {
//   animeListArr.push(anime.data());
// });

// let result = { ...watchListInfo.response, animeList: animeListArr };
// return { status: Constant_Var_success, response: result };
