import { ref, uploadBytes } from "firebase/storage";
import getUserAuth from "../utils/GetUserAuth";
import {
  Constant_Var_error,
  Constant_Var_errorMessage_notAuthenticatedUser,
  Constant_Var_firebase_collectionName_users,
  Constant_Var_success,
} from "@/utils/constants";
import uploadImageToFirebaseStorage from "../utils/UploadImageToFirebaseStorage";
import { doc, Timestamp, updateDoc } from "firebase/firestore";
import { changePhotoUrlCached, getUserInfoCached } from "../utils/CacheStorage";
import { db } from "../utils/firebaseinit";
import DeleteImageFromFirebaseStorage from "../utils/DeleteImageFromFirebaseStorage";


/**
 * Updates the authenticated user's profile image by uploading a new image to Firebase Storage,
 * updating the Firestore user document with the new image URL, and deleting the old image from storage.
 *
 * @param {Object} params - The input parameters.
 * @param {Blob|boolean} [params.blob=false] - The new profile image file as a Blob. Defaults to false if not provided.
 * @param {string|boolean} [params.imageUrl=false] - The URL or path of the new profile image. Defaults to false if not provided.
 *
 * @returns {Promise<{status:string,response:any}>} - A promise that resolves to an object containing:
 *   - `status` {string}: A constant representing the status of the operation. Will be `Constant_Var_success` on success, or `Constant_Var_error` on failure.
 *   - `response` {string|Error}: The new profile image URL if successful, or an error message if failed.
 *
 * No errors are thrown. All errors are caught and returned in the `response` field with `status: Constant_Var_error`.
 */
export default async function UpdateProfileImage({
  blob = false,
  imageUrl = false
}) {
  try {
    validateParams({ blob:blob, imageUrl:imageUrl });
    
    // Check if user cookies exist
    const userData = await getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
    }

    const resp = await uploadImageToFirebaseStorage(
      `/profileImage/${userData.details.uid}${new Date().getTime()}`,
      imageUrl,
      blob
    );
    if (resp.status === Constant_Var_error) throw resp.response;

    await updateDoc(
      doc(db, Constant_Var_firebase_collectionName_users, userData.details.uid),
      {
        photoUrl: resp.response,
      }
    );

    const oldData=getUserInfoCached();
    changePhotoUrlCached({photoUrl:resp.response});
    const respDelete = await DeleteImageFromFirebaseStorage(oldData.photoUrl);

    if(respDelete.status===Constant_Var_error) throw respDelete.response;

    return { status: Constant_Var_success, response: resp.response };
  } catch (error) {
    return { response: error, status: Constant_Var_error };
  }
}

function validateParams({ blob, imageUrl }) {
  if (!blob && !imageUrl) {
    throw new Error("Either 'blob' or 'imageUrl' must be provided");
  }

  if (blob && !(blob instanceof Blob) && !(blob instanceof File && blob.type.startsWith('image/'))) {
    throw new Error("'blob' must be a Blob or an image file");
  }

  if (imageUrl && typeof imageUrl !== 'string') {
    throw new Error("'imageUrl' must be a string");
  }
}