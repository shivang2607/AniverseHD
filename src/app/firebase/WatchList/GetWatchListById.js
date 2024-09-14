import { auth, db } from "../utils/firebaseinit";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import getUserAuth from "../utils/GetCurrentUserAuth";
import { NotAuthenticatedUser, success , errorStr} from "@/utils/constants";

export default async function GetWatchListById(watchListId) {
  try {
    // Check if user cookies exist
    const userData = getUserAuth();
    if (!userData) {
      throw new Error(NotAuthenticatedUser);
    }
    
    let watchListInfo = await GetWatchListInfoById(watchListId);
   
    if(watchListInfo.status!==success) throw watchListInfo.error;

    //Checking if the watchList is public or current user is the owner
    if(watchListInfo.data.ownerUid===userData.details.uid || watchListInfo.data.type==="public"){
        const collectionRef= collection(db, "watchLists",watchListId,"animeList");
        const animeList=await getDocs(collectionRef);
        let animeListArr=[];

        animeList.forEach((anime)=>{
          animeListArr.push(anime.data());
        });

        let result={...watchListInfo.data, animeList:animeListArr};
        return { status: success, data: result };
      }else{
        throw new Error(`Private WatchList`);
      }
   

  } catch (error) {
    return { error, status: errorStr };
  }
}

export const GetWatchListInfoById= async (watchListId)=>{
  try {
    // Check if user cookies exist
    const userData = getUserAuth();
    if (!userData) {
      throw new Error(NotAuthenticatedUser);
    }
    const docRef = doc(db, "watchLists",watchListId);
    const dataWatchlist = await getDoc(docRef);
   
    if(dataWatchlist.exists()){
        return { status: success, data: dataWatchlist.data()};
    }else{
      throw new Error(`Watchlist with id=${watchListId} does not exists`);
    }

  } catch (error) {
    return { error, status: errorStr };
  }
}
