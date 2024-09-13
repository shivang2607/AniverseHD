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
import { errorStr, NotAuthenticatedUser, success } from "@/utils/constants";
import uploadImageToFirebaseStorage from "../utils/UploadImageToFirebaseStorage";

export default async function CreateNewProfile() {
  try {
    const userData = getUserAuth();
    if (!userData) throw new Error(NotAuthenticatedUser);

    //Uploading profile Image to firebase storage
    const resp = await uploadImageToFirebaseStorage(
      userData.details.photo,
      `/profileImage/${userData.details.uid}`
    );

    if (resp.status != success) throw resp.error;

    const photoURL = resp.url;

    const batch = writeBatch(db);

    batch.set(doc(db, "users", userData.details.uid), {
      dateJoined: serverTimestamp(),
      username: userData.details.name,
      email: userData.details.email,
      photoUrl: photoURL,
      uid: userData.details.uid,
    });

    const watchlists = [
      "Recent",
      "Dropped",
      "Favourite",
      "On Hold",
      "Plan To Watch",
      "Completed",
    ];
    watchlists.forEach((listName) => {
      createWatchListInBatch(batch, listName, "private", userData);
    });

    await batch.commit();

    return { status: success };
    //do not save watchlists in users collection, only save them in public collection
  } catch (error) {
    return { error, status: errorStr };
  }
}
async function createWatchListInBatch(batch, watchListName, type, userData) {
  const docRef = doc(collection(db, "watchlists"));
  batch.set(docRef, {
    ownerEmail: userData.details.email,
    ownerUid: userData.details.uid,
    watchListName: watchListName,
    type: type,
    isSpecialRecent: watchListName === "Recent",
    id: docRef.id,
  });
}
