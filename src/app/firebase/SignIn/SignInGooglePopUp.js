import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import { auth } from "../utils/firebaseinit";
import Cookies from "js-cookie";
import { Constant_Var_error } from "@/utils/constants";
import { useRouter } from "next/router";

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

    const router=useRouter();
    router.push('/profile');
    // window.location.reload();
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    const credential = GoogleAuthProvider.credentialFromError(error);
    return { error, status: Constant_Var_error};
  }
}
