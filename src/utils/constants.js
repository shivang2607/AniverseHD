
export const Constant_Var_success = "success";
export const Constant_Var_error = "error";
export const Constant_Var_RecentWatchlistSize = 4;

// # Session Storage Variables #
export const Constant_Var_sessionStorage_key_userWatchListsInfo  = "userwatchLists";
export const Constant_Var_sessionStorage_key_watchListInfoById = "watchListInfoById";
export const Constant_Var_sessionStorage_key_watchListAnimeListById = "watchListAnimeListById";
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
  "Watching",
];

export  const Constant_Var_starterWatchLists_recent="Recent";
export  const Constant_Var_starterWatchLists_favourite="Favourite";

// # Search API Enums as Key-Value Arrays #
export const Constant_Enum_animeSearchQueryType = [
  { key: "Tv", value: "tv" },
  { key: "Movie", value: "movie" },
  { key: "OVA", value: "ova" },
  { key: "Special", value: "special" },
  { key: "ONA", value: "ona" },
  { key: "Music", value: "music" },
  { key: "CM", value: "cm" },
  { key: "PV", value: "pv" },
  { key: "Tv Special", value: "tv_special" }
];

export const Constant_Enum_animeSearchQueryStatus = [
  { key: "Airing", value: "airing" },
  { key: "Complete", value: "complete" },
  { key: "Upcoming", value: "upcoming" }
];

export const Constant_Enum_animeSearchQueryRating = [
  { key: "G", value: "g" },          // All Ages
  { key: "PG", value: "pg" },        // Children
  { key: "PG13", value: "pg13" },    // Teens 13 or older
  { key: "R17", value: "r17" },      // 17+ (violence & profanity)
  { key: "R", value: "r" },          // Mild Nudity
  { key: "RX", value: "rx" }         // Hentai
];

export const Constant_Enum_animeSearchQueryOrderBy = [
  { key: "MAL Id", value: "mal_id" },
  { key: "Title", value: "title" },
  { key: "Start Date", value: "start_date" },
  { key: "End Date", value: "end_date" },
  { key: "Episodes", value: "episodes" },
  { key: "Score", value: "score" },
  { key: "Scored by", value: "scored_by" },
  { key: "Rank", value: "rank" },
  { key: "Popularity", value: "popularity" },
  { key: "Members", value: "members" },
  { key: "Favourites", value: "favorites" }
];

export const Constant_Enum_searchQuerySort = [
  { key: "Ascending", value: "asc" },
  { key: "Decending", value: "desc" }
];

export const Constant_Var_genresList=[
  {
    key: "Action",
    value: '1'
  },
  {
    key: "Adventure",
    value: '2'
  },
  {
    key: "Avant Garde",
    value: '5'
  },
  {
    key: "Award Winning",
    value: '46'
  },
  {
    key: "Boys Love",
    value: '28'
  },
  {
    key: "Comedy",
    value: '4'
  },
  {
    key: "Drama",
    value: '8'
  },
  {
    key: "Fantasy",
    value: '10'
  },
  {
    key: "Girls Love",
    value: '26'
  },
  {
    key: "Gourmet",
    value: '47'
  },
  {
    key: "Horror",
    value: '14'
  },
  {
    key: "Mystery",
    value: '7'
  },
  {
    key: "Romance",
    value: '22'
  },
  {
    key: "Sci-Fi",
    value: '24'
  },
  {
    key: "Slice of Life",
    value: '36'
  },
  {
    key: "Sports",
    value: '30'
  },
  {
    key: "Supernatural",
    value: '37'
  },
  {
    key: "Suspense",
    value: '41'
  }
];

// # Query Params Defaults #
export const Constant_Var_defaultPage = 1;
export const Constant_Var_defaultLimit = 25;

// # Boolean Flags #
export const Constant_Var_flag_unapproved = true;
export const Constant_Var_flag_sfw = true;

// # Date Formats #
export const Constant_Var_dateFormat = {
  YEAR: "YYYY",
  MONTH: "YYYY-MM",
  FULL: "YYYY-MM-DD"
};