import { db } from "../utils/firebaseinit";
import { doc, getDoc } from "firebase/firestore";
import {CreateNewProfile} from "./CreateNewProfile";
import getUserAuth from "../utils/GetCurrentUserAuth";
import { getUserInfoCached, setUserInfoCached } from "../utils/SessionStorage";
import { errorStr, NotAuthenticatedUser, success } from "@/utils/constants";

export default async function GetUserData() {
  try {
    // Check if user cookies exist
    const userData = getUserAuth();
    if (!userData) throw new Error(NotAuthenticatedUser);

    const cachedUserInfo=getUserInfoCached();
    if(cachedUserInfo!=null) return { status: success, data: cachedUserInfo };

    const docRef = doc(db, "users", userData.details.uid);

    const data = await getDoc(docRef);

    // Check if the document exists
    if (data.exists()) {
      setUserInfoCached(data.data());
      return { status: success, data: data.data() };
    } else {
      const resp = await CreateNewProfile();
      if (resp && resp.status != success) throw resp.error;

      return await GetUserData();
    }
  } catch (error) {
    return { error, status: errorStr };
  }
}
