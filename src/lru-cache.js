//!this file was an experiment to check wether exporting cache objects from other file will prevent the cache from getting empty on any file change, result is that it behaves same as when it is used in single file. Though results are still unclear and should be verified again.

import { LRUCache } from "lru-cache"

const searchOptions = {
    max:500,
    ttl: 1000*60*60*24*30,
}
const recommendationOptions = {
    max:300,
    ttl: 1000*60*60*24*30,
  }
  
export const searchCache = new LRUCache(searchOptions);
export const recommendCache = new LRUCache(recommendationOptions);