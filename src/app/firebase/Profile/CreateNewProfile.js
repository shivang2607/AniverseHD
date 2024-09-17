import { db } from "../utils/firebaseinit";
import {
  doc,
  writeBatch,
  serverTimestamp,
  collection,
} from "firebase/firestore";
import getUserAuth from "../utils/GetCurrentUserAuth";
import {
  Constant_Var_error,
  Constant_Var_firebase_collectionName_users,
  Constant_Var_errorMessage_notAuthenticatedUser,
  Constant_Var_errorMessage_profileCreationAlradyUnderProgress,
  Constant_Var_success,
  Constant_Var_firebase_collectionName_watchLists,
  Constant_Var_firebase_fieldValue_private,
} from "@/utils/constants";
import uploadImageToFirebaseStorage from "../utils/UploadImageToFirebaseStorage";

// Global variable to track if a profile is being created, avoid race condition
let isProfileBeingCreated = false;

export default async function CreateNewProfile() {
  try {
    const userData = await getUserAuth();
    if (!userData)
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);

    if (isProfileBeingCreated)
      throw new Error(Constant_Var_errorMessage_profileCreationAlradyUnderProgress);

    isProfileBeingCreated = true;
    //Uploading profile Image to firebase storage
    const resp = await uploadImageToFirebaseStorage(
      `/profileImage/${userData.details.uid}`,
      userData.details.photo
    );

    const coverResp = await uploadImageToFirebaseStorage(
      `/coverImage/${userData.details.uid}`,
      "https://cdn.pixabay.com/photo/2015/08/23/09/22/banner-902589_640.jpg"
    );

    if (resp.status === Constant_Var_error) throw resp.response;
    if (coverResp.status === Constant_Var_error) throw coverResp.response;

    const photoURL = resp.response;
    const coverURL = coverResp.response;

    const batch = writeBatch(db);

    batch.set(
      doc(db, Constant_Var_firebase_collectionName_users, userData.details.uid),
      {
        dateJoined: serverTimestamp(),
        userName: userData.details.name,
        email: userData.details.email,
        photoUrl: photoURL,
        coverUrl: coverURL,
        uid: userData.details.uid,
      }
    );

    const watchLists = [
      "Recent",
      "Dropped",
      "Favourite",
      "On Hold",
      "Plan To Watch",
      "Completed",
    ];
    watchLists.forEach((listName) => {
      createWatchListInBatch(batch, listName, Constant_Var_firebase_fieldValue_private, userData);
    });

    await batch.commit();

    isProfileBeingCreated = false;
    return { status: Constant_Var_success, response: null };
    //do not save watchLists in users collection, only save them in public collection
  } catch (error) {
    isProfileBeingCreated = false;
    return { response: error, status: Constant_Var_error };
  }
}

async function createWatchListInBatch(batch, watchListName, type, userData) {
  const docRef = doc(
    collection(db, Constant_Var_firebase_collectionName_watchLists)
  );
  batch.set(docRef, {
    ownerEmail: userData.details.email,
    ownerUid: userData.details.uid,
    watchListName: watchListName,
    type: type,
    isSpecialRecent: watchListName === "Recent",
    id: docRef.id,
  });
}
