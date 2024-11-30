import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

import { auth } from "../utils/firebaseinit";
import Cookies from "js-cookie";
import {
  Constant_Var_error,
  Constant_Var_errorMessage_loggedInUserDoesNostExistsYet,
  Constant_Var_success,
} from "@/utils/constants";
import { useRouter } from "next/router";
import CreateNewProfile from "../Profile/CreateNewProfile";
import GetLoggedUserData from "../Profile/GetLoggedUserData";
import GetLoggedUserWatchListsInfo from "../WatchList/WatchListDocument/GetLoggedUserWatchListsInfo";

/**
* SignInGooglePopUp
* 
* Initiates a Google sign-in popup, manages authentication with Firebase, and checks if a user profile exists in the database.
* If the profile does not exist, it initiates profile creation. Status updates are provided throughout the process via a 
* callback function, `statusCallback`.
* 
*@param {Function} [statusCallback] - Optional. A function that receives status updates at different stages of the sign-in process, 
* including:
*  - `"signingIn"`: Sign-in process has started.
*  - `"checkingProfile"`: Checking if the user's profile exists.
*  - `"creatingProfile"`: Creating a new user profile.
*  - `"success"`: Sign-in and profile check (or creation) were successful.
* 
* @returns {Object} - Returns an object indicating the outcome of the sign-in attempt.
*  - {string} status - `Constant_Var_success` or `Constant_Var_error`, indicating whether the operation was successful.
*  - {string|Object} response - If successful, returns the user's `uid`. If an error occurs, returns the error details.
* 
* @throws {Error} - If any step in the sign-in or profile creation/check process fails.
* 
* @example
* SignInGooglePopUp((status) => {
*   console.log(status); // Handle status in the UI, e.g., loading indicators
* });
*/
export default async function SignInGooglePopUp(statusCallback) {
  try {
    const provider = new GoogleAuthProvider();

    provider.setCustomParameters({
      prompt: "select_account",
      auth_type: "reauthenticate",
    });

    // Notify that sign-in has started
    if (statusCallback) statusCallback("signingIn");

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    sessionStorage.clear()
    Cookies.set(
      "user",
      JSON.stringify({
        token: token,
        email: result.user.email,
        name: result.user.displayName,
        photo: result.user.photoURL,
        uid: result.user.uid,
      }),
      { expires: 20 }
    );

    // Notify that profile creation check has started
    if (statusCallback) statusCallback("checkingProfile");

    const checkUser = await CreateProfileIfNotExists((profileStatus) => {
      if (statusCallback) statusCallback(profileStatus);
    });

    if (checkUser.status === Constant_Var_error) {
      throw checkUser.response;
    }

    // Notify sign-in success
    if (statusCallback) statusCallback("success");

    return { status: Constant_Var_success, response: result.user.uid };
  } catch (error) {
    return { response: error, status: Constant_Var_error };
  }
}

async function CreateProfileIfNotExists(statusCallback) {
  try {
    // if (statusCallback) statusCallback("creatingPe");
    const [respUserInfo, respUserWatchLists] = await Promise.all([
      GetLoggedUserData(),
      GetLoggedUserWatchListsInfo(),
    ]);

    if (respUserInfo.status === Constant_Var_success && respUserWatchLists.status === Constant_Var_success) {
      return { status: Constant_Var_success, response: null };
    }

    if (
      respUserInfo.response.message === respUserWatchLists.response.message &&
      respUserWatchLists.response.message === Constant_Var_errorMessage_loggedInUserDoesNostExistsYet
    ) {
      if (statusCallback) statusCallback("creatingProfile");

      const profileCreationResponse = await CreateNewProfile();

      if (profileCreationResponse.status === Constant_Var_success) {
        return { status: Constant_Var_success, response: null };
      } else {
        throw profileCreationResponse.response;
      }
    } else if (respUserInfo.response.message !== Constant_Var_errorMessage_loggedInUserDoesNostExistsYet) {
      throw respUserInfo.response;
    } else {
      throw respUserWatchLists.response;
    }
  } catch (error) {
    return { response: error, status: Constant_Var_error };
  }
}