import apiClient from './interceptor';
import {
  Constant_Var_success,
  Constant_Var_error,
  Constant_Var_errorMessage_notAuthenticatedUser
} from '@/utils/constants';
import getUserAuth from '@/app/firebase/utils/GetUserAuth';

/**
 * User service for Cloudflare Worker API integration
 * Replaces Firebase Firestore operations for user profiles
 */

/**
 * Get logged-in user data from Cloudflare Worker
 * @returns {Promise<{status: string, response: any}>}
 */
export async function getLoggedUserData() {
  try {
    const userData = await getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
    }

    const response = await apiClient.get('/user', {
      params: { userId: userData.details.uid }
    });

    return {
      status: Constant_Var_success,
      response: response.data.data // Based on your sendSuccess format
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return {
      status: Constant_Var_error,
      response: error.response?.data || error.message
    };
  }
}

/**
 * Create or update user profile in Cloudflare Worker
 * @param {Object} userProfile - User profile data
 * @returns {Promise<{status: string, response: any}>}
 */
export async function createOrUpdateUserProfile(userProfile) {
  try {
    const userData = await getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
    }

    const profileData = {
      userName: userProfile.userName || userData.details.name,
      email: userProfile.email || userData.details.email,
      userProfileUrl: userProfile.photoUrl || userData.details.photoURL,
      userBannerUrl: userProfile.coverUrl || '',
    };

    const response = await apiClient.post('/user', profileData);

    return {
      status: Constant_Var_success,
      response: response.data.data
    };
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    return {
      status: Constant_Var_error,
      response: error.response?.data || error.message
    };
  }
}

/**
 * Update user name
 * @param {string} userName - New user name
 * @returns {Promise<{status: string, response: any}>}
 */
export async function updateUserName(userName) {
  try {
    const userData = await getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
    }

    const response = await apiClient.patch('/user', {
      displayName: userName
    });

    return {
      status: Constant_Var_success,
      response: response.data.data
    };
  } catch (error) {
    console.error('Error updating user name:', error);
    return {
      status: Constant_Var_error,
      response: error.response?.data || error.message
    };
  }
}

/**
 * Update user profile image
 * @param {string} photoUrl - New profile image URL
 * @returns {Promise<{status: string, response: any}>}
 */
export async function updateUserProfileImage(photoUrl) {
  try {
    const userData = await getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
    }

    const response = await apiClient.patch('/user', {
      userProfileUrl: photoUrl
    });

    return {
      status: Constant_Var_success,
      response: response.data.data
    };
  } catch (error) {
    console.error('Error updating profile image:', error);
    return {
      status: Constant_Var_error,
      response: error.response?.data || error.message
    };
  }
}

/**
 * Update user cover image
 * @param {string} coverUrl - New cover image URL
 * @returns {Promise<{status: string, response: any}>}
 */
export async function updateUserCoverImage(coverUrl) {
  try {
    const userData = await getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
    }

    const response = await apiClient.patch('/user', {
      userBannerUrl: coverUrl
    });

    return {
      status: Constant_Var_success,
      response: response.data.data
    };
  } catch (error) {
    console.error('Error updating cover image:', error);
    return {
      status: Constant_Var_error,
      response: error.response?.data || error.message
    };
  }
}

/**
 * Update user bio
 * @param {string} userBio - User bio text
 * @returns {Promise<{status: string, response: any}>}
 */
export async function updateUserBio(userBio) {
  try {
    const userData = await getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
    }

    const response = await apiClient.patch('/user', {
      userBio: userBio
    });

    return {
      status: Constant_Var_success,
      response: response.data.data
    };
  } catch (error) {
    console.error('Error updating user bio:', error);
    return {
      status: Constant_Var_error,
      response: error.response?.data || error.message
    };
  }
}

/**
 * Delete user profile
 * @returns {Promise<{status: string, response: any}>}
 */
export async function deleteUserProfile() {
  try {
    const userData = await getUserAuth();
    if (!userData) {
      throw new Error(Constant_Var_errorMessage_notAuthenticatedUser);
    }

    const response = await apiClient.delete('/user');

    return {
      status: Constant_Var_success,
      response: response.data.data
    };
  } catch (error) {
    console.error('Error deleting user profile:', error);
    return {
      status: Constant_Var_error,
      response: error.response?.data || error.message
    };
  }
}