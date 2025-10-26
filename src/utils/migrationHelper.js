/**
 * Migration helper utilities for transitioning from Firebase to Cloudflare Workers
 * This file contains utilities to help migrate data and switch between implementations
 */

import { Constant_Var_success } from './constants';

/**
 * Feature flag to control which implementation to use
 * Set to true to use Cloudflare Workers, false to use Firebase
 */
export const USE_CLOUDFLARE_WORKERS = process.env.NEXT_PUBLIC_USE_CLOUDFLARE_WORKERS === 'true';

/**
 * Get the appropriate user store based on feature flag
 * @returns {Object} User store (either Firebase or Cloudflare version)
 */
export function getUserStore() {
  if (USE_CLOUDFLARE_WORKERS) {
    // Dynamic import to avoid loading Firebase dependencies when using Cloudflare
    return import('@/ZustandStores/userStoreCloudflare').then(module => module.default);
  } else {
    return import('@/ZustandStores/userStore').then(module => module.default);
  }
}

/**
 * Migration utility to export user data from Firebase
 * This can be used to backup data before switching to Cloudflare
 */
export async function exportFirebaseUserData() {
  try {
    const { default: GetLoggedUserData } = await import('@/app/firebase/Profile/GetLoggedUserData');
    const { default: GetLoggedUserWatchListsInfo } = await import('@/app/firebase/WatchList/WatchListDocument/GetLoggedUserWatchListsInfo');
    
    const [userDataResp, watchlistsResp] = await Promise.all([
      GetLoggedUserData(),
      GetLoggedUserWatchListsInfo()
    ]);

    if (userDataResp.status === Constant_Var_success && watchlistsResp.status === Constant_Var_success) {
      return {
        status: Constant_Var_success,
        data: {
          userProfile: userDataResp.response,
          watchlists: watchlistsResp.response
        }
      };
    } else {
      throw new Error('Failed to export Firebase data');
    }
  } catch (error) {
    console.error('Error exporting Firebase data:', error);
    return {
      status: 'error',
      error: error.message
    };
  }
}

/**
 * Migration utility to import user data to Cloudflare Workers
 * @param {Object} userData - User data exported from Firebase
 */
export async function importToCloudflareWorkers(userData) {
  try {
    const { createOrUpdateUserProfile } = await import('@/services/api/userService');
    const { createWatchlist } = await import('@/services/api/watchlistService');

    // Import user profile
    const userProfileResp = await createOrUpdateUserProfile(userData.userProfile);
    
    if (userProfileResp.status !== Constant_Var_success) {
      throw new Error('Failed to import user profile');
    }

    // Import watchlists
    const watchlistPromises = userData.watchlists.map(watchlist => 
      createWatchlist({
        watchListName: watchlist.watchListName,
        type: watchlist.type
      })
    );

    const watchlistResults = await Promise.all(watchlistPromises);
    
    const failedWatchlists = watchlistResults.filter(result => result.status !== Constant_Var_success);
    
    if (failedWatchlists.length > 0) {
      console.warn(`${failedWatchlists.length} watchlists failed to import`);
    }

    return {
      status: Constant_Var_success,
      message: `Successfully imported user profile and ${watchlistResults.length - failedWatchlists.length} watchlists`
    };
  } catch (error) {
    console.error('Error importing to Cloudflare Workers:', error);
    return {
      status: 'error',
      error: error.message
    };
  }
}

/**
 * Complete migration from Firebase to Cloudflare Workers
 * This function exports data from Firebase and imports it to Cloudflare Workers
 */
export async function migrateFromFirebaseToCloudflare() {
  try {
    console.log('Starting migration from Firebase to Cloudflare Workers...');
    
    // Step 1: Export data from Firebase
    console.log('Exporting data from Firebase...');
    const exportResult = await exportFirebaseUserData();
    
    if (exportResult.status !== Constant_Var_success) {
      throw new Error(`Export failed: ${exportResult.error}`);
    }

    // Step 2: Import data to Cloudflare Workers
    console.log('Importing data to Cloudflare Workers...');
    const importResult = await importToCloudflareWorkers(exportResult.data);
    
    if (importResult.status !== Constant_Var_success) {
      throw new Error(`Import failed: ${importResult.error}`);
    }

    console.log('Migration completed successfully!');
    return {
      status: Constant_Var_success,
      message: 'Migration completed successfully'
    };
  } catch (error) {
    console.error('Migration failed:', error);
    return {
      status: 'error',
      error: error.message
    };
  }
}

/**
 * Validate Cloudflare Worker API connectivity
 */
export async function validateCloudflareWorkerConnection() {
  try {
    const { default: apiClient } = await import('@/services/api/client');
    
    const response = await apiClient.get('/');
    
    if (response.status === 200) {
      return {
        status: Constant_Var_success,
        message: 'Cloudflare Worker is accessible'
      };
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error) {
    console.error('Cloudflare Worker connection failed:', error);
    return {
      status: 'error',
      error: error.message
    };
  }
}