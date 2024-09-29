
export const Constant_Var_success = "success";
export const Constant_Var_error = "error";
export let Constant_Var_RecentWatchlistSize = 4;

// # Session Storage Variables #
export const Constant_Var_sessionStorage_key_userWatchListsInfo  = "userwatchLists";
export const Constant_Var_sessionStorage_key_watchListInfo = "watchListInfo";
export const Constant_Var_sessionStorage_key_loggedInUser = "user";


// # Firebase fieldNames # 
export const Constant_Var_firebase_fieldName_ownerUid = "ownerUid";
export const Constant_Var_firebase_fieldName_type = "type";


//# Firebase FieldValues #
export const Constant_Var_firebase_fieldValue_public = "public";
export const Constant_Var_firebase_fieldValue_private = "private";


// # Firebase Collections #
export const Constant_Var_firebase_collectionName_watchLists = "watchLists";
export const Constant_Var_firebase_collectionName_animeList = "animeList";
export const Constant_Var_firebase_collectionName_users = "users";


// # Error Messages #
export const Constant_Var_errorMessage_notAuthorisedUser = "Not authorised user.";
export const Constant_Var_errorMessage_notAuthenticatedUser = "User not authenticated.";
export const Constant_Var_errorMessage_profileCreationAlradyUnderProgress =
  "Profile Creation Alrady Under Progress";
export const Constant_Var_errorMessage_noWatchListExists= "No watchlist Exists";
export const Constant_Var_errorMessage_userDoesNotExistWithThisId =
  "User Does Not Exist with Id";
export const Constant_Var_errorMessage_loggedInUserDoesNostExistsYet =
  "Logged In User Does Not Exist Yet";
export const Constant_Var_errorMessage_missingParams = "Missing params";
export const Constant_Var_errorMessage_privateWatchList = "Private WatchList";

// # Starter user Profile Images Array #
export  const Constant_Array_firebase_profileImageArr=["/userProfileImage1.jpg"," /userProfileImage2.png","/userProfileImage3.jpg","/userProfileImage4.webp","/userProfileImage5.jpg","/userProfileImage6.jpg","/userProfileImage7.jpg","/userProfileImage7.jpg"];


// #Default Watchlists #
export const starterWatchLists = [
  "Recent",
  "Dropped",
  "Favourite",
  "On Hold",
  "Plan To Watch",
  "Completed",
];