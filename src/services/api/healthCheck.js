import apiClient from './client';

/**
 * Health check function to test the Next.js proxy to Cloudflare Worker
 * This helps verify that the proxy is working correctly
 */
export async function checkCloudflareProxyHealth() {
  try {
    console.log('Testing Cloudflare proxy health...');
    
    // Test the root endpoint through the proxy
    const response = await apiClient.get('/');
    
    if (response.status === 200) {
      console.log('✅ Cloudflare proxy is healthy');
      return {
        status: 'success',
        message: 'Cloudflare proxy is accessible',
        data: response.data
      };
    } else {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Cloudflare proxy health check failed:', error);
    return {
      status: 'error',
      message: 'Cloudflare proxy is not accessible',
      error: error.response?.data || error.message
    };
  }
}

/**
 * Test authentication through the proxy
 * This requires a user to be logged in
 */
export async function testProxyAuthentication() {
  try {
    console.log('Testing proxy authentication...');
    
    // Try to access a protected endpoint
    const response = await apiClient.get('/user');
    
    if (response.status === 200) {
      console.log('✅ Proxy authentication is working');
      return {
        status: 'success',
        message: 'Authentication through proxy is working',
        data: response.data
      };
    } else {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('🔐 Authentication required (expected if not logged in)');
      return {
        status: 'auth_required',
        message: 'Authentication is required',
        error: error.response.data
      };
    } else {
      console.error('❌ Proxy authentication test failed:', error);
      return {
        status: 'error',
        message: 'Proxy authentication test failed',
        error: error.response?.data || error.message
      };
    }
  }
}