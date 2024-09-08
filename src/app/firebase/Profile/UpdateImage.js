import { auth, db } from "../firebaseinit";
import { doc, getDoc } from "firebase/firestore";
import Cookies from "js-cookie";

export default async function UpdateImage(blob) {
  try {
    // Check if user cookies exist
    if (!getUserCookies()) {
      return { status: "error", message: "User not authenticated." };
    }
    const imagePathRef = ref(
      storage,
      `/profileImage/${userData.details.email}`
    );
    const snap = await uploadBytes(imagePathRef, blob);
    const url = await getDownloadURL(snap.ref);

    return { status: "success", url:url};
  } catch (error) {
    return { status: "error", message: error.message, error };
  }
}

function getUserCookies() {
  const user = Cookies.get("user");
  if (user) {
    const details = JSON.parse(user);
    return { details };
  }
  return false;
}
