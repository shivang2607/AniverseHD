import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import { auth } from "../firebaseinit";
import Cookies from "js-cookie";
import GetUserData from "../Profile/GetUserData";

export default async function SignInGooglePopUp() {
  try {
    const provider = new GoogleAuthProvider();

    provider.setCustomParameters({
      prompt: "select_account",
      auth_type: "reauthenticate",
    });

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;

    Cookies.set(
      "user",
      JSON.stringify({
        token: token,
        email: result.user.email,
        name: result.user.displayName,
        photo: result.user.photoURL,
      }),
      { expires: 20 }
    );
    // window.location.reload();

  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    const credential = GoogleAuthProvider.credentialFromError(error);
    return { status: 'error', message: error.message, error };
  }
}
