import {
  Constant_Var_error,
  Constant_Var_errorMessage_missingParams,
  Constant_Var_success,
} from "@/utils/constants";
import createBlobFromImageUrl from "@/utils/CreateBlobFromImageUrl";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "./firebaseinit";

export default async function uploadImageToFirebaseStorage(
  path,
  imageUrl = false,
  blob = false
) {
  try {
    // return { status: Constant_Var_success, response: "https://firebasestorage.googleapis.com/v0/b/aniversehd.appspot.com/o/profileImage%2F1AcugKbSXpYblJS3NnVyXGxbuC621734840841572?alt=media&token=029ca725-8447-479a-beb4-56481af3be29" };
    // // Ensure either imageUrl or blob is provided
    if (!imageUrl && !blob) {
      throw new Error(Constant_Var_errorMessage_missingParams);
    }

    const imagePathRef = ref(storage, path);

    // Handle Blob upload
    if (blob) {
      const snap = await uploadBytes(imagePathRef, blob);
      const downloadURL = await getDownloadURL(snap.ref);
      return { status: Constant_Var_success, response: downloadURL };
    }

    // Handle imageUrl upload
    if (imageUrl) {
      const resp = await createBlobFromImageUrl(imageUrl);

      // Check if blob creation was successful
      if (resp.status !== Constant_Var_success) throw resp.response;
      
      const snap = await uploadBytes(imagePathRef, resp.response);
      const downloadURL = await getDownloadURL(snap.ref);
      return { status: Constant_Var_success, response: downloadURL };
    }
  } catch (error) {
    // Return error response
    return { status: Constant_Var_error, response: error };
  }
}
