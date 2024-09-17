import { db } from "../utils/firebaseinit";
import { doc, getDoc } from "firebase/firestore";
import {
  Constant_Var_error,
  Constant_Var_firebase_collectionName_users,
  Constant_Var_errorMessage_missingParams,
  Constant_Var_success,
  Constant_Var_errorMessage_userDoesNotExistWithThisId,
} from "@/utils/constants";

export default async function GetOtherUserData(userId) {
  try {

    if (!userId) throw new Error(Constant_Var_errorMessage_missingParams);

    const docRef = doc(db, Constant_Var_firebase_collectionName_users, userId);
    const data = await getDoc(docRef);

    if (data.exists()) {
      const userData = data.data();
      return { status: Constant_Var_success, response: userData };
    }

    throw new Error(Constant_Var_errorMessage_userDoesNotExistWithThisId);
  } catch (error) {
    return { status: Constant_Var_error, response: error };
  }
}
