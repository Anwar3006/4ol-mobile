import AsyncStorage from '@react-native-async-storage/async-storage';

interface APICallRecord {
  functionName: string;
  endpoint: string;
  timestamp: string;
  parameters?: any;
  deviceId: string;
  userId?: string;
}

interface APITrackingStats {
  totalCalls: number;
  callsByFunction: Record<string, number>;
  callsByEndpoint: Record<string, number>;
  callsByDate: Record<string, number>;
  lastResetDate: string;
  deviceId: string;
}

interface APILimits {
  dailyLimit: number;
  monthlyLimit: number;
  perFunctionLimit: Record<string, number>;
}

class PersistentAPITracker {
  private static instance: PersistentAPITracker;
  private readonly STORAGE_KEY = 'google_api_tracking';
  private readonly LIMITS_KEY = 'api_limits';
  private readonly DEVICE_ID_KEY = 'device_id';

  private stats: APITrackingStats = {
    totalCalls: 0,
    callsByFunction: {},
    callsByEndpoint: {},
    callsByDate: {},
    lastResetDate: new Date().toISOString().split('T')[0],
    deviceId: '',
  };

  private limits: APILimits = {
    dailyLimit: 100,
    monthlyLimit: 1000,
    perFunctionLimit: {
      fetchNearbyPlaces: 999,
      fetchDistancesAndDurations: 999,
      fetchAutocompleteSuggestions: 999,
      fetchPlaceDetails: 999,
      fetchImage: 999,
      mapViewLoad: 999, // Track Maps SDK for Android map loads
    },
  };

  private isServiceEnabled = true;

  private constructor() {
    this.initializeTracker();
  }

  public static getInstance(): PersistentAPITracker {
    if (!PersistentAPITracker.instance) {
      PersistentAPITracker.instance = new PersistentAPITracker();
    }
    return PersistentAPITracker.instance;
  }

  private async initializeTracker(): Promise<void> {
    try {
      // Get or create device ID
      let deviceId = await AsyncStorage.getItem(this.DEVICE_ID_KEY);
      if (!deviceId) {
        deviceId = this.generateDeviceId();
        await AsyncStorage.setItem(this.DEVICE_ID_KEY, deviceId);
      }
      this.stats.deviceId = deviceId;

      // Load existing stats
      const savedStats = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (savedStats) {
        const parsedStats = JSON.parse(savedStats);
        // Check if we need to reset daily/monthly counts
        this.stats = this.checkAndResetCounts(parsedStats);
      }

      // Load limits
      const savedLimits = await AsyncStorage.getItem(this.LIMITS_KEY);
      if (savedLimits) {
        this.limits = {...this.limits, ...JSON.parse(savedLimits)};
      }

      await this.saveStats();
      console.log(
        '🔧 [PERSISTENT TRACKER] Initialized with device ID:',
        deviceId,
      );
    } catch (error) {
      console.error('Error initializing persistent API tracker:', error);
    }
  }

  private generateDeviceId(): string {
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private checkAndResetCounts(stats: APITrackingStats): APITrackingStats {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().substring(0, 7);

    // Reset daily counts if it's a new day
    if (stats.lastResetDate !== today) {
      stats.callsByDate = {[today]: 0};
      stats.lastResetDate = today;
    }

    // Reset monthly counts if it's a new month
    const lastMonth = stats.lastResetDate.substring(0, 7);
    if (lastMonth !== currentMonth) {
      stats.totalCalls = 0;
      stats.callsByFunction = {};
      stats.callsByEndpoint = {};
    }

    return stats;
  }

  public async trackAPICall(
    functionName: string,
    endpoint: string,
    parameters?: any,
    userId?: string,
  ): Promise<boolean> {
    try {
      // Check if service is enabled
      if (!this.isServiceEnabled) {
        console.log(
          '🚫 [PERSISTENT TRACKER] Service disabled - API call blocked',
        );
        return false;
      }

      // Check limits before allowing the call
      if (!this.checkLimits(functionName, endpoint)) {
        console.log('🚫 [PERSISTENT TRACKER] API limit reached - call blocked');
        this.disableService();
        return false;
      }

      const record: APICallRecord = {
        functionName,
        endpoint,
        timestamp: new Date().toISOString(),
        parameters,
        deviceId: this.stats.deviceId,
        userId,
      };

      // Update stats
      this.stats.totalCalls++;
      this.stats.callsByFunction[functionName] =
        (this.stats.callsByFunction[functionName] || 0) + 1;
      this.stats.callsByEndpoint[endpoint] =
        (this.stats.callsByEndpoint[endpoint] || 0) + 1;

      const today = new Date().toISOString().split('T')[0];
      this.stats.callsByDate[today] = (this.stats.callsByDate[today] || 0) + 1;

      // Save to storage
      await this.saveStats();
      await this.saveAPIRecord(record);

      console.log(
        `📊 [PERSISTENT TRACKER] API Call #${this.stats.totalCalls}: ${functionName} (${endpoint})`,
      );
      console.log(
        `📊 [PERSISTENT TRACKER] Daily calls: ${this.stats.callsByDate[today]}/${this.limits.dailyLimit}`,
      );

      return true;
    } catch (error) {
      console.error('Error tracking API call:', error);
      return false;
    }
  }

  private checkLimits(functionName: string, endpoint: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    const todayCalls = this.stats.callsByDate[today] || 0;
    const functionCalls = this.stats.callsByFunction[functionName] || 0;

    // Check daily limit
    if (todayCalls >= this.limits.dailyLimit) {
      console.log(
        `🚫 [PERSISTENT TRACKER] Daily limit reached: ${todayCalls}/${this.limits.dailyLimit}`,
      );
      return false;
    }

    // Check monthly limit
    if (this.stats.totalCalls >= this.limits.monthlyLimit) {
      console.log(
        `🚫 [PERSISTENT TRACKER] Monthly limit reached: ${this.stats.totalCalls}/${this.limits.monthlyLimit}`,
      );
      return false;
    }

    // Check per-function limit
    const functionLimit = this.limits.perFunctionLimit[functionName];
    if (functionLimit && functionCalls >= functionLimit) {
      console.log(
        `🚫 [PERSISTENT TRACKER] Function limit reached: ${functionName} ${functionCalls}/${functionLimit}`,
      );
      return false;
    }

    return true;
  }

  private async saveStats(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.stats));
    } catch (error) {
      console.error('Error saving API stats:', error);
    }
  }

  private async saveAPIRecord(record: APICallRecord): Promise<void> {
    try {
      const recordsKey = `api_records_${this.stats.deviceId}`;
      const existingRecords = await AsyncStorage.getItem(recordsKey);
      const records = existingRecords ? JSON.parse(existingRecords) : [];

      records.push(record);

      // Keep only last 1000 records to prevent storage bloat
      if (records.length > 1000) {
        records.splice(0, records.length - 1000);
      }

      await AsyncStorage.setItem(recordsKey, JSON.stringify(records));
    } catch (error) {
      console.error('Error saving API record:', error);
    }
  }

  public async getStats(): Promise<APITrackingStats> {
    await this.initializeTracker();
    return {...this.stats};
  }

  public async getLimits(): Promise<APILimits> {
    return {...this.limits};
  }

  public async setLimits(newLimits: Partial<APILimits>): Promise<void> {
    this.limits = {...this.limits, ...newLimits};
    await AsyncStorage.setItem(this.LIMITS_KEY, JSON.stringify(this.limits));
    console.log('🔧 [PERSISTENT TRACKER] Limits updated:', this.limits);
  }

  public async resetStats(): Promise<void> {
    this.stats = {
      totalCalls: 0,
      callsByFunction: {},
      callsByEndpoint: {},
      callsByDate: {},
      lastResetDate: new Date().toISOString().split('T')[0],
      deviceId: this.stats.deviceId,
    };
    await this.saveStats();
    console.log('🔄 [PERSISTENT TRACKER] Stats reset');
  }

  public async clearAllData(): Promise<void> {
    await AsyncStorage.removeItem(this.STORAGE_KEY);
    await AsyncStorage.removeItem(this.LIMITS_KEY);
    await AsyncStorage.removeItem(this.DEVICE_ID_KEY);
    await this.initializeTracker();
    console.log('🗑️ [PERSISTENT TRACKER] All data cleared');
  }

  public enableService(): void {
    this.isServiceEnabled = true;
    console.log('✅ [PERSISTENT TRACKER] Service enabled');
  }

  public async resetAndEnableService(): Promise<void> {
    await this.resetStats();
    this.enableService();
    console.log('🔄 [PERSISTENT TRACKER] Service reset and enabled');
  }

  public disableService(): void {
    this.isServiceEnabled = false;
    console.log(
      '🚫 [PERSISTENT TRACKER] Service disabled - all API calls blocked',
    );
  }

  public isServiceActive(): boolean {
    return this.isServiceEnabled;
  }

  public async getAPIRecords(limit: number = 50): Promise<APICallRecord[]> {
    try {
      const recordsKey = `api_records_${this.stats.deviceId}`;
      const records = await AsyncStorage.getItem(recordsKey);
      if (!records) return [];

      const parsedRecords = JSON.parse(records);
      return parsedRecords.slice(-limit).reverse(); // Most recent first
    } catch (error) {
      console.error('Error getting API records:', error);
      return [];
    }
  }

  // Track Maps SDK for Android map loads
  public async trackMapViewLoad(): Promise<boolean> {
    return this.trackAPICall('mapViewLoad', 'maps/android/load', {
      timestamp: new Date().toISOString(),
    });
  }
}

export default PersistentAPITracker.getInstance();
