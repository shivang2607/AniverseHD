import { auth, db } from "@/app/firebase/firebaseinit";
import { doc, getDoc, writeBatch,collection, addDoc,setDoc } from "firebase/firestore";
import Cookies from "js-cookie";

export default async function CreateWatchList(watchlistName, type) {
  try {
    // Check if user cookies exist
    if(!watchlistName || !type){
      return { status: "error", message: "required params not passed" };
    }
    if (!getUserCookies()) {
      return { status: "error", message: "User not authenticated." };
    }
    const docRef = doc(collection(db, "watchlists"));
    await setDoc(docRef, {
      ownerEmail: getUserCookies().details.email,
      watchListName: watchlistName,
      type:type,
      id:docRef.id,
      isSpecialRecent:false
    });

    return { status: "success"};   
  } catch (error) {
    return { status: "error", message: error.message, error };
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
