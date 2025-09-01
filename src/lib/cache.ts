// Cache utility functions for localStorage
export interface CacheItem<T> {
    data: T;
    timestamp: number;
    expiresIn?: number; // milliseconds
}

export class CacheManager {
    private static readonly DEFAULT_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days
    static set<T>(key: string, data: T, expiresIn?: number): void {
        if (typeof window === 'undefined') return;

        const cacheItem: CacheItem<T> = {
            data,
            timestamp: Date.now(),
            expiresIn: expiresIn || this.DEFAULT_EXPIRY
        };

        try {
            localStorage.setItem(key, JSON.stringify(cacheItem));
        } catch (error) {
            console.warn('Failed to cache data:', error);
        }
    }

    static get<T>(key: string): T | null {
        if (typeof window === 'undefined') return null;

        try {
            const cached = localStorage.getItem(key);
            if (!cached) return null;

            const cacheItem: CacheItem<T> = JSON.parse(cached);
            const now = Date.now();

            // Check if expired
            if (cacheItem.expiresIn && now - cacheItem.timestamp > cacheItem.expiresIn) {
                localStorage.removeItem(key);
                return null;
            }

            return cacheItem.data;
        } catch (error) {
            console.warn('Failed to retrieve cached data:', error);
            return null;
        }
    }

    static remove(key: string): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(key);
    }

    static clear(): void {
        if (typeof window === 'undefined') return;
        localStorage.clear();
    }

    static isExpired(key: string): boolean {
        if (typeof window === 'undefined') return true;

        try {
            const cached = localStorage.getItem(key);
            if (!cached) return true;

            const cacheItem: CacheItem<any> = JSON.parse(cached);
            const now = Date.now();

            return cacheItem.expiresIn ? now - cacheItem.timestamp > cacheItem.expiresIn : false;
        } catch {
            return true;
        }
    }
}

// Cache keys
export const CACHE_KEYS = {
    USER_STATS: 'user_stats',
    TOP_ARTISTS: 'top_artists',
    TOP_TRACKS: 'top_tracks',
    TOP_GENRES: 'top_genres',
    LAST_ROAST: 'last_roast',
    NEIGHBOR_MATCHES: (username: string) => `neighbor_matches_${username}`,
    USER_PROFILE: 'user_profile'
} as const;
