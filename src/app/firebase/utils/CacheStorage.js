import {
  Constant_Var_sessionStorage_key_loggedInUser,
  Constant_Var_sessionStorage_key_userWatchListsInfo,
  Constant_Var_sessionStorage_key_watchListAnimeListById,
  Constant_Var_sessionStorage_key_watchListInfoById,
  Constant_Var_starterWatchLists_favourite,
  Constant_Var_starterWatchLists_recent,
} from "@/utils/constants";

/** Misscelanious  */
const getSessionStorageParsedItem = (key) => {
  const item = sessionStorage.getItem(key);

  if (!item || item === "undefined") {
    console.warn(`Item for key: ${key} is not found in sessionStorage.`);
    return null; // Return null or handle accordingly when the key is missing
  }

  try {
    return JSON.parse(item);
  } catch (error) {
    console.error(
      `Failed to parse item from sessionStorage for key: ${key}`,
      error
    );
    return null; // Return null when JSON parsing fails
  }
};

const findWatchListIndex = ({ userWatchLists, watchListId }) => {
  return userWatchLists.findIndex((watchList) => watchList.id === watchListId);
};

const updateUserPropertyCached = (property, value) => {
  let userData = getUserInfoCached();
  if (!userData) return;
  userData[property] = value;
  setUserInfoCached({ userData });
};

/** User Profile INfo */
export const getUserInfoCached = () => {
  const userData = getSessionStorageParsedItem(
    Constant_Var_sessionStorage_key_loggedInUser
  );
  return userData;
};

export const setUserInfoCached = ({ userData }) => {
  // console.log("setting data",userData);
  sessionStorage.setItem(
    Constant_Var_sessionStorage_key_loggedInUser,
    JSON.stringify(userData)
  );
};

export const changeUserNameCached = ({ userName }) => {
  let userData = getUserInfoCached();
  if (!userData) return;

  userData.userName = userName;
  setUserInfoCached({ userData: userData });
};

export const changeCoverUrlCached = ({ coverUrl }) => {
  let userData = getUserInfoCached();
  if (!userData) return;

  userData.coverUrl = coverUrl;
  setUserInfoCached(userData);
};

export const changePhotoUrlCached = ({ photoUrl }) => {
  let userData = getUserInfoCached();
  if (!userData) return;

  userData.photoUrl = photoUrl;
  setUserInfoCached(userData);
};

export const changeUserPlayOptionsCached = ({ playerOptions }) => {
  let userData = getUserInfoCached();
  if (!userData) return;

  userData.playerOptions = playerOptions;

  setUserInfoCached({ userData });
};
/** User WatchLists Info */
export const getUserWatchListsInfoCached = ({ userId }) => {
  const userWatchlists = getSessionStorageParsedItem(
    `${Constant_Var_sessionStorage_key_userWatchListsInfo}/${userId}`
  );

  return userWatchlists;
};

export const setUserWatchListsInfoCached = ({ watchLists, userId }) => {
  sessionStorage.setItem(
    `${Constant_Var_sessionStorage_key_userWatchListsInfo}/${userId}`,
    JSON.stringify(watchLists)
  );
};

/** WatchListInfo By Id */
export const getWatchListInfoByIdInfoCached = ({ watchListId }) => {
  const watchlistInfo = getSessionStorageParsedItem(
    `${Constant_Var_sessionStorage_key_watchListInfoById}/${watchListId}`
  );

  return watchlistInfo;
};

export const setWatchListInfoByIdInfoCached = ({
  watchListInfo,
  watchListId,
}) => {
  sessionStorage.setItem(
    `${Constant_Var_sessionStorage_key_watchListInfoById}/${watchListId}`,
    JSON.stringify(watchListInfo)
  );
};

export const removeWatchListInfoByIdInfoCached = ({ watchListId }) => {
  sessionStorage.removeItem(
    `${Constant_Var_sessionStorage_key_watchListInfoById}/${watchListId}`
  );
};

/** User watchList Anime list By WatchList Id */
export const getWatchListAnimeListByIdCached = ({ watchListId }) => {
  const watchlistAnimeList = getSessionStorageParsedItem(
    `${Constant_Var_sessionStorage_key_watchListAnimeListById}/${watchListId}`
  );

  return watchlistAnimeList;
};

export const setWatchListAnimeListByIdCached = ({
  watchlistAnimeList,
  watchListId,
}) => {
  sessionStorage.setItem(
    `${Constant_Var_sessionStorage_key_watchListAnimeListById}/${watchListId}`,
    JSON.stringify(watchlistAnimeList)
  );
};

export const removeWatchlistAnimeListCached = ({ watchListId }) => {
  sessionStorage.removeItem(
    `${Constant_Var_sessionStorage_key_watchListAnimeListById}/${watchListId}`
  );
};

export const addAnimeToUserWatchListCached = ({
  watchListId,
  anime,
  userId,
  updatedAt,
}) => {
  let watchListInfo = getWatchListInfoByIdInfoCached({
    watchListId: watchListId,
  });
  let userWatchLists = getUserWatchListsInfoCached({ userId: userId });
  let watchListAnimeList = getWatchListAnimeListByIdCached({
    watchListId: watchListId,
  });
  watchListInfo.updatedAt = updatedAt;
  const isRecent =
    watchListInfo.isSpecialStarter &&
    watchListInfo.watchListName === Constant_Var_starterWatchLists_recent;

  // Check if anime already exists in the watchListAnimeList
  const animeExistsInWatchList =
    watchListAnimeList &&
    watchListAnimeList.some((item) => item.animeId === anime.animeId);

  // Adding whole anime data to WatchListAnimeListBYId cache if it does not exist
  if (!animeExistsInWatchList) {
    if (watchListAnimeList) {
      watchListAnimeList.push(anime);
    } else {
      watchListAnimeList = [anime]; // If animeList doesn't exist, initialize the array
    }
    setWatchListAnimeListByIdCached({
      watchlistAnimeList: watchListAnimeList,
      watchListId: watchListId,
    });
  }

  // Check if animeId already exists in watchListInfo
  const animeExistsInWatchListInfo =
    watchListInfo &&
    watchListInfo?.animeList.some((item) => item.animeId === anime.animeId);

  // Adding only animeId and timestamp to watchListInfo By Id cache
  if (!animeExistsInWatchListInfo) {
    watchListInfo.animeList.push({
      animeId: anime.animeId,
      addedAt: anime.addedAt,
      animeName: anime.animeName,
      ...(isRecent ? { url: anime.url } : {}),
      ...(isRecent ? { episodeTimestamp: anime.episodeTimestamp } : {}),
    });
    setWatchListInfoByIdInfoCached({
      watchListInfo: watchListInfo,
      watchListId: watchListId,
    });
  }

  //adding only animeid and timestamp to watchListInfo in user watchLists cache
  if (userWatchLists) {
    let ind = findWatchListIndex({
      userWatchLists: userWatchLists,
      watchListId: watchListId,
    });

    if (ind != -1) {
      const animeExistsInWatchListInfo =
        userWatchLists[ind] &&
        userWatchLists[ind]?.animeList.some(
          (item) => item.animeId === anime.animeId
        );

      if (!animeExistsInWatchListInfo)
        userWatchLists[ind].animeList.push({
          animeId: anime.animeId,
          addedAt: anime.addedAt,
          animeName: anime.animeName,
          ...(isRecent ? { url: anime.url } : {}),
          ...(isRecent ? { episodeTimestamp: anime.episodeTimestamp } : {}),
        });
    }

    setUserWatchListsInfoCached({ watchLists: userWatchLists, userId: userId });
  }

  return;
};

export const addAnimeToWatchListByIdCachedInBatch = ({
  watchListId,
  animeList,
}) => {
  let watchListAnimeList = getWatchListAnimeListByIdCached({
    watchListId: watchListId,
  });

  if (watchListAnimeList) {
    watchListAnimeList = watchListAnimeList.concat(animeList);
  } else {
    watchListAnimeList = animeList;
  }
  watchListAnimeList.sort((a, b) => {
    if (a.updatedAt.seconds !== b.updatedAt.seconds) {
      return a.updatedAt.seconds - b.updatedAt.seconds;
    }
    return a.updatedAt.nanoseconds - b.updatedAt.nanoseconds;
  });
  setWatchListAnimeListByIdCached({
    watchlistAnimeList: watchListAnimeList,
    watchListId: watchListId,
  });
  return;
};

export const removeAnimeFromUserWatchListCached = ({
  watchListId,
  animeId,
  userId,
  updatedAt,
}) => {
  let watchListInfo = getWatchListInfoByIdInfoCached({
    watchListId: watchListId,
  });
  let userWatchLists = getUserWatchListsInfoCached({ userId: userId });
  let watchListAnimeList = getWatchListAnimeListByIdCached({
    watchListId: watchListId,
  });
  watchListInfo.updatedAt = updatedAt;

  // Remove anime from WatchListAnimeListById cache
  if (watchListAnimeList) {
    watchListAnimeList = watchListAnimeList.filter(
      (anime) => anime.animeId !== animeId
    );
    setWatchListAnimeListByIdCached({
      watchlistAnimeList: watchListAnimeList,
      watchListId: watchListId,
    });
  }

  // Remove animeId from watchListInfo in user watchLists cache
  if (userWatchLists) {
    let ind = findWatchListIndex({
      userWatchLists: userWatchLists,
      watchListId: watchListId,
    });

    if (ind !== -1) {
      userWatchLists[ind].animeList = userWatchLists[ind].animeList.filter(
        (anime) => anime.animeId !== animeId
      );
    }

    setUserWatchListsInfoCached({ watchLists: userWatchLists, userId: userId });
  }

  // Remove animeId from watchListInfo by Id cache
  if (watchListInfo) {
    watchListInfo.animeList = watchListInfo.animeList.filter(
      (anime) => anime.animeId !== animeId
    );
    setWatchListInfoByIdInfoCached({
      watchListInfo: watchListInfo,
      watchListId: watchListId,
    });
  }

  return;
};

/**user watchlist alteration   issue, not adding in session storage when new watchlist is created*/
export const addUserWatchlistCached = ({
  watchListInfo,
  watchListId,
  userId,
}) => {
  let userWatchLists = getUserWatchListsInfoCached({ userId: userId }) || [];

  userWatchLists.push(watchListInfo);
  setUserWatchListsInfoCached({ watchLists: userWatchLists, userId: userId });
  setWatchListInfoByIdInfoCached({
    watchListInfo: watchListInfo,
    watchListId: watchListId,
  });
};

export const deleteUserWatchlistCached = ({ watchListId, userId }) => {
  let userWatchLists = getUserWatchListsInfoCached({ userId: userId });
  if (!userWatchLists) return;

  userWatchLists = userWatchLists.filter((list) => {
    return list.id !== watchListId;
  });
  setUserWatchListsInfoCached({ watchLists: userWatchLists, userId: userId });
  removeWatchListInfoByIdInfoCached({ watchListId: watchListId });
};

export const updatePublicPrivateCached = ({
  watchListId,
  type,
  updatedAt,
  userId,
}) => {
  let watchListInfo = getWatchListInfoByIdInfoCached({
    watchListId: watchListId,
  });
  let userWatchLists = getUserWatchListsInfoCached({ userId: userId });
  watchListInfo.updatedAt = updatedAt;

  if (watchListInfo) {
    watchListInfo.type = type;
    setWatchListInfoByIdInfoCached({
      watchListInfo: watchListInfo,
      watchListId: watchListId,
    });
  }

  //adding only animeid and timestamp to watchListInfo in user watchLists cache
  if (userWatchLists) {
    let ind = findWatchListIndex({
      userWatchLists: userWatchLists,
      watchListId: watchListId,
    });

    if (ind != -1) userWatchLists[ind].type = type;

    setUserWatchListsInfoCached({ watchLists: userWatchLists, userId: userId });
  }

  return;
};
