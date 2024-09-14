import { auth, db } from "../utils/firebaseinit";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import getUserAuth from "../utils/GetCurrentUserAuth";
import { Constant_Var_NotAuthenticatedUser, Constant_Var_success , Constant_Var_error, Constant_Var_watchListsFirestoreCollection} from "@/utils/constants";

export default async function GetWatchListById(watchListId) {
  try {
    // Check if user cookies exist
    const userData = getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_NotAuthenticatedUser);
    }
    
    let watchListInfo = await GetWatchListInfoById(watchListId);
   
    if(watchListInfo.status!==Constant_Var_success) throw watchListInfo.error;

    //Checking if the watchList is public or current user is the owner
    if(watchListInfo.data.ownerUid===userData.details.uid || watchListInfo.data.type==="public"){
        const collectionRef= collection(db, Constant_Var_watchListsFirestoreCollection,watchListId,"animeList");
        const animeList=await getDocs(collectionRef);
        let animeListArr=[];

        animeList.forEach((anime)=>{
          animeListArr.push(anime.data());
        });

        let result={...watchListInfo.data, animeList:animeListArr};
        return { status: Constant_Var_success, data: result };
      }else{
        throw new Error(`Private WatchList`);
      }
   

  } catch (error) {
    return { error, status: Constant_Var_error };
  }
}

export const GetWatchListInfoById= async (watchListId)=>{
  try {
    // Check if user cookies exist
    const userData = getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_NotAuthenticatedUser);
    }
    const docRef = doc(db, Constant_Var_watchListsFirestoreCollection,watchListId);
    const dataWatchlist = await getDoc(docRef);
   
    if(dataWatchlist.exists()){
        return { status: Constant_Var_success, data: dataWatchlist.data()};
    }else{
      throw new Error(`Watchlist with id=${watchListId} does not exists`);
    }

  } catch (error) {
    return { error, status: Constant_Var_error };
  }
}
