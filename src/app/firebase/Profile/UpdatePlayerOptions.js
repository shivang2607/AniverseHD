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
 * Updates the user's play options (e.g., autoPlay, autoSkipIntro, autoNext) in Firebase Firestore and cache 
 * based on the provided `playerOptions` object.
 * 
 * This function performs the following operations:
 * 1. Validates the input `playerOptions` object for the fields `autoPlay`, `autoSkipIntro`, and `autoNext`.
 * 2. Retrieves the authenticated user's details from cookies.
 * 3. Updates the user's play options in the Firebase Firestore database under the `playerOptions` field.
 * 4. Caches the updated play options locally using the `changeUserPlayOptionsCached` utility function.
 * 
 * @param {Object} playerOptions - The play options to update.
 * @param {boolean|null} playerOptions.autoPlay - Whether autoplay is enabled (or `null` to leave unchanged).
 * @param {boolean|null} playerOptions.autoSkipIntro - Whether skip intro is enabled (or `null` to leave unchanged).
 * @param {boolean|null} playerOptions.autoNext - Whether autoplay next episode is enabled (or `null` to leave unchanged).
 * 
 * @returns {Object} - The result of the operation.
 * @returns {string} status - The status of the update operation ('success' or 'error').
 * @returns {Object|null} response - The error object in case of failure, or `null` on success.
 * 
 * @throws {Error} - Throws an error if the user is not authenticated or if validation fails for the input parameters.
 * 
 * Usage:
 * ```
 * const playerOptions = {
 *   autoPlay: true,
 *   autoSkipIntro: null,
 *   autoNext: false,
 * };
 * 
 * const result = await UpdatePlayerOptions(playerOptions);
 * 
 * if (result.status === 'success') {
 *   console.log('Play options updated successfully.');
 * } else {
 *   console.error('Failed to update play options:', result.response);
 * }
 * ```
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
