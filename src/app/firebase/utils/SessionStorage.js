export const getUserInfoCached = () => {
  const userData = sessionStorage.getItem("user");

  if (userData != null) return JSON.parse(userData);
  else return null;
};

export const setUserInfoCached = (userData) => {
    // console.log("setting data",userData);
  sessionStorage.setItem("user", JSON.stringify(userData));
};

export const getUserWatchlistsCached = () => {
  const userWatchlists = sessionStorage.getItem("watchlists");

  if (userWatchlists != null) return JSON.parse(userWatchlists);
  else return null;
};

export const setUserWatchlistsCached = (watchlists) => {
  sessionStorage.setItem("watchlists", JSON.stringify(watchlists));
};

export const setAddAnimeUserWatchListCahed = (watchlists, anime) => {
//   let watchlists = getUserWatchlistsCached();
//   watchlists.

    sessionStorage.setItem("watchlists", JSON.stringify(watchlists));
};
