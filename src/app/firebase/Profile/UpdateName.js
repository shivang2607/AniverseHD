import { auth, db } from "../utils/firebaseinit";
import { doc, updateDoc } from "firebase/firestore";
import getUserAuth from "../utils/GetCurrentUserAuth";
import { errorStr, NotAuthenticatedUser, success } from "@/utils/constants";

export default async function UpdateName(userName) {
  try {
    // Check if user cookies exist
    const userData = getUserAuth();
    if (!userData) {
      throw new Error(NotAuthenticatedUser);
    }
    await updateDoc(doc(db, "users", userData.details.uid), {
      username: userName,
    });

    return { status: success };
  } catch (error) {
    return { error, status: errorStr };
  }
}
