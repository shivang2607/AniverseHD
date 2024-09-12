import { auth, db, storage } from "../utils/firebaseinit";
import {
  doc,
  getDoc,
  setDoc,
  writeBatch,
  serverTimestamp,
  collection,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Cookies from "js-cookie";
import getUserAuth from "../utils/GetCurrentUserAuth";
import { createBlobFromImageUrl } from "../../../utils/CreateBlobFromImageUrl";
import { errorStr, NotAuthenticatedUser, success } from "@/utils/constants";
class customError extends Error {
  constructor(message, response = null) {
    super(message); // Call the parent class constructor to set the message
    if (response != null) this.response = response; // Add the custom property (response)
  }
}
export default async function CreateNewProfile() {
  try {
    const userData = getUserAuth();
    if (!userData) throw new Error(NotAuthenticatedUser);

    //Uploading profile Image to firebase storage
    const resp = await uploadImageToStorage(userData.details.photo);

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
async function uploadImageToStorage(imageUrl) {
  try {
    const resp = await createBlobFromImageUrl(imageUrl);

    if (resp.status != success) throw resp.error;

    const imagePathRef = ref(storage, `/profileImage/${userData.details.uid}`);
    const snap = await uploadBytes(imagePathRef, resp.blob);
    const urlResp = await getDownloadURL(snap.ref);
    // You now have a Blob object you can use (e.g., upload, download, etc.)
    return { status: success, url: urlResp };
  } catch (error) {
    return { error, status: errorStr };
  }
}

