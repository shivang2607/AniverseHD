import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import getUserAuth from "../utils/GetCurrentUserAuth";
import { errorStr, NotAuthenticatedUser, success } from "@/utils/constants";

export default async function UpdateImage(blob) {
  try {
    // Check if user cookies exist
    const userData = getUserAuth();
    if (!userData) {
      throw new Error(NotAuthenticatedUser);
    }
    const imagePathRef = ref(storage, `/profileImage/${userData.details.uid}`);
    const snap = await uploadBytes(imagePathRef, blob);

    return { status: success };
  } catch (error) {
    return { error, status: errorStr };
  }
}
