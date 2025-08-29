import AsyncStorage from '@react-native-async-storage/async-storage';

interface CachedModalData {
  facilityId: string;
  userLatitude: number;
  userLongitude: number;
  imageUrl: string | null;
  distance: string;
  duration: string;
  timestamp: number;
}

class ModalCache {
  private static readonly CACHE_KEY = 'facility_modal_cache';
  private static readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private static readonly LOCATION_THRESHOLD = 0.001; // ~100 meters

  /**
   * Store modal data in cache
   */
  static async setCachedModalData(
    facilityId: string,
    userLatitude: number,
    userLongitude: number,
    imageUrl: string | null,
    distance: string,
    duration: string,
  ): Promise<void> {
    try {
      const cachedData: CachedModalData = {
        facilityId,
        userLatitude,
        userLongitude,
        imageUrl,
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
      console.log('💾 Modal data cached for facility:', facilityId);
    } catch (error) {
      console.error('Error caching modal data:', error);
    }
  }

  /**
   * Get cached modal data for a facility
   */
  static async getCachedModalData(
    facilityId: string,
    userLatitude: number,
    userLongitude: number,
  ): Promise<{
    imageUrl: string | null;
    distance: string;
    duration: string;
  } | null> {
    try {
      const cachedData = await this.getCachedData();
      const facilityCache = cachedData[facilityId];

      if (!facilityCache) {
        console.log('📭 No cached modal data found for facility:', facilityId);
        return null;
      }

      // Check if cache is expired
      const isExpired =
        Date.now() - facilityCache.timestamp > this.CACHE_EXPIRY;
      if (isExpired) {
        console.log('⏰ Cached modal data expired for facility:', facilityId);
        await this.removeCachedModalData(facilityId);
        return null;
      }

      // Check if user location has changed significantly
      const latDiff = Math.abs(userLatitude - facilityCache.userLatitude);
      const lngDiff = Math.abs(userLongitude - facilityCache.userLongitude);
      const locationChanged =
        latDiff > this.LOCATION_THRESHOLD || lngDiff > this.LOCATION_THRESHOLD;

      if (locationChanged) {
        console.log(
          '📍 User location changed significantly, modal cache invalid for facility:',
          facilityId,
        );
        await this.removeCachedModalData(facilityId);
        return null;
      }

      console.log('✅ Using cached modal data for facility:', facilityId);
      return {
        imageUrl: facilityCache.imageUrl,
        distance: facilityCache.distance,
        duration: facilityCache.duration,
      };
    } catch (error) {
      console.error('Error getting cached modal data:', error);
      return null;
    }
  }

  /**
   * Remove cached modal data for a specific facility
   */
  static async removeCachedModalData(facilityId: string): Promise<void> {
    try {
      const cachedData = await this.getCachedData();
      delete cachedData[facilityId];
      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(cachedData));
      console.log('🗑️ Removed cached modal data for facility:', facilityId);
    } catch (error) {
      console.error('Error removing cached modal data:', error);
    }
  }

  /**
   * Clear all cached modal data
   */
  static async clearAllCachedModalData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.CACHE_KEY);
      console.log('🧹 Cleared all cached modal data');
    } catch (error) {
      console.error('Error clearing cached modal data:', error);
    }
  }

  /**
   * Get all cached data
   */
  private static async getCachedData(): Promise<
    Record<string, CachedModalData>
  > {
    try {
      const cachedString = await AsyncStorage.getItem(this.CACHE_KEY);
      return cachedString ? JSON.parse(cachedString) : {};
    } catch (error) {
      console.error('Error getting cached modal data:', error);
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
      console.error('Error getting modal cache stats:', error);
      return {totalCached: 0, expiredEntries: 0, validEntries: 0};
    }
  }
}

export default ModalCache;
