import { db } from "../utils/firebaseinit";
import { doc, getDoc } from "firebase/firestore";
import CreateNewProfile from "./CreateNewProfile";
import getUserAuth from "../utils/GetCurrentUserAuth";
import { getUserInfoCached, setUserInfoCached } from "../utils/CacheStorage";
import {
  Constant_Var_error,
  Constant_Var_firebase_collectionName_users,
  Constant_Var_errorMessage_notAuthenticatedUser,
  Constant_Var_success,
} from "@/utils/constants";

export default async function GetLoggedUserData() {
  try {
    const userData = await getUserAuth();
    if (!userData)
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);

    const cachedUserInfo = getUserInfoCached();
    if (cachedUserInfo != null) {
      return { status: Constant_Var_success, response: cachedUserInfo };
    }

    const docRef = doc(
      db,
      Constant_Var_firebase_collectionName_users,
      userData.details.uid
    );
    const data = await getDoc(docRef);

    if (data.exists()) {
      const userData = data.data();
      setUserInfoCached(userData);
      return { status: Constant_Var_success, response: userData };
    }

    const resp = await CreateNewProfile();
    if (resp.status !== Constant_Var_success) throw resp.response;

    return await GetLoggedUserData();
  } catch (error) {
    return { status: Constant_Var_error, response: error };
  }
}
