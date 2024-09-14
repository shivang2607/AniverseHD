import { auth, db } from "../utils/firebaseinit";
import { doc, updateDoc } from "firebase/firestore";
import getUserAuth from "../utils/GetCurrentUserAuth";
import { Constant_Var_error, Constant_Var_firestoreUsers, Constant_Var_NotAuthenticatedUser, Constant_Var_success } from "@/utils/constants";

export default async function UpdateName(userName) {
  try {
    // Check if user cookies exist
    const userData = getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_NotAuthenticatedUser);
    }
    await updateDoc(doc(db, Constant_Var_firestoreUsers, userData.details.uid), {
      username: userName,
    });

    return { status: Constant_Var_success };
  } catch (error) {
    return { error, status: Constant_Var_error };
  }
}
