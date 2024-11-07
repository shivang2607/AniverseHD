import { Constant_Var_errorMessage_missingParams } from "@/utils/constants";
import { Timestamp } from "firebase/firestore"; // Import Firestore's Timestamp for createdAt

/**
 * watchListModel function to create an object for Firestore
 * @param {string} ownerUid - User's unique identifier (owner of the watchlist)
 * @param {string} watchListName - Name of the watchlist
 * @param {string} type - Type of the watchlist (e.g., anime, movie, etc.)
 * @param {boolean} isSpecialStarter - Flag indicating if this is a special starter list
 * @param {string} id - Document ID reference
 * @returns {Object} Firestore document object
 */
function WatchListModel({ ownerUid, watchListName, type, isSpecialStarter, id }) {
  if (!ownerUid || !watchListName || !type || !id || isSpecialStarter==undefined) {
    throw new Error(Constant_Var_errorMessage_missingParams);
  }

  // Create the document object to be sent to Firestore
  const document = {
    ownerUid: ownerUid,
    watchListName: watchListName,
    type: type,
    isSpecialStarter: isSpecialStarter, // Defaults to false if not provided
    id: id,
    createdAt: Timestamp.now(), // Firestore timestamp
    updatedAt: Timestamp.now(),
    // count: 0, // Initial count of items in the watchlist
    animeList:[]
  };

  return document; // Return the object that can be sent to Firestore
}

export default WatchListModel;
