import { signOut } from "firebase/auth";

import { auth } from "../utils/firebaseinit";
import Cookies from "js-cookie";
import { Constant_Var_error, Constant_Var_success } from "@/utils/constants";

export default async function SignOut() {
  try {
    await signOut(auth);
    ClearSessionandCookies();

    // window.location.reload();
    return {status:Constant_Var_success, response:null};
  } catch (error) {
    return { response: error, status: Constant_Var_error };
  }
}

export function ClearSessionandCookies(){
    Cookies.remove("user");
    sessionStorage.clear();
}
