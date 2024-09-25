import {
  Constant_Var_sessionStorage_key_loggedInUser,
  Constant_Var_sessionStorage_key_userWatchListsInfo,
  Constant_Var_sessionStorage_key_watchListInfo,
} from "@/utils/constants";

/** User Profile INfo */
export const getUserInfoCached = () => {
  const userData = sessionStorage.getItem(
    Constant_Var_sessionStorage_key_loggedInUser
  );

  if (userData != null) return JSON.parse(userData);
  else return null;
};

export const setUserInfoCached = (userData) => {
  // console.log("setting data",userData);
  sessionStorage.setItem(
    Constant_Var_sessionStorage_key_loggedInUser,
    JSON.stringify(userData)
  );
};
export const changeUserNameCached = (userName) => {
  let userData = getUserInfoCached();
  userData.userName = userName;
  setUserInfoCached(userData);
};

export const changeCoverUrlCached = (coverUrl) => {
  let userData = getUserInfoCached();
  userData.coverUrl = coverUrl;
  setUserInfoCached(userData);
};

export const changePhotoUrlCached = (photoUrl) => {
  let userData = getUserInfoCached();
  userData.photoUrl = photoUrl;
  setUserInfoCached(userData);
};

/** User WatchLists Info */
export const getUserWatchListsInfoCached = (userId) => {
  const userWatchlists = sessionStorage.getItem(
    `${Constant_Var_sessionStorage_key_userWatchListsInfo}\\${userId}`
  );

  if (userWatchlists != null) return JSON.parse(userWatchlists);
  else return null;
};

export const setUserWatchListsInfoCached = (watchLists, userId) => {
  sessionStorage.setItem(
    `${Constant_Var_sessionStorage_key_userWatchListsInfo}\\${userId}`,
    JSON.stringify(watchLists)
  );
};

export const getWatchListInfoByIdInfoCached = (watchListId) => {
  const watchlistInfo = sessionStorage.getItem(
    `${Constant_Var_sessionStorage_key_watchListInfo}\\${watchListId}`
  );

  if (watchlistInfo != null) return JSON.parse(watchlistInfo);
  else return null;
};

export const setWatchListInfoByIdInfoCached = (watchListInfo, watchListId) => {
  sessionStorage.setItem(
    `${Constant_Var_sessionStorage_key_watchListInfo}\\${watchListId}`,
    JSON.stringify(watchListInfo)
  );
};

export const removeWatchListInfoByIdInfoCached = (watchListId) => {
  sessionStorage.removeItem(
    `${Constant_Var_sessionStorage_key_watchListInfo}\\${watchListId}`
  );
};

/** User watchList Anime list */
//to be created

export const addAnimeToUserWatchListCahed = (watchListId, anime) => {
  // let watchLists = getUserWatchlistsCached();
  // if (watchLists == null) return;
  // watchLists = watchLists.map((item) => {
  //   if (item.id == watchListId) {
  //     let exists = item.animeList.some(
  //       (item) => item.animeId === anime.animeId
  //     );
  //     !exists && item.animeList.push(anime);
  //     return item;
  //   } else return item;
  // });
  // setUserWatchlistsCached(watchLists);
};

export const removeAnimeFromUserWatchListCahed = (watchListId, animeId) => {
  // let watchLists = getUserWatchlistsCached();
  // if (watchLists == null) return;
  // watchLists = watchLists.map((item) => {
  //   if (item.id == watchListId) {
  //     item.animeList = item.animeList.filter((anime) => {
  //       return anime.animeId !== animeId;
  //     });
  //     return item;
  //   } else return item;
  // });
  // setUserWatchlistsCached(watchLists);
};

/**user watchlist alteration   issue, not adding in session storage when new watchlist is created*/
export const addUserWatchlistCached = (watchListInfo, watchListId, userId) => {
  let userWatchLists = getUserWatchListsInfoCached(userId);
  if (!userWatchLists) return;
  
  userWatchLists.push(watchListInfo);
  setUserWatchListsInfoCached(userWatchLists, userId);
  setWatchListInfoByIdInfoCached(watchListInfo, watchListId);
};

export const deleteUserWatchlistCached = (watchListId) => {
  let userWatchLists = getUserWatchListsInfoCached(userId);
  if (!userWatchLists) return;

  userWatchLists = userWatchLists.filter((list) => {
    return list.id !== watchListId;
  });
  setUserWatchListsInfoCached(userWatchLists, userId);
  removeWatchListInfoByIdInfoCached(watchListId);
};
