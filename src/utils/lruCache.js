import { LRUCache } from "lru-cache"

const cacheOption = {
    max:50,
    ttl: 1000*60*60*24*2,
}


export const cacheF = new LRUCache(cacheOption);