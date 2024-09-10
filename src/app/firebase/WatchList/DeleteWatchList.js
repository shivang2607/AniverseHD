import { auth, db } from "../firebaseinit";
import { doc, getDoc } from "firebase/firestore";
import Cookies from "js-cookie";
import GetWatchList from "./GetWatchListById";

export default async function DeleteWatchList(watchListId) {
  try {
    // Check if user cookies exist
    const userData= getUserCookies();

    if (!userData) {
      return { status: 'error', message: 'User not authenticated.' };
    }
    
   const res= await GetWatchList(watchListId);
   if(res.userEmail===userData.details.email){
    await deleteDoc(doc(db, "watchlist", watchListId));
   }else{
    return { status: 'error', message: "Not authorised user." };
   }

   return {status:"success"};
  } catch (error) {
    return { status: 'error', message: error.message, error };
  }
}

function getUserCookies() {
  const user = Cookies.get("user");
  if (user) {
    const details = JSON.parse(user);
    return { details };
  }
  return false;
}
