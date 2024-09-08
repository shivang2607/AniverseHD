import { auth, db } from "../firebaseinit";
import { doc, getDoc } from "firebase/firestore";
import Cookies from "js-cookie";

export default async function GetUserData() {
  try {
    // Check if user cookies exist
    if (!getUserCookies()) {
      return { status: 'error', message: 'User not authenticated.' };
    }
  
    const docRef = doc(db, "users", getUserCookies().details.email);

    const data = await getDoc(docRef);

    // Check if the document exists
    if (data.exists()) {
      return { status: 'success', data: data.data() };
    } else {
      return { status: 'error', message: 'No data found for the user.', data:null };
    }
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
