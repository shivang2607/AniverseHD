import apiClient from './client';
import { 
  Constant_Var_success, 
  Constant_Var_error,
  Constant_Var_errorMessage_notAuthenticatedUser 
} from '@/utils/constants';
import getUserAuth from '@/app/firebase/utils/GetUserAuth';

/**
 * Watchlist service for Cloudflare Worker API integration
 * Replaces Firebase Firestore operations for watchlists
 */

/**
 * Get user watchlists from Cloudflare Worker
 * @returns {Promise<{status: string, response: any}>}
 */
export async function getUserWatchlists() {
  try {
    const userData = await getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
    }

    const response = await apiClient.get('/getUserWatchLists', {
      params: { userId: userData.details.uid }
    });

    return { 
      status: Constant_Var_success, 
      response: response.data.data || [] 
    };
  } catch (error) {
    console.error('Error fetching user watchlists:', error);
    return { 
      status: Constant_Var_error, 
      response: error.response?.data || error.message 
    };
  }
}

/**
 * Create a new watchlist
 * @param {Object} params - Watchlist creation parameters
 * @param {string} params.watchListName - Name of the watchlist
 * @param {string} params.type - Type of watchlist (public/private)
 * @returns {Promise<{status: string, response: any}>}
 */
export async function createWatchlist({ watchListName, type }) {
  try {
    const userData = await getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
    }

    const watchlistData = {
      name: watchListName,
      description: '',
      visibility: type === 'public' ? true : false
    };

    const response = await apiClient.post('/createWatchList', watchlistData);

    return { 
      status: Constant_Var_success, 
      response: response.data.data 
    };
  } catch (error) {
    console.error('Error creating watchlist:', error);
    return { 
      status: Constant_Var_error, 
      response: error.response?.data || error.message 
    };
  }
}

/**
 * Get watchlist by ID
 * @param {string} watchlistId - Watchlist ID
 * @param {number} page - Page number for pagination
 * @param {number} pageSize - Number of items per page
 * @returns {Promise<{status: string, response: any}>}
 */
export async function getWatchlistById(watchlistId, page = 1, pageSize = 10) {
  try {
    const userData = await getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
    }

    const response = await apiClient.get(`/getWatchlistById/${watchlistId}`, {
      params: { page, pageSize }
    });

    return { 
      status: Constant_Var_success, 
      response: response.data.data 
    };
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return { 
      status: Constant_Var_error, 
      response: error.response?.data || error.message 
    };
  }
}

/**
 * Update watchlist
 * @param {string} watchlistId - Watchlist ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<{status: string, response: any}>}
 */
export async function updateWatchlist(watchlistId, updateData) {
  try {
    const userData = await getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
    }

    // Map Firebase field names to Cloudflare field names
    const mappedData = {};
    if (updateData.watchListName) mappedData.name = updateData.watchListName;
    if (updateData.description) mappedData.description = updateData.description;
    if (updateData.type) mappedData.visibility = updateData.type === 'public';

    const response = await apiClient.patch(`/updateWatchlist/${watchlistId}`, mappedData);

    return { 
      status: Constant_Var_success, 
      response: response.data.data 
    };
  } catch (error) {
    console.error('Error updating watchlist:', error);
    return { 
      status: Constant_Var_error, 
      response: error.response?.data || error.message 
    };
  }
}

/**
 * Delete watchlist
 * @param {string} watchlistId - Watchlist ID to delete
 * @returns {Promise<{status: string, response: any}>}
 */
export async function deleteWatchlist(watchlistId) {
  try {
    const userData = await getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
    }

    const response = await apiClient.delete(`/deleteWatchlist/${watchlistId}`);

    return { 
      status: Constant_Var_success, 
      response: response.data.data 
    };
  } catch (error) {
    console.error('Error deleting watchlist:', error);
    return { 
      status: Constant_Var_error, 
      response: error.response?.data || error.message 
    };
  }
}

/**
 * Add anime to watchlist
 * @param {string} watchlistId - Watchlist ID
 * @param {Object} animeData - Anime data to add
 * @param {string} url - URL for recent watchlist (optional)
 * @returns {Promise<{status: string, response: any}>}
 */
export async function addAnimeToWatchlist(watchlistId, animeData, url = null) {
  try {
    const userData = await getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
    }

    const requestData = {
      animeId: animeData.anime_id || animeData.id,
      animeObj: animeData
    };

    // Add URL for recent watchlist
    if (url) {
      requestData.url = url;
    }

    const response = await apiClient.post(`/addAnimeToWatchlist/${watchlistId}`, requestData);

    return { 
      status: Constant_Var_success, 
      response: response.data.data 
    };
  } catch (error) {
    console.error('Error adding anime to watchlist:', error);
    return { 
      status: Constant_Var_error, 
      response: error.response?.data || error.message 
    };
  }
}

/**
 * Add multiple anime to watchlist (bulk import)
 * @param {Object} mergedDataObj - Object with categorized anime lists
 * @returns {Promise<{status: string, response: any}>}
 */
export async function addAnimeListToWatchlist(mergedDataObj) {
  try {
    const userData = await getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
    }

    const response = await apiClient.post('/addAnimeListToWatchlist', {
      mergedDataObj: mergedDataObj
    });

    return { 
      status: Constant_Var_success, 
      response: response.data.data 
    };
  } catch (error) {
    console.error('Error adding anime list to watchlist:', error);
    return { 
      status: Constant_Var_error, 
      response: error.response?.data || error.message 
    };
  }
}

/**
 * Remove anime from watchlist
 * @param {string} watchlistId - Watchlist ID
 * @param {string} animeId - Anime ID to remove
 * @returns {Promise<{status: string, response: any}>}
 */
export async function removeAnimeFromWatchlist(watchlistId, animeId) {
  try {
    const userData = await getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
    }

    const response = await apiClient.delete(`/removeAnimeFromWatchlist/${watchlistId}`, {
      data: { animeId: animeId }
    });

    return { 
      status: Constant_Var_success, 
      response: response.data.data 
    };
  } catch (error) {
    console.error('Error removing anime from watchlist:', error);
    return { 
      status: Constant_Var_error, 
      response: error.response?.data || error.message 
    };
  }
}

/**
 * Get user's recent watchlist
 * @returns {Promise<{status: string, response: any}>}
 */
export async function getRecentWatchlist() {
  try {
    const userData = await getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
    }

    const response = await apiClient.get('/getRecentWatchlist');

    return { 
      status: Constant_Var_success, 
      response: response.data.data 
    };
  } catch (error) {
    console.error('Error fetching recent watchlist:', error);
    return { 
      status: Constant_Var_error, 
      response: error.response?.data || error.message 
    };
  }
}

/**
 * Add anime directly to anime table
 * @param {Object} animeData - Anime data to add
 * @returns {Promise<{status: string, response: any}>}
 */
export async function addAnimeToTable(animeData) {
  try {
    const userData = await getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
    }

    const response = await apiClient.post('/addAnime', animeData);

    return { 
      status: Constant_Var_success, 
      response: response.data.data 
    };
  } catch (error) {
    console.error('Error adding anime to table:', error);
    return { 
      status: Constant_Var_error, 
      response: error.response?.data || error.message 
    };
  }
}