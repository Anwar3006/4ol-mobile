import AsyncStorage from '@react-native-async-storage/async-storage';

interface CachedDistanceData {
  facilityId: string;
  userLatitude: number;
  userLongitude: number;
  distance: string;
  duration: string;
  timestamp: number;
}

class DistanceCache {
  private static readonly CACHE_KEY = 'facility_distance_cache';
  private static readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private static readonly LOCATION_THRESHOLD = 0.001; // ~100 meters

  /**
   * Store distance data in cache
   */
  static async setCachedDistance(
    facilityId: string,
    userLatitude: number,
    userLongitude: number,
    distance: string,
    duration: string,
  ): Promise<void> {
    try {
      const cachedData: CachedDistanceData = {
        facilityId,
        userLatitude,
        userLongitude,
        distance,
        duration,
        timestamp: Date.now(),
      };

      const existingCache = await this.getCachedData();
      const updatedCache = {
        ...existingCache,
        [facilityId]: cachedData,
      };

      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(updatedCache));
      console.log('💾 Distance cached for facility:', facilityId);
    } catch (error) {
      console.error('Error caching distance:', error);
    }
  }

  /**
   * Get cached distance data for a facility
   */
  static async getCachedDistance(
    facilityId: string,
    userLatitude: number,
    userLongitude: number,
  ): Promise<{distance: string; duration: string} | null> {
    try {
      const cachedData = await this.getCachedData();
      const facilityCache = cachedData[facilityId];

      if (!facilityCache) {
        console.log('📭 No cached distance found for facility:', facilityId);
        return null;
      }

      // Check if cache is expired
      const isExpired =
        Date.now() - facilityCache.timestamp > this.CACHE_EXPIRY;
      if (isExpired) {
        console.log('⏰ Cached distance expired for facility:', facilityId);
        await this.removeCachedDistance(facilityId);
        return null;
      }

      // Check if user location has changed significantly
      const latDiff = Math.abs(userLatitude - facilityCache.userLatitude);
      const lngDiff = Math.abs(userLongitude - facilityCache.userLongitude);
      const locationChanged =
        latDiff > this.LOCATION_THRESHOLD || lngDiff > this.LOCATION_THRESHOLD;

      if (locationChanged) {
        console.log(
          '📍 User location changed significantly, cache invalid for facility:',
          facilityId,
        );
        await this.removeCachedDistance(facilityId);
        return null;
      }

      console.log('✅ Using cached distance for facility:', facilityId);
      return {
        distance: facilityCache.distance,
        duration: facilityCache.duration,
      };
    } catch (error) {
      console.error('Error getting cached distance:', error);
      return null;
    }
  }

  /**
   * Remove cached distance for a specific facility
   */
  static async removeCachedDistance(facilityId: string): Promise<void> {
    try {
      const cachedData = await this.getCachedData();
      delete cachedData[facilityId];
      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(cachedData));
      console.log('🗑️ Removed cached distance for facility:', facilityId);
    } catch (error) {
      console.error('Error removing cached distance:', error);
    }
  }

  /**
   * Clear all cached distance data
   */
  static async clearAllCachedDistances(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.CACHE_KEY);
      console.log('🧹 Cleared all cached distances');
    } catch (error) {
      console.error('Error clearing cached distances:', error);
    }
  }

  /**
   * Get all cached data
   */
  private static async getCachedData(): Promise<
    Record<string, CachedDistanceData>
  > {
    try {
      const cachedString = await AsyncStorage.getItem(this.CACHE_KEY);
      return cachedString ? JSON.parse(cachedString) : {};
    } catch (error) {
      console.error('Error getting cached data:', error);
      return {};
    }
  }

  /**
   * Get cache statistics
   */
  static async getCacheStats(): Promise<{
    totalCached: number;
    expiredEntries: number;
    validEntries: number;
  }> {
    try {
      const cachedData = await this.getCachedData();
      const totalCached = Object.keys(cachedData).length;
      let expiredEntries = 0;
      let validEntries = 0;

      Object.values(cachedData).forEach(entry => {
        const isExpired = Date.now() - entry.timestamp > this.CACHE_EXPIRY;
        if (isExpired) {
          expiredEntries++;
        } else {
          validEntries++;
        }
      });

      return {
        totalCached,
        expiredEntries,
        validEntries,
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {totalCached: 0, expiredEntries: 0, validEntries: 0};
    }
  }
}

export default DistanceCache;
