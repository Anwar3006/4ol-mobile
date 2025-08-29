import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import apiCallTracker from '../../utils/apiCallTracker';

// Supabase Edge Function API guard
const checkApiAllowed = async (action: string) => {
  const res = await fetch(
    'https://bqdohqgwdqrpmzffmsva.supabase.co/functions/v1/api-guard',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxZG9ocWd3ZHFycG16ZmZtc3ZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI2MTQ0OTAsImV4cCI6MjAzODE5MDQ5MH0.oS-GvWNzPgRuQWrlPwaReAe5Mo1UD3W5-VCZpRTRWTo',
      },
      body: JSON.stringify({action}),
    },
  );
  const data = await res.json();
  if (!data.ok) throw new Error(data.message);
  return true;
};

export const fetchNearbyPlaces = createAsyncThunk(
  'markers/fetchNearbyPlaces',
  async ({
    latitude,
    longitude,
    selectedDistance,
    API_KEY,
    filters,
  }: {
    latitude: any;
    longitude: any;
    selectedDistance: any;
    API_KEY: any;
    filters: any;
  }) => {
    console.log('CALLED====>');

    // Track function call
    apiCallTracker.trackFunctionCall('fetchNearbyPlaces');

    const allMarkers: any = [];

    // OPTIMIZED: Fetch ALL places in one API call instead of multiple calls
    const fetchAllPlaces = async () => {
      // Use a broad search to get all healthcare facilities
      // Keywords based on your filter categories: Hospital/Clinic, Pharmacy, Herbal Centers, Diagnostic Lab, Dental, Ambulance, Homes, Eye Care, Osteopathy, Physiotherapy, Prosthetics, Psychiatric
      const broadKeywords =
        'hospital, clinic, pharmacy, herbal, diagnostic, laboratory, dental, ambulance, nursing home, eye care, osteopathy, physiotherapy, prosthetics, psychiatric, medical center, healthcare';

      let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${selectedDistance}&keyword=${encodeURIComponent(
        broadKeywords,
      )}&key=${API_KEY}`;
      let nextPageToken = '';
      let pageCount = 0;

      do {
        const pageUrl = nextPageToken
          ? `${url}&pagetoken=${nextPageToken}`
          : url;

        // Check API guard first (even in test mode for testing)
        try {
          await checkApiAllowed('NearByPlace');
        } catch (error) {
          console.log(
            '🚫 API call blocked by Supabase guard:',
            (error as Error).message,
          );
          break;
        }

        console.log(
          '🏥 [PLACES API] Making request to:',
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${selectedDistance}&keyword=${encodeURIComponent(
            broadKeywords,
          )}&key=${API_KEY.substring(0, 10)}...`,
        );

        const response = await fetch(pageUrl);
        const data = await response.json();

        console.log('🏥 [PLACES API] Response status:', data.status);
        if (data.status !== 'OK') {
          console.warn(
            '🏥 [PLACES API] Error:',
            data.error_message || data.status,
          );
        }

        if (response.ok && data.status === 'OK') {
          // Track Google API call only after successful response
          const apiAllowed = await apiCallTracker.trackAPICall(
            'fetchNearbyPlaces',
            'nearbysearch',
            {
              page: pageCount + 1,
              keywords: broadKeywords,
              pageToken: !!nextPageToken,
            },
          );

          if (!apiAllowed) {
            console.log('🚫 API call blocked by persistent tracker');
            break;
          }
          const results = data?.results || [];
          allMarkers.push(...results);
          nextPageToken = data.next_page_token || '';
          pageCount++;

          if (nextPageToken) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } else {
          console.error(
            'Error fetching places:',
            data.error_message || 'Unknown error',
          );
          break;
        }
      } while (nextPageToken && pageCount < 3); // Limit to 3 pages to avoid too many calls
    };

    // Fetch all places in one go
    await fetchAllPlaces();

    // Categorize the results based on your filter categories
    const categorizedMarkers = allMarkers.map((marker: any) => {
      const markerName = marker.name?.toLowerCase() || '';
      const markerTypes = marker.types || [];

      // Map to your exact filter categories
      if (markerName.includes('pharmacy') || markerTypes.includes('pharmacy')) {
        return {...marker, category: 'Pharmacy'};
      }

      if (markerName.includes('herbal') || markerName.includes('traditional')) {
        return {...marker, category: 'Herbal Centers'};
      }

      if (
        markerName.includes('laboratory') ||
        markerName.includes('lab') ||
        markerName.includes('diagnostic') ||
        markerTypes.includes('health')
      ) {
        return {...marker, category: 'Diagnostic (Laboratory)'};
      }

      if (markerName.includes('dental') || markerTypes.includes('dentist')) {
        return {...marker, category: 'Dental'};
      }

      if (
        markerName.includes('ambulance') ||
        markerName.includes('emergency')
      ) {
        return {...marker, category: 'Ambulance'};
      }

      if (
        markerName.includes('home') ||
        markerName.includes('nursing') ||
        markerName.includes('care home')
      ) {
        return {...marker, category: 'Homes'};
      }

      if (
        markerName.includes('eye') ||
        markerName.includes('optical') ||
        markerName.includes('vision')
      ) {
        return {...marker, category: 'Eye Care'};
      }

      if (
        markerName.includes('osteopathy') ||
        markerName.includes('osteopathic')
      ) {
        return {...marker, category: 'Osteopathy'};
      }

      if (
        markerName.includes('physiotherapy') ||
        markerName.includes('physical therapy') ||
        markerName.includes('rehabilitation')
      ) {
        return {...marker, category: 'Physiotherapy'};
      }

      if (
        markerName.includes('prosthetic') ||
        markerName.includes('orthopedic') ||
        markerName.includes('medical equipment')
      ) {
        return {...marker, category: 'Prosthetics'};
      }

      if (
        markerName.includes('psychiatric') ||
        markerName.includes('psychology') ||
        markerName.includes('mental health') ||
        markerName.includes('psychiatry')
      ) {
        return {...marker, category: 'Psychiatric'};
      }

      // Default to Hospital/Clinic for general healthcare facilities
      return {...marker, category: 'Hospital/ Clinic'};
    });

    // Remove duplicates
    const uniqueMarkers = Array.from(
      new Map(
        categorizedMarkers.map((marker: any) => [marker.place_id, marker]),
      ).values(),
    );

    console.log(
      `Fetched ${uniqueMarkers.length} unique places in 1-3 API calls`,
    );
    return uniqueMarkers;
  },
);

const markersSlice = createSlice({
  name: 'markers',
  initialState: {
    markers: [],
    originalMarkers: [],
    loading: false,
    error: null,
    selectedDistance: 10000,
    selectedFilter: 'Display All',
    lastFetchedLocation: null as any, // Track last fetched location
    lastFetchedDistance: null as any, // Track last fetched distance
  },
  reducers: {
    filterMarkers(state, action: {payload: string}) {
      const filter = action.payload;
      if (filter === 'Display All') {
        state.markers = state.originalMarkers;
      } else {
        state.markers = state.originalMarkers.filter(
          (marker: any) => marker.category === filter,
        );
      }
      console.log(
        `Filtered to ${state.markers.length} places for category: ${filter}`,
      );
    },
    setSelectedDistance(state, action: {payload: number}) {
      state.selectedDistance = action.payload;
    },
    setSelectedFilter(state, action: {payload: string}) {
      state.selectedFilter = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchNearbyPlaces.pending, state => {
        state.loading = true;
      })
      .addCase(fetchNearbyPlaces.fulfilled, (state, action) => {
        state.loading = false;
        //@ts-ignore
        state.markers = action.payload;
        //@ts-ignore
        state.originalMarkers = action.payload;
        // Store the location and distance for caching
        state.lastFetchedLocation = action.meta.arg;
        state.lastFetchedDistance = action.meta.arg.selectedDistance;
      })
      .addCase(fetchNearbyPlaces.rejected, (state, action) => {
        state.loading = false;
        //@ts-ignore
        state.error = action.error.message || 'Failed to fetch markers';
      });
  },
});

// Helper function to check if we need to refetch data
export const shouldRefetchPlaces = (
  currentLocation: {latitude: number; longitude: number},
  currentDistance: number,
  lastLocation: any,
  lastDistance: any,
) => {
  if (!lastLocation || !lastDistance) return true;

  // Check if location changed significantly (more than 1km)
  const latDiff = Math.abs(currentLocation.latitude - lastLocation.latitude);
  const lngDiff = Math.abs(currentLocation.longitude - lastLocation.longitude);
  const locationChanged = latDiff > 0.01 || lngDiff > 0.01; // ~1km change

  // Check if distance changed
  const distanceChanged = currentDistance !== lastDistance;

  return locationChanged || distanceChanged;
};

export const {filterMarkers, setSelectedDistance, setSelectedFilter} =
  markersSlice.actions;
export const markerData = markersSlice.reducer;
