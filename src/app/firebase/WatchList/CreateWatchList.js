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
import { errorStr, NotAuthenticatedUser, success } from "@/utils/constants";
import { addUserWatchlistCached } from "../utils/SessionStorage";

export default async function CreateWatchList(watchListName, type) {
  try {
    // Check if user cookies exist
    if (!watchListName || !type) {
      throw new Error("Missing Params");
    }
    const userData = getUserAuth();
    if (!userData) {
      throw new Error(NotAuthenticatedUser);
    }
    const docRef = doc(collection(db, "watchLists"));
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
    return { status: success };
  } catch (error) {
    return { error, status: errorStr };
  }
}
