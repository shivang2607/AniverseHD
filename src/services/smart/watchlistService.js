/**
 * Smart Watchlist Service - Drop-in replacement for Firebase watchlist functions
 * This service automatically detects the migration mode and routes to the appropriate implementation
 * 
 * Usage: Replace Firebase imports with this service
 * Before: import AddAnimeToWatchList from "@/app/firebase/WatchList/UpdateWatchLists/AddAnimeToWatchList";
 * After:  import { AddAnimeToWatchList } from "@/services/smart/watchlistService";
 */

// Firebase imports (original) - using aliases to avoid naming conflicts
import FirebaseGetLoggedUserWatchListsInfo from '@/app/firebase/WatchList/WatchListDocument/GetLoggedUserWatchListsInfo';
import FirebaseCreateWatchList from '@/app/firebase/WatchList/CreateWatchList';
import FirebaseGetWatchListDataById from '@/app/firebase/WatchList/WatchListAnimeList/GetWatchListDataById';
import FirebaseDeleteWatchListById from '@/app/firebase/WatchList/DeleteWatchList';
import FirebaseAddAnimeToWatchList from '@/app/firebase/WatchList/UpdateWatchLists/AddAnimeToWatchList';
import FirebaseRemoveAnimeFromWatchList from '@/app/firebase/WatchList/UpdateWatchLists/RemoveAnimeFromWatchList';
import FirebaseChangeWatchListName from '@/app/firebase/WatchList/UpdateWatchLists/ChangeWatchListName';
import FirebaseUpdatePublicPrivateWatchList from '@/app/firebase/WatchList/UpdateWatchLists/UpdatePublicPrivateWatchList';
import FirebaseGetWatchListInfoById from '@/app/firebase/WatchList/WatchListDocument/GetWatchListInfoById';
import FirebaseGetOtherUserWatchListsInfo from '@/app/firebase/WatchList/WatchListDocument/GetOtherUserWatchListsInfo';

// Hybrid imports (new)
import { 
  getUserWatchlists as getHybridWatchlists, 
  createWatchlist as createHybridWatchlist, 
  getWatchlistById as getHybridWatchlistById, 
  deleteWatchlist as deleteHybridWatchlist, 
  addAnimeToWatchlist as addHybridAnimeToWatchlist, 
  removeAnimeFromWatchlist as removeHybridAnimeFromWatchlist,
  updateWatchlistName as updateHybridWatchlistName,
  updateWatchlistPrivacy as updateHybridWatchlistPrivacy
} from '@/services/hybrid/watchlistService';

/**
 * Get current migration mode
 */
const getMigrationMode = () => {
  // Check environment variable first
  if (process.env.NEXT_PUBLIC_MIGRATION_MODE) {
    return process.env.NEXT_PUBLIC_MIGRATION_MODE;
  }
  
  // Check localStorage for runtime switching
  const localMode = localStorage.getItem('MIGRATION_MODE');
  if (localMode) {
    return localMode;
  }
  
  // Check for emergency fallback
  if (localStorage.getItem('USE_FIREBASE_FALLBACK') === 'true') {
    return 'firebase';
  }
  
  // Default to firebase for safety
  return 'firebase';
};

/**
 * Show hybrid operation warnings
 */
const showHybridWarning = (hybridResults) => {
  if (hybridResults && (!hybridResults.firebase || !hybridResults.cloudflare)) {
    const failedSystem = !hybridResults.firebase ? 'Firebase' : 'Cloudflare';
    
    // Only show warning in development or if explicitly enabled
    if (process.env.NODE_ENV === 'development' || localStorage.getItem('SHOW_HYBRID_WARNINGS') === 'true') {
      console.warn(`Hybrid operation warning: ${failedSystem} failed but operation succeeded`);
    }
  }
};

/**
 * Smart wrapper for GetLoggedUserWatchListsInfo
 * Drop-in replacement for Firebase function
 */
export async function GetLoggedUserWatchListsInfo() {
  const mode = getMigrationMode();
  
  if (mode === 'hybrid') {
    const result = await getHybridWatchlists();
    showHybridWarning(result.hybridResults);
    return result;
  } else {
    return await FirebaseGetLoggedUserWatchListsInfo();
  }
}

/**
 * Smart wrapper for CreateWatchList
 * Drop-in replacement for Firebase function
 */
export async function CreateWatchList({ watchListName, type }) {
  const mode = getMigrationMode();
  
  if (mode === 'hybrid') {
    const result = await createHybridWatchlist({ watchListName, type });
    showHybridWarning(result.hybridResults);
    return result;
  } else {
    return await FirebaseCreateWatchList({ watchListName, type });
  }
}

/**
 * Smart wrapper for GetWatchListDataById
 * Drop-in replacement for Firebase function
 */
export async function GetWatchListDataById({ watchListId, getAll = false, offset = null, limit = null }) {
  const mode = getMigrationMode();
  
  if (mode === 'hybrid') {
    const result = await getHybridWatchlistById({ watchListId, getAll });
    showHybridWarning(result.hybridResults);
    return result;
  } else {
    return await FirebaseGetWatchListDataById({ watchListId, getAll, offset, limit });
  }
}

/**
 * Smart wrapper for DeleteWatchListById
 * Drop-in replacement for Firebase function
 */
export async function DeleteWatchListById({ watchListId }) {
  const mode = getMigrationMode();
  
  if (mode === 'hybrid') {
    const result = await deleteHybridWatchlist(watchListId);
    showHybridWarning(result.hybridResults);
    return result;
  } else {
    return await FirebaseDeleteWatchListById({ watchListId });
  }
}

/**
 * Smart wrapper for AddAnimeToWatchList
 * Drop-in replacement for Firebase function
 */
export async function AddAnimeToWatchList({ watchListId, animeId, animeData, url = null }) {
  const mode = getMigrationMode();
  
  if (mode === 'hybrid') {
    const result = await addHybridAnimeToWatchlist({ watchListId, animeData, url });
    showHybridWarning(result.hybridResults);
    return result;
  } else {
    return await FirebaseAddAnimeToWatchList({ watchListId, animeId, animeData, url });
  }
}

/**
 * Smart wrapper for RemoveAnimeFromWatchList
 * Drop-in replacement for Firebase function
 */
export async function RemoveAnimeFromWatchList({ watchListId, animeId }) {
  const mode = getMigrationMode();
  
  if (mode === 'hybrid') {
    const result = await removeHybridAnimeFromWatchlist({ watchListId, animeId });
    showHybridWarning(result.hybridResults);
    return result;
  } else {
    return await FirebaseRemoveAnimeFromWatchList({ watchListId, animeId });
  }
}

/**
 * Smart wrapper for ChangeWatchListName
 * Drop-in replacement for Firebase function
 */
export async function ChangeWatchListName({ watchListId, newName }) {
  const mode = getMigrationMode();
  
  if (mode === 'hybrid') {
    const result = await updateHybridWatchlistName({ watchListId, newName });
    showHybridWarning(result.hybridResults);
    return result;
  } else {
    return await FirebaseChangeWatchListName({ watchListId, newName });
  }
}

/**
 * Smart wrapper for UpdatePublicPrivateWatchList
 * Drop-in replacement for Firebase function
 */
export async function UpdatePublicPrivateWatchList({ watchListId, type }) {
  const mode = getMigrationMode();
  
  if (mode === 'hybrid') {
    const result = await updateHybridWatchlistPrivacy({ watchListId, type });
    showHybridWarning(result.hybridResults);
    return result;
  } else {
    return await FirebaseUpdatePublicPrivateWatchList({ watchListId, type });
  }
}

/**
 * Smart wrapper for GetWatchListInfoById
 * Drop-in replacement for Firebase function
 * Note: This function doesn't have a hybrid equivalent yet, so it always uses Firebase
 */
export async function GetWatchListInfoById({ watchListId }) {
  // This function is read-only and less critical, so we can keep using Firebase for now
  return await FirebaseGetWatchListInfoById({ watchListId });
}

/**
 * Smart wrapper for GetOtherUserWatchListsInfo
 * Drop-in replacement for Firebase function
 * Note: This function doesn't have a hybrid equivalent yet, so it always uses Firebase
 */
export async function GetOtherUserWatchListsInfo({ userId }) {
  // This function is read-only and less critical, so we can keep using Firebase for now
  return await FirebaseGetOtherUserWatchListsInfo({ userId });
}

/**
 * Utility function to get current migration mode (for debugging)
 */
export function getCurrentMigrationMode() {
  return getMigrationMode();
}

/**
 * Utility function to enable hybrid warnings in production
 */
export function enableHybridWarnings() {
  localStorage.setItem('SHOW_HYBRID_WARNINGS', 'true');
}

/**
 * Utility function to disable hybrid warnings
 */
export function disableHybridWarnings() {
  localStorage.removeItem('SHOW_HYBRID_WARNINGS');
}