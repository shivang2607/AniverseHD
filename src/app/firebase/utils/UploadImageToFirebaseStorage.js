import { Constant_Var_error, Constant_Var_success } from "@/utils/constants";
import createBlobFromImageUrl  from "@/utils/CreateBlobFromImageUrl";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "./firebaseinit";

export default async function uploadImageToFirebaseStorage(imageUrl, path) {
    try {
      const resp = await createBlobFromImageUrl(imageUrl);
  
      if (resp.status != Constant_Var_success) throw resp.error;
  
      const imagePathRef = ref(storage, path);
      const snap = await uploadBytes(imagePathRef, resp.blob);
      const urlResp = await getDownloadURL(snap.ref);
      // You now have a Blob object you can use (e.g., upload, download, etc.)
      return { status: Constant_Var_success, url: urlResp };
    } catch (error) {
      return { error, status: Constant_Var_error };
    }
  }