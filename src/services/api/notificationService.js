import apiClient from './interceptor';
import {
    Constant_Var_success,
    Constant_Var_error,
    Constant_Var_errorMessage_notAuthenticatedUser
} from '@/utils/constants';
import getUserAuth from '@/app/firebase/utils/GetUserAuth';

/**
 * Notification service for Cloudflare Worker API integration
 * Handles all notification-related operations through the Cloudflare D1 database
 */

/**
 * Get user notifications
 * @param {Object} options - Query options (limit, offset, unreadOnly, etc.)
 * @returns {Promise<{status: string, response: any}>}
 */
export async function getNotifications(options = {}) {
    try {
        const userData = await getUserAuth();
        if (!userData) {
            throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
        }

        const params = {
            limit: options.limit || 20,
            offset: options.offset || 0,
            unreadOnly: options.unreadOnly || false,
            ...options
        };

        const response = await apiClient.get('/notifications', { params });

        return {
            status: Constant_Var_success,
            response: response.data.data
        };
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return {
            status: Constant_Var_error,
            response: error.response?.data || error.message
        };
    }
}

/**
 * Get a single notification by ID
 * @param {string} notificationId - Notification ID
 * @returns {Promise<{status: string, response: any}>}
 */
export async function getNotificationById(notificationId) {
    try {
        const userData = await getUserAuth();
        if (!userData) {
            throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
        }

        const response = await apiClient.get(`/notifications/${notificationId}`);

        return {
            status: Constant_Var_success,
            response: response.data.data
        };
    } catch (error) {
        console.error('Error fetching notification:', error);
        return {
            status: Constant_Var_error,
            response: error.response?.data || error.message
        };
    }
}

/**
 * Mark notifications as read
 * @param {Array<string>} notificationIds - Array of notification IDs to mark as read
 * @returns {Promise<{status: string, response: any}>}
 */
export async function markNotificationsAsRead(notificationIds) {
    try {
        const userData = await getUserAuth();
        if (!userData) {
            throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
        }

        const response = await apiClient.put('/mark-read-notifications', {
            notificationIds: notificationIds,
        });

        return {
            status: Constant_Var_success,
            response: response.data.data
        };
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        return {
            status: Constant_Var_error,
            response: error.response?.data || error.message
        };
    }
}
