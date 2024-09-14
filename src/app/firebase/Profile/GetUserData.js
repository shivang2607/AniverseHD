import { db } from "../utils/firebaseinit";
import { doc, getDoc } from "firebase/firestore";
import CreateNewProfile from "./CreateNewProfile";
import getUserAuth from "../utils/GetCurrentUserAuth";
import { getUserInfoCached, setUserInfoCached } from "../utils/SessionStorage";
import { Constant_Var_error, Constant_Var_firestoreUsers, Constant_Var_NotAuthenticatedUser,Constant_Var_success } from "@/utils/constants";

export default async function GetUserData() {
  try {
    // Check if user cookies exist
    const userData = getUserAuth();
    if (!userData) throw new Error(Constant_Var_NotAuthenticatedUser);

    const cachedUserInfo=getUserInfoCached();
    if(cachedUserInfo!=null) return { status: Constant_Var_success, data: cachedUserInfo };

    const docRef = doc(db, Constant_Var_firestoreUsers, userData.details.uid);

    const data = await getDoc(docRef);

    // Check if the document exists
    if (data.exists()) {
      setUserInfoCached(data.data());
      return { status: Constant_Var_success, data: data.data() };
    } else {
      const resp = await CreateNewProfile();
      if (resp && resp.status != Constant_Var_success) throw resp.error;

      return await GetUserData();
    }
  } catch (error) {
    return { error, status: Constant_Var_error };
  }
}
