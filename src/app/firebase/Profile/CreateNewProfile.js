import { auth, db, storage } from "../firebaseinit";
import { doc, getDoc, setDoc, writeBatch } from "firebase/firestore";
import Cookies from "js-cookie";

async function CreateNewProfile() {
  try{
    const userData = getUserCookies();
    if(!userData)  return { status: 'error', message: 'User not authenticated.' };
  
    //Uploading profile Image to firebase storage
    const photoURL = uploadImageToStorage(userData.details.photoURL);
  
    const batch = writeBatch(db);
    await setDoc(doc(db, "users", userData.details.email), {
      dateJoined: serverTimestamp(),
      username: userData.detailsdisplayName,
      email: userData.detailsemail,
      photoUrl: photoURL,
    });
  
    //do not save watchlists in users collection, only save them in public collection
  }catch(error){
    return { status: 'error', message: error.message, error };
  }
 

}

async function uploadImageToStorage(url) {
  const blob = await createBlobFromImageUrl(url);
  const imagePathRef = ref(storage, `/profileImage/${userData.details.email}`);
  const snap = await uploadBytes(imagePathRef, blob);
  const urlResp = await getDownloadURL(snap.ref);

  return urlResp;
}

function getUserCookies() {
  const user = Cookies.get("user");
  if (user) {
    const details = JSON.parse(user);
    return { details };
  }
  return false;
}

async function createBlobFromImageUrl(imageUrl) {
  try {
    // Fetch the image from the URL
    const response = await fetch(imageUrl);

    // Convert the response to a Blob
    const blob = await response.blob();

    // You now have a Blob object you can use (e.g., upload, download, etc.)
    return blob;
  } catch (error) {
    console.error("Error creating Blob from image URL:", error);
    throw error;
  }
}

export default CreateNewProfile;
