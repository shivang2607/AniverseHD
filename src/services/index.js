/**
 * Unified Service Layer
 * 
 * This is the SINGLE POINT OF ENTRY for all data operations in the application.
 * All components MUST import from this file, not from Firebase or Cloudflare services directly.
 * 
 * The service layer automatically routes to the appropriate implementation based on
 * the NEXT_PUBLIC_DATA_SOURCE environment variable:
 * - 'firebase': All operations use Firebase Firestore
 * - 'hybrid': Writes to both Firebase and Cloudflare, reads from Cloudflare only
 * - 'cloudflare': All operations use Cloudflare D1
 */

import { getDataSource, DATA_SOURCE_FIREBASE, DATA_SOURCE_HYBRID, DATA_SOURCE_CLOUDFLARE } from '@/config/dataSource';

// ============================================================================
// USER SERVICES
// ============================================================================

/**
 * Get logged-in user data
 * @returns {Promise<{status: string, response: any}>}
 */
export async function getUserData() {
    const dataSource = getDataSource();

    if (dataSource === DATA_SOURCE_FIREBASE) {
        const { default: GetLoggedUserData } = await import('@/app/firebase/Profile/GetLoggedUserData');
        return GetLoggedUserData();
    } else if (dataSource === DATA_SOURCE_HYBRID) {
        const { getUserData } = await import('./hybrid/userService');
        return getUserData();
    } else {
        const { getLoggedUserData } = await import('./api/userService');
        return getLoggedUserData();
    }
}

/**
 * Create or update user profile
 * @param {Object} userProfile - User profile data
 * @returns {Promise<{status: string, response: any}>}
 */
export async function createUserProfile(userProfile) {
    const dataSource = getDataSource();

    if (dataSource === DATA_SOURCE_FIREBASE) {
        const { default: CreateNewProfile } = await import('@/app/firebase/Profile/CreateNewProfile');
        return CreateNewProfile(userProfile);
    } else if (dataSource === DATA_SOURCE_HYBRID) {
        const { createUserProfile } = await import('./hybrid/userService');
        return createUserProfile(userProfile);
    } else {
        const { createOrUpdateUserProfile } = await import('./api/userService');
        return createOrUpdateUserProfile(userProfile);
    }
}

/**
 * Update user name
 * @param {string} userName - New user name
 * @returns {Promise<{status: string, response: any}>}
 */
export async function updateUserName(userName) {
    const dataSource = getDataSource();

    if (dataSource === DATA_SOURCE_FIREBASE) {
        const { default: UpdateName } = await import('@/app/firebase/Profile/UpdateName');
        return UpdateName({ userName });
    } else if (dataSource === DATA_SOURCE_HYBRID) {
        const { updateUserName } = await import('./hybrid/userService');
        return updateUserName(userName);
    } else {
        const { updateUserName } = await import('./api/userService');
        return updateUserName(userName);
    }
}

/**
 * Update user profile image
 * @param {Blob} blob - Image blob
 * @returns {Promise<{status: string, response: any}>}
 */
export async function updateProfileImage(blob) {
    const dataSource = getDataSource();

    if (dataSource === DATA_SOURCE_FIREBASE) {
        const { default: UpdateProfileImage } = await import('@/app/firebase/Profile/UpdateProfileImage');
        return UpdateProfileImage({ blob });
    } else if (dataSource === DATA_SOURCE_HYBRID) {
        const { updateProfileImage } = await import('./hybrid/userService');
        return updateProfileImage(blob);
    } else {
        // For Cloudflare mode, need to upload image first
        const { default: UploadImageToFirebaseStorage } = await import('@/app/firebase/utils/UploadImageToFirebaseStorage');
        const uploadResult = await UploadImageToFirebaseStorage({ blob, folderName: 'profileImages' });
        if (uploadResult.status === 'success') {
            const { updateUserProfileImage } = await import('./api/userService');
            return updateUserProfileImage(uploadResult.response);
        }
        return uploadResult;
    }
}

/**
 * Update user cover image
 * @param {Blob} blob - Image blob
 * @returns {Promise<{status: string, response: any}>}
 */
export async function updateCoverImage(blob) {
    const dataSource = getDataSource();

    if (dataSource === DATA_SOURCE_FIREBASE) {
        const { default: UpdateCoverImage } = await import('@/app/firebase/Profile/UpdateCoverImage');
        return UpdateCoverImage({ blob });
    } else if (dataSource === DATA_SOURCE_HYBRID) {
        const { updateCoverImage } = await import('./hybrid/userService');
        return updateCoverImage(blob);
    } else {
        // For Cloudflare mode, need to upload image first
        const { default: UploadImageToFirebaseStorage } = await import('@/app/firebase/utils/UploadImageToFirebaseStorage');
        const uploadResult = await UploadImageToFirebaseStorage({ blob, folderName: 'coverImages' });
        if (uploadResult.status === 'success') {
            const { updateUserCoverImage } = await import('./api/userService');
            return updateUserCoverImage(uploadResult.response);
        }
        return uploadResult;
    }
}

// ============================================================================
// WATCHLIST SERVICES
// ============================================================================

/**
 * Get user watchlists
 * @returns {Promise<{status: string, response: any}>}
 */
export async function getUserWatchlists() {
    const dataSource = getDataSource();

    if (dataSource === DATA_SOURCE_FIREBASE) {
        const { default: GetLoggedUserWatchListsInfo } = await import('@/app/firebase/WatchList/WatchListDocument/GetLoggedUserWatchListsInfo');
        return GetLoggedUserWatchListsInfo();
    } else if (dataSource === DATA_SOURCE_HYBRID) {
        const { getUserWatchlists } = await import('./hybrid/watchlistService');
        return getUserWatchlists();
    } else {
        const { getUserWatchlists } = await import('./api/watchlistService');
        return getUserWatchlists();
    }
}

/**
 * Create a new watchlist
 * @param {Object} params - Watchlist parameters
 * @returns {Promise<{status: string, response: any}>}
 */
export async function createWatchlist({ watchListName, type }) {
    const dataSource = getDataSource();

    if (dataSource === DATA_SOURCE_FIREBASE) {
        const { default: CreateWatchList } = await import('@/app/firebase/WatchList/CreateWatchList');
        return CreateWatchList({ watchListName, type });
    } else if (dataSource === DATA_SOURCE_HYBRID) {
        const { createWatchlist } = await import('./hybrid/watchlistService');
        return createWatchlist({ watchListName, type });
    } else {
        const { createWatchlist } = await import('./api/watchlistService');
        return createWatchlist({ watchListName, type });
    }
}

/**
 * Get watchlist by ID
 * @param {Object} params - Parameters
 * @returns {Promise<{status: string, response: any}>}
 */
export async function getWatchlistById({ watchListId, offset = 0, pageSize = 10, getAll = false }) {
    const dataSource = getDataSource();

    if (dataSource === DATA_SOURCE_FIREBASE) {
        const { default: GetWatchListDataById } = await import('@/app/firebase/WatchList/WatchListAnimeList/GetWatchListDataById');
        return GetWatchListDataById({ watchListId, offset, pageSize, getAll });
    } else if (dataSource === DATA_SOURCE_HYBRID) {
        const { getWatchlistById } = await import('./hybrid/watchlistService');
        return getWatchlistById({ watchListId, offset, pageSize, getAll });
    } else {
        const { getWatchlistById } = await import('./api/watchlistService');
        return getWatchlistById(watchListId, offset, pageSize);
    }
}

/**
 * Delete watchlist
 * @param {string} watchlistId - Watchlist ID
 * @returns {Promise<{status: string, response: any}>}
 */
export async function deleteWatchlist(watchlistId) {
    const dataSource = getDataSource();

    if (dataSource === DATA_SOURCE_FIREBASE) {
        const { default: DeleteWatchListById } = await import('@/app/firebase/WatchList/DeleteWatchList');
        return DeleteWatchListById({ watchListId: watchlistId });
    } else if (dataSource === DATA_SOURCE_HYBRID) {
        const { deleteWatchlist } = await import('./hybrid/watchlistService');
        return deleteWatchlist(watchlistId);
    } else {
        const { deleteWatchlist } = await import('./api/watchlistService');
        return deleteWatchlist(watchlistId);
    }
}

/**
 * Add anime to watchlist
 * @param {Object} params - Parameters
 * @returns {Promise<{status: string, response: any}>}
 */
export async function addAnimeToWatchlist({ watchListId, animeId, animeData, url = null }) {
    const dataSource = getDataSource();

    if (dataSource === DATA_SOURCE_FIREBASE) {
        const { default: AddAnimeToWatchList } = await import('@/app/firebase/WatchList/UpdateWatchLists/AddAnimeToWatchList');
        return AddAnimeToWatchList({ watchListId, animeId, animeData, url });
    } else if (dataSource === DATA_SOURCE_HYBRID) {
        const { addAnimeToWatchlist } = await import('./hybrid/watchlistService');
        return addAnimeToWatchlist({ watchListId, animeData, url });
    } else {
        const { addAnimeToWatchlist } = await import('./api/watchlistService');
        return addAnimeToWatchlist(watchListId, animeData, url);
    }
}

/**
 * Remove anime from watchlist
 * @param {Object} params - Parameters
 * @returns {Promise<{status: string, response: any}>}
 */
export async function removeAnimeFromWatchlist({ watchListId, animeId }) {
    const dataSource = getDataSource();

    if (dataSource === DATA_SOURCE_FIREBASE) {
        const { default: RemoveAnimeFromWatchList } = await import('@/app/firebase/WatchList/UpdateWatchLists/RemoveAnimeFromWatchList');
        return RemoveAnimeFromWatchList({ watchListId, animeId });
    } else if (dataSource === DATA_SOURCE_HYBRID) {
        const { removeAnimeFromWatchlist } = await import('./hybrid/watchlistService');
        return removeAnimeFromWatchlist({ watchListId, animeId });
    } else {
        const { removeAnimeFromWatchlist } = await import('./api/watchlistService');
        return removeAnimeFromWatchlist(watchListId, animeId);
    }
}

/**
 * Update watchlist name
 * @param {Object} params - Parameters
 * @returns {Promise<{status: string, response: any}>}
 */
export async function updateWatchlistName({ watchListId, newName }) {
    const dataSource = getDataSource();

    if (dataSource === DATA_SOURCE_FIREBASE) {
        const { default: ChangeWatchListName } = await import('@/app/firebase/WatchList/UpdateWatchLists/ChangeWatchListName');
        return ChangeWatchListName({ watchListId, newName });
    } else if (dataSource === DATA_SOURCE_HYBRID) {
        const { updateWatchlistName } = await import('./hybrid/watchlistService');
        return updateWatchlistName({ watchListId, newName });
    } else {
        const { updateWatchlist } = await import('./api/watchlistService');
        return updateWatchlist(watchListId, { watchListName: newName });
    }
}

/**
 * Update watchlist privacy
 * @param {Object} params - Parameters
 * @returns {Promise<{status: string, response: any}>}
 */
export async function updateWatchlistPrivacy({ watchListId, type }) {
    const dataSource = getDataSource();

    if (dataSource === DATA_SOURCE_FIREBASE) {
        const { default: UpdatePublicPrivateWatchList } = await import('@/app/firebase/WatchList/UpdateWatchLists/UpdatePublicPrivateWatchList');
        return UpdatePublicPrivateWatchList({ watchListId, type });
    } else if (dataSource === DATA_SOURCE_HYBRID) {
        const { updateWatchlistPrivacy } = await import('./hybrid/watchlistService');
        return updateWatchlistPrivacy({ watchListId, type });
    } else {
        const { updateWatchlist } = await import('./api/watchlistService');
        return updateWatchlist(watchListId, { type });
    }
}

// ============================================================================
// COMMENT SERVICES
// ============================================================================

/**
 * Get comments for an anime
 * @param {string} animeId - Anime ID
 * @param {Object} options - Query options
 * @returns {Promise<{status: string, response: any}>}
 */
export async function getComments(animeId, options = {}) {
    const dataSource = getDataSource();

    // Comments only exist in Cloudflare, so Firebase mode also uses Cloudflare
    if (dataSource === DATA_SOURCE_FIREBASE) {
        const { getComments } = await import('./api/commentService');
        return getComments(animeId, options);
    } else if (dataSource === DATA_SOURCE_HYBRID) {
        const { getComments } = await import('./hybrid/commentService');
        return getComments(animeId, options);
    } else {
        const { getComments } = await import('./api/commentService');
        return getComments(animeId, options);
    }
}

/**
 * Get comment by ID
 * @param {string} commentId - Comment ID
 * @returns {Promise<{status: string, response: any}>}
 */
export async function getCommentById(commentId) {
    const dataSource = getDataSource();

    // Comments only exist in Cloudflare
    if (dataSource === DATA_SOURCE_FIREBASE) {
        const { getCommentById } = await import('./api/commentService');
        return getCommentById(commentId);
    } else if (dataSource === DATA_SOURCE_HYBRID) {
        const { getCommentById } = await import('./hybrid/commentService');
        return getCommentById(commentId);
    } else {
        const { getCommentById } = await import('./api/commentService');
        return getCommentById(commentId);
    }
}

/**
 * Post a new comment
 * @param {string} animeId - Anime ID
 * @param {Object} commentData - Comment data
 * @returns {Promise<{status: string, response: any}>}
 */
export async function postComment(animeId, commentData) {
    const dataSource = getDataSource();

    // Comments only exist in Cloudflare
    if (dataSource === DATA_SOURCE_FIREBASE) {
        const { postComment } = await import('./api/commentService');
        return postComment(animeId, commentData);
    } else if (dataSource === DATA_SOURCE_HYBRID) {
        const { postComment } = await import('./hybrid/commentService');
        return postComment(animeId, commentData);
    } else {
        const { postComment } = await import('./api/commentService');
        return postComment(animeId, commentData);
    }
}

/**
 * Update a comment
 * @param {string} commentId - Comment ID
 * @param {Object} updateData - Update data
 * @returns {Promise<{status: string, response: any}>}
 */
export async function updateComment(commentId, updateData) {
    const dataSource = getDataSource();

    // Comments only exist in Cloudflare
    if (dataSource === DATA_SOURCE_FIREBASE) {
        const { updateComment } = await import('./api/commentService');
        return updateComment(commentId, updateData);
    } else if (dataSource === DATA_SOURCE_HYBRID) {
        const { updateComment } = await import('./hybrid/commentService');
        return updateComment(commentId, updateData);
    } else {
        const { updateComment } = await import('./api/commentService');
        return updateComment(commentId, updateData);
    }
}

/**
 * Delete a comment
 * @param {string} commentId - Comment ID
 * @returns {Promise<{status: string, response: any}>}
 */
export async function deleteComment(commentId) {
    const dataSource = getDataSource();

    // Comments only exist in Cloudflare
    if (dataSource === DATA_SOURCE_FIREBASE) {
        const { deleteComment } = await import('./api/commentService');
        return deleteComment(commentId);
    } else if (dataSource === DATA_SOURCE_HYBRID) {
        const { deleteComment } = await import('./hybrid/commentService');
        return deleteComment(commentId);
    } else {
        const { deleteComment } = await import('./api/commentService');
        return deleteComment(commentId);
    }
}

/**
 * React to a comment
 * @param {string} commentId - Comment ID
 * @param {string} reactionType - Reaction type ('like' or 'dislike')
 * @returns {Promise<{status: string, response: any}>}
 */
export async function reactOnComment(commentId, reactionType) {
    const dataSource = getDataSource();

    // Comments only exist in Cloudflare
    if (dataSource === DATA_SOURCE_FIREBASE) {
        const { reactOnComment } = await import('./api/commentService');
        return reactOnComment(commentId, reactionType);
    } else if (dataSource === DATA_SOURCE_HYBRID) {
        const { reactOnComment } = await import('./hybrid/commentService');
        return reactOnComment(commentId, reactionType);
    } else {
        const { reactOnComment } = await import('./api/commentService');
        return reactOnComment(commentId, reactionType);
    }
}

// ============================================================================
// NOTIFICATION SERVICES
// ============================================================================

/**
 * Get user notifications
 * @param {Object} options - Query options
 * @returns {Promise<{status: string, response: any}>}
 */
export async function getNotifications(options = {}) {
    const dataSource = getDataSource();

    // Notifications only exist in Cloudflare
    if (dataSource === DATA_SOURCE_FIREBASE) {
        const { getNotifications } = await import('./api/notificationService');
        return getNotifications(options);
    } else if (dataSource === DATA_SOURCE_HYBRID) {
        const { getNotifications } = await import('./hybrid/notificationService');
        return getNotifications(options);
    } else {
        const { getNotifications } = await import('./api/notificationService');
        return getNotifications(options);
    }
}

/**
 * Get notification by ID
 * @param {string} notificationId - Notification ID
 * @returns {Promise<{status: string, response: any}>}
 */
export async function getNotificationById(notificationId) {
    const dataSource = getDataSource();

    // Notifications only exist in Cloudflare
    if (dataSource === DATA_SOURCE_FIREBASE) {
        const { getNotificationById } = await import('./api/notificationService');
        return getNotificationById(notificationId);
    } else if (dataSource === DATA_SOURCE_HYBRID) {
        const { getNotificationById } = await import('./hybrid/notificationService');
        return getNotificationById(notificationId);
    } else {
        const { getNotificationById } = await import('./api/notificationService');
        return getNotificationById(notificationId);
    }
}

/**
 * Mark notifications as read
 * @param {Array<string>} notificationIds - Array of notification IDs
 * @returns {Promise<{status: string, response: any}>}
 */
export async function markNotificationsAsRead(notificationIds) {
    const dataSource = getDataSource();

    // Notifications only exist in Cloudflare
    if (dataSource === DATA_SOURCE_FIREBASE) {
        const { markNotificationsAsRead } = await import('./api/notificationService');
        return markNotificationsAsRead(notificationIds);
    } else if (dataSource === DATA_SOURCE_HYBRID) {
        const { markNotificationsAsRead } = await import('./hybrid/notificationService');
        return markNotificationsAsRead(notificationIds);
    } else {
        const { markNotificationsAsRead } = await import('./api/notificationService');
        return markNotificationsAsRead(notificationIds);
    }
}
