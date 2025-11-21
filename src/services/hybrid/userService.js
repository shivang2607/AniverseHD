import {
  getLoggedUserData as getCloudflareUserData,
  createOrUpdateUserProfile as createCloudflareUserProfile,
  updateUserName as updateCloudflareUserName,
  updateUserProfileImage as updateCloudflareUserProfileImage,
  updateUserCoverImage as updateCloudflareUserCoverImage,
  updateUserBio as updateCloudflareUserBio
} from '../api/userService';

// Firebase imports
import GetLoggedUserData from '@/app/firebase/Profile/GetLoggedUserData';
import CreateNewProfile from '@/app/firebase/Profile/CreateNewProfile';
import UpdateName from '@/app/firebase/Profile/UpdateName';
import UpdateProfileImage from '@/app/firebase/Profile/UpdateProfileImage';
import UpdateCoverImage from '@/app/firebase/Profile/UpdateCoverImage';

import {
  Constant_Var_success,
  Constant_Var_error
} from '@/utils/constants';

/**
 * Hybrid User Service - Dual write to both Firestore and Cloudflare
 * Reads from Cloudflare, writes to both systems for data safety
 */

/**
 * Get user data - reads from Cloudflare only
 * @returns {Promise<{status: string, response: any}>}
 */
export async function getUserData() {
  try {
    // Read from Cloudflare only - no fallback
    const cloudflareResult = await getCloudflareUserData();

    console.log("getUserData from Cloudflare:", cloudflareResult);
    return cloudflareResult;
  } catch (error) {
    console.error('Error in hybrid getUserData:', error);
    return { status: Constant_Var_error, response: error };
  }
}

/**
 * Create user profile - writes to both Firestore and Cloudflare
 * @param {Object} userProfile - User profile data
 * @returns {Promise<{status: string, response: any}>}
 */
export async function createUserProfile(userProfile) {
  const results = {
    firebase: null,
    cloudflare: null,
    success: false,
    errors: []
  };

  try {
    // Write to both systems in parallel
    const [firebaseResult, cloudflareResult] = await Promise.allSettled([
      CreateNewProfile(userProfile),
      createCloudflareUserProfile(userProfile)
    ]);

    // Process Firebase result
    if (firebaseResult.status === 'fulfilled') {
      results.firebase = firebaseResult.value;
    } else {
      results.errors.push(`Firebase error: ${firebaseResult.reason}`);
      console.error('Firebase create user failed:', firebaseResult.reason);
    }

    // Process Cloudflare result
    if (cloudflareResult.status === 'fulfilled') {
      results.cloudflare = cloudflareResult.value;
    } else {
      results.errors.push(`Cloudflare error: ${cloudflareResult.reason}`);
      console.error('Cloudflare create user failed:', cloudflareResult.reason);
    }

    // Consider success if at least one system succeeded
    const firebaseSuccess = results.firebase?.status === Constant_Var_success;
    const cloudflareSuccess = results.cloudflare?.status === Constant_Var_success;

    results.success = firebaseSuccess || cloudflareSuccess;

    if (results.success) {
      // Log any partial failures
      if (!firebaseSuccess) {
        console.warn('User creation: Firebase failed but Cloudflare succeeded');
      }
      if (!cloudflareSuccess) {
        console.warn('User creation: Cloudflare failed but Firebase succeeded');
      }

      return {
        status: Constant_Var_success,
        response: results.cloudflare?.response || results.firebase?.response,
        hybridResults: results
      };
    } else {
      throw new Error(`Both systems failed: ${results.errors.join(', ')}`);
    }
  } catch (error) {
    console.error('Error in hybrid createUserProfile:', error);
    return {
      status: Constant_Var_error,
      response: error.message,
      hybridResults: results
    };
  }
}

/**
 * Update user name - writes to both Firestore and Cloudflare
 * @param {string} userName - New user name
 * @returns {Promise<{status: string, response: any}>}
 */
export async function updateUserName(userName) {
  const results = {
    firebase: null,
    cloudflare: null,
    success: false,
    errors: []
  };

  try {
    // Write to both systems in parallel
    const [firebaseResult, cloudflareResult] = await Promise.allSettled([
      UpdateName({ userName }),
      updateCloudflareUserName(userName)
    ]);

    // Process results
    if (firebaseResult.status === 'fulfilled') {
      results.firebase = firebaseResult.value;
    } else {
      results.errors.push(`Firebase error: ${firebaseResult.reason}`);
      console.error('Firebase update name failed:', firebaseResult.reason);
    }

    if (cloudflareResult.status === 'fulfilled') {
      results.cloudflare = cloudflareResult.value;
    } else {
      results.errors.push(`Cloudflare error: ${cloudflareResult.reason}`);
      console.error('Cloudflare update name failed:', cloudflareResult.reason);
    }

    // Consider success if at least one system succeeded
    const firebaseSuccess = results.firebase?.status === Constant_Var_success;
    const cloudflareSuccess = results.cloudflare?.status === Constant_Var_success;

    results.success = firebaseSuccess || cloudflareSuccess;

    if (results.success) {
      return {
        status: Constant_Var_success,
        response: results.cloudflare?.response || results.firebase?.response,
        hybridResults: results
      };
    } else {
      throw new Error(`Both systems failed: ${results.errors.join(', ')}`);
    }
  } catch (error) {
    console.error('Error in hybrid updateUserName:', error);
    return {
      status: Constant_Var_error,
      response: error.message,
      hybridResults: results
    };
  }
}

/**
 * Update profile image - writes to both Firestore and Cloudflare
 * @param {Blob} blob - Image blob
 * @returns {Promise<{status: string, response: any}>}
 */
export async function updateProfileImage(blob) {
  const results = {
    firebase: null,
    cloudflare: null,
    success: false,
    errors: []
  };

  try {
    // Upload image to Firebase Storage first (since both systems will use the same URL)
    const { default: UploadImageToFirebaseStorage } = await import('@/app/firebase/utils/UploadImageToFirebaseStorage');
    const imageUploadResult = await UploadImageToFirebaseStorage({
      blob,
      folderName: 'profileImages'
    });

    if (imageUploadResult.status !== Constant_Var_success) {
      throw new Error('Image upload failed');
    }

    const imageUrl = imageUploadResult.response;

    // Update both systems with the new image URL
    const [firebaseResult, cloudflareResult] = await Promise.allSettled([
      UpdateProfileImage({ blob }), // Firebase handles its own upload
      updateCloudflareUserProfileImage(imageUrl)
    ]);

    // Process results
    if (firebaseResult.status === 'fulfilled') {
      results.firebase = firebaseResult.value;
    } else {
      results.errors.push(`Firebase error: ${firebaseResult.reason}`);
      console.error('Firebase update profile image failed:', firebaseResult.reason);
    }

    if (cloudflareResult.status === 'fulfilled') {
      results.cloudflare = cloudflareResult.value;
    } else {
      results.errors.push(`Cloudflare error: ${cloudflareResult.reason}`);
      console.error('Cloudflare update profile image failed:', cloudflareResult.reason);
    }

    // Consider success if at least one system succeeded
    const firebaseSuccess = results.firebase?.status === Constant_Var_success;
    const cloudflareSuccess = results.cloudflare?.status === Constant_Var_success;

    results.success = firebaseSuccess || cloudflareSuccess;

    if (results.success) {
      return {
        status: Constant_Var_success,
        response: results.cloudflare?.response || results.firebase?.response,
        hybridResults: results
      };
    } else {
      throw new Error(`Both systems failed: ${results.errors.join(', ')}`);
    }
  } catch (error) {
    console.error('Error in hybrid updateProfileImage:', error);
    return {
      status: Constant_Var_error,
      response: error.message,
      hybridResults: results
    };
  }
}

/**
 * Update cover image - writes to both Firestore and Cloudflare
 * @param {Blob} blob - Image blob
 * @returns {Promise<{status: string, response: any}>}
 */
export async function updateCoverImage(blob) {
  const results = {
    firebase: null,
    cloudflare: null,
    success: false,
    errors: []
  };

  try {
    // Upload image to Firebase Storage first
    const { default: UploadImageToFirebaseStorage } = await import('@/app/firebase/utils/UploadImageToFirebaseStorage');
    const imageUploadResult = await UploadImageToFirebaseStorage({
      blob,
      folderName: 'coverImages'
    });

    if (imageUploadResult.status !== Constant_Var_success) {
      throw new Error('Image upload failed');
    }

    const imageUrl = imageUploadResult.response;

    // Update both systems with the new image URL
    const [firebaseResult, cloudflareResult] = await Promise.allSettled([
      UpdateCoverImage({ blob }), // Firebase handles its own upload
      updateCloudflareUserCoverImage(imageUrl)
    ]);

    // Process results
    if (firebaseResult.status === 'fulfilled') {
      results.firebase = firebaseResult.value;
    } else {
      results.errors.push(`Firebase error: ${firebaseResult.reason}`);
      console.error('Firebase update cover image failed:', firebaseResult.reason);
    }

    if (cloudflareResult.status === 'fulfilled') {
      results.cloudflare = cloudflareResult.value;
    } else {
      results.errors.push(`Cloudflare error: ${cloudflareResult.reason}`);
      console.error('Cloudflare update cover image failed:', cloudflareResult.reason);
    }

    // Consider success if at least one system succeeded
    const firebaseSuccess = results.firebase?.status === Constant_Var_success;
    const cloudflareSuccess = results.cloudflare?.status === Constant_Var_success;

    results.success = firebaseSuccess || cloudflareSuccess;

    if (results.success) {
      return {
        status: Constant_Var_success,
        response: results.cloudflare?.response || results.firebase?.response,
        hybridResults: results
      };
    } else {
      throw new Error(`Both systems failed: ${results.errors.join(', ')}`);
    }
  } catch (error) {
    console.error('Error in hybrid updateCoverImage:', error);
    return {
      status: Constant_Var_error,
      response: error.message,
      hybridResults: results
    };
  }
}
