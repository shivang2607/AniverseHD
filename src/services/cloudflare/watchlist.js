import { 
  getUserWatchlists, 
  createWatchlist, 
  getWatchlistById, 
  updateWatchlist, 
  deleteWatchlist, 
  addAnimeToWatchlist, 
  removeAnimeFromWatchlist 
} from '../api/watchlistService';
import { 
  getUserWatchListsInfoCached, 
  setUserWatchListsInfoCached,
  setWatchListInfoByIdInfoCached,
  addUserWatchlistCached 
} from '@/app/firebase/utils/CacheStorage';
import { Constant_Var_success } from '@/utils/constants';
import getUserAuth from '@/app/firebase/utils/GetUserAuth';

/**
 * Cloudflare Worker replacements for Firebase watchlist operations
 * These functions maintain the same interface as the original Firebase functions
 */

/**
 * Get logged user watchlists - Cloudflare Worker version
 * @returns {Promise<{status: string, response: any}>}
 */
export async function GetLoggedUserWatchListsInfo() {
  try {
    const userData = await getUserAuth();
    if (!userData) {
      throw new Error('User not authenticated');
    }

    // Check cache first
    const cachedUserWatchlists = getUserWatchListsInfoCached({
      userId: userData.details.uid
    });

    if (cachedUserWatchlists != null) {
      return { status: Constant_Var_success, response: cachedUserWatchlists };
    }

    const result = await getUserWatchlists();
    
    if (result.status === Constant_Var_success && result.response.length > 0) {
      // Cache each watchlist
      result.response.forEach(watchlist => {
        setWatchListInfoByIdInfoCached({
          watchListInfo: watchlist,
          watchListId: watchlist.id
        });
      });
      
      // Cache the user's watchlists
      setUserWatchListsInfoCached({
        watchLists: result.response,
        userId: userData.details.uid
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error in GetLoggedUserWatchListsInfo:', error);
    return { status: 'error', response: error };
  }
}

/**
 * Create watchlist - Cloudflare Worker version
 * @param {Object} params - Parameters object
 * @param {string} params.watchListName - Name of the watchlist
 * @param {string} params.type - Type of watchlist (public/private)
 * @returns {Promise<{status: string, response: any}>}
 */
export async function CreateWatchList({ watchListName, type }) {
  try {
    const result = await createWatchlist({ watchListName, type });
    
    if (result.status === Constant_Var_success) {
      const userData = await getUserAuth();
      if (userData && result.response.watchlist) {
        // Update cache
        addUserWatchlistCached({
          watchListInfo: result.response.watchlist,
          watchListId: result.response.watchlist.id,
          userId: userData.details.uid
        });
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error in CreateWatchList:', error);
    return { status: 'error', response: error };
  }
}

/**
 * Get watchlist data by ID - Cloudflare Worker version
 * @param {Object} params - Parameters object
 * @param {string} params.watchListId - Watchlist ID
 * @param {boolean} params.getAll - Whether to get all data
 * @returns {Promise<{status: string, response: any}>}
 */
export async function GetWatchListDataById({ watchListId, getAll = false }) {
  try {
    const result = await getWatchlistById(watchListId);
    
    if (result.status === Constant_Var_success) {
      // Cache the watchlist data
      setWatchListInfoByIdInfoCached({
        watchListInfo: result.response,
        watchListId: watchListId
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error in GetWatchListDataById:', error);
    return { status: 'error', response: error };
  }
}

/**
 * Delete watchlist by ID - Cloudflare Worker version
 * @param {Object} params - Parameters object
 * @param {string} params.watchListId - Watchlist ID to delete
 * @returns {Promise<{status: string, response: any}>}
 */
export async function DeleteWatchListById({ watchListId }) {
  try {
    const result = await deleteWatchlist(watchListId);
    return result;
  } catch (error) {
    console.error('Error in DeleteWatchListById:', error);
    return { status: 'error', response: error };
  }
}

/**
 * Add anime to watchlist - Cloudflare Worker version
 * @param {Object} params - Parameters object
 * @param {string} params.watchListId - Watchlist ID
 * @param {Object} params.animeData - Anime data to add
 * @returns {Promise<{status: string, response: any}>}
 */
export async function AddAnimeToWatchList({ watchListId, animeData }) {
  try {
    const result = await addAnimeToWatchlist(watchListId, animeData);
    return result;
  } catch (error) {
    console.error('Error in AddAnimeToWatchList:', error);
    return { status: 'error', response: error };
  }
}

/**
 * Remove anime from watchlist - Cloudflare Worker version
 * @param {Object} params - Parameters object
 * @param {string} params.watchListId - Watchlist ID
 * @param {string} params.animeId - Anime ID to remove
 * @returns {Promise<{status: string, response: any}>}
 */
export async function RemoveAnimeFromWatchList({ watchListId, animeId }) {
  try {
    const result = await removeAnimeFromWatchlist(watchListId, animeId);
    return result;
  } catch (error) {
    console.error('Error in RemoveAnimeFromWatchList:', error);
    return { status: 'error', response: error };
  }
}

/**
 * Update watchlist name - Cloudflare Worker version
 * @param {Object} params - Parameters object
 * @param {string} params.watchListId - Watchlist ID
 * @param {string} params.newName - New watchlist name
 * @returns {Promise<{status: string, response: any}>}
 */
export async function ChangeWatchListName({ watchListId, newName }) {
  try {
    const result = await updateWatchlist(watchListId, { watchListName: newName });
    return result;
  } catch (error) {
    console.error('Error in ChangeWatchListName:', error);
    return { status: 'error', response: error };
  }
}

/**
 * Update watchlist privacy - Cloudflare Worker version
 * @param {Object} params - Parameters object
 * @param {string} params.watchListId - Watchlist ID
 * @param {string} params.type - New privacy type (public/private)
 * @returns {Promise<{status: string, response: any}>}
 */
export async function UpdatePublicPrivateWatchList({ watchListId, type }) {
  try {
    const result = await updateWatchlist(watchListId, { type: type });
    return result;
  } catch (error) {
    console.error('Error in UpdatePublicPrivateWatchList:', error);
    return { status: 'error', response: error };
  }
}