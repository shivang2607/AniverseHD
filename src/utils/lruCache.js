import { LRUCache } from "lru-cache"

const cacheOption = {
    max:50,
     maxSize: 50 * 1024 * 1024, // 50 MB
  sizeCalculation: (value, key) => {
    if (typeof value === "string") {
      // stored as string
      return Buffer.byteLength(value);
    } else if (Buffer.isBuffer(value)) {
      // stored as buffer
      return value.length;
    } else if (typeof value === "object" && value !== null) {
      // stored as JSON object
      return Buffer.byteLength(JSON.stringify(value));
    } else {
      // fallback for numbers, booleans, etc.
      return Buffer.byteLength(String(value));
    }
  },
ttl: 1000*60*60*24,
}


export const defaultCacheOptions = cacheOption;

export const cacheF = new LRUCache(cacheOption);