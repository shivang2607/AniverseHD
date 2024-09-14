export const getUserInfoCached = () => {
  const userData = sessionStorage.getItem("user");

  if (userData != null) return JSON.parse(userData);
  else return null;
};

export const setUserInfoCached = (userData) => {
    // console.log("setting data",userData);
  sessionStorage.setItem("user", JSON.stringify(userData));
};

export const updateUserName =(name)=>{
  let userData= getUserInfoCached();

  if(userData==null) return;

  userData.userName=name;
  setUserInfoCached(userData);
}

export const getUserWatchlistsCached = () => {
  const userWatchlists = sessionStorage.getItem("userwatchLists");

  if (userWatchlists != null) return JSON.parse(userWatchlists);
  else return null;
};

export const setUserWatchlistsCached = (watchLists) => {
  sessionStorage.setItem("userwatchLists", JSON.stringify(watchLists));
};

export const addAnimeToUserWatchListCahed = (watchListId,anime) => {
  let watchLists = getUserWatchlistsCached();

  if(watchLists==null) return;

  watchLists=watchLists.map((item)=>{
    if(item.id==watchListId){
     let exists= item.animeList.some(item => item.animeId===anime.animeId);
  
     !exists && item.animeList.push(anime);

      return item;
    }else return item;
  });

  setUserWatchlistsCached(watchLists);
};

export const removeAnimeFromUserWatchListCahed = (watchListId,animeId) => {
  let watchLists = getUserWatchlistsCached();

  if(watchLists==null) return;

  watchLists=watchLists.map((item)=>{
    if(item.id==watchListId){
      item.animeList= item.animeList.filter(anime=>{ return anime.animeId!==animeId});
      return item;
    }else return item;
  });

  setUserWatchlistsCached(watchLists);
};


export const addUserWatchlistCached=(watchList)=>{
    let watchLists= getUserWatchlistsCached();
    if(watchLists==null) return;
    watchLists.push(watchList);
    setUserWatchlistsCached(watchLists);
}

export const deleteUserWatchlistCached=(watchListId)=>{
  let watchLists= getUserWatchlistsCached();
  if(watchLists==null) return;
  watchLists=watchLists.filter(list=>{
    return list.id!==watchListId;
  });
  setUserWatchlistsCached(watchLists);
}
