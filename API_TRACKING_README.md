# Google Maps API Call Tracking System

This system tracks all Google Maps API calls and function calls across the healthcare app to help monitor API usage and optimize performance.

## Features

- **Real-time API Call Tracking**: Tracks every Google Maps API call with timestamps
- **Function Call Counting**: Counts how many times each function is called
- **Visual Summary**: Modal interface to view API call statistics
- **Reset Capability**: Ability to reset counters for new testing sessions

## How to Use

### 1. View API Call Summary
- Tap the chart icon (📊) in the top-right corner of any screen
- This opens a modal showing:
  - Total Google API calls made
  - Function call counts for each tracked function
  - Recent API calls with timestamps

### 2. Console Logging
All API calls are automatically logged to the console with the format:
```
🔍 [API TRACKER] Google API Call #X: {
  function: "functionName",
  endpoint: "apiEndpoint",
  totalCalls: X,
  functionCallCount: X,
  timestamp: "2024-01-01T12:00:00.000Z"
}
```

### 3. Reset Counters
- Use the "Reset Counters" button in the API summary modal
- Or call `apiCallTracker.reset()` in code

## Tracked Functions

The following functions are now tracked:

### Distance & Duration Services
- `fetchDistancesAndDurations` - Batch distance calculations
- `fetchDistanceAndDuration` - Single distance calculation

### Map & Location Services
- `fetchNearbyPlaces` - Nearby places search
- `fetchAutocompleteSuggestions` - Location autocomplete
- `fetchLocationName` - Reverse geocoding
- `fetchPlaceDetails` - Place details lookup
- `fetchImage` - Place image fetching
- `openMarkModal` - Marker modal opening

### Facility Services
- `getRatingsAndDistance` - Facility ratings and distance (commented out)
- `facility.fetchDistanceAndDuration` - Facility distance calculation

## API Endpoints Tracked

- `distancematrix` - Distance and duration calculations
- `nearbysearch` - Nearby places search
- `place/autocomplete` - Location autocomplete
- `geocode` - Reverse geocoding
- `place/details` - Place details
- `place/photo` - Place photos
- `findplacefromtext` - Place search by text

## Integration

The tracking system is automatically integrated into:

1. **distanceDurationService.ts** - Distance calculation services
2. **MarkersSlice.ts** - Redux slice for map markers
3. **facility.ts** - Facility-related services
4. **Locator.tsx** - Main map screen
5. **BottomTabNavigation.tsx** - Navigation with debug button

## Expected API Call Counts

For a typical user session:
- **Initial load**: 1-3 calls (fetchNearbyPlaces)
- **Location reverse geocoding**: 1 call
- **Search autocomplete**: 1 call per search
- **Place selection**: 1 call
- **Modal opening**: 3 calls (2 for image, 1 for distance)
- **Facility details**: 1 call (distance calculation)

**Total expected**: 7-10 API calls for a typical session

## Debugging

To debug API call issues:
1. Open the API summary modal
2. Check console logs for detailed call information
3. Look for unexpected function call patterns
4. Monitor for excessive API calls that might indicate bugs

## Performance Monitoring

The system helps identify:
- Unnecessary API calls
- Functions being called too frequently
- API call patterns that could be optimized
- Potential caching opportunities

## Files Modified

- `src/utils/apiCallTracker.ts` - Core tracking system
- `src/components/APICallSummary.tsx` - Visual summary component
- `src/services/distanceDurationService.ts` - Added tracking
- `src/store/slices/MarkersSlice.ts` - Added tracking
- `src/services/facility.ts` - Added tracking
- `src/screens/Locator/Locator.tsx` - Added tracking
- `src/navigation/BottomTabNavigation.tsx` - Added debug button
