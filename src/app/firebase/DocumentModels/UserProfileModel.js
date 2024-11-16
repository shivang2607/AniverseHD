import { Timestamp } from "firebase/firestore"; // Import Firestore's Timestamp for createdAt

/**
 * userProfileModel function to create an object for Firestore
 * @param {string} uid - User's unique identifier
 * @param {string} name - User's name
 * @param {string} email - User's email
 * @param {string} photoURL - URL for the user's profile picture
 * @param {string} coverURL - URL for the user's cover picture
 * @returns {Object} Firestore document object
 */
function UserProfileModel({uid, name, email , photoURL, coverURL}) {

  if (!uid || !name || !email || !photoURL || !coverURL) {
    throw new Error("Invalid user details provided");
  }

  // Create the document object to be sent to Firestore
  const document = {
    createdAt: Timestamp.now(), // Firestore timestamp
    userName: name,
    email: email,
    photoUrl: photoURL,
    coverUrl: coverURL,
    uid: uid,
    playerOptions:{ 
      autoPlay:true,
      autoSkipIntro:false,
      autoNext:true,
    }
  };

  return document; // Return the object that can be sent to Firestore
}

export default UserProfileModel;
