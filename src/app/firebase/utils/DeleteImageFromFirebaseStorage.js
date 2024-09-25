import { ref, deleteObject } from "firebase/storage";
import { storage } from "./firebaseinit";
import {
  Constant_Var_error,
  Constant_Var_errorMessage_missingParams,
  Constant_Var_success,
} from "@/utils/constants";

export default async function DeleteImageFromFirebaseStorage(imageUrl) {
  try {
    // Ensure the imageUrl is provided
    if (!imageUrl) {
      throw new Error(Constant_Var_errorMessage_missingParams);
    }

    // Extract the path from the download URL
    const decodedUrl = decodeURIComponent(imageUrl);
    const filePath = decodedUrl
      .split('/o/')[1]  // Get the part after '/o/'
      .split('?')[0];   // Remove the query parameters

    // Create a reference to the file to delete using the extracted path
    const oldImageRef = ref(storage, filePath);

    // Delete the file
    await deleteObject(oldImageRef);

    return { status: Constant_Var_success, response: null };
  } catch (error) {
    // Return error response
    return { status: Constant_Var_error, response: error };
  }
}
