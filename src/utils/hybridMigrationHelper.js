/**
 * Hybrid Migration Helper - Manages dual-write operations and fallback strategies
 * This provides utilities for monitoring and managing the hybrid Firebase + Cloudflare setup
 */

import { Constant_Var_success } from './constants';

/**
 * Configuration for hybrid operations
 */
export const HYBRID_CONFIG = {
  // Timeout for operations (in milliseconds)
  OPERATION_TIMEOUT: 10000,
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  
  // Health check intervals
  HEALTH_CHECK_INTERVAL: 30000, // 30 seconds
  
  // Fallback thresholds
  FAILURE_THRESHOLD: 3, // Number of consecutive failures before fallback
};

/**
 * Health monitoring for both systems
 */
class HybridHealthMonitor {
  constructor() {
    this.firebaseHealth = { status: 'unknown', lastCheck: null, failures: 0 };
    this.cloudflareHealth = { status: 'unknown', lastCheck: null, failures: 0 };
    this.isMonitoring = false;
  }

  async checkFirebaseHealth() {
    try {
      const { default: getUserAuth } = await import('@/app/firebase/utils/GetUserAuth');
      const userData = await getUserAuth();
      
      if (userData) {
        this.firebaseHealth = { 
          status: 'healthy', 
          lastCheck: new Date(), 
          failures: 0 
        };
        return true;
      } else {
        throw new Error('No user authenticated');
      }
    } catch (error) {
      this.firebaseHealth.failures++;
      this.firebaseHealth.status = 'unhealthy';
      this.firebaseHealth.lastCheck = new Date();
      console.error('Firebase health check failed:', error);
      return false;
    }
  }

  async checkCloudflareHealth() {
    try {
      const { default: apiClient } = await import('@/services/api/client');
      const response = await apiClient.get('/');
      
      if (response.status === 200) {
        this.cloudflareHealth = { 
          status: 'healthy', 
          lastCheck: new Date(), 
          failures: 0 
        };
        return true;
      } else {
        throw new Error(`Unexpected status: ${response.status}`);
      }
    } catch (error) {
      this.cloudflareHealth.failures++;
      this.cloudflareHealth.status = 'unhealthy';
      this.cloudflareHealth.lastCheck = new Date();
      console.error('Cloudflare health check failed:', error);
      return false;
    }
  }

  async performHealthCheck() {
    const [firebaseHealthy, cloudflareHealthy] = await Promise.all([
      this.checkFirebaseHealth(),
      this.checkCloudflareHealth()
    ]);

    // Auto-enable fallback if Cloudflare is consistently failing
    if (this.cloudflareHealth.failures >= HYBRID_CONFIG.FAILURE_THRESHOLD) {
      console.warn('Cloudflare has failed multiple times, enabling fallback mode');
      this.enableAutoFallback();
    }

    return {
      firebase: firebaseHealthy,
      cloudflare: cloudflareHealthy,
      overall: firebaseHealthy || cloudflareHealthy
    };
  }

  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.performHealthCheck();
    }, HYBRID_CONFIG.HEALTH_CHECK_INTERVAL);
    
    console.log('Hybrid health monitoring started');
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.isMonitoring = false;
      console.log('Hybrid health monitoring stopped');
    }
  }

  enableAutoFallback() {
    localStorage.setItem('USE_FIREBASE_FALLBACK', 'true');
    localStorage.setItem('USE_FIREBASE_FALLBACK_WATCHLISTS', 'true');
    localStorage.setItem('AUTO_FALLBACK_ENABLED', new Date().toISOString());
    
    // Dispatch custom event for UI components to react
    window.dispatchEvent(new CustomEvent('hybridFallbackEnabled', {
      detail: { reason: 'auto', timestamp: new Date() }
    }));
  }

  getHealthStatus() {
    return {
      firebase: this.firebaseHealth,
      cloudflare: this.cloudflareHealth,
      isMonitoring: this.isMonitoring
    };
  }
}

// Global health monitor instance
export const healthMonitor = new HybridHealthMonitor();

/**
 * Utility to execute operations with timeout and retry logic
 */
export async function executeWithRetry(operation, operationName, maxRetries = HYBRID_CONFIG.MAX_RETRIES) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Operation timeout')), HYBRID_CONFIG.OPERATION_TIMEOUT);
      });
      
      const result = await Promise.race([operation(), timeoutPromise]);
      return result;
    } catch (error) {
      lastError = error;
      console.warn(`${operationName} attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, HYBRID_CONFIG.RETRY_DELAY * attempt));
      }
    }
  }
  
  throw lastError;
}

/**
 * Data consistency checker - compares data between Firebase and Cloudflare
 */
export async function checkDataConsistency(userId) {
  try {
    console.log('Checking data consistency between Firebase and Cloudflare...');
    
    // Get data from both systems
    const [firebaseUserData, cloudflareUserData] = await Promise.allSettled([
      import('@/app/firebase/Profile/GetLoggedUserData').then(module => module.default()),
      import('@/services/api/userService').then(module => module.getLoggedUserData())
    ]);

    const [firebaseWatchlists, cloudflareWatchlists] = await Promise.allSettled([
      import('@/app/firebase/WatchList/WatchListDocument/GetLoggedUserWatchListsInfo').then(module => module.default()),
      import('@/services/api/watchlistService').then(module => module.getUserWatchlists())
    ]);

    const inconsistencies = [];

    // Check user data consistency
    if (firebaseUserData.status === 'fulfilled' && cloudflareUserData.status === 'fulfilled') {
      const fbUser = firebaseUserData.value.response;
      const cfUser = cloudflareUserData.value.response;
      
      if (fbUser.userName !== cfUser.displayName) {
        inconsistencies.push({
          type: 'user_name',
          firebase: fbUser.userName,
          cloudflare: cfUser.displayName
        });
      }
      
      if (fbUser.email !== cfUser.email) {
        inconsistencies.push({
          type: 'user_email',
          firebase: fbUser.email,
          cloudflare: cfUser.email
        });
      }
    }

    // Check watchlist consistency
    if (firebaseWatchlists.status === 'fulfilled' && cloudflareWatchlists.status === 'fulfilled') {
      const fbWatchlists = firebaseWatchlists.value.response;
      const cfWatchlists = cloudflareWatchlists.value.response;
      
      if (fbWatchlists.length !== cfWatchlists.length) {
        inconsistencies.push({
          type: 'watchlist_count',
          firebase: fbWatchlists.length,
          cloudflare: cfWatchlists.length
        });
      }
    }

    return {
      status: Constant_Var_success,
      consistent: inconsistencies.length === 0,
      inconsistencies: inconsistencies,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error checking data consistency:', error);
    return {
      status: 'error',
      error: error.message,
      timestamp: new Date()
    };
  }
}

/**
 * Migration status tracker
 */
export class MigrationStatusTracker {
  constructor() {
    this.status = this.loadStatus();
  }

  loadStatus() {
    const saved = localStorage.getItem('HYBRID_MIGRATION_STATUS');
    return saved ? JSON.parse(saved) : {
      phase: 'not_started', // not_started, dual_write, cloudflare_primary, completed
      startedAt: null,
      completedAt: null,
      operations: {
        userCreated: 0,
        userUpdated: 0,
        watchlistCreated: 0,
        watchlistUpdated: 0,
        animeAdded: 0,
        animeRemoved: 0
      },
      errors: []
    };
  }

  saveStatus() {
    localStorage.setItem('HYBRID_MIGRATION_STATUS', JSON.stringify(this.status));
  }

  startMigration() {
    this.status.phase = 'dual_write';
    this.status.startedAt = new Date().toISOString();
    this.saveStatus();
  }

  recordOperation(operationType, success = true, error = null) {
    if (success) {
      this.status.operations[operationType]++;
    } else {
      this.status.errors.push({
        operation: operationType,
        error: error?.message || 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
    this.saveStatus();
  }

  completeMigration() {
    this.status.phase = 'completed';
    this.status.completedAt = new Date().toISOString();
    this.saveStatus();
  }

  getStatus() {
    return { ...this.status };
  }

  reset() {
    localStorage.removeItem('HYBRID_MIGRATION_STATUS');
    this.status = this.loadStatus();
  }
}

// Global migration tracker
export const migrationTracker = new MigrationStatusTracker();

/**
 * Emergency recovery utilities
 */
export const emergencyRecovery = {
  /**
   * Switch to Firebase-only mode immediately
   */
  enableFirebaseOnly() {
    localStorage.setItem('USE_FIREBASE_FALLBACK', 'true');
    localStorage.setItem('USE_FIREBASE_FALLBACK_WATCHLISTS', 'true');
    localStorage.setItem('EMERGENCY_MODE', 'firebase_only');
    localStorage.setItem('EMERGENCY_MODE_TIMESTAMP', new Date().toISOString());
    
    window.dispatchEvent(new CustomEvent('emergencyModeEnabled', {
      detail: { mode: 'firebase_only', timestamp: new Date() }
    }));
    
    console.warn('EMERGENCY: Switched to Firebase-only mode');
  },

  /**
   * Switch to Cloudflare-only mode (risky - only if Firebase is down)
   */
  enableCloudflareOnly() {
    localStorage.setItem('USE_CLOUDFLARE_ONLY', 'true');
    localStorage.setItem('EMERGENCY_MODE', 'cloudflare_only');
    localStorage.setItem('EMERGENCY_MODE_TIMESTAMP', new Date().toISOString());
    
    window.dispatchEvent(new CustomEvent('emergencyModeEnabled', {
      detail: { mode: 'cloudflare_only', timestamp: new Date() }
    }));
    
    console.warn('EMERGENCY: Switched to Cloudflare-only mode');
  },

  /**
   * Return to hybrid mode
   */
  enableHybridMode() {
    localStorage.removeItem('USE_FIREBASE_FALLBACK');
    localStorage.removeItem('USE_FIREBASE_FALLBACK_WATCHLISTS');
    localStorage.removeItem('USE_CLOUDFLARE_ONLY');
    localStorage.removeItem('EMERGENCY_MODE');
    localStorage.removeItem('EMERGENCY_MODE_TIMESTAMP');
    
    window.dispatchEvent(new CustomEvent('emergencyModeDisabled', {
      detail: { timestamp: new Date() }
    }));
    
    console.log('Returned to hybrid mode');
  },

  /**
   * Get current emergency mode status
   */
  getEmergencyStatus() {
    const mode = localStorage.getItem('EMERGENCY_MODE');
    const timestamp = localStorage.getItem('EMERGENCY_MODE_TIMESTAMP');
    
    return {
      isEmergencyMode: !!mode,
      mode: mode,
      enabledAt: timestamp ? new Date(timestamp) : null
    };
  }
};

/**
 * Initialize hybrid system monitoring
 */
export function initializeHybridSystem() {
  console.log('Initializing hybrid Firebase + Cloudflare system...');
  
  // Start health monitoring
  healthMonitor.startMonitoring();
  
  // Start migration tracking if not already started
  if (migrationTracker.getStatus().phase === 'not_started') {
    migrationTracker.startMigration();
  }
  
  // Set up error handlers
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('Cloudflare') || event.reason?.message?.includes('Firebase')) {
      console.error('Unhandled hybrid system error:', event.reason);
      migrationTracker.recordOperation('unhandledError', false, event.reason);
    }
  });
  
  console.log('Hybrid system initialized successfully');
}

/**
 * Cleanup hybrid system resources
 */
export function cleanupHybridSystem() {
  healthMonitor.stopMonitoring();
  console.log('Hybrid system cleaned up');
}