// API Call Tracker for Google Maps API
import persistentApiTracker from '../services/persistentApiTracker';

interface APICallLog {
  functionName: string;
  apiEndpoint: string;
  timestamp: Date;
  parameters?: any;
}

class APICallTracker {
  private static instance: APICallTracker;
  private apiCallLogs: APICallLog[] = [];
  private functionCallCounts: Record<string, number> = {};

  private constructor() {}

  public static getInstance(): APICallTracker {
    if (!APICallTracker.instance) {
      APICallTracker.instance = new APICallTracker();
    }
    return APICallTracker.instance;
  }

  // Track Google API call
  public async trackAPICall(
    functionName: string,
    apiEndpoint: string,
    parameters?: any,
  ): Promise<boolean> {
    // Track in persistent storage first
    const allowed = await persistentApiTracker.trackAPICall(
      functionName,
      apiEndpoint,
      parameters,
    );

    if (!allowed) {
      console.log(
        `🚫 [API TRACKER] API call blocked by persistent tracker: ${functionName}`,
      );
      return false;
    }

    const log: APICallLog = {
      functionName,
      apiEndpoint,
      timestamp: new Date(),
      parameters,
    };

    this.apiCallLogs.push(log);

    // Update function call count
    this.functionCallCounts[functionName] =
      (this.functionCallCounts[functionName] || 0) + 1;

    console.log(
      `🔍 [API TRACKER] Google API Call #${this.apiCallLogs.length}:`,
      {
        function: functionName,
        endpoint: apiEndpoint,
        totalCalls: this.apiCallLogs.length,
        functionCallCount: this.functionCallCounts[functionName],
        timestamp: log.timestamp.toISOString(),
      },
    );

    return true;
  }

  // Track function call (without API call)
  public trackFunctionCall(functionName: string): void {
    this.functionCallCounts[functionName] =
      (this.functionCallCounts[functionName] || 0) + 1;

    console.log(`📊 [API TRACKER] Function Call:`, {
      function: functionName,
      callCount: this.functionCallCounts[functionName],
      timestamp: new Date().toISOString(),
    });
  }

  // Get summary statistics
  public getSummary(): {
    totalAPICalls: number;
    functionCallCounts: Record<string, number>;
    apiCallLogs: APICallLog[];
  } {
    return {
      totalAPICalls: this.apiCallLogs.length,
      functionCallCounts: {...this.functionCallCounts},
      apiCallLogs: [...this.apiCallLogs],
    };
  }

  // Reset all counters
  public reset(): void {
    this.apiCallLogs = [];
    this.functionCallCounts = {};
    console.log('🔄 [API TRACKER] All counters reset');
  }

  // Print current summary
  public printSummary(): void {
    const summary = this.getSummary();
    console.log('📈 [API TRACKER] SUMMARY:', {
      totalGoogleAPICalls: summary.totalAPICalls,
      functionCallCounts: summary.functionCallCounts,
      totalFunctionsCalled: Object.keys(summary.functionCallCounts).length,
    });
  }

  // Get persistent tracking stats
  public async getPersistentStats(): Promise<any> {
    return await persistentApiTracker.getStats();
  }

  // Get persistent tracking limits
  public async getPersistentLimits(): Promise<any> {
    return await persistentApiTracker.getLimits();
  }

  // Check if service is enabled
  public isServiceEnabled(): boolean {
    return persistentApiTracker.isServiceActive();
  }
}

export const apiCallTracker = APICallTracker.getInstance();
export default apiCallTracker;
