import { auth, db } from "@/app/firebase/utils/firebaseinit";
import {
  doc,
  collection,
  setDoc,
} from "firebase/firestore";
import getUserAuth from "../utils/GetCurrentUserAuth";
import { Constant_Var_error, Constant_Var_errorMessage_missingParams, Constant_Var_errorMessage_notAuthenticatedUser, Constant_Var_success, Constant_Var_firebase_collectionName_watchLists } from "@/utils/constants";
import { addUserWatchlistCached } from "../utils/CacheStorage";

export default async function CreateWatchList(watchListName, type) {
  try {
    // Check if user cookies exist
    if (!watchListName || !type) {
      throw new Error(Constant_Var_errorMessage_missingParams);
    }
    const userData = await getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
    }
    const docRef = doc(collection(db, Constant_Var_firebase_collectionName_watchLists));

    await setDoc(docRef, {
      ownerUid: userData.details.uid,
      watchListName: watchListName,
      type: type,
      isSpecialRecent: false,
      id: docRef.id,
      count:0,
    });

    const watchListInfo = {
      ownerUid: userData.details.uid,
      watchListName: watchListName,
      type: type,
      isSpecialRecent: false,
      id: docRef.id,
      count:0,
    };
    addUserWatchlistCached(watchListInfo,docRef.id,userData.details.uid);
    return { status: Constant_Var_success , response:null};
  } catch (error) {
    return { response: error, status: Constant_Var_error };
  }
}
