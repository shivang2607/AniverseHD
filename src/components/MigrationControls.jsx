import { useState, useEffect } from 'react';
import useUserStore from '@/ZustandStores/userStore';
import { checkCloudflareProxyHealth, testProxyAuthentication } from '@/services/api/healthCheck';

/**
 * Migration Controls Component
 * Add this to your admin panel or settings page to control migration modes
 */
export default function MigrationControls() {
  const userStore = useUserStore();
  const [currentMode, setCurrentMode] = useState(userStore.getMigrationMode());
  const [healthStatus, setHealthStatus] = useState(null);
  const [lastResults, setLastResults] = useState(null);
  const [proxyHealth, setProxyHealth] = useState(null);

  useEffect(() => {
    // Update current mode when store changes
    setCurrentMode(userStore.getMigrationMode());
    setLastResults(userStore.getLastHybridResults());
  }, [userStore, userStore.migrationMode, userStore.lastHybridResults]);

  const handleModeChange = (newMode) => {
    userStore.setMigrationMode(newMode);
    setCurrentMode(newMode);
  };

  const handleHealthCheck = async () => {
    const health = await userStore.checkSystemHealth();
    setHealthStatus(health);
  };

  const handleProxyHealthCheck = async () => {
    const [proxyResult, authResult] = await Promise.all([
      checkCloudflareProxyHealth(),
      testProxyAuthentication()
    ]);
    
    setProxyHealth({
      proxy: proxyResult,
      auth: authResult
    });
  };

  const getModeColor = (mode) => {
    switch (mode) {
      case 'firebase': return 'bg-blue-500';
      case 'hybrid': return 'bg-yellow-500';
      case 'cloudflare': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getModeDescription = (mode) => {
    switch (mode) {
      case 'firebase': return 'Firebase only (original, safest)';
      case 'hybrid': return 'Dual-write to both systems (migration mode)';
      case 'cloudflare': return 'Cloudflare only (future)';
      default: return 'Unknown mode';
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Migration Controls
      </h2>

      {/* Current Mode Display */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getModeColor(currentMode)}`}>
            {currentMode.toUpperCase()}
          </span>
          <span className="text-gray-600 dark:text-gray-300">
            {getModeDescription(currentMode)}
          </span>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
          Switch Migration Mode
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {['firebase', 'hybrid', 'cloudflare'].map((mode) => (
            <button
              key={mode}
              onClick={() => handleModeChange(mode)}
              disabled={mode === currentMode}
              className={`p-3 rounded-lg border-2 transition-all ${
                mode === currentMode
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
              } ${
                mode === currentMode ? 'cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <div className="text-left">
                <div className="font-medium text-gray-900 dark:text-white capitalize">
                  {mode}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {getModeDescription(mode)}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Emergency Controls */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
          Emergency Controls
        </h3>
        <div className="flex gap-3">
          <button
            onClick={userStore.enableEmergencyFallback}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            🚨 Emergency Firebase Fallback
          </button>
          <button
            onClick={userStore.disableEmergencyFallback}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            ✅ Disable Emergency Mode
          </button>
        </div>
      </div>

      {/* Proxy Health Check */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
          Cloudflare Proxy Health
        </h3>
        <button
          onClick={handleProxyHealthCheck}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors mb-3"
        >
          🔍 Check Proxy Health
        </button>
        
        {proxyHealth && (
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-3 rounded-lg ${proxyHealth.proxy.status === 'success' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
              <div className="font-medium">Proxy Connection</div>
              <div className={`text-sm ${proxyHealth.proxy.status === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {proxyHealth.proxy.status === 'success' ? '✅ Connected' : '❌ Failed'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {proxyHealth.proxy.message}
              </div>
            </div>
            <div className={`p-3 rounded-lg ${proxyHealth.auth.status === 'success' ? 'bg-green-100 dark:bg-green-900/20' : proxyHealth.auth.status === 'auth_required' ? 'bg-yellow-100 dark:bg-yellow-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
              <div className="font-medium">Authentication</div>
              <div className={`text-sm ${proxyHealth.auth.status === 'success' ? 'text-green-600 dark:text-green-400' : proxyHealth.auth.status === 'auth_required' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                {proxyHealth.auth.status === 'success' ? '✅ Working' : proxyHealth.auth.status === 'auth_required' ? '🔐 Auth Required' : '❌ Failed'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {proxyHealth.auth.message}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* System Health Check */}
      {currentMode === 'hybrid' && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            System Health
          </h3>
          <button
            onClick={handleHealthCheck}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors mb-3"
          >
            🔍 Check System Health
          </button>
          
          {healthStatus && (
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-3 rounded-lg ${healthStatus.firebase ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                <div className="font-medium">Firebase</div>
                <div className={`text-sm ${healthStatus.firebase ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {healthStatus.firebase ? '✅ Healthy' : '❌ Unhealthy'}
                </div>
              </div>
              <div className={`p-3 rounded-lg ${healthStatus.cloudflare ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                <div className="font-medium">Cloudflare</div>
                <div className={`text-sm ${healthStatus.cloudflare ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {healthStatus.cloudflare ? '✅ Healthy' : '❌ Unhealthy'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Last Operation Results */}
      {currentMode === 'hybrid' && lastResults && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            Last Operation Results
          </h3>
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
            <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-auto">
              {JSON.stringify(lastResults, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          Migration Instructions
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• <strong>Firebase:</strong> Original mode, all data from Firebase (safest)</li>
          <li>• <strong>Hybrid:</strong> Writes to both systems, reads from Cloudflare with Firebase fallback</li>
          <li>• <strong>Cloudflare:</strong> All operations use Cloudflare only (future)</li>
          <li>• Use Emergency Fallback if Cloudflare has issues</li>
        </ul>
      </div>
    </div>
  );
}