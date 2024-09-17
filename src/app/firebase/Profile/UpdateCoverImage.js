import getUserAuth from "../utils/GetCurrentUserAuth";
import { Constant_Var_error, Constant_Var_errorMessage_notAuthenticatedUser, Constant_Var_success } from "@/utils/constants";
import uploadImageToFirebaseStorage from "../utils/UploadImageToFirebaseStorage";

export default async function UpdateCoverImage(blob=false, imageUrl=false) {
  try {
    // Check if user cookies exist
    const userData = await getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
    }
    
   const resp= await uploadImageToFirebaseStorage(`/coverImage/${userData.details.uid}`,imageUrl,blob);

   if(resp.status===Constant_Var_error) throw resp.response;

   return { status: Constant_Var_success, response: resp.response };
  } catch (error) {
    return { response: error, status: Constant_Var_error };
  }
}
