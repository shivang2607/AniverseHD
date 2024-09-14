import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import getUserAuth from "../utils/GetCurrentUserAuth";
import { Constant_Var_error, Constant_Var_NotAuthenticatedUser, Constant_Var_success } from "@/utils/constants";
import { storage } from "../utils/firebaseinit";

export default async function UpdateImage(blob) {
  try {
    // Check if user cookies exist
    const userData = getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_NotAuthenticatedUser);
    }
    const imagePathRef = ref(storage, `/profileImage/${userData.details.uid}`);
    const snap = await uploadBytes(imagePathRef, blob);

    return { status: Constant_Var_success };
  } catch (error) {
    return { error, status: Constant_Var_error };
  }
}
