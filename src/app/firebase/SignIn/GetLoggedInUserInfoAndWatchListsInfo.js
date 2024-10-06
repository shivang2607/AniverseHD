import { Constant_Var_errorMessage_loggedInUserDoesNostExistsYet, Constant_Var_success } from "@/utils/constants";
import GetLoggedUserData from "../Profile/GetLoggedUserData";
import GetLoggedUserWatchListsInfo from "../WatchList/WatchListDocument/GetLoggedUserWatchListsInfo";
import CreateNewProfile from "../Profile/CreateNewProfile";


export default async function GetLoggedInUserInfoAndWatchListsInfo() {
    try {
      // Fetching in parallel
      const [respUserInfo, respUserWatchLists] = await Promise.all([
        GetLoggedUserData(),
        GetLoggedUserWatchListsInfo(),
      ]);

       // Create new profile if user doesn't exist
       if (
        respUserInfo.response.message ===
        Constant_Var_errorMessage_loggedInUserDoesNostExistsYet
      ) {
    
        const profileCreationResponse = await CreateNewProfile();

        if (profileCreationResponse.status === Constant_Var_success) {
          loadLoggedInUserData(); // Retry loading after profile creation
          return;
        } else {
          console.log("Error creating profile");
          throw profileCreationResponse.response;
        }

      } else {
        console.log("Error loading user info");
        throw respUserInfo.response;
      }


      // # Setting User WatchLists #
      if (respUserWatchLists.status === Constant_Var_success) {
       
      } else {
        console.log("Load watchlists error");
        throw respUserWatchLists.response;
      }

    } catch (error) {
      // show toast of error
    }
  }