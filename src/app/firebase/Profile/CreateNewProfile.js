import { db } from "../utils/firebaseinit";
import {
  doc,
  writeBatch,
  serverTimestamp,
  collection,
  Timestamp,
} from "firebase/firestore";
import getUserAuth from "../utils/GetUserAuth";
import {
  Constant_Var_error,
  Constant_Var_firebase_collectionName_users,
  Constant_Var_errorMessage_notAuthenticatedUser,
  Constant_Var_errorMessage_profileCreationAlradyUnderProgress,
  Constant_Var_success,
  Constant_Var_firebase_collectionName_watchLists,
  Constant_Var_firebase_fieldValue_private,
  Constant_Array_firebase_profileImageArr,
  starterWatchLists,
} from "@/utils/constants";
import uploadImageToFirebaseStorage from "../utils/UploadImageToFirebaseStorage";
import UserProfileModel from "../DocumentModels/UserProfileModel";
import WatchListModel from "../DocumentModels/WatchListModel";

// Global variable to track if a profile is being created, avoid race condition
let isProfileBeingCreated = false;

export default async function CreateNewProfile() {
  try {
    const userData = await getUserAuth();
    if (!userData)
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);

    if (isProfileBeingCreated)
      throw new Error(
        Constant_Var_errorMessage_profileCreationAlradyUnderProgress
      );

    isProfileBeingCreated = true;

    //Uploading profile Image to firebase storage
    const resp = await uploadImageToFirebaseStorage(
      `/profileImage/${userData.details.uid}${new Date().getTime()}`,
      getRandomProfileImageUrl()
    );

    const coverResp = await uploadImageToFirebaseStorage(
      `/coverImage/${userData.details.uid}${new Date().getTime()}`,
      "/cover_test.png"
    );

    if (resp.status === Constant_Var_error) throw resp.response;
    if (coverResp.status === Constant_Var_error) throw coverResp.response;

    const photoURL = resp.response;
    const coverURL = coverResp.response;

    const batch = writeBatch(db);

    // Creating user profile
    const userProfileDocument = UserProfileModel({
      uid: userData.details.uid,
      name: userData.details.name,
      email: userData.details.email,
      photoURL: photoURL,
      coverURL: coverURL,
    });

    batch.set(
      doc(db, Constant_Var_firebase_collectionName_users, userData.details.uid),
      userProfileDocument
    );

    //Creating default watchlists for User

    const watchLists = starterWatchLists;
    watchLists.forEach((listName) => {
      createWatchListInBatch(
        batch,
        listName,
        Constant_Var_firebase_fieldValue_private,
        userData,
        true
      );
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

async function createWatchListInBatch(
  batch,
  watchListName,
  type,
  userData,
  isSpecialStarter
) {
  const docRef = doc(
    collection(db, Constant_Var_firebase_collectionName_watchLists)
  );

  const watchListDocument = WatchListModel({
    ownerUid: userData.details.uid,
    watchListName: watchListName,
    type: type,
    isSpecialStarter: isSpecialStarter,
    id:docRef.id,
  });

  batch.set(docRef, watchListDocument);
}

function getRandomProfileImageUrl() {
  // Generate a random index between 0 and the length of the array - 1
  const randomIndex = Math.floor(
    Math.random() * Constant_Array_firebase_profileImageArr.length
  );

  // Select the image at the random index
  const selectedImage = Constant_Array_firebase_profileImageArr[randomIndex];

  return selectedImage; // You can return or use this selected image as needed
}
