import { db } from "../utils/firebaseinit";
import { addDoc, collection, doc, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import getUserAuth from "../utils/GetUserAuth";
import {
  Constant_Var_error,
  Constant_Var_success,
} from "@/utils/constants";

/**
 * To Report a Bug by user.
 *
 * @param {Object} params - The input parameters.
 * @param {string} params.Message - The Bug Message.
 *
 * @returns {Promise<{status:string,response:any}>} - A promise that resolves to an object containing:
 *   - `status` {string}: A constant representing the status of the operation. Will be `Constant_Var_success` on success, or `Constant_Var_error` on failure.
 *   - `response` {null|Error}: `null` if successful, or an error message if failed.
 *
 * No errors are thrown. All errors are caught and returned in the `response` field with `status: Constant_Var_error`.
 * 
 * @example
 * import ReportBug from "./ReportBug";
 *
 * async function reportExample() {
 *   const bugMessage = "Found a UI bug in the dashboard.";
 *   const result = await ReportBug({ Message: bugMessage });
 *
 *   if (result.status === Constant_Var_success) {
 *     console.log("Bug reported successfully!");
 *   } else {
 *     console.error("Failed to report bug:", result.response);
 *   }
 * }
 *
 * reportExample();
 */
export default async function ReportBug({ Message }) {
  try {

    validateParams({ Message:Message });
    // Check if user cookies exist
    const userData = await getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
    }
    const docRef = doc(collection(db, "bugs"));
    const bugObject = {
        message: Message,
        status: "Unresolved",
        reportedBy: userData? userData.details.uid : "Anonymous",
        reportedAt: Timestamp.now(),
    }

    await setDoc(docRef, bugObject);
    
    return { status: Constant_Var_success, response: null };
  } catch (error) {
    return { response: error, status: Constant_Var_error };
  }
};


function validateParams({ Message }) {
  if (typeof Message !== 'string' || Message.trim() === '') {
    throw new Error("'Message' must be a non-empty string");
  }
}
