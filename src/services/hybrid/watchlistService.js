import {
  getUserWatchlists as getCloudflareWatchlists,
  createWatchlist as createCloudflareWatchlist,
  getWatchlistById as getCloudflareWatchlistById,
  updateWatchlist as updateCloudflareWatchlist,
  deleteWatchlist as deleteCloudflareWatchlist,
  addAnimeToWatchlist as addCloudflareAnimeToWatchlist,
  removeAnimeFromWatchlist as removeCloudflareAnimeFromWatchlist,
  addAnimeListToWatchlist as addCloudflareAnimeListToWatchlist
} from '../api/watchlistService';

// Firebase imports
import GetLoggedUserWatchListsInfo from '@/app/firebase/WatchList/WatchListDocument/GetLoggedUserWatchListsInfo';
import CreateWatchList from '@/app/firebase/WatchList/CreateWatchList';
import GetWatchListDataById from '@/app/firebase/WatchList/WatchListAnimeList/GetWatchListDataById';
import DeleteWatchListById from '@/app/firebase/WatchList/DeleteWatchList';
import AddAnimeToWatchList from '@/app/firebase/WatchList/UpdateWatchLists/AddAnimeToWatchList';
import RemoveAnimeFromWatchList from '@/app/firebase/WatchList/UpdateWatchLists/RemoveAnimeFromWatchList';
import ChangeWatchListName from '@/app/firebase/WatchList/UpdateWatchLists/ChangeWatchListName';
import UpdatePublicPrivateWatchList from '@/app/firebase/WatchList/UpdateWatchLists/UpdatePublicPrivateWatchList';

// Formatter
import { formatWatchlists, formatWatchlistDetail } from '../cloudflareFormatter';

import {
  Constant_Var_success,
  Constant_Var_error
} from '@/utils/constants';

/**
 * Hybrid Watchlist Service - Dual write to both Firestore and Cloudflare
 * Reads from Cloudflare, writes to both systems for data safety
 */

/**
 * Get user watchlists - reads from Cloudflare only
 * @returns {Promise<{status: string, response: any}>}
 */
export async function getUserWatchlists() {
  try {
    // Read from Cloudflare only - no fallback
    const res = await getCloudflareWatchlists();
    
    if (res.status === Constant_Var_success) {
      res.response = formatWatchlists(res.response);
    }
    
    return res;
  } catch (error) {
    console.error('Error in hybrid getUserWatchlists:', error);
    return { status: Constant_Var_error, response: error };
  }
}

/**
 * Create watchlist - writes to both Firestore and Cloudflare
 * @param {Object} params - Watchlist creation parameters
 * @returns {Promise<{status: string, response: any}>}
 */
export async function createWatchlist({ watchListName, type }) {
  const results = {
    firebase: null,
    cloudflare: null,
    success: false,
    errors: []
  };

  try {
    // Write to both systems in parallel
    const [firebaseResult, cloudflareResult] = await Promise.allSettled([
      CreateWatchList({ watchListName, type }),
      createCloudflareWatchlist({ watchListName, type })
    ]);

    // Process Firebase result
    if (firebaseResult.status === 'fulfilled') {
      results.firebase = firebaseResult.value;
    } else {
      results.errors.push(`Firebase error: ${firebaseResult.reason}`);
      console.error('Firebase create watchlist failed:', firebaseResult.reason);
    }

    // Process Cloudflare result
    if (cloudflareResult.status === 'fulfilled') {
      results.cloudflare = cloudflareResult.value;
    } else {
      results.errors.push(`Cloudflare error: ${cloudflareResult.reason}`);
      console.error('Cloudflare create watchlist failed:', cloudflareResult.reason);
    }

    // Consider success if at least one system succeeded
    const firebaseSuccess = results.firebase?.status === Constant_Var_success;
    const cloudflareSuccess = results.cloudflare?.status === Constant_Var_success;

    results.success = firebaseSuccess || cloudflareSuccess;

    if (results.success) {
      return {
        status: Constant_Var_success,
        response: results.cloudflare?.response || results.firebase?.response,
        hybridResults: results
      };
    } else {
      throw new Error(`Both systems failed: ${results.errors.join(', ')}`);
    }
  } catch (error) {
    console.error('Error in hybrid createWatchlist:', error);
    return {
      status: Constant_Var_error,
      response: error.message,
      hybridResults: results
    };
  }
}

/**
 * Get watchlist by ID - reads from Cloudflare only
 * @param {Object} params - Parameters for fetching watchlist
 * @param {string} params.watchListId - Watchlist ID
 * @param {number} params.offset - Offset for pagination (optional)
 * @param {number} params.pageSize - Page size for pagination (optional)
 * @param {boolean} params.getAll - Whether to get all data
 * @returns {Promise<{status: string, response: any}>}
 */
/**
 * Get watchlist by ID - reads from Cloudflare only
 * @param {Object} params - Parameters for fetching watchlist
 * @param {string} params.watchListId - Watchlist ID
 * @param {number} params.offset - Offset for pagination (optional)
 * @param {number} params.pageSize - Page size for pagination (optional)
 * @param {boolean} params.getAll - Whether to get all data (offset=0, large pageSize)
 * @returns {Promise<{status: string, response: any}>}
 */
export async function getWatchlistById({ watchListId, offset = 0, pageSize = 10, getAll = false }) {
  try {
    // When getAll is true, fetch from page 1 with a very large pageSize
    const effectiveOffset = getAll ? 0 : offset;
    const effectivePageSize = getAll ? 10000 : pageSize;

    const res = await getCloudflareWatchlistById(watchListId, effectiveOffset, effectivePageSize);
    
    if (res.status === Constant_Var_success) {
      res.response = formatWatchlistDetail(res.response);
    }
    
    return res;
  } catch (error) {
    console.error('Error in hybrid getWatchlistById:', error);
    return { status: Constant_Var_error, response: error };
  }
}

/**
 * Delete watchlist - writes to both Firestore and Cloudflare
 * @param {string} watchlistId - Watchlist ID to delete
 * @returns {Promise<{status: string, response: any}>}
 */
export async function deleteWatchlist(watchlistId) {
  const results = {
    firebase: null,
    cloudflare: null,
    success: false,
    errors: []
  };

  try {
    // Write to both systems in parallel
    const [firebaseResult, cloudflareResult] = await Promise.allSettled([
      DeleteWatchListById({ watchListId: watchlistId }),
      deleteCloudflareWatchlist(watchlistId)
    ]);

    // Process results
    if (firebaseResult.status === 'fulfilled') {
      results.firebase = firebaseResult.value;
    } else {
      results.errors.push(`Firebase error: ${firebaseResult.reason}`);
      console.error('Firebase delete watchlist failed:', firebaseResult.reason);
    }

    if (cloudflareResult.status === 'fulfilled') {
      results.cloudflare = cloudflareResult.value;
    } else {
      results.errors.push(`Cloudflare error: ${cloudflareResult.reason}`);
      console.error('Cloudflare delete watchlist failed:', cloudflareResult.reason);
    }

    // Consider success if at least one system succeeded
    const firebaseSuccess = results.firebase?.status === Constant_Var_success;
    const cloudflareSuccess = results.cloudflare?.status === Constant_Var_success;

    results.success = firebaseSuccess || cloudflareSuccess;

    if (results.success) {
      return {
        status: Constant_Var_success,
        response: results.cloudflare?.response || results.firebase?.response,
        hybridResults: results
      };
    } else {
      throw new Error(`Both systems failed: ${results.errors.join(', ')}`);
    }
  } catch (error) {
    console.error('Error in hybrid deleteWatchlist:', error);
    return {
      status: Constant_Var_error,
      response: error.message,
      hybridResults: results
    };
  }
}

/**
 * Add anime to watchlist - writes to both Firestore and Cloudflare
 * @param {string} watchlistId - Watchlist ID
 * @param {Object} animeData - Anime data to add
 * @param {string} url - URL for recent watchlist (optional)
 * @returns {Promise<{status: string, response: any}>}
 */
export async function addAnimeToWatchlist({ watchListId, animeData, url = null }) {
  const results = {
    firebase: null,
    cloudflare: null,
    success: false,
    errors: []
  };

  try {
    // Prepare data for both systems
    const firebaseAnimeData = {
      watchListId,
      animeId: animeData.anime_id || animeData.id,
      animeData: animeData,
      url: url
    };

    // Write to both systems in parallel
    const [firebaseResult, cloudflareResult] = await Promise.allSettled([
      AddAnimeToWatchList(firebaseAnimeData),
      addCloudflareAnimeToWatchlist(watchListId, animeData, url)
    ]);

    // Process results
    if (firebaseResult.status === 'fulfilled') {
      results.firebase = firebaseResult.value;
    } else {
      results.errors.push(`Firebase error: ${firebaseResult.reason}`);
      console.error('Firebase add anime failed:', firebaseResult.reason);
    }

    if (cloudflareResult.status === 'fulfilled') {
      results.cloudflare = cloudflareResult.value;
    } else {
      results.errors.push(`Cloudflare error: ${cloudflareResult.reason}`);
      console.error('Cloudflare add anime failed:', cloudflareResult.reason);
    }

    // Consider success if at least one system succeeded
    const firebaseSuccess = results.firebase?.status === Constant_Var_success;
    const cloudflareSuccess = results.cloudflare?.status === Constant_Var_success;

    results.success = firebaseSuccess || cloudflareSuccess;

    if (results.success) {
      return {
        status: Constant_Var_success,
        response: results.cloudflare?.response || results.firebase?.response,
        hybridResults: results
      };
    } else {
      throw new Error(`Both systems failed: ${results.errors.join(', ')}`);
    }
  } catch (error) {
    console.error('Error in hybrid addAnimeToWatchlist:', error);
    return {
      status: Constant_Var_error,
      response: error.message,
      hybridResults: results
    };
  }
}

/**
 * Remove anime from watchlist - writes to both Firestore and Cloudflare
 * @param {string} watchlistId - Watchlist ID
 * @param {string} animeId - Anime ID to remove
 * @returns {Promise<{status: string, response: any}>}
 */
export async function removeAnimeFromWatchlist({ watchListId, animeId }) {
  const results = {
    firebase: null,
    cloudflare: null,
    success: false,
    errors: []
  };

  try {
    // Write to both systems in parallel
    const [firebaseResult, cloudflareResult] = await Promise.allSettled([
      RemoveAnimeFromWatchList({ watchListId, animeId }),
      removeCloudflareAnimeFromWatchlist(watchListId, animeId)
    ]);

    // Process results
    if (firebaseResult.status === 'fulfilled') {
      results.firebase = firebaseResult.value;
    } else {
      results.errors.push(`Firebase error: ${firebaseResult.reason}`);
      console.error('Firebase remove anime failed:', firebaseResult.reason);
    }

    if (cloudflareResult.status === 'fulfilled') {
      results.cloudflare = cloudflareResult.value;
    } else {
      results.errors.push(`Cloudflare error: ${cloudflareResult.reason}`);
      console.error('Cloudflare remove anime failed:', cloudflareResult.reason);
    }

    // Consider success if at least one system succeeded
    const firebaseSuccess = results.firebase?.status === Constant_Var_success;
    const cloudflareSuccess = results.cloudflare?.status === Constant_Var_success;

    results.success = firebaseSuccess || cloudflareSuccess;

    if (results.success) {
      return {
        status: Constant_Var_success,
        response: results.cloudflare?.response || results.firebase?.response,
        hybridResults: results
      };
    } else {
      throw new Error(`Both systems failed: ${results.errors.join(', ')}`);
    }
  } catch (error) {
    console.error('Error in hybrid removeAnimeFromWatchlist:', error);
    return {
      status: Constant_Var_error,
      response: error.message,
      hybridResults: results
    };
  }
}

/**
 * Update watchlist name - writes to both Firestore and Cloudflare
 * @param {string} watchlistId - Watchlist ID
 * @param {string} newName - New watchlist name
 * @returns {Promise<{status: string, response: any}>}
 */
export async function updateWatchlistName({ watchListId, newName }) {
  const results = {
    firebase: null,
    cloudflare: null,
    success: false,
    errors: []
  };

  try {
    // Write to both systems in parallel
    const [firebaseResult, cloudflareResult] = await Promise.allSettled([
      ChangeWatchListName({ watchListId, newName }),
      updateCloudflareWatchlist(watchListId, { watchListName: newName })
    ]);

    // Process results
    if (firebaseResult.status === 'fulfilled') {
      results.firebase = firebaseResult.value;
    } else {
      results.errors.push(`Firebase error: ${firebaseResult.reason}`);
      console.error('Firebase update watchlist name failed:', firebaseResult.reason);
    }

    if (cloudflareResult.status === 'fulfilled') {
      results.cloudflare = cloudflareResult.value;
    } else {
      results.errors.push(`Cloudflare error: ${cloudflareResult.reason}`);
      console.error('Cloudflare update watchlist name failed:', cloudflareResult.reason);
    }

    // Consider success if at least one system succeeded
    const firebaseSuccess = results.firebase?.status === Constant_Var_success;
    const cloudflareSuccess = results.cloudflare?.status === Constant_Var_success;

    results.success = firebaseSuccess || cloudflareSuccess;

    if (results.success) {
      return {
        status: Constant_Var_success,
        response: results.cloudflare?.response || results.firebase?.response,
        hybridResults: results
      };
    } else {
      throw new Error(`Both systems failed: ${results.errors.join(', ')}`);
    }
  } catch (error) {
    console.error('Error in hybrid updateWatchlistName:', error);
    return {
      status: Constant_Var_error,
      response: error.message,
      hybridResults: results
    };
  }
}

/**
 * Update watchlist privacy - writes to both Firestore and Cloudflare
 * @param {string} watchlistId - Watchlist ID
 * @param {string} type - New privacy type (public/private)
 * @returns {Promise<{status: string, response: any}>}
 */
export async function updateWatchlistPrivacy({ watchListId, type }) {
  const results = {
    firebase: null,
    cloudflare: null,
    success: false,
    errors: []
  };

  try {
    // Write to both systems in parallel
    const [firebaseResult, cloudflareResult] = await Promise.allSettled([
      UpdatePublicPrivateWatchList({ watchListId, type }),
      updateCloudflareWatchlist(watchListId, { type })
    ]);

    // Process results
    if (firebaseResult.status === 'fulfilled') {
      results.firebase = firebaseResult.value;
    } else {
      results.errors.push(`Firebase error: ${firebaseResult.reason}`);
      console.error('Firebase update watchlist privacy failed:', firebaseResult.reason);
    }

    if (cloudflareResult.status === 'fulfilled') {
      results.cloudflare = cloudflareResult.value;
    } else {
      results.errors.push(`Cloudflare error: ${cloudflareResult.reason}`);
      console.error('Cloudflare update watchlist privacy failed:', cloudflareResult.reason);
    }

    // Consider success if at least one system succeeded
    const firebaseSuccess = results.firebase?.status === Constant_Var_success;
    const cloudflareSuccess = results.cloudflare?.status === Constant_Var_success;

    results.success = firebaseSuccess || cloudflareSuccess;

    if (results.success) {
      return {
        status: Constant_Var_success,
        response: results.cloudflare?.response || results.firebase?.response,
        hybridResults: results
      };
    } else {
      throw new Error(`Both systems failed: ${results.errors.join(', ')}`);
    }
  } catch (error) {
    console.error('Error in hybrid updateWatchlistPrivacy:', error);
    return {
      status: Constant_Var_error,
      response: error.message,
      hybridResults: results
    };
  }
}
