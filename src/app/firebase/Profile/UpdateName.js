import { db } from "../utils/firebaseinit";
import { doc, updateDoc } from "firebase/firestore";
import getUserAuth from "../utils/GetUserAuth";
import {
  Constant_Var_error,
  Constant_Var_firebase_collectionName_users,
  Constant_Var_errorMessage_notAuthenticatedUser,
  Constant_Var_success,
} from "@/utils/constants";
import { changeUserNameCached } from "../utils/CacheStorage";

/**
 * Updates the authenticated user's name in Firestore and updates the cached name.
 *
 * @param {Object} params - The input parameters.
 * @param {string} params.userName - The new name to be updated for the user.
 *
 * @returns {Promise<{status:string,response:any}>} - A promise that resolves to an object containing:
 *   - `status` {string}: A constant representing the status of the operation. Will be `Constant_Var_success` on success, or `Constant_Var_error` on failure.
 *   - `response` {null|Error}: `null` if successful, or an error message if failed.
 *
 * No errors are thrown. All errors are caught and returned in the `response` field with `status: Constant_Var_error`.
 */
export default async function UpdateName({ userName }) {
  try {
    // Check if user cookies exist
    const userData = await getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
    }
    await updateDoc(
      doc(db, Constant_Var_firebase_collectionName_users, userData.details.uid),
      {
        userName: userName,
      }
    );
    changeUserNameCached({ userName: userName });

    return { status: Constant_Var_success, response: null };
  } catch (error) {
    return { response: error, status: Constant_Var_error };
  }
}
