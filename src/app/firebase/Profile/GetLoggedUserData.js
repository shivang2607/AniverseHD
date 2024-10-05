import { db } from "../utils/firebaseinit";
import { doc, getDoc } from "firebase/firestore";
import CreateNewProfile from "./CreateNewProfile";
import getUserAuth from "../utils/GetUserAuth";
import { getUserInfoCached, setUserInfoCached } from "../utils/CacheStorage";
import {
  Constant_Var_error,
  Constant_Var_firebase_collectionName_users,
  Constant_Var_errorMessage_notAuthenticatedUser,
  Constant_Var_success,
  Constant_Var_errorMessage_userDoesNotExistWithThisId,
  Constant_Var_errorMessage_loggedInUserDoesNostExistsYet,
} from "@/utils/constants";

/**
 * Retrieves the profile data of the currently logged-in user from Firestore.
 *
 * @returns {Promise<Object>} - A promise that resolves to an object containing:
 *   - `status` {string}: A constant representing the status of the operation. Will be `Constant_Var_success` on success or `Constant_Var_error` on failure.
 *   - `response` {Object|Error}: The user profile data on success, or an error object on failure.
 *
 * @example
 * const result = await GetLoggedUserData();
 * if (result.status === Constant_Var_success) {
 *   console.log('User data:', result.response);
 * } else {
 *   console.error('Error:', result.response);
 * }
 */
export default async function GetLoggedUserData() {
  try {
    const userData = await getUserAuth();
    if (!userData)
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);

    const cachedUserInfo = getUserInfoCached();
    if (cachedUserInfo != null) {
      return { status: Constant_Var_success, response: cachedUserInfo };
    }

    const docRef = doc(
      db,
      Constant_Var_firebase_collectionName_users,
      userData.details.uid
    );
    const data = await getDoc(docRef);

    if (data.exists()) {
      const userData = data.data();
      setUserInfoCached({userData:userData});
      return { status: Constant_Var_success, response: userData };
    }else{
      throw new Error(Constant_Var_errorMessage_loggedInUserDoesNostExistsYet);
    }
  } catch (error) {
    return { status: Constant_Var_error, response: error };
  }
}
