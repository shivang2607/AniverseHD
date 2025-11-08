# Firebase to Cloudflare Migration Guide

Simple guide for migrating from Firebase Firestore to Cloudflare D1 using a dual-write hybrid approach.

## Architecture

- **Client** → **Next.js Proxy** (`/api/v2/cloudflare`) → **Cloudflare Worker**
- **Authentication**: Firebase Auth tokens verified by Next.js proxy
- **User Store**: Automatically routes to Firebase, Hybrid, or Cloudflare based on mode

## Key Files

- `src/ZustandStores/userStore.js` - Single store with mode-aware routing
- `src/services/hybrid/userService.js` - Dual-write user operations
- `src/services/hybrid/watchlistService.js` - Dual-write watchlist operations
- `src/services/api/userService.js` - Cloudflare user API calls
- `src/services/api/watchlistService.js` - Cloudflare watchlist API calls
- `src/app/api/v2/cloudflare/[...proxyPath]/route.js` - Next.js proxy with auth

## Migration Modes

Control via `NEXT_PUBLIC_MIGRATION_MODE` environment variable:

### Firebase Mode (Default - Safest)
```env
NEXT_PUBLIC_MIGRATION_MODE=firebase
```
- All operations use Firebase Firestore
- Original behavior, zero risk

### Hybrid Mode (Migration Phase)
```env
NEXT_PUBLIC_MIGRATION_MODE=hybrid
```
- **Writes**: Go to both Firebase AND Cloudflare (parallel)
- **Reads**: From Cloudflare with Firebase fallback
- **Safety**: Data preserved in both systems
- **Warnings**: Shows toast if one system fails

### Cloudflare Mode (Future)
```env
NEXT_PUBLIC_MIGRATION_MODE=cloudflare
```
- All operations use Cloudflare D1 only
- Firebase can be decommissioned

### Step 4: Switch Migration Modes

Control migration modes via environment variables only:

```env
# .env.development or .env.production
NEXT_PUBLIC_MIGRATION_MODE=firebase    # Safe default
NEXT_PUBLIC_MIGRATION_MODE=hybrid      # Dual-write mode  
NEXT_PUBLIC_MIGRATION_MODE=cloudflare  # Future mode
```

Emergency controls (for true emergencies only):
```javascript
const userStore = useUserStore();

// Emergency fallback (immediate Firebase-only)
userStore.enableEmergencyFallback();

// Disable emergency mode (return to env config)
userStore.disableEmergencyFallback();
```

## Emergency Controls

For immediate Firebase-only fallback if Cloudflare has issues:

```javascript
const userStore = useUserStore();

// Emergency: Switch to Firebase-only immediately
userStore.enableEmergencyFallback();

// Return to environment-configured mode
userStore.disableEmergencyFallback();
```

## Migration Steps

### Phase 1: Start Safe (Current)
```env
NEXT_PUBLIC_MIGRATION_MODE=firebase
```
- Everything uses Firebase (original behavior)
- Zero risk, test Cloudflare Worker separately

### Phase 2: Enable Hybrid (Migration)
```env
NEXT_PUBLIC_MIGRATION_MODE=hybrid
```
- Writes go to both Firebase AND Cloudflare
- Reads from Cloudflare with Firebase fallback
- Data preserved in both systems
- Warnings shown if one system fails

### Phase 3: Cloudflare Only (Future)
```env
NEXT_PUBLIC_MIGRATION_MODE=cloudflare
```
- All operations use Cloudflare only
- Firebase can be decommissioned

## What Was Changed

### All Components Now Route Through User Store
- No direct Firebase imports in components
- All mutations respect migration mode
- Consistent behavior across the app

### Proxy Architecture
- All Cloudflare API calls go through Next.js proxy at `/api/v2/cloudflare`
- Proxy verifies Firebase auth tokens server-side
- Proxy adds `user-id` header automatically

### Hybrid Mode Behavior
- **Writes**: Parallel execution to both systems
- **Success**: If at least one system succeeds
- **Warnings**: Toast shown if only one system succeeds
- **Reads**: Cloudflare first, Firebase fallback

## Testing

1. **Start in Firebase mode** - verify everything works as before
2. **Switch to Hybrid mode** - test dual-write behavior
3. **Monitor console** for any hybrid operation warnings
4. **Test emergency fallback** - ensure it switches to Firebase-only
5. **Verify data** in both Firebase and Cloudflare

## Rollback

If issues occur:
1. Set `NEXT_PUBLIC_MIGRATION_MODE=firebase` in environment
2. Or use emergency fallback: `userStore.enableEmergencyFallback()`
3. All data remains in Firebase - zero data loss