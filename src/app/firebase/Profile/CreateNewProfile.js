import { auth, db, storage } from "../firebaseinit";
import { doc, getDoc, setDoc, writeBatch, serverTimestamp,collection } from "firebase/firestore";
import {ref,uploadBytes ,getDownloadURL} from "firebase/storage";
import Cookies from "js-cookie";

async function CreateNewProfile() {
  try{
    const userData = getUserCookies();
    if(!userData)  return { status: 'error', message: 'User not authenticated.' };
  
    //Uploading profile Image to firebase storage
    // const photoURL = uploadImageToStorage();
  
    const batch = writeBatch(db);
    batch.set(doc(db, "users", userData.details.email), {
      dateJoined: serverTimestamp(),
      username: userData.details.name,
      email: userData.details.email,
      // photoUrl: photoURL,
    });

    createWatchList(batch,"Recent","private");
    createWatchList(batch,"Dropped","private");
    createWatchList(batch,"Favourite","private");
    createWatchList(batch,"On Hold","private");
    createWatchList(batch,"Plan To Watch","private");
    createWatchList(batch,"Completed","private");
    
    await batch.commit();

    return {status: 'success'};
    //do not save watchlists in users collection, only save them in public collection
  }catch(error){
    return { status: 'error', message: error.message, error };
  }
}
async function createWatchList(batch, watchListName, type){ 
    const docRef = doc(collection(db, "watchlists"));
    batch.set(docRef, {
      ownerEmail: getUserCookies().details.email,
      watchListName: watchListName,
      type:type,
      isSpecialRecent: watchListName==="Recent",
      id:docRef.id,
    }); 
}
async function uploadImageToStorage() {
  const userData = getUserCookies();
  const blob = await createBlobFromImageUrl(userData.details.photo);
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
    throw error;
  }
}

export default CreateNewProfile;
