import { Constant_Var_errorMessage_missingParams } from "@/utils/constants";
import { Timestamp } from "firebase/firestore"; // Import Firestore's Timestamp for createdAt

/**
 * AnimeModel function to create an object representing an anime for Firestore
 * @param {Object} params - Object containing the details of the anime
 * @param {string} params.animeId - Unique identifier of the anime
 * @param {string} params.animeName - Name of the anime
 * @param {Object} params.animePhoto - URL of the anime's cover photo
 * @param {Array} params.animeGenre - Genre of the anime
 * @param {string} params.animeType - Type of the anime (e.g., TV, Movie, OVA, etc.)
 * @param {number} params.animeScore - Rating score of the anime
 * @param {string} params.animeAgeRating - Age rating of the anime (e.g., PG, R, etc.)
 * @param {number} params.animeStartYear - Release year of the anime
 * @param {number} params.animeLength - Length of the anime (e.g., number of episodes or runtime)
 * @param {object} params.url - Url of episode for recent watchlist 
 * @returns {Object} Firestore document object containing the anime data
 * @throws Will throw an error if any required parameter is missing
 */

function AnimeModel({ animeId, animeName,animePhoto=null, animeGenre=null,animeType=null,animeScore=null,animeAgeRating=null,animeStartYear=null,animeLength=null, url=null }) {
  if (!animeId || !animeName) {
    throw new Error(Constant_Var_errorMessage_missingParams);
  }

  // Create the document object to be sent to Firestore

  const document = {
    animeId: animeId,
    animeName: animeName,
    animePhoto: animePhoto,
    animeGenre: animeGenre,
    animeType: animeType,
    animeScore: animeScore,
    animeAgeRating: animeAgeRating,
    animeStartYear: animeStartYear,
    animeLength: animeLength,
    url:url,
    addedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  
  return document; // Return the object that can be sent to Firestore
}

export default AnimeModel;
