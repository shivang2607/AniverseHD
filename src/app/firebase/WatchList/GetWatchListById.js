import { auth, db } from "../firebaseinit";
import { doc, getDoc } from "firebase/firestore";
import Cookies from "js-cookie";

export default async function GetWatchListById(watchlistId) {
  try {
    // Check if user cookies exist
    // if (!getUserCookies()) {
    //   return { status: 'error', message: 'User not authenticated.' };
    // }
    
    
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
