import getUserAuth from "../utils/GetUserAuth";
import {
  Constant_Var_error,
  Constant_Var_errorMessage_notAuthenticatedUser,
  Constant_Var_firebase_collectionName_users,
  Constant_Var_success,
} from "@/utils/constants";
import uploadImageToFirebaseStorage from "../utils/UploadImageToFirebaseStorage";
import { doc, updateDoc } from "firebase/firestore";
import { changeCoverUrlCached, getUserInfoCached } from "../utils/CacheStorage";
import DeleteImageFromFirebaseStorage from "../utils/DeleteImageFromFirebaseStorage";
import { db } from "../utils/firebaseinit";


/**
 * Updates the cover image for the authenticated user by uploading a new image to Firebase Storage,
 * updating the Firestore user document, and deleting the old cover image from storage.
 *
 * @param {Object} params - The input parameters.
 * @param {Blob|boolean} [params.blob=false] - The new cover image file as a Blob. Defaults to false if not provided.
 * @param {string|boolean} [params.imageUrl=false] - The URL or path of the new cover image. Defaults to false if not provided.
 *
 * @returns {Promise<Object>} - A promise that resolves to an object containing:
 *   - `status` {string}: A constant representing the status of the operation. Will be `Constant_Var_success` on success, or `Constant_Var_error` on failure.
 *   - `response` {string|Error}: The new cover image URL if successful, or an error message if failed.
 *
 * No errors are thrown. All errors are caught and returned in the `response` field with `status: Constant_Var_error`.
 */

export default async function UpdateCoverImage({blob = false, imageUrl = false}) {
  try {
    // Check if user cookies exist
    const userData = await getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
    }

    const resp = await uploadImageToFirebaseStorage(
      `/coverImage/${userData.details.uid}${new Date().getTime()}`,
      imageUrl,
      blob
    );

    if (resp.status === Constant_Var_error) throw resp.response;

    await updateDoc(
      doc(db, Constant_Var_firebase_collectionName_users, userData.details.uid),
      {
        coverUrl: resp.response,
      }
    );

    const oldData = getUserInfoCached();
    changeCoverUrlCached({coverUrl:resp.response});
    const respDelete = await DeleteImageFromFirebaseStorage(oldData.coverUrl);

    if (respDelete.status === Constant_Var_error) throw respDelete.response;

    return { status: Constant_Var_success, response: resp.response };
  } catch (error) {
    return { response: error, status: Constant_Var_error };
  }
}
