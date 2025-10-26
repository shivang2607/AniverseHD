# Firebase Import Migration Guide

This guide helps you update all direct Firebase watchlist imports to use the smart service that automatically handles migration modes.

## 🎯 Problem

Your codebase has direct imports of Firebase watchlist functions in many files:

```javascript
// Direct Firebase imports (current)
import AddAnimeToWatchList from "@/app/firebase/WatchList/UpdateWatchLists/AddAnimeToWatchList";
import RemoveAnimeFromWatchList from "@/app/firebase/WatchList/UpdateWatchLists/RemoveAnimeFromWatchList";
import GetWatchListDataById from "@/app/firebase/WatchList/WatchListAnimeList/GetWatchListDataById";
// ... and many more
```

These bypass the migration system and always use Firebase, even in hybrid mode.

## ✅ Solution

Replace all Firebase imports with smart service imports:

```javascript
// Smart service imports (new)
import { 
  AddAnimeToWatchList, 
  RemoveAnimeFromWatchList, 
  GetWatchListDataById 
} from "@/services/smart/watchlistService";
```

## 📋 Files That Need Updates

Based on the search results, these files have direct Firebase imports:

### Components
- `src/components/WatchlistBar.jsx`
- `src/components/utils/ListDropDown.jsx`
- `src/components/RecentCard.jsx`
- `src/components/mainCard.jsx`
- `src/components/watchListCard.jsx`

### Pages
- `src/app/watch/[id]/page.jsx`
- `src/app/watchlist/[id]/page.jsx`
- `src/app/anime/[id]/AnimeClient.jsx`

### Profile Components
- `src/app/profile/[id]/components/WatchListsTabs.jsx`
- `src/app/profile/[id]/components/UserWatchLists.jsx`
- `src/app/profile/[id]/components/WatchListPagination.jsx`
- `src/app/profile/[id]/components/EditWatchlistModal.jsx`
- `src/app/profile/[id]/components/CreateWatchListModal.jsx`

## 🔄 Import Mapping Reference

| Firebase Import | Smart Service Import |
|----------------|---------------------|
| `import AddAnimeToWatchList from "@/app/firebase/WatchList/UpdateWatchLists/AddAnimeToWatchList"` | `import { AddAnimeToWatchList } from "@/services/smart/watchlistService"` |
| `import RemoveAnimeFromWatchList from "@/app/firebase/WatchList/UpdateWatchLists/RemoveAnimeFromWatchList"` | `import { RemoveAnimeFromWatchList } from "@/services/smart/watchlistService"` |
| `import GetWatchListDataById from "@/app/firebase/WatchList/WatchListAnimeList/GetWatchListDataById"` | `import { GetWatchListDataById } from "@/services/smart/watchlistService"` |
| `import CreateWatchList from "@/app/firebase/WatchList/CreateWatchList"` | `import { CreateWatchList } from "@/services/smart/watchlistService"` |
| `import DeleteWatchListById from "@/app/firebase/WatchList/DeleteWatchList"` | `import { DeleteWatchListById } from "@/services/smart/watchlistService"` |
| `import GetLoggedUserWatchListsInfo from "@/app/firebase/WatchList/WatchListDocument/GetLoggedUserWatchListsInfo"` | `import { GetLoggedUserWatchListsInfo } from "@/services/smart/watchlistService"` |
| `import ChangeWatchListName from "@/app/firebase/WatchList/UpdateWatchLists/ChangeWatchListName"` | `import { ChangeWatchListName } from "@/services/smart/watchlistService"` |
| `import UpdatePublicPrivateWatchList from "@/app/firebase/WatchList/UpdateWatchLists/UpdatePublicPrivateWatchList"` | `import { UpdatePublicPrivateWatchList } from "@/services/smart/watchlistService"` |

## 📝 Step-by-Step Migration

### Example: Updating `src/components/utils/ListDropDown.jsx`

**Before:**
```javascript
import AddAnimeToWatchList from "@/app/firebase/WatchList/UpdateWatchLists/AddAnimeToWatchList";
import GetLoggedUserWatchListsInfo from "@/app/firebase/WatchList/WatchListDocument/GetLoggedUserWatchListsInfo";
import RemoveAnimeFromWatchList from "@/app/firebase/WatchList/UpdateWatchLists/RemoveAnimeFromWatchList";
```

**After:**
```javascript
import { 
  AddAnimeToWatchList, 
  GetLoggedUserWatchListsInfo, 
  RemoveAnimeFromWatchList 
} from "@/services/smart/watchlistService";
```

### Example: Updating `src/components/WatchlistBar.jsx`

**Before:**
```javascript
import RemoveAnimeFromWatchList from "@/app/firebase/WatchList/UpdateWatchLists/RemoveAnimeFromWatchList";
```

**After:**
```javascript
import { RemoveAnimeFromWatchList } from "@/services/smart/watchlistService";
```

## 🔍 How to Find and Replace

### Method 1: Manual Search and Replace

1. **Search for Firebase imports:**
   ```
   @/app/firebase/WatchList
   ```

2. **Replace each import:**
   - Remove the Firebase import line
   - Add the smart service import (or add to existing one)

### Method 2: VS Code Find and Replace

1. **Open Find and Replace** (Ctrl/Cmd + H)

2. **Use these patterns** (enable regex mode):

   **Find:** `import\s+(\w+)\s+from\s+"@/app/firebase/WatchList/[^"]+";?`
   
   **Replace:** `// TODO: Replace with smart service import`

3. **Then manually add the smart service imports**

### Method 3: Automated Script (Advanced)

If you have Node.js and want to automate this:

```bash
# Install dependencies (if not already installed)
npm install glob

# Run the migration script
node scripts/updateWatchlistImports.js
```

## ✅ Verification Steps

After updating imports:

1. **Check compilation:**
   ```bash
   npm run build
   ```

2. **Test in Firebase mode:**
   ```env
   NEXT_PUBLIC_MIGRATION_MODE=firebase
   ```

3. **Test in hybrid mode:**
   ```env
   NEXT_PUBLIC_MIGRATION_MODE=hybrid
   ```

4. **Verify function calls work the same:**
   - All function signatures remain identical
   - All parameters work the same way
   - All return values are the same

## 🚨 Important Notes

### Function Signatures Unchanged
The smart service maintains **identical function signatures** to Firebase functions:

```javascript
// Both work exactly the same way
await AddAnimeToWatchList({ watchListId, animeId, animeData });
await RemoveAnimeFromWatchList({ watchListId, animeId });
```

### No Code Logic Changes
You don't need to change any of your component logic - only the import statements.

### Backward Compatibility
The smart service is fully backward compatible. If you set `NEXT_PUBLIC_MIGRATION_MODE=firebase`, it uses the original Firebase functions.

## 🎯 Priority Order

Update files in this order for maximum safety:

1. **Start with utility components** (ListDropDown, WatchlistBar)
2. **Then main components** (mainCard, RecentCard)
3. **Then pages** (watch, watchlist, profile pages)
4. **Test thoroughly** after each group

## 🔄 Rollback Plan

If you need to rollback:

1. **Revert the import changes**
2. **Or set emergency fallback:**
   ```javascript
   localStorage.setItem('USE_FIREBASE_FALLBACK', 'true');
   ```

## 🎉 Benefits After Migration

Once all imports are updated:

- ✅ **Unified Control**: All watchlist operations respect migration mode
- ✅ **Zero Code Changes**: Function calls remain identical
- ✅ **Automatic Routing**: Smart service handles Firebase vs Hybrid automatically
- ✅ **Easy Testing**: Switch modes with environment variables
- ✅ **Safety**: Emergency fallback always available

## 📞 Need Help?

If you encounter issues:

1. **Check the console** for any import errors
2. **Verify file paths** are correct
3. **Test one file at a time** to isolate issues
4. **Use emergency fallback** if needed: `localStorage.setItem('USE_FIREBASE_FALLBACK', 'true')`