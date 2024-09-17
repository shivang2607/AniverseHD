import { db } from "../utils/firebaseinit";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import {Constant_Var_success, Constant_Var_error, Constant_Var_firebase_collectionName_watchLists, Constant_Var_firebase_fieldName_ownerUid, Constant_Var_firebase_fieldValue_public, Constant_Var_firebase_fieldName_type, Constant_Var_errorMessage_missingParams, Constant_Var_firebase_collectionName_animeList } from "@/utils/constants";

export default async function GetOtherUserWatchLists(userId) {
  try {

    if(!userId) throw new Error(Constant_Var_errorMessage_missingParams);
    
    const watchListquery = query(
      collection(db, Constant_Var_firebase_collectionName_watchLists),
      where(Constant_Var_firebase_fieldName_ownerUid, "==", userId), 
      where(Constant_Var_firebase_fieldName_type,"==",Constant_Var_firebase_fieldValue_public)
    );
    let userwatchLists = await getDocs(watchListquery);

    // Create an array of promises for fetching each watchList's animeList subcollection
    const promises = [];
    const watchListMetadata = [];
    //getting animeList subcollection from all watchLists of this user using async call with promise all
    userwatchLists.forEach((item) => {
      // Get watchList metadata
      watchListMetadata.push(item.data());
      // Fetch the animeList subcollection for each watchList
      const collectionRef = collection(db, Constant_Var_firebase_collectionName_watchLists, item.data().id, Constant_Var_firebase_collectionName_animeList);
      promises.push(getDocs(collectionRef));
    });

    // Wait for all animeList queries to resolve
    const animeListResponses = await Promise.all(promises);

    // Combine the metadata and the animeList data
    const result = animeListResponses.map((animeList, index) => {
      return {
        ...watchListMetadata[index], // Include the metadata (name, ownerEmail, etc.)
        animeList: animeList.docs.map((doc) => doc.data()), // Include the animeList data
      };
    });

    return { status: Constant_Var_success, response: result };
  } catch (error) {
    return { response: error, status: Constant_Var_error };
  }
}
