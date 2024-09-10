import { auth, db } from "../firebaseinit";
import { doc,updateDoc } from "firebase/firestore";
import Cookies from "js-cookie";

export default async function UpdateName(userName) {
  try {
    // Check if user cookies exist
    const userData = getUserCookies();
    if (!userData) {
      return { status: "error", message: "User not authenticated." };
    }
    await updateDoc(doc(db, "users", userData.details.email), {
        username: userName,
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
