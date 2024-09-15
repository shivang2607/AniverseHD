import { ref, uploadBytes} from "firebase/storage";
import getUserAuth from "../utils/GetCurrentUserAuth";
import { Constant_Var_error, Constant_Var_NotAuthenticatedUser, Constant_Var_success } from "@/utils/constants";
import { storage } from "../utils/firebaseinit";

export default async function UpdateCoverImage(blob) {
  try {
    // Check if user cookies exist
    const userData = getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_NotAuthenticatedUser);
    }
    const imagePathRef = ref(storage, `/coverImage/${userData.details.uid}`);
           await uploadBytes(imagePathRef, blob);

    return { status: Constant_Var_success, response: null };
  } catch (error) {
    return { response: error, status: Constant_Var_error };
  }
}
