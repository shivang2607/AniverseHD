import { db } from "../utils/firebaseinit";
import { doc, updateDoc } from "firebase/firestore";
import getUserAuth from "../utils/GetUserAuth";
import {
  Constant_Var_error,
  Constant_Var_firebase_collectionName_users,
  Constant_Var_errorMessage_notAuthenticatedUser,
  Constant_Var_success,
} from "@/utils/constants";
import { changeUserNameCached, changeUserPlayOptionsCached } from "../utils/CacheStorage";

/**
 * Updates the user's play options (autoPlay, autoSkipIntro, autoNext) in Firebase Firestore and cache.
 * 
 * This function performs the following operations:
 * 1. Validates the input parameters for autoPlay, autoSkipIntro, and autoNext.
 * 2. Checks if the user is authenticated by verifying the user data from cookies.
 * 3. Prepares the data object with the provided play options (autoPlay, autoSkipIntro, autoNext).
 * 4. Updates the user's play options in the Firebase Firestore database.
 * 5. Caches the updated play options using the `changeUserPlayOptionsCached` function.
 * 
 * @param {Object} options - The play options to update.
 * @param {boolean|null} options.autoPlay - Whether autoplay is enabled (or null if unchanged).
 * @param {boolean|null} options.autoSkipIntro - Whether skip intro is enabled (or null if unchanged).
 * @param {boolean|null} options.autoNext - Whether autoplay next episode is enabled (or null if unchanged).
 * 
 * @returns {Object} - The result of the operation.
 * @returns {string} status - The status of the update operation ('success' or 'error').
 * @returns {Object|null} response - The response or error message.
 * 
 * @throws {Error} If the user is not authenticated.
 */
export default async function UpdatePlayerOptions(playerOptions) {
  try {
    validateParams(playerOptions);
    // Check if user cookies exist
    const userData = await getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
    }
    
    await updateDoc(
          doc(db, Constant_Var_firebase_collectionName_users, userData.details.uid),
          {
            playerOptions:playerOptions
          }
    );
      

    changeUserPlayOptionsCached({playerOptions:playerOptions});
    
    return { status: Constant_Var_success, response: null };
  } catch (error) {
    return { response: error, status: Constant_Var_error };
  }
};


function validateParams({ autoPlay,autoSkipIntro,autoNext }) {
    if (autoPlay !== null && typeof autoPlay !== 'boolean') {
        throw new Error("Invalid value for autoPlay. It must be a boolean or null.");
      }
      if (autoSkipIntro !== null && typeof autoSkipIntro !== 'boolean') {
        throw new Error("Invalid value for autoSkipIntro. It must be a boolean or null.");
      }
      if (autoNext !== null && typeof autoNext !== 'boolean') {
        throw new Error("Invalid value for autoNext. It must be a boolean or null.");
      }
}
