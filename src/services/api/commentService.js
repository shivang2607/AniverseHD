import apiClient from './client';
import {
    Constant_Var_success,
    Constant_Var_error,
    Constant_Var_errorMessage_notAuthenticatedUser
} from '@/utils/constants';
import getUserAuth from '@/app/firebase/utils/GetUserAuth';

/**
 * Comment service for Cloudflare Worker API integration
 * Handles all comment-related operations through the Cloudflare D1 database
 */

/**
 * Get comments for an anime
 * @param {string} animeId - Anime ID
 * @param {Object} options - Query options (limit, offset, sortBy, etc.)
 * @returns {Promise<{status: string, response: any}>}
 */
export async function getComments(animeId, options = {}) {
    try {
        const params = {
            limit: options.limit || 20,
            offset: options.offset || 0,
            sortBy: options.sortBy || 'createdAt',
            ...options
        };

        const response = await apiClient.get(`/${animeId}/comments`, { params });

        return {
            status: Constant_Var_success,
            response: response.data.data
        };
    } catch (error) {
        console.error('Error fetching comments:', error);
        return {
            status: Constant_Var_error,
            response: error.response?.data || error.message
        };
    }
}

/**
 * Get a single comment by ID
 * @param {string} commentId - Comment ID
 * @returns {Promise<{status: string, response: any}>}
 */
export async function getCommentById(commentId) {
    try {
        const response = await apiClient.get(`/comments/${commentId}`);

        return {
            status: Constant_Var_success,
            response: response.data.data
        };
    } catch (error) {
        console.error('Error fetching comment:', error);
        return {
            status: Constant_Var_error,
            response: error.response?.data || error.message
        };
    }
}

/**
 * Post a new comment
 * @param {string} animeId - Anime ID
 * @param {Object} commentData - Comment data
 * @returns {Promise<{status: string, response: any}>}
 */
export async function postComment(animeId, commentData) {
    try {
        const userData = await getUserAuth();
        if (!userData) {
            throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
        }

        const response = await apiClient.post(`/${animeId}/comments`, {
            content: commentData.content,
            parentCommentId: commentData.parentCommentId || null,
            animeId: animeId,
        });

        return {
            status: Constant_Var_success,
            response: response.data.data
        };
    } catch (error) {
        console.error('Error posting comment:', error);
        return {
            status: Constant_Var_error,
            response: error.response?.data || error.message
        };
    }
}

/**
 * Update a comment
 * @param {string} commentId - Comment ID
 * @param {Object} updateData - Update data
 * @returns {Promise<{status: string, response: any}>}
 */
export async function updateComment(commentId, updateData) {
    try {
        const userData = await getUserAuth();
        if (!userData) {
            throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
        }

        const response = await apiClient.put('/comments', {
            commentId: commentId,
            content: updateData.content,
        });

        return {
            status: Constant_Var_success,
            response: response.data.data
        };
    } catch (error) {
        console.error('Error updating comment:', error);
        return {
            status: Constant_Var_error,
            response: error.response?.data || error.message
        };
    }
}

/**
 * Delete a comment
 * @param {string} commentId - Comment ID
 * @returns {Promise<{status: string, response: any}>}
 */
export async function deleteComment(commentId) {
    try {
        const userData = await getUserAuth();
        if (!userData) {
            throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
        }

        const response = await apiClient.delete(`/comments/${commentId}`);

        return {
            status: Constant_Var_success,
            response: response.data.data
        };
    } catch (error) {
        console.error('Error deleting comment:', error);
        return {
            status: Constant_Var_error,
            response: error.response?.data || error.message
        };
    }
}

/**
 * React to a comment (like/dislike)
 * @param {string} commentId - Comment ID
 * @param {string} reactionType - Reaction type ('like' or 'dislike')
 * @returns {Promise<{status: string, response: any}>}
 */
export async function reactOnComment(commentId, reactionType) {
    try {
        const userData = await getUserAuth();
        if (!userData) {
            throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
        }

        const response = await apiClient.post(`/comments/${commentId}/react`, {
            reactionType: reactionType, // 'like' or 'dislike'
        });

        return {
            status: Constant_Var_success,
            response: response.data.data
        };
    } catch (error) {
        console.error('Error reacting to comment:', error);
        return {
            status: Constant_Var_error,
            response: error.response?.data || error.message
        };
    }
}
