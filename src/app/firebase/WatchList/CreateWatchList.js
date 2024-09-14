import { auth, db } from "@/app/firebase/utils/firebaseinit";
import {
  doc,
  getDoc,
  writeBatch,
  collection,
  addDoc,
  setDoc,
} from "firebase/firestore";
import getUserAuth from "../utils/GetCurrentUserAuth";
import { Constant_Var_error, Constant_Var_NotAuthenticatedUser, Constant_Var_success, Constant_Var_watchListsFirestoreCollection } from "@/utils/constants";
import { addUserWatchlistCached } from "../utils/SessionStorage";

export default async function CreateWatchList(watchListName, type) {
  try {
    // Check if user cookies exist
    if (!watchListName || !type) {
      throw new Error("Missing Params");
    }
    const userData = getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_NotAuthenticatedUser);
    }
    const docRef = doc(collection(db, Constant_Var_watchListsFirestoreCollection));
    await setDoc(docRef, {
      ownerEmail: userData.details.email,
      ownerUid: userData.details.uid,
      watchListName: watchListName,
      type: type,
      isSpecialRecent: false,
      id: docRef.id,
    });
    const watchList = {
      ownerEmail: userData.details.email,
      ownerUid: userData.details.uid,
      watchListName: watchListName,
      type: type,
      isSpecialRecent: false,
      id: docRef.id,
      animeList: [],
    };
    addUserWatchlistCached(watchList);
    return { status: Constant_Var_success };
  } catch (error) {
    return { error, status: Constant_Var_error };
  }
}
