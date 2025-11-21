/**
 * Data Source Configuration
 * Controls whether the app uses Firebase, Cloudflare, or Hybrid mode
 */

// Data source modes
export const DATA_SOURCE_FIREBASE = 'firebase';
export const DATA_SOURCE_HYBRID = 'hybrid';
export const DATA_SOURCE_CLOUDFLARE = 'cloudflare';

/**
 * Get the current data source from environment variable
 * @returns {'firebase' | 'hybrid' | 'cloudflare'}
 */
export function getDataSource() {
    const dataSource = process.env.NEXT_PUBLIC_DATA_SOURCE || DATA_SOURCE_FIREBASE;

    // Validate the data source
    const validSources = [DATA_SOURCE_FIREBASE, DATA_SOURCE_HYBRID, DATA_SOURCE_CLOUDFLARE];
    if (!validSources.includes(dataSource)) {
        console.warn(`Invalid NEXT_PUBLIC_DATA_SOURCE: ${dataSource}. Defaulting to 'firebase'`);
        return DATA_SOURCE_FIREBASE;
    }

    return dataSource;
}

/**
 * Check if currently in Firebase mode
 * @returns {boolean}
 */
export function isFirebaseMode() {
    return getDataSource() === DATA_SOURCE_FIREBASE;
}

/**
 * Check if currently in Hybrid mode (dual-write)
 * @returns {boolean}
 */
export function isHybridMode() {
    return getDataSource() === DATA_SOURCE_HYBRID;
}

/**
 * Check if currently in Cloudflare mode
 * @returns {boolean}
 */
export function isCloudflareMode() {
    return getDataSource() === DATA_SOURCE_CLOUDFLARE;
}

/**
 * Log current data source configuration
 */
export function logDataSourceConfig() {
    const source = getDataSource();
    console.log(`[Data Source] Current mode: ${source}`);

    if (source === DATA_SOURCE_FIREBASE) {
        console.log('[Data Source] All operations use Firebase Firestore');
    } else if (source === DATA_SOURCE_HYBRID) {
        console.log('[Data Source] Writes go to both Firebase and Cloudflare');
        console.log('[Data Source] Reads come from Cloudflare only (no fallback)');
    } else if (source === DATA_SOURCE_CLOUDFLARE) {
        console.log('[Data Source] All operations use Cloudflare D1');
    }
}
