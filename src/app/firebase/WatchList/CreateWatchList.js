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

export default async function CreateWatchList(watchlistName, type) {
  try {
    // Check if user cookies exist
    if (!watchlistName || !type) {
      throw new Error("Missing Params");
    }
    const userData = getUserAuth();
    if (!userData) {
      throw new Error(NotAuthenticatedUser);
    }
    const docRef = doc(collection(db, "watchlists"));
    await setDoc(docRef, {
      ownerEmail: userData.details.email,
      ownerUid: userData.details.uid,
      watchListName: watchlistName,
      type: type,
      isSpecialRecent: false,
      id: docRef.id,
    });

    return { status: success };
  } catch (error) {
    return { error, status: errorStr };
  }
}
