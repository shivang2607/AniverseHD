# Firebase to Cloudflare Migration - Complete Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Data Source Modes](#data-source-modes)
4. [Quick Start](#quick-start)
5. [Service Layer Usage](#service-layer-usage)
6. [Migration Steps](#migration-steps)
7. [API Reference](#api-reference)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This guide covers the Firebase to Cloudflare D1 migration system with dual-write capabilities and environment-based control.

### Key Features
- ✅ **Single Point of Entry**: All components use `@/services` - no direct Firebase/Cloudflare imports
- ✅ **Environment-Based Switching**: Control data source via `NEXT_PUBLIC_DATA_SOURCE`
- ✅ **Dual-Write Support**: Hybrid mode writes to both systems simultaneously
- ✅ **No Auto-Fallback**: Predictable behavior - if Cloudflare fails, operation fails
- ✅ **Proxy with Auth**: All Cloudflare requests verified with Firebase tokens

### What's Migrated
- **User Data**: Profile, name, images (Firebase → Cloudflare)
- **Watchlists**: All watchlist operations (Firebase → Cloudflare)
- **Comments**: Already in Cloudflare only (no Firebase version)
- **Notifications**: Already in Cloudflare only (no Firebase version)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Components                         │
│  (Profile, Watchlists, Comments, Notifications, etc.)       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Import from @/services
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Unified Service Layer (@/services)              │
│  Routes based on NEXT_PUBLIC_DATA_SOURCE                     │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
   ┌────────┐  ┌─────────┐  ┌──────────┐
   │Firebase│  │ Hybrid  │  │Cloudflare│
   │Services│  │Services │  │Services  │
   └────┬───┘  └────┬────┘  └────┬─────┘
        │           │            │
        ▼           ▼            ▼
   ┌────────┐  ┌─────────────────────┐
   │Firebase│  │Firebase + Cloudflare│
   │Firestore  │(Dual Write)         │
   └────────┘  └─────────────────────┘
                     │
                     ▼
              ┌──────────────┐
              │   Cloudflare │
              │      D1      │
              └──────────────┘
```

### Key Files

**Service Layer (Single Point of Entry)**
- `src/services/index.js` - **USE THIS** - All data operations
- `src/config/dataSource.js` - Configuration system

**Cloudflare API Services**
- `src/services/api/userService.js` - User operations
- `src/services/api/watchlistService.js` - Watchlist operations
- `src/services/api/commentService.js` - Comment operations
- `src/services/api/notificationService.js` - Notification operations

**Hybrid Services (Dual-Write)**
- `src/services/hybrid/userService.js` - User dual-write
- `src/services/hybrid/watchlistService.js` - Watchlist dual-write
- `src/services/hybrid/commentService.js` - Comment passthrough
- `src/services/hybrid/notificationService.js` - Notification passthrough

**Infrastructure**
- `src/app/api/v2/cloudflare/[...proxyPath]/route.js` - Auth proxy
- `src/ZustandStores/userStore.js` - User state management

---

## Data Source Modes

Control via `NEXT_PUBLIC_DATA_SOURCE` environment variable:

### 🟢 Firebase Mode (Default - Safest)
```env
NEXT_PUBLIC_DATA_SOURCE=firebase
```

**Behavior:**
- ✅ User data: Firebase Firestore
- ✅ Watchlists: Firebase Firestore
- ✅ Comments: Cloudflare D1 (always)
- ✅ Notifications: Cloudflare D1 (always)

**Use When:** Default mode, safest option, original behavior

---

### 🟡 Hybrid Mode (Migration Phase)
```env
NEXT_PUBLIC_DATA_SOURCE=hybrid
```

**Behavior:**
- ✅ User data: **Write to both** Firebase & Cloudflare, **Read from Cloudflare only**
- ✅ Watchlists: **Write to both** Firebase & Cloudflare, **Read from Cloudflare only**
- ✅ Comments: Cloudflare D1 (always)
- ✅ Notifications: Cloudflare D1 (always)

**Important:**
- ⚠️ No automatic fallback - if Cloudflare fails, reads fail
- ⚠️ Writes succeed if at least one system succeeds
- ⚠️ Shows warning toast if only one system succeeds

**Use When:** Actively migrating, testing Cloudflare, syncing data

---

### 🔵 Cloudflare Mode (Future)
```env
NEXT_PUBLIC_DATA_SOURCE=cloudflare
```

**Behavior:**
- ✅ User data: Cloudflare D1 only
- ✅ Watchlists: Cloudflare D1 only
- ✅ Comments: Cloudflare D1 (always)
- ✅ Notifications: Cloudflare D1 (always)

**Use When:** Migration complete, Firebase can be decommissioned

---

## Quick Start

### 1. Set Environment Variable

In `.env.development` or `.env.production`:

```env
# Data source mode
NEXT_PUBLIC_DATA_SOURCE=firebase  # Start with firebase

# Cloudflare Worker configuration
WORKER_URL=http://127.0.0.1:8787  # or production URL
WORKER_VERSION=v1
```

### 2. Import from Unified Service Layer

```javascript
// ✅ CORRECT - Import from unified service layer
import { 
  getUserData, 
  updateUserName,
  getUserWatchlists,
  createWatchlist,
  getComments,
  postComment 
} from '@/services';

// ❌ WRONG - Don't import directly
import GetLoggedUserData from '@/app/firebase/Profile/GetLoggedUserData';
```

### 3. Use the Services

```javascript
// Get user data
const result = await getUserData();
if (result.status === 'success') {
  console.log(result.response);
}

// Update user name
await updateUserName('New Name');

// Get comments (always from Cloudflare)
const comments = await getComments('anime-123');
```

---

## Service Layer Usage

### User Operations

```javascript
import { 
  getUserData, 
  createUserProfile, 
  updateUserName,
  updateProfileImage,
  updateCoverImage 
} from '@/services';

// Get user data
const userData = await getUserData();

// Create/update profile
await createUserProfile({
  userName: 'John Doe',
  email: 'john@example.com',
  photoUrl: 'https://...',
  coverUrl: 'https://...'
});

// Update user name
await updateUserName('New Name');

// Update images (blob from file input)
await updateProfileImage(imageBlob);
await updateCoverImage(coverBlob);
```

### Watchlist Operations

```javascript
import {
  getUserWatchlists,
  createWatchlist,
  getWatchlistById,
  deleteWatchlist,
  addAnimeToWatchlist,
  removeAnimeFromWatchlist,
  updateWatchlistName,
  updateWatchlistPrivacy
} from '@/services';

// Get all watchlists
const watchlists = await getUserWatchlists();

// Create new watchlist
await createWatchlist({
  watchListName: 'My Favorites',
  type: 'private' // or 'public'
});

// Add anime to watchlist
await addAnimeToWatchlist({
  watchListId: 'abc123',
  animeId: 'anime-123',
  animeData: { id: 'anime-123', title: 'Anime Title' },
  url: '/watch/anime-123'
});

// Update watchlist
await updateWatchlistName({ watchListId: 'abc123', newName: 'New Name' });
await updateWatchlistPrivacy({ watchListId: 'abc123', type: 'public' });
```

### Comment Operations

```javascript
import {
  getComments,
  getCommentById,
  postComment,
  updateComment,
  deleteComment,
  reactOnComment
} from '@/services';

// Get comments (always from Cloudflare)
const comments = await getComments('anime-123', {
  limit: 20,
  offset: 0
});

// Post comment
await postComment('anime-123', {
  content: 'Great anime!',
  parentCommentId: null // or parent ID for replies
});

// React to comment
await reactOnComment('comment-123', 'like');
```

### Notification Operations

```javascript
import {
  getNotifications,
  markNotificationsAsRead
} from '@/services';

// Get notifications (always from Cloudflare)
const notifications = await getNotifications({
  limit: 20,
  unreadOnly: true
});

// Mark as read
await markNotificationsAsRead(['notif-1', 'notif-2']);
```

---

## Migration Steps

### Phase 1: Start Safe (Current)

```env
NEXT_PUBLIC_DATA_SOURCE=firebase
```

1. Set environment variable to `firebase`
2. Test all features work normally
3. Verify comments and notifications work (from Cloudflare)
4. Monitor for any issues

**Expected Behavior:**
- User/watchlist data from Firebase
- Comments/notifications from Cloudflare
- Original behavior, zero risk

---

### Phase 2: Enable Hybrid (Migration)

```env
NEXT_PUBLIC_DATA_SOURCE=hybrid
```

1. Set environment variable to `hybrid`
2. Test user profile operations
3. Test watchlist operations
4. Monitor console for warnings
5. Verify data in both Firebase and Cloudflare

**Expected Behavior:**
- Writes go to both Firebase AND Cloudflare
- Reads come from Cloudflare ONLY
- If Cloudflare fails, reads fail (no silent fallback)
- Warnings shown if one system fails

**Verification:**
- Check Firebase Console for user/watchlist data
- Check Cloudflare D1 database for same data
- Ensure IDs and fields match

**Run in Hybrid Mode:**
- Days or weeks depending on confidence
- Monitor for any issues
- Fix any data inconsistencies

---

### Phase 3: Cloudflare Only (Future)

```env
NEXT_PUBLIC_DATA_SOURCE=cloudflare
```

1. Set environment variable to `cloudflare`
2. Test all features work
3. Monitor for extended period
4. Decommission Firebase when confident

**Expected Behavior:**
- All operations use Cloudflare D1
- Firebase not used (except for auth)

---

## API Reference

### User Services

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `getUserData()` | - | `Promise<{status, response}>` | Get logged-in user data |
| `createUserProfile(userProfile)` | `{userName, email, photoUrl, coverUrl}` | `Promise<{status, response}>` | Create/update profile |
| `updateUserName(userName)` | `string` | `Promise<{status, response}>` | Update user name |
| `updateProfileImage(blob)` | `Blob` | `Promise<{status, response}>` | Update profile image |
| `updateCoverImage(blob)` | `Blob` | `Promise<{status, response}>` | Update cover image |

### Watchlist Services

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `getUserWatchlists()` | - | `Promise<{status, response}>` | Get all watchlists |
| `createWatchlist({watchListName, type})` | `{watchListName, type}` | `Promise<{status, response}>` | Create watchlist |
| `getWatchlistById({watchlistId, getAll})` | `{watchlistId, getAll}` | `Promise<{status, response}>` | Get watchlist by ID |
| `deleteWatchlist(watchlistId)` | `string` | `Promise<{status, response}>` | Delete watchlist |
| `addAnimeToWatchlist({watchListId, animeId, animeData, url})` | `{watchListId, animeId, animeData, url}` | `Promise<{status, response}>` | Add anime |
| `removeAnimeFromWatchlist({watchListId, animeId})` | `{watchListId, animeId}` | `Promise<{status, response}>` | Remove anime |
| `updateWatchlistName({watchListId, newName})` | `{watchListId, newName}` | `Promise<{status, response}>` | Update name |
| `updateWatchlistPrivacy({watchListId, type})` | `{watchListId, type}` | `Promise<{status, response}>` | Update privacy |

### Comment Services

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `getComments(animeId, options)` | `string, {limit, offset}` | `Promise<{status, response}>` | Get comments |
| `getCommentById(commentId)` | `string` | `Promise<{status, response}>` | Get single comment |
| `postComment(animeId, commentData)` | `string, {content, parentCommentId}` | `Promise<{status, response}>` | Post comment |
| `updateComment(commentId, updateData)` | `string, {content}` | `Promise<{status, response}>` | Update comment |
| `deleteComment(commentId)` | `string` | `Promise<{status, response}>` | Delete comment |
| `reactOnComment(commentId, reactionType)` | `string, 'like'\|'dislike'` | `Promise<{status, response}>` | React to comment |

### Notification Services

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `getNotifications(options)` | `{limit, offset, unreadOnly}` | `Promise<{status, response}>` | Get notifications |
| `getNotificationById(notificationId)` | `string` | `Promise<{status, response}>` | Get single notification |
| `markNotificationsAsRead(notificationIds)` | `string[]` | `Promise<{status, response}>` | Mark as read |

---

## Troubleshooting

### Proxy Errors

**Symptoms:** Requests to `/api/v2/cloudflare/*` fail

**Check:**
1. Verify `WORKER_URL` and `WORKER_VERSION` in `.env`
2. Check Firebase Admin SDK is initialized
3. Look for `[Proxy]` logs in server console
4. Check browser Network tab for auth headers

**Solution:**
```env
WORKER_URL=http://127.0.0.1:8787  # or production URL
WORKER_VERSION=v1
```

---

### Cloudflare Failures in Hybrid Mode

**Symptoms:** Operations fail even though Firebase is working

**Reason:** Hybrid mode reads from Cloudflare only (no fallback)

**Check:**
1. Cloudflare Worker logs
2. D1 database accessibility
3. User-id header in requests
4. Cloudflare Worker API responses

**Solution:**
- Fix Cloudflare issues, or
- Switch back to Firebase mode temporarily:
  ```env
  NEXT_PUBLIC_DATA_SOURCE=firebase
  ```

---

### Data Inconsistency

**Symptoms:** Data differs between Firebase and Cloudflare

**Check:**
1. Console for hybrid operation warnings
2. Which system failed (Firebase or Cloudflare)
3. Toast notifications for partial failures

**Solution:**
1. Identify which writes failed
2. Manually sync data if needed
3. Stay in Firebase mode until issues resolved
4. Monitor hybrid mode carefully before switching

---

### Comments/Notifications Not Working

**Remember:** Comments and notifications ONLY exist in Cloudflare

**Check:**
1. Cloudflare Worker is running
2. Proxy is forwarding requests correctly
3. Auth tokens are being sent
4. D1 database has comments/notifications tables

**Note:** Even in `firebase` mode, comments/notifications use Cloudflare

---

### Debugging Tips

**Check Current Data Source:**
```javascript
import { getDataSource, logDataSourceConfig } from '@/config/dataSource';

console.log('Current:', getDataSource());
logDataSourceConfig(); // Detailed info
```

**Check Proxy Logs:**
Look for `[Proxy]` in server console:
```
[Proxy] GET http://127.0.0.1:8787/api/v1/user
[Proxy] Response: { status: 200, bodySize: 1234 }
```

**Check Network Tab:**
- Filter by `/api/v2/cloudflare`
- Verify `Authorization: Bearer <token>` header
- Check response status and body

---

## Important Notes

### Comments & Notifications
- ⚠️ **Always use Cloudflare** - even in `firebase` mode
- ⚠️ **No Firebase version exists** - they were never in Firebase
- ⚠️ **This is expected behavior** - not a bug

### Dual-Write Behavior
- ✅ **Hybrid mode**: Writes to both, reads from Cloudflare
- ✅ **Success if one succeeds**: Operation succeeds if at least one write succeeds
- ✅ **Warnings for partial failures**: Toast shown if only one system succeeds
- ⚠️ **No automatic fallback**: If Cloudflare read fails, operation fails

### Environment Variables
- ✅ **NEXT_PUBLIC_DATA_SOURCE**: Controls data source (firebase/hybrid/cloudflare)
- ✅ **WORKER_URL**: Cloudflare Worker URL
- ✅ **WORKER_VERSION**: API version (usually v1)

### Rollback
If issues occur:
1. Set `NEXT_PUBLIC_DATA_SOURCE=firebase`
2. Restart application
3. All data remains in Firebase - zero data loss

---

## Summary

✅ **Fixed**: Critical proxy bug  
✅ **Created**: Unified service layer  
✅ **Implemented**: Comment & notification services  
✅ **Removed**: Automatic Firebase fallback  
✅ **Updated**: Environment-based configuration  

The migration system is ready for use!
