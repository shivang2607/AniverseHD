import {
    getComments as getCloudflareComments,
    getCommentById as getCloudflareCommentById,
    postComment as postCloudflareComment,
    updateComment as updateCloudflareComment,
    deleteComment as deleteCloudflareComment,
    reactOnComment as reactCloudflareComment
} from '../api/commentService';

import {
    Constant_Var_success,
    Constant_Var_error
} from '@/utils/constants';

/**
 * Hybrid Comment Service
 * 
 * Since comments only exist in Cloudflare (not in Firebase), this service
 * acts as a passthrough to Cloudflare. In the future, if you need to sync
 * comments to Firebase, you can implement dual-write here.
 */

/**
 * Get comments for an anime - reads from Cloudflare only
 * @param {string} animeId - Anime ID
 * @param {Object} options - Query options
 * @returns {Promise<{status: string, response: any}>}
 */
export async function getComments(animeId, options = {}) {
    try {
        const cloudflareResult = await getCloudflareComments(animeId, options);
        return cloudflareResult;
    } catch (error) {
        console.error('Error in hybrid getComments:', error);
        return { status: Constant_Var_error, response: error };
    }
}

/**
 * Get comment by ID - reads from Cloudflare only
 * @param {string} commentId - Comment ID
 * @returns {Promise<{status: string, response: any}>}
 */
export async function getCommentById(commentId) {
    try {
        const cloudflareResult = await getCloudflareCommentById(commentId);
        return cloudflareResult;
    } catch (error) {
        console.error('Error in hybrid getCommentById:', error);
        return { status: Constant_Var_error, response: error };
    }
}

/**
 * Post a new comment - writes to Cloudflare only
 * @param {string} animeId - Anime ID
 * @param {Object} commentData - Comment data
 * @returns {Promise<{status: string, response: any}>}
 */
export async function postComment(animeId, commentData) {
    try {
        const cloudflareResult = await postCloudflareComment(animeId, commentData);
        return cloudflareResult;
    } catch (error) {
        console.error('Error in hybrid postComment:', error);
        return {
            status: Constant_Var_error,
            response: error.message
        };
    }
}

/**
 * Update a comment - writes to Cloudflare only
 * @param {string} commentId - Comment ID
 * @param {Object} updateData - Update data
 * @returns {Promise<{status: string, response: any}>}
 */
export async function updateComment(commentId, updateData) {
    try {
        const cloudflareResult = await updateCloudflareComment(commentId, updateData);
        return cloudflareResult;
    } catch (error) {
        console.error('Error in hybrid updateComment:', error);
        return {
            status: Constant_Var_error,
            response: error.message
        };
    }
}

/**
 * Delete a comment - writes to Cloudflare only
 * @param {string} commentId - Comment ID
 * @returns {Promise<{status: string, response: any}>}
 */
export async function deleteComment(commentId) {
    try {
        const cloudflareResult = await deleteCloudflareComment(commentId);
        return cloudflareResult;
    } catch (error) {
        console.error('Error in hybrid deleteComment:', error);
        return {
            status: Constant_Var_error,
            response: error.message
        };
    }
}

/**
 * React to a comment - writes to Cloudflare only
 * @param {string} commentId - Comment ID
 * @param {string} reactionType - Reaction type ('like' or 'dislike')
 * @returns {Promise<{status: string, response: any}>}
 */
export async function reactOnComment(commentId, reactionType) {
    try {
        const cloudflareResult = await reactCloudflareComment(commentId, reactionType);
        return cloudflareResult;
    } catch (error) {
        console.error('Error in hybrid reactOnComment:', error);
        return {
            status: Constant_Var_error,
            response: error.message
        };
    }
}
