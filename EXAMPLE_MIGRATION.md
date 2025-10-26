# Example Migration: WatchlistBar.jsx

This shows exactly how to migrate a file from Firebase imports to smart service imports.

## 📁 File: `src/components/WatchlistBar.jsx`

### ❌ Before (Current Firebase Import)

```javascript
"use client";
import React, { useEffect, useState } from "react";
import useUserStore from "@/ZustandStores/userStore";
import { FaRegCirclePlay } from "react-icons/fa6";
import Link from "next/link";
import { MdCancel } from "react-icons/md";
import { BiSolidHide } from "react-icons/bi";
import RemoveAnimeFromWatchList from "@/app/firebase/WatchList/UpdateWatchLists/RemoveAnimeFromWatchList";  // ❌ Direct Firebase import
import { Constant_Var_success } from "@/utils/constants";
import toast from "react-hot-toast";

export default function WatchlistBar() {
  // ... rest of component code remains exactly the same
  
  const handleRemove = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await RemoveAnimeFromWatchList({  // ✅ Function call stays the same
      watchListId: selectedId,
      animeId: id,
    });
    loadLoggedInUserWatchLists();

    if (result.status !== Constant_Var_success) {
      toast.error("Can't Remove Anime from Recent Watch list");
    }
  };
  
  // ... rest of component
}
```

### ✅ After (Smart Service Import)

```javascript
"use client";
import React, { useEffect, useState } from "react";
import useUserStore from "@/ZustandStores/userStore";
import { FaRegCirclePlay } from "react-icons/fa6";
import Link from "next/link";
import { MdCancel } from "react-icons/md";
import { BiSolidHide } from "react-icons/bi";
import { RemoveAnimeFromWatchList } from "@/services/smart/watchlistService";  // ✅ Smart service import
import { Constant_Var_success } from "@/utils/constants";
import toast from "react-hot-toast";

export default function WatchlistBar() {
  // ... rest of component code remains exactly the same
  
  const handleRemove = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await RemoveAnimeFromWatchList({  // ✅ Function call stays the same
      watchListId: selectedId,
      animeId: id,
    });
    loadLoggedInUserWatchLists();

    if (result.status !== Constant_Var_success) {
      toast.error("Can't Remove Anime from Recent Watch list");
    }
  };
  
  // ... rest of component
}
```

## 🔍 What Changed?

### Import Statement Only
**Before:**
```javascript
import RemoveAnimeFromWatchList from "@/app/firebase/WatchList/UpdateWatchLists/RemoveAnimeFromWatchList";
```

**After:**
```javascript
import { RemoveAnimeFromWatchList } from "@/services/smart/watchlistService";
```

### Everything Else Stays the Same
- ✅ Function call: `RemoveAnimeFromWatchList({ watchListId, animeId })`
- ✅ Parameters: Same object with same properties
- ✅ Return value: Same `{ status, response }` format
- ✅ Error handling: Same logic
- ✅ Component logic: No changes needed

## 🎯 Key Points

1. **Only the import changes** - everything else stays identical
2. **Default import becomes named import** - note the `{ }` brackets
3. **Function behavior is identical** - same parameters, same return values
4. **Smart service automatically detects migration mode** and routes appropriately

## 🔄 Migration Modes

After this change, the function will automatically:

- **Firebase Mode** (`NEXT_PUBLIC_MIGRATION_MODE=firebase`): Uses original Firebase function
- **Hybrid Mode** (`NEXT_PUBLIC_MIGRATION_MODE=hybrid`): Writes to both Firebase and Cloudflare
- **Emergency Fallback**: Always available via `localStorage.setItem('USE_FIREBASE_FALLBACK', 'true')`

## 📋 Apply This Pattern to All Files

Use this same pattern for all files with Firebase watchlist imports:

1. **Find the Firebase import line**
2. **Replace with smart service import** (change default to named import)
3. **Keep everything else exactly the same**
4. **Test that it still works**

## 🧪 Testing

After making the change:

1. **Test in Firebase mode:**
   ```env
   NEXT_PUBLIC_MIGRATION_MODE=firebase
   ```
   Should work exactly as before.

2. **Test in hybrid mode:**
   ```env
   NEXT_PUBLIC_MIGRATION_MODE=hybrid
   ```
   Should work the same, but writes to both systems.

3. **Check console** for any hybrid operation warnings (in development mode).

This pattern applies to all the other files that need migration!