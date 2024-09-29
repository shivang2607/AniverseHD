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

export default async function UpdateCoverImage(blob = false, imageUrl = false) {
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
    changeCoverUrlCached(resp.response);
    const respDelete = await DeleteImageFromFirebaseStorage(oldData.coverUrl);

    if (respDelete.status === Constant_Var_error) throw respDelete.response;

    return { status: Constant_Var_success, response: resp.response };
  } catch (error) {
    return { response: error, status: Constant_Var_error };
  }
}
