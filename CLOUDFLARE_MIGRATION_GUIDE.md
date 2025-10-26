# Firebase to Cloudflare Workers Migration Guide

This guide will help you migrate your user profiles and watchlists from Firebase Firestore to Cloudflare Workers while keeping Firebase Authentication.

## Overview

The migration involves:
- ✅ **Keep**: Firebase Authentication (Google Sign-in)
- ✅ **Keep**: Firebase for feedback and comments (as requested)
- 🔄 **Migrate**: User profiles from Firestore to Cloudflare D1
- 🔄 **Migrate**: Watchlists from Firestore to Cloudflare D1

## Files Created

### New Service Files
- `src/services/api/userService.js` - User profile API calls to Cloudflare Worker
- `src/services/api/watchlistService.js` - Watchlist API calls to Cloudflare Worker
- `src/services/cloudflare/userProfile.js` - Cloudflare replacements for Firebase user functions
- `src/services/cloudflare/watchlist.js` - Cloudflare replacements for Firebase watchlist functions
- `src/ZustandStores/userStoreCloudflare.js` - Updated user store using Cloudflare APIs
- `src/utils/migrationHelper.js` - Migration utilities and feature flags

### Updated Files
- `src/services/api/client.ts` - Updated to use Cloudflare Worker URL
- `.env.development` - Added `NEXT_PUBLIC_CLOUDFLARE_WORKER_URL`
- `.env.production` - Added `NEXT_PUBLIC_CLOUDFLARE_WORKER_URL`

## Migration Steps

### Step 1: Update Environment Variables

1. **Development Environment** (`.env.development`):
   ```env
   NEXT_PUBLIC_CLOUDFLARE_WORKER_URL=http://127.0.0.1:8787
   NEXT_PUBLIC_USE_CLOUDFLARE_WORKERS=false  # Start with false for testing
   ```

2. **Production Environment** (`.env.production`):
   ```env
   NEXT_PUBLIC_CLOUDFLARE_WORKER_URL=https://your-worker.your-subdomain.workers.dev
   NEXT_PUBLIC_USE_CLOUDFLARE_WORKERS=true
   ```

### Step 2: Test Cloudflare Worker Connection

```javascript
import { validateCloudflareWorkerConnection } from '@/utils/migrationHelper';

// Test the connection
const result = await validateCloudflareWorkerConnection();
console.log(result);
```

### Step 3: Gradual Migration Approach

#### Option A: Feature Flag Migration (Recommended)
1. Set `NEXT_PUBLIC_USE_CLOUDFLARE_WORKERS=false` initially
2. Test Cloudflare Worker APIs in parallel
3. When ready, switch to `NEXT_PUBLIC_USE_CLOUDFLARE_WORKERS=true`

#### Option B: Direct Migration
1. Export existing Firebase data
2. Import to Cloudflare Workers
3. Switch to new implementation

### Step 4: Update Your Components

Replace the user store import in your components:

**Before:**
```javascript
import useUserStore from '@/ZustandStores/userStore';
```

**After (with feature flag):**
```javascript
import { getUserStore } from '@/utils/migrationHelper';

// In your component
const [userStore, setUserStore] = useState(null);

useEffect(() => {
  getUserStore().then(store => setUserStore(store));
}, []);
```

**After (direct migration):**
```javascript
import useUserStore from '@/ZustandStores/userStoreCloudflare';
```

### Step 5: Data Migration

Use the migration helper to transfer existing data:

```javascript
import { migrateFromFirebaseToCloudflare } from '@/utils/migrationHelper';

// Run migration
const result = await migrateFromFirebaseToCloudflare();
if (result.status === 'success') {
  console.log('Migration completed successfully!');
} else {
  console.error('Migration failed:', result.error);
}
```

## API Mapping

### User Profile APIs

| Firebase Function | Cloudflare Equivalent | Cloudflare Endpoint |
|-------------------|----------------------|-------------------|
| `GetLoggedUserData()` | `getLoggedUserData()` | `GET /api/v1/user` |
| `CreateNewProfile()` | `createOrUpdateUserProfile()` | `POST /api/v1/user` |
| `UpdateName()` | `updateUserName()` | `PATCH /api/v1/user` |
| `UpdateProfileImage()` | `updateUserProfileImage()` | `PATCH /api/v1/user` |
| `UpdateCoverImage()` | `updateUserCoverImage()` | `PATCH /api/v1/user` |

### Watchlist APIs

| Firebase Function | Cloudflare Equivalent | Cloudflare Endpoint |
|-------------------|----------------------|-------------------|
| `GetLoggedUserWatchListsInfo()` | `getUserWatchlists()` | `GET /api/v1/getUserWatchLists` |
| `CreateWatchList()` | `createWatchlist()` | `POST /api/v1/createWatchList` |
| `GetWatchListDataById()` | `getWatchlistById()` | `GET /api/v1/getWatchlistById/:id` |
| `DeleteWatchListById()` | `deleteWatchlist()` | `DELETE /api/v1/deleteWatchlist/:id` |
| `AddAnimeToWatchList()` | `addAnimeToWatchlist()` | `POST /api/v1/addAnimeToWatchlist/:id` |
| `RemoveAnimeFromWatchList()` | `removeAnimeFromWatchlist()` | `DELETE /api/v1/removeAnimeFromWatchlist/:id` |

## Important Notes

### Authentication
- Firebase Authentication remains unchanged
- JWT tokens from Firebase are sent to Cloudflare Worker for authorization
- The `src/services/api/interceptor.ts` handles token injection

### Image Upload
- The current implementation has placeholder image upload functions
- You'll need to implement image upload to your chosen storage solution:
  - Cloudflare R2 (recommended for Cloudflare ecosystem)
  - AWS S3
  - Any other storage service

### Caching
- The new implementation maintains the same caching strategy as Firebase
- Cache functions from `src/app/firebase/utils/CacheStorage.js` are reused

### Error Handling
- All functions maintain the same response format: `{status, response}`
- Error handling patterns remain consistent with existing code

## Testing Checklist

- [ ] Cloudflare Worker is accessible
- [ ] User profile creation/retrieval works
- [ ] User profile updates work (name, images, player options)
- [ ] Watchlist creation works
- [ ] Watchlist retrieval works
- [ ] Adding/removing anime from watchlists works
- [ ] Watchlist deletion works
- [ ] Authentication tokens are properly sent
- [ ] Caching works correctly
- [ ] Error handling works as expected

## Rollback Plan

If issues occur, you can quickly rollback by:
1. Setting `NEXT_PUBLIC_USE_CLOUDFLARE_WORKERS=false`
2. Reverting to the original user store import
3. Firebase data remains intact during the migration

## Next Steps

1. **Set up your Cloudflare Worker URL** in environment variables
2. **Test the connection** using the validation function
3. **Implement image upload** for profile and cover images
4. **Run a test migration** with a test user account
5. **Gradually migrate users** or use feature flags for A/B testing
6. **Monitor performance** and error rates during migration

## Support

If you encounter issues during migration:
1. Check Cloudflare Worker logs
2. Verify environment variables are set correctly
3. Test API endpoints directly using tools like Postman
4. Check browser network tab for API call failures