import { signOut } from "firebase/auth";

import { auth } from "../utils/firebaseinit";
import Cookies from "js-cookie";
import { Constant_Var_error } from "@/utils/constants";

export default async function SignOut() {
  try {
    await signOut(auth);
    Cookies.remove("user");
  } catch (error) {
    return { error, status: Constant_Var_error };
  }
}
