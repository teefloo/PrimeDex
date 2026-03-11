import { get, set } from 'idb-keyval';

const CACHE_PREFIX = 'poke-cache-';
const CACHE_EXPIRATION = 1000 * 60 * 60 * 24 * 7; // 7 days

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export async function getCachedData<T>(key: string, allowExpired = false): Promise<T | null> {
  try {
    const item = await get<CacheItem<T>>(`${CACHE_PREFIX}${key}`);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > CACHE_EXPIRATION;
    if (isExpired && !allowExpired) {
      return null;
    }

    return item.data;
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
}

export async function setCachedData<T>(key: string, data: T): Promise<void> {
  try {
    await set(`${CACHE_PREFIX}${key}`, {
      data,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Cache write error:', error);
  }
}
