import {
    getNotifications as getCloudflareNotifications,
    getNotificationById as getCloudflareNotificationById,
    markNotificationsAsRead as markCloudflareNotificationsAsRead
} from '../api/notificationService';

import {
    Constant_Var_success,
    Constant_Var_error
} from '@/utils/constants';

/**
 * Hybrid Notification Service
 * 
 * Since notifications only exist in Cloudflare (not in Firebase), this service
 * acts as a passthrough to Cloudflare. In the future, if you need to sync
 * notifications to Firebase, you can implement dual-write here.
 */

/**
 * Get user notifications - reads from Cloudflare only
 * @param {Object} options - Query options
 * @returns {Promise<{status: string, response: any}>}
 */
export async function getNotifications(options = {}) {
    try {
        const cloudflareResult = await getCloudflareNotifications(options);
        return cloudflareResult;
    } catch (error) {
        console.error('Error in hybrid getNotifications:', error);
        return { status: Constant_Var_error, response: error };
    }
}

/**
 * Get notification by ID - reads from Cloudflare only
 * @param {string} notificationId - Notification ID
 * @returns {Promise<{status: string, response: any}>}
 */
export async function getNotificationById(notificationId) {
    try {
        const cloudflareResult = await getCloudflareNotificationById(notificationId);
        return cloudflareResult;
    } catch (error) {
        console.error('Error in hybrid getNotificationById:', error);
        return { status: Constant_Var_error, response: error };
    }
}

/**
 * Mark notifications as read - writes to Cloudflare only
 * @param {Array<string>} notificationIds - Array of notification IDs
 * @returns {Promise<{status: string, response: any}>}
 */
export async function markNotificationsAsRead(notificationIds) {
    try {
        const cloudflareResult = await markCloudflareNotificationsAsRead(notificationIds);
        return cloudflareResult;
    } catch (error) {
        console.error('Error in hybrid markNotificationsAsRead:', error);
        return {
            status: Constant_Var_error,
            response: error.message
        };
    }
}
