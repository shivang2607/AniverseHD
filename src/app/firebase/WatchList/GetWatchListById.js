import { auth, db } from "../utils/firebaseinit";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import getUserAuth from "../utils/GetCurrentUserAuth";
import { NotAuthenticatedUser, success , errorStr} from "@/utils/constants";

export default async function GetWatchListById(watchlistId) {
  try {
    // Check if user cookies exist
    const userData = getUserAuth();
    if (!userData) {
      throw new Error(NotAuthenticatedUser);
    }
    
    let watchlistInfo = await GetWatchListInfoById(watchlistId);
   
    if(watchlistInfo.status!==success) throw watchlistInfo.error;

    //Checking if the watchlist is public or current user is the owner
    if(watchlistInfo.data.ownerUid===userData.details.uid || watchlistInfo.data.type==="public"){
        const collectionRef= collection(db, "watchlists",watchlistId,"animelist");
        const animelist=await getDocs(collectionRef);
        let animeListArr=[];

        animelist.forEach((anime)=>{
          animeListArr.push(anime.data());
        });

        let result={...watchlistInfo.data, animeList:animeListArr};
        return { status: success, data: result };
      }else{
        throw new Error(`Private Watchlist`);
      }
   

  } catch (error) {
    return { error, status: errorStr };
  }
}

export const GetWatchListInfoById= async (watchlistId)=>{
  try {
    // Check if user cookies exist
    const userData = getUserAuth();
    if (!userData) {
      throw new Error(NotAuthenticatedUser);
    }
    const docRef = doc(db, "watchlists",watchlistId);
    const dataWatchlist = await getDoc(docRef);
   
    if(dataWatchlist.exists()){
        return { status: success, data: dataWatchlist.data()};
    }else{
      throw new Error(`Watchlist with id=${watchlistId} does not exists`);
    }

  } catch (error) {
    return { error, status: errorStr };
  }
}
