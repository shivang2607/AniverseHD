import { db } from "../utils/firebaseinit";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import getUserAuth from "../utils/GetUserAuth";
import {
  Constant_Var_error,
  Constant_Var_success,
} from "@/utils/constants";

/**
 * To Send a Feedback by user.
 *
 * @param {Object} params - The input parameters.
 * @param {string} params.Message - The Bug Message.
 * @param {number} params.Stars - The Stars.
 *
 * @returns {Promise<{status:string,response:any}>} - A promise that resolves to an object containing:
 *   - `status` {string}: A constant representing the status of the operation. Will be `Constant_Var_success` on success, or `Constant_Var_error` on failure.
 *   - `response` {null|Error}: `null` if successful, or an error message if failed.
 *
 * No errors are thrown. All errors are caught and returned in the `response` field with `status: Constant_Var_error`.
 * 
 * @example
 * import FeedBack from "./FeedBack";
 *
 * async function FeedBackExample() {
 *   const FeedBackMessage = "WatchLists feature looks amazing, please add a mal watchlist sync feature too.";
 * const stars = 5;
 *   const result = await FeedBack({ Message: FeedBackMessage, Stars: stars});
 *
 *   if (result.status === Constant_Var_success) {
 *     console.log("FeedBack sent successfully!");
 *   } else {
 *     console.error("Failed to send FeedBack:", result.response);
 *   }
 * }
 *
 * FeedBackExample();
 */
export default async function FeedBack({ Message, Stars }) {
  try {

    validateParams({ Message:Message, Stars:Stars });
    // Check if user cookies exist
    const userData = await getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
    }
    const docRef = doc(collection(db, "feedbacks"));
    const feedbackObject = {
        message: Message,
        sentBy: userData.details.uid,
        stars: Stars,
        sentAt: Timestamp.now(),
    }

    await setDoc(docRef, feedbackObject);
    
    return { status: Constant_Var_success, response: null };
  } catch (error) {
    return { response: error, status: Constant_Var_error };
  }
};


function validateParams({ Message, Stars }) {
  if (typeof Message !== 'string') {
    throw new Error("'Message' must be a string");
  }

  if (typeof Stars !== 'number' || Stars < 0 || Stars > 5) {
    throw new Error("'Stars' must be a number between 0 and 5");
  }
}
