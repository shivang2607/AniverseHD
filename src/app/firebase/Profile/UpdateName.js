import {db } from "../utils/firebaseinit";
import { doc, updateDoc } from "firebase/firestore";
import getUserAuth from "../utils/GetUserAuth";
import { Constant_Var_error, Constant_Var_firebase_collectionName_users, Constant_Var_errorMessage_notAuthenticatedUser, Constant_Var_success } from "@/utils/constants";
import { changeUserNameCached } from "../utils/CacheStorage";

export default async function UpdateName(userName) {
  try {
    // Check if user cookies exist
    const userData = await getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
    }
    await updateDoc(doc(db, Constant_Var_firebase_collectionName_users, userData.details.uid), {
      userName: userName,
    });
    changeUserNameCached({userName:userName});
    
    return { status: Constant_Var_success, response: null };
  } catch (error) {
    return { response: error, status: Constant_Var_error };
  }
}
