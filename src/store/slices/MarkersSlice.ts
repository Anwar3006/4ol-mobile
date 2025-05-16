import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';

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
    const allMarkers: any = [];
    const fetchPlacesForFilter = async (
      type: string,
      keyword: string,
      filterName: string,
    ) => {
      let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${selectedDistance}&key=${API_KEY}`;
      if (type) url += `&type=${type}`;
      if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
      let nextPageToken = '';
      do {
        const pageUrl = nextPageToken
          ? `${url}&pagetoken=${nextPageToken}`
          : url;
        const response = await fetch(pageUrl);
        const data = await response.json();
        if (response.ok) {
          const updatedResults = data?.results?.map((r: any) => ({
            ...r,
            category: filterName,
          }));
          allMarkers.push(...updatedResults);
          nextPageToken = data.next_page_token || '';
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
      } while (nextPageToken);
    };
    const filterEntries: any = Object.entries(filters);
    for (const [filterName, {type, keyword}] of filterEntries) {
      if (filterName !== 'Display All') {
        await fetchPlacesForFilter(type, keyword, filterName);
      }
    }
    const uniqueMarkers = Array.from(
      new Map(
        allMarkers.map((marker: any) => [marker.place_id, marker]),
      ).values(),
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
      })
      .addCase(fetchNearbyPlaces.rejected, (state, action) => {
        state.loading = false;
        //@ts-ignore
        state.error = action.error.message || 'Failed to fetch markers';
      });
  },
});

export const {filterMarkers, setSelectedDistance, setSelectedFilter} =
  markersSlice.actions;
export const markerData = markersSlice.reducer;
