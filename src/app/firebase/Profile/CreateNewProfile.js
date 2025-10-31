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
  Constant_Var_firebase_fieldValue_public,
  Constant_Var_starterWatchLists_recent,
} from "@/utils/constants";
import uploadImageToFirebaseStorage from "../utils/UploadImageToFirebaseStorage";
import UserProfileModel from "../DocumentModels/UserProfileModel";
import WatchListModel from "../DocumentModels/WatchListModel";


/**
 * Global flag to prevent multiple profile creations at the same time.
 * This avoids race conditions where multiple profiles might be created simultaneously.
 */
let isProfileBeingCreated = false;

/**
 * Creates a new user profile and default watchlists in Firestore. This function also uploads a profile image and cover image to Firebase Storage.
 *
 * @returns {Promise<{status:string,response:any}>} - A promise that resolves to an object containing:
 *   - `status` {string}: A constant representing the status of the operation. Will be `Constant_Var_success` on success or `Constant_Var_error` on failure.
 *   - `response` {null|Error}: Returns `null` on success, or an error object on failure.
 *
 * @example
 * const result = await CreateNewProfile();
 * if (result.status === Constant_Var_success) {
 *   console.log('Profile created successfully');
 * } else {
 *   console.error('Error:', result.response);
 * }
 */
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
      `/profileImage/${userData.details.uid}/${new Date().getTime()}`,
      getRandomProfileImageUrl()
    );

    const coverResp = await uploadImageToFirebaseStorage(
      `/coverImage/${userData.details.uid}/${new Date().getTime()}`,
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
      if(listName!==Constant_Var_starterWatchLists_recent){
        createWatchListInBatch(
          batch,
          listName,
          Constant_Var_firebase_fieldValue_public,
          userData,
          true
        );
      }else{
        createWatchListInBatch(
          batch,
          listName,
          Constant_Var_firebase_fieldValue_private,
          userData,
          true
        );
      }
    });

    await batch.commit();

    await fetch('/api/v1/users-cloudflare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.details.uid,
          userName: userData.details.name,
          userProfileUrl: photoURL,
          userBannerUrl: coverURL,
          email: userData.details.email
        }),
    });

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
    ownerName:userData.details.name,
    watchListName: watchListName,
    type: type,
    isSpecialStarter: isSpecialStarter,
    id: docRef.id,
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
