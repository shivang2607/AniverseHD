import { db } from "../utils/firebaseinit";
import { doc, getDoc } from "firebase/firestore";
import {
  Constant_Var_error,
  Constant_Var_firebase_collectionName_users,
  Constant_Var_errorMessage_missingParams,
  Constant_Var_success,
  Constant_Var_errorMessage_userDoesNotExistWithThisId,
} from "@/utils/constants";

/**
 * Fetches user data from Firestore for a specified user ID.
 *
 * @param {Object} params - The input parameters.
 * @param {string} params.userId - The ID of the user whose data is to be retrieved.
 *
 * @returns {Promise<{status:string,response:any}>} - A promise that resolves to an object containing:
 *   - `status` {string}: A constant representing the status of the operation (success or error).
 *   - `response` {Object|string}: The user data if successful, or an error message if failed.
 *
 * No errors are thrown. All errors are caught and returned in the `response` field with `status:    Constant_Var_error`.
 */
export default async function GetOtherUserData({ userId }) {
  try {
    if (!userId) throw new Error(Constant_Var_errorMessage_missingParams);

    userId=toString(userId);
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
