import { auth, db, storage } from "../utils/firebaseinit";
import {
  doc,
  getDoc,
  setDoc,
  writeBatch,
  serverTimestamp,
  collection,
} from "firebase/firestore";
import getUserAuth from "../utils/GetCurrentUserAuth";
import { Constant_Var_error, Constant_Var_firestoreUsers, Constant_Var_NotAuthenticatedUser,Constant_Var_success, Constant_Var_watchListsFirestoreCollection} from "@/utils/constants";
import uploadImageToFirebaseStorage from "../utils/UploadImageToFirebaseStorage";

export default async function CreateNewProfile() {
  try {
    const userData = getUserAuth();
    if (!userData) throw new Error(Constant_Var_NotAuthenticatedUser);

    //Uploading profile Image to firebase storage
    const resp = await uploadImageToFirebaseStorage(
      userData.details.photo,
      `/profileImage/${userData.details.uid}`
    );

    if (resp.status != Constant_Var_success) throw resp.error;

    const photoURL = resp.url;

    const batch = writeBatch(db);

    batch.set(doc(db, Constant_Var_firestoreUsers, userData.details.uid), {
      dateJoined: serverTimestamp(),
      userName: userData.details.name,
      email: userData.details.email,
      photoUrl: photoURL,
      uid: userData.details.uid,
    });

    const watchLists = [
      "Recent",
      "Dropped",
      "Favourite",
      "On Hold",
      "Plan To Watch",
      "Completed",
    ];
    watchLists.forEach((listName) => {
      createWatchListInBatch(batch, listName, "private", userData);
    });

    await batch.commit();

    return { status: Constant_Var_success };
    //do not save watchLists in users collection, only save them in public collection
  } catch (error) {
    return { error, status: Constant_Var_error };
  }
}
async function createWatchListInBatch(batch, watchListName, type, userData) {
  const docRef = doc(collection(db, Constant_Var_watchListsFirestoreCollection));
  batch.set(docRef, {
    ownerEmail: userData.details.email,
    ownerUid: userData.details.uid,
    watchListName: watchListName,
    type: type,
    isSpecialRecent: watchListName === "Recent",
    id: docRef.id,
  });
}
