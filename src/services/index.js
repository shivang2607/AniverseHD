/**
 * Unified Service Layer
 * 
 * This is the SINGLE POINT OF ENTRY for all data operations in the application.
 * All components MUST import from this file, not from Firebase or Cloudflare services directly.
 */

import { getDataSource, DATA_SOURCE_FIREBASE, DATA_SOURCE_HYBRID, DATA_SOURCE_CLOUDFLARE } from '@/config/dataSource';

// Firebase Imports
import GetLoggedUserDataFirebase from '@/app/firebase/Profile/GetLoggedUserData';
import CreateNewProfileFirebase from '@/app/firebase/Profile/CreateNewProfile';
import UpdateNameFirebase from '@/app/firebase/Profile/UpdateName';
import UpdateProfileImageFirebase from '@/app/firebase/Profile/UpdateProfileImage';
import UpdateCoverImageFirebase from '@/app/firebase/Profile/UpdateCoverImage';
import GetLoggedUserWatchListsInfoFirebase from '@/app/firebase/WatchList/WatchListDocument/GetLoggedUserWatchListsInfo';
import CreateWatchListFirebase from '@/app/firebase/WatchList/CreateWatchList';
import GetWatchListDataByIdFirebase from '@/app/firebase/WatchList/WatchListAnimeList/GetWatchListDataById';
import DeleteWatchListByIdFirebase from '@/app/firebase/WatchList/DeleteWatchList';
import AddAnimeToWatchListFirebase from '@/app/firebase/WatchList/UpdateWatchLists/AddAnimeToWatchList';
import RemoveAnimeFromWatchListFirebase from '@/app/firebase/WatchList/UpdateWatchLists/RemoveAnimeFromWatchList';
import ChangeWatchListNameFirebase from '@/app/firebase/WatchList/UpdateWatchLists/ChangeWatchListName';
import UpdatePublicPrivateWatchListFirebase from '@/app/firebase/WatchList/UpdateWatchLists/UpdatePublicPrivateWatchList';

// Hybrid Imports
import * as hybridUser from './hybrid/userService';
import * as hybridWatchlist from './hybrid/watchlistService';
import * as hybridComment from './hybrid/commentService';
import * as hybridNotification from './hybrid/notificationService';

// API (Cloudflare) Imports
import * as apiUser from './api/userService';
import * as apiWatchlist from './api/watchlistService';
import * as apiComment from './api/commentService';
import * as apiNotification from './api/notificationService';

// Formatter
import * as formatter from './cloudflareFormatter';
import { Constant_Var_success } from '@/utils/constants';

// Utils
import UploadImageToFirebaseStorage from '@/app/firebase/utils/UploadImageToFirebaseStorage';

// ============================================================================
// USER SERVICES
// ============================================================================

export async function getUserData() {
    const dataSource = getDataSource();

    if (dataSource === DATA_SOURCE_FIREBASE) {
        return GetLoggedUserDataFirebase();
    } else if (dataSource === DATA_SOURCE_HYBRID) {
        return hybridUser.getUserData();
    } else {
        const res = await apiUser.getLoggedUserData();
        if (res.status === Constant_Var_success) {
            res.response = formatter.formatUser(res.response);
        }
        return res;
    }
}

export async function createUserProfile(userProfile) {
    const dataSource = getDataSource();

    if (dataSource === DATA_SOURCE_FIREBASE) {
        return CreateNewProfileFirebase(userProfile);
    } else if (dataSource === DATA_SOURCE_HYBRID) {
        return hybridUser.createUserProfile(userProfile);
    } else {
        return apiUser.createOrUpdateUserProfile(userProfile);
    }
}

export async function updateUserName(userName) {
    const dataSource = getDataSource();

    if (dataSource === DATA_SOURCE_FIREBASE) {
        return UpdateNameFirebase({ userName });
    } else if (dataSource === DATA_SOURCE_HYBRID) {
        return hybridUser.updateUserName(userName);
    } else {
        return apiUser.updateUserName(userName);
    }
}

export async function updateProfileImage(blob) {
    const dataSource = getDataSource();

    if (dataSource === DATA_SOURCE_FIREBASE) {
        return UpdateProfileImageFirebase({ blob });
    } else if (dataSource === DATA_SOURCE_HYBRID) {
        return hybridUser.updateProfileImage(blob);
    } else {
        const uploadResult = await UploadImageToFirebaseStorage({ blob, folderName: 'profileImages' });
        if (uploadResult.status === Constant_Var_success) {
            return apiUser.updateUserProfileImage(uploadResult.response);
        }
        return uploadResult;
    }
}

export async function updateCoverImage(blob) {
    const dataSource = getDataSource();

    if (dataSource === DATA_SOURCE_FIREBASE) {
        return UpdateCoverImageFirebase({ blob });
    } else if (dataSource === DATA_SOURCE_HYBRID) {
        return hybridUser.updateCoverImage(blob);
    } else {
        const uploadResult = await UploadImageToFirebaseStorage({ blob, folderName: 'coverImages' });
        if (uploadResult.status === Constant_Var_success) {
            return apiUser.updateUserCoverImage(uploadResult.response);
        }
        return uploadResult;
    }
}

// ============================================================================
// WATCHLIST SERVICES
// ============================================================================

export async function getUserWatchlists() {
    const dataSource = getDataSource();

    if (dataSource === DATA_SOURCE_FIREBASE) {
        return GetLoggedUserWatchListsInfoFirebase();
    } else if (dataSource === DATA_SOURCE_HYBRID) {
        return hybridWatchlist.getUserWatchlists();
    } else {
        const res = await apiWatchlist.getUserWatchlists();
        if (res.status === Constant_Var_success) {
            res.response = formatter.formatWatchlists(res.response);
        }
        return res;
    }
}

export async function createWatchlist({ watchListName, type }) {
    const dataSource = getDataSource();

    if (dataSource === DATA_SOURCE_FIREBASE) {
        return CreateWatchListFirebase({ watchListName, type });
    } else if (dataSource === DATA_SOURCE_HYBRID) {
        return hybridWatchlist.createWatchlist({ watchListName, type });
    } else {
        return apiWatchlist.createWatchlist({ watchListName, type });
    }
}

export async function getWatchlistById({ watchListId, offset = 0, pageSize = 10, getAll = false }) {
    const dataSource = getDataSource();

    if (dataSource === DATA_SOURCE_FIREBASE) {
        return GetWatchListDataByIdFirebase({ watchListId, offset, pageSize, getAll });
    } else if (dataSource === DATA_SOURCE_HYBRID) {
        return hybridWatchlist.getWatchlistById({ watchListId, offset, pageSize, getAll });
    } else {
        const res = await apiWatchlist.getWatchlistById(watchListId, offset, pageSize);
        if (res.status === Constant_Var_success) {
            res.response = formatter.formatWatchlistDetail(res.response);
        }
        return res;
    }
}

export async function deleteWatchlist(watchlistId) {
    const dataSource = getDataSource();

    if (dataSource === DATA_SOURCE_FIREBASE) {
        return DeleteWatchListByIdFirebase({ watchListId: watchlistId });
    } else if (dataSource === DATA_SOURCE_HYBRID) {
        return hybridWatchlist.deleteWatchlist(watchlistId);
    } else {
        return apiWatchlist.deleteWatchlist(watchlistId);
    }
}

export async function addAnimeToWatchlist({ watchListId, animeId, animeData, url = null }) {
    const dataSource = getDataSource();

    if (dataSource === DATA_SOURCE_FIREBASE) {
        return AddAnimeToWatchListFirebase({ watchListId, animeId, animeData, url });
    } else if (dataSource === DATA_SOURCE_HYBRID) {
        return hybridWatchlist.addAnimeToWatchlist({ watchListId, animeData, url });
    } else {
        return apiWatchlist.addAnimeToWatchlist(watchListId, animeData, url);
    }
}

export async function removeAnimeFromWatchlist({ watchListId, animeId }) {
    const dataSource = getDataSource();

    if (dataSource === DATA_SOURCE_FIREBASE) {
        return RemoveAnimeFromWatchListFirebase({ watchListId, animeId });
    } else if (dataSource === DATA_SOURCE_HYBRID) {
        return hybridWatchlist.removeAnimeFromWatchlist({ watchListId, animeId });
    } else {
        return apiWatchlist.removeAnimeFromWatchlist(watchListId, animeId);
    }
}

export async function updateWatchlistName({ watchListId, newName }) {
    const dataSource = getDataSource();

    if (dataSource === DATA_SOURCE_FIREBASE) {
        return ChangeWatchListNameFirebase({ watchListId, newName });
    } else if (dataSource === DATA_SOURCE_HYBRID) {
        return hybridWatchlist.updateWatchlistName({ watchListId, newName });
    } else {
        return apiWatchlist.updateWatchlist(watchListId, { watchListName: newName });
    }
}

export async function updateWatchlistPrivacy({ watchListId, type }) {
    const dataSource = getDataSource();

    if (dataSource === DATA_SOURCE_FIREBASE) {
        return UpdatePublicPrivateWatchListFirebase({ watchListId, type });
    } else if (dataSource === DATA_SOURCE_HYBRID) {
        return hybridWatchlist.updateWatchlistPrivacy({ watchListId, type });
    } else {
        return apiWatchlist.updateWatchlist(watchListId, { type });
    }
}

// ============================================================================
// COMMENT SERVICES
// ============================================================================

export async function getComments(animeId, options = {}) {
    const dataSource = getDataSource();

    if (dataSource === DATA_SOURCE_HYBRID) {
        return hybridComment.getComments(animeId, options);
    } else {
        return apiComment.getComments(animeId, options);
    }
}

export async function getCommentById(commentId) {
    const dataSource = getDataSource();

    if (dataSource === DATA_SOURCE_HYBRID) {
        return hybridComment.getCommentById(commentId);
    } else {
        return apiComment.getCommentById(commentId);
    }
}

export async function postComment(animeId, commentData) {
    const dataSource = getDataSource();

    if (dataSource === DATA_SOURCE_HYBRID) {
        return hybridComment.postComment(animeId, commentData);
    } else {
        return apiComment.postComment(animeId, commentData);
    }
}

export async function updateComment(commentId, updateData) {
    const dataSource = getDataSource();

    if (dataSource === DATA_SOURCE_HYBRID) {
        return hybridComment.updateComment(commentId, updateData);
    } else {
        return apiComment.updateComment(commentId, updateData);
    }
}

export async function deleteComment(commentId) {
    const dataSource = getDataSource();

    if (dataSource === DATA_SOURCE_HYBRID) {
        return hybridComment.deleteComment(commentId);
    } else {
        return apiComment.deleteComment(commentId);
    }
}

export async function reactOnComment(commentId, reactionType) {
    const dataSource = getDataSource();

    if (dataSource === DATA_SOURCE_HYBRID) {
        return hybridComment.reactOnComment(commentId, reactionType);
    } else {
        return apiComment.reactOnComment(commentId, reactionType);
    }
}

// ============================================================================
// NOTIFICATION SERVICES
// ============================================================================

export async function getNotifications(options = {}) {
    const dataSource = getDataSource();

    if (dataSource === DATA_SOURCE_HYBRID) {
        return hybridNotification.getNotifications(options);
    } else {
        return apiNotification.getNotifications(options);
    }
}

export async function getNotificationById(notificationId) {
    const dataSource = getDataSource();

    if (dataSource === DATA_SOURCE_HYBRID) {
        return hybridNotification.getNotificationById(notificationId);
    } else {
        return apiNotification.getNotificationById(notificationId);
    }
}

export async function markNotificationsAsRead(notificationIds) {
    const dataSource = getDataSource();

    if (dataSource === DATA_SOURCE_HYBRID) {
        return hybridNotification.markNotificationsAsRead(notificationIds);
    } else {
        return apiNotification.markNotificationsAsRead(notificationIds);
    }
}
