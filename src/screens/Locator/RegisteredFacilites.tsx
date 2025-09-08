import React, {useEffect, useRef, useState, useMemo, useCallback} from 'react';
import MapService from '../../services/getRegisteredMapMarkers';
import LocationLayout from '../../components/common/LocationLayout';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import {
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
  View,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  TextInput,
  Switch,
  LayoutChangeEvent,
  Linking,
  Alert,
} from 'react-native';
import {Text} from 'react-native-paper';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Dropdown} from 'react-native-element-dropdown';
import useLocation from '../../hooks/useLocation';
import Geolocation from '@react-native-community/geolocation';
import {themeColors} from '../../theme/colors';
import useGhanaPostGPS from '../../hooks/useGhanaPostGPS';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SCREENS} from '../../constants/screens';
import {
  fetchDistanceAndDuration,
  fetchDistancesAndDurations,
} from '../../services/distanceDurationService';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../store';
import {
  fetchNearbyPlaces,
  filterMarkers,
  setSelectedDistance,
  setSelectedFilter,
  shouldRefetchPlaces,
} from '../../store/slices/MarkersSlice';
import {logActivity} from '../../services/activityLogsService';
import {user} from '../../store/selectors';
import type {AppDispatch} from '../../store/index';
// import apiCallTracker from '../../utils/apiCallTracker';
import ModalCache from '../../utils/modalCache';

import {THIS_IS_MAP_KEY} from '../../../config/variables';

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

export const useAppDispatch: () => AppDispatch = useDispatch;

type TopRatedProps = {
  navigation?: NativeStackNavigationProp<any>;
  route?: {
    params: {
      category?: string;
    };
  };
};

const RegisteredFacilites = ({navigation, route}: TopRatedProps) => {
  // =========== STATE HOOKS ============
  // All useState hooks grouped together at the top level
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number | null;
    longitude: number | null;
  }>({
    latitude: null,
    longitude: null,
  });
  const [loading, setLoading] = useState(true);
  const [fetchingGPSLocation, setFetchingGPSLocation] = useState(false);
  const [rowWidth, setRowWidth] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [markers, setMarkers] = useState<any[]>([]);
  const [filteredMarkers, setFilteredMarkers] = useState<any[]>([]);
  const [selectedFacilityTypes, setSelectedFacilityTypes] = useState<string[]>(
    [],
  );
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [selectedRadius, setSelectedRadius] = useState<number>(10);
  const [address, setAddress] = useState('');
  const [topRated, setTopRated] = useState<boolean>(false);
  const [baseFilteredMarkers, setBaseFilteredMarkers] = useState<any[]>([]);
  const [markModal, setMarkModal] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [markerInfo, setMarkerInfo] = useState<{
    name: string;
    vicinity: string;
    distance: any;
    travelTime: any;
  } | null>(null);

  // Separate state for local facility modal data
  const [localFacilityModalData, setLocalFacilityModalData] = useState<{
    [facilityId: string]: {
      name: string;
      vicinity: string;
      distance: string;
      travelTime: string;
      image: string | null;
    };
  }>({});

  // Cache for distance calculations to avoid API calls on filter changes
  const [distanceCache, setDistanceCache] = useState<Map<string, any>>(
    new Map(),
  );
  const [lastCalculatedLocation, setLastCalculatedLocation] =
    useState<any>(null);

  // =========== SEARCH FUNCTIONALITY STATE ============
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    placeDetails?: any; // Add this field for complete place details
  } | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // =========== REDUX HOOKS ============
  const dispatch = useAppDispatch();
  const userData = useSelector(user);
  const {
    markers: reduxMarkers,
    loading: reduxLoading,
    selectedDistance,
    selectedFilter,
    lastFetchedLocation,
    lastFetchedDistance,
  } = useSelector((state: RootState) => state.markers);

  // =========== REF HOOKS ============
  const mapRef = useRef<MapView>(null);
  const slideAnim = useRef(new Animated.Value(-200)).current;

  // =========== CUSTOM HOOKS ============
  const {fetchGhanaPostAddress, addressData} = useGhanaPostGPS();

  // =========== CONSTANTS ============
  const facilityTypeMapping: {[key: string]: string} = {
    'Hospital/ Clinic': 'Hospital/ Clinic',
    Pharmacy: 'Pharmacy',
    'Herbal Centers': 'Herbal Hospital',
    'Diagnostic (Laboratory)': 'Diagnostic Lab',
    Dental: 'Dental',
    Ambulance: 'Ambulance',
    Homes: 'Home',
    'Eye Care': 'Eye Care',
    Osteopathy: 'Osteopathy',
    Physiotherapy: 'Physiotherapy',
    Prosthetics: 'Prosthetics',
    Psychiatric: 'Psychiatric',
  };

  const facilityIconMapping: {[key: string]: React.ReactElement} = {
    'Hospital/ Clinic': <FontAwesome6 name="house-medical" size={18} />,
    Pharmacy: <FontAwesome5 name="pills" size={18} />,
    'Herbal Centers': <FontAwesome5 name="leaf" size={18} />,
    'Diagnostic (Laboratory)': <Entypo name="lab-flask" size={18} />,
    Dental: <FontAwesome5 name="teeth" size={18} />,
    Ambulance: <FontAwesome5 name="ambulance" size={18} />,
    Homes: <Entypo name="home" size={18} />,
    'Eye Care': <FontAwesome5 name="eye" size={18} />,
    Osteopathy: <FontAwesome5 name="bone" size={18} />,
    Physiotherapy: <FontAwesome6 name="user-doctor" size={18} />,
    Prosthetics: <FontAwesome5 name="hands" size={18} />,
    Psychiatric: <Icon name="brain" size={18} />,
  };

  const facilityTypes = Object.keys(facilityTypeMapping);

  const radiusOptions = [
    {label: '2 km', value: 2},
    {label: '3 km', value: 3},
    {label: '4 km', value: 4},
    {label: '5 km', value: 5},
    {label: '6 km', value: 6},
    {label: '7 km', value: 7},
    {label: '8 km', value: 8},
    {label: '9 km', value: 9},
    {label: '10 km', value: 10},
  ];

  // =========== MEMOIZED VALUES ============
  // All useMemo hooks grouped together
  const customMapStyle = useMemo(
    () => [
      {
        featureType: 'poi',
        stylers: [{visibility: 'off'}],
      },
      {
        featureType: 'poi.business',
        stylers: [{visibility: 'off'}],
      },
    ],
    [],
  );

  const initialRegion = useMemo(() => {
    const region = {
      latitude:
        currentLocation.latitude ||
        (THIS_IS_MAP_KEY === 'TEST_MODE' || !THIS_IS_MAP_KEY ? 6.5244 : 6.5244), // Default to Ghana coordinates for both modes
      longitude:
        currentLocation.longitude ||
        (THIS_IS_MAP_KEY === 'TEST_MODE' || !THIS_IS_MAP_KEY
          ? -1.2244
          : -1.2244),
      latitudeDelta: 0.009,
      longitudeDelta: 0.009,
    };
    console.log('🗺️ [MAP] Initial region set:', region);
    return region;
  }, [currentLocation.latitude, currentLocation.longitude]);

  const facilityTypeButtons = useMemo(() => {
    return facilityTypes.map(type => (
      <TouchableOpacity
        key={type}
        style={[
          styles.filterButton,
          selectedFacilityTypes.includes(type)
            ? styles.filterButtonSelected
            : null,
        ]}
        onPress={() => {
          const newTypes = selectedFacilityTypes.includes(type)
            ? selectedFacilityTypes.filter(t => t !== type) // Remove if already selected
            : [...selectedFacilityTypes, type]; // Add if not selected

          console.log(
            '🏥 [CATEGORY FILTER] Categories changed from:',
            selectedFacilityTypes,
            'to:',
            newTypes,
          );
          setSelectedFacilityTypes(newTypes);
        }}>
        {React.cloneElement(facilityIconMapping[type], {
          color: selectedFacilityTypes.includes(type) ? '#fff' : '#666',
        })}
        <Text
          style={[
            styles.filterText,
            selectedFacilityTypes.includes(type)
              ? styles.filterTextSelected
              : null,
          ]}>
          {type}
        </Text>
      </TouchableOpacity>
    ));
  }, [selectedFacilityTypes]);

  const renderMarkers = useMemo(() => {
    // Only show a limited number of markers based on distance
    return filteredMarkers.slice(0, 20).map((marker, index) => {
      const currentDay = new Date()
        .toLocaleString('en-us', {weekday: 'long'})
        .toLowerCase();
      const currentTime = new Date().toTimeString().slice(0, 5);
      const isOpen =
        marker.business_hours[currentDay] &&
        currentTime >= marker.business_hours[currentDay].opening &&
        currentTime <= marker.business_hours[currentDay].closing;

      return (
        <Marker
          key={index}
          coordinate={{
            latitude: marker.latitude,
            longitude: marker.longitude,
          }}
          tracksViewChanges={false}
          onPress={() => {
            console.log(
              '🔍 [EXISTING MARKER] Clicked on existing facility marker:',
              {
                id: marker.id,
                name: marker.facility_name,
                type: marker.facility_type,
              },
            );
            // Clear previous marker info before setting new marker
            setMarkerInfo(null);
            setImage(null);
            setMarkModal(false);
            // Don't clear localFacilityModalData - keep it for reuse
            setSelectedMarker(marker);
            openMarkModal(marker); // Call openMarkModal for existing facilities too
          }}>
          <View style={styles.markerContainer}>
            <View
              style={[
                styles.customMarker,
                {
                  backgroundColor: isOpen ? themeColors.primary : '#d9534f',
                },
              ]}>
              {React.cloneElement(
                facilityIconMapping[
                  Object.keys(facilityTypeMapping).find(
                    key => facilityTypeMapping[key] === marker.facility_type,
                  ) || 'Hospital/ Clinic'
                ] || <Icon name="medical-bag" size={14} color="#fff" />,
                {color: '#fff', size: 14},
              )}
            </View>
          </View>
        </Marker>
      );
    });
  }, [filteredMarkers, facilityIconMapping, facilityTypeMapping]);

  // =========== CALLBACK FUNCTIONS ============
  // All useCallback hooks grouped together
  const onTabBarLayout = useCallback((event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    setRowWidth(width);
    setIsReady(true);
  }, []);

  const handleFetchAddress = useCallback(async () => {
    setFetchingGPSLocation(true);

    if (THIS_IS_MAP_KEY === 'TEST_MODE' || !THIS_IS_MAP_KEY) {
      console.log('🧪 [TEST MODE] Mock address for testing');
      setAddress('Accra, Greater Accra, Ghana');
      setFetchingGPSLocation(false);
      return;
    }

    if (currentLocation.latitude && currentLocation.longitude) {
      await fetchGhanaPostAddress(
        currentLocation.latitude,
        currentLocation.longitude,
      )
        .then(data => {
          if (data && data?.data?.Table !== null) {
            setAddress(
              data?.data?.Table[0]?.Area +
                ', ' +
                data?.data?.Table[0]?.GPSName || '',
            );
          }
        })
        .finally(() => setFetchingGPSLocation(false));
    }
  }, [
    currentLocation.latitude,
    currentLocation.longitude,
    fetchGhanaPostAddress,
  ]);

  const parseRating = useCallback((marker: any) => {
    return marker.avg_rating
      ? parseFloat(marker.avg_rating)
      : marker.facility_ratings?.[0]?.avg
      ? parseFloat(marker.facility_ratings[0].avg)
      : 0;
  }, []);

  const filterMarkersByDistance = useCallback(async () => {
    if (!currentLocation?.latitude || !markers.length) return;

    console.log('🔍 [FILTER] filterMarkersByDistance called');
    console.log('🔍 [FILTER] Selected Facility Types:', selectedFacilityTypes);
    console.log('🔍 [FILTER] Selected Radius:', selectedRadius);
    console.log('🔍 [FILTER] Total markers to filter:', markers.length);

    // Check if location has changed significantly (more than 100 meters)
    const locationChanged =
      !lastCalculatedLocation ||
      (currentLocation.latitude &&
        lastCalculatedLocation.latitude &&
        Math.abs(currentLocation.latitude - lastCalculatedLocation.latitude) >
          0.001) ||
      (currentLocation.longitude &&
        lastCalculatedLocation.longitude &&
        Math.abs(currentLocation.longitude - lastCalculatedLocation.longitude) >
          0.001);

    console.log('🔍 [FILTER] Location changed:', locationChanged);

    // 1. First filter by facility types (support multiple selections)
    let filteredResults = markers.filter(marker => {
      if (selectedFacilityTypes.length === 0) return true; // Show all if no categories selected

      return selectedFacilityTypes.some(
        type => marker.facility_type === facilityTypeMapping[type],
      );
    });

    console.log(
      '🔍 [FILTER] After facility type filter:',
      filteredResults.length,
    );

    // 2. Quick distance calculation using Haversine formula (no API calls)
    const calculateHaversineDistance = (
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number,
    ) => {
      const R = 6371; // Earth radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distance in km
    };

    // Apply distance calculation (use cache if location hasn't changed)
    const markersWithDistance = filteredResults.map(marker => {
      const cacheKey = `${marker.latitude},${marker.longitude}`;

      // Use cached distance if location hasn't changed
      if (!locationChanged && distanceCache.has(cacheKey)) {
        const cachedData = distanceCache.get(cacheKey);
        console.log(
          '🔍 [FILTER] Using cached distance for marker:',
          marker.facility_name,
        );
        return {
          ...marker,
          ...cachedData,
        };
      }

      // Calculate new distance
      const distanceInKm = calculateHaversineDistance(
        currentLocation.latitude!,
        currentLocation.longitude!,
        marker.latitude,
        marker.longitude,
      );

      const distanceData = {
        distance: distanceInKm,
        distanceText: `${distanceInKm.toFixed(1)} km`,
        duration: '~' + Math.ceil(distanceInKm * 4) + ' min', // Rough estimate
      };

      // Cache the distance data
      setDistanceCache(prev => new Map(prev.set(cacheKey, distanceData)));

      return {
        ...marker,
        ...distanceData,
      };
    });

    // 3. Filter by radius and sort by distance
    const withinRadius = markersWithDistance
      .filter(m => m.distance <= selectedRadius)
      .sort((a, b) => a.distance - b.distance);

    console.log('🔍 [FILTER] After radius filter:', withinRadius.length);
    console.log('🔍 [FILTER] Radius used:', selectedRadius, 'km');

    // 4. Only get precise distances for the top 20 results
    const topResults = withinRadius.slice(0, 20);

    console.log('🔍 [FILTER] Final filtered results:', topResults.length);
    console.log('🔍 [FILTER] Filtering complete - NO API calls made');

    // Only get precise distances via API if location has changed
    if (topResults.length > 0 && locationChanged) {
      console.log(
        '🔍 [FILTER] Location changed, fetching precise distances via API',
      );
      const origin = `${currentLocation.latitude!},${currentLocation.longitude!}`;
      const destinations = topResults.map(
        marker => `${marker.latitude},${marker.longitude}`,
      );

      try {
        const distanceResults = await fetchDistancesAndDurations(
          origin,
          destinations,
          false, // false = direct call (not internal)
        );

        // Update only the top markers with precise distance data
        topResults.forEach((marker, index) => {
          if (distanceResults[index]) {
            marker.distanceText = distanceResults[index].distance;
            marker.duration = distanceResults[index].duration;

            // Cache the precise distance data
            const cacheKey = `${marker.latitude},${marker.longitude}`;
            setDistanceCache(
              prev =>
                new Map(
                  prev.set(cacheKey, {
                    distance: marker.distance,
                    distanceText: distanceResults[index].distance,
                    duration: distanceResults[index].duration,
                  }),
                ),
            );
          }
        });
      } catch (error) {
        console.log('Error fetching precise distances:', error);
        // Continue with approximate distances
      }
    } else if (topResults.length > 0) {
      console.log(
        '🔍 [FILTER] Location unchanged, using cached/approximate distances - NO API calls',
      );
    }

    // Update location tracking
    setLastCalculatedLocation(currentLocation);

    // Update state with all markers that are within radius
    setFilteredMarkers(withinRadius);
    setBaseFilteredMarkers(withinRadius);
  }, [
    currentLocation.latitude,
    currentLocation.longitude,
    markers.length,
    selectedFacilityTypes,
    selectedRadius,
    facilityTypeMapping,
    distanceCache,
    lastCalculatedLocation,
  ]);

  const showCard = useCallback(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const hideCard = useCallback(() => {
    Animated.spring(slideAnim, {
      toValue: -200,
      useNativeDriver: true,
    }).start();
    // Reset modal states when hiding card, but preserve local facility modal data
    setMarkModal(false);
    setMarkerInfo(null);
    setImage(null);
    // Don't clear localFacilityModalData - keep it for reuse
  }, [slideAnim]);

  const animateToMyLocation = useCallback(() => {
    if (currentLocation.latitude && currentLocation.longitude) {
      console.log(
        '📍 [MY LOCATION] Animating to user location:',
        currentLocation,
      );
      mapRef.current?.animateToRegion(
        {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.009,
          longitudeDelta: 0.009,
        },
        1000,
      );
    } else {
      console.log('❌ [MY LOCATION] No current location available');
    }
  }, [currentLocation]);

  const openInMaps = useCallback(() => {
    if (!selectedMarker?.latitude || !selectedMarker?.longitude) {
      Alert.alert('Error', 'Location coordinates not available');
      return;
    }

    const destination = `${selectedMarker.latitude},${selectedMarker.longitude}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;

    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Unable to open Google Maps');
        }
      })
      .catch(err => {
        console.error('Error opening maps:', err);
        Alert.alert('Error', 'Failed to open Google Maps');
      });
  }, [selectedMarker]);

  // =========== OTHER FUNCTIONS ============
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true; // iOS handles permissions automatically
  };

  const getLocation = async () => {
    console.log('📍 [LOCATION] Starting location request...');
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      console.log(
        '🚫 [LOCATION] Permission denied - user location marker will not show',
      );
      setLoading(false); // Set loading to false if permission is denied
      return;
    }
    console.log(
      '✅ [LOCATION] Permission granted, getting current position...',
    );

    Geolocation.getCurrentPosition(
      position => {
        console.log('✅ [LOCATION] Location obtained:', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false); // Set loading to false when location is fetched
      },
      error => {
        console.log(
          '❌ [LOCATION] Error getting location:',
          error.message,
          error.code,
        );
        setLoading(false); // Set loading to false if there is an error
      },
      {enableHighAccuracy: true, timeout: 30000, maximumAge: 10000},
    );
  };

  // =========== SEARCH FUNCTIONS FROM LOCATOR ============

  // Search autocomplete function
  const fetchAutocompleteSuggestions = async (query: any) => {
    if (query.length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSearchLoading(true);
    try {
      // Check API guard first (even in test mode for testing)
      try {
        await checkApiAllowed('AutoCompleteSuggestions');
      } catch (error) {
        console.log(
          '🚫 Autocomplete API call blocked by Supabase guard:',
          (error as Error).message,
        );
        setSuggestions([]);
        setShowSuggestions(false);
        setSearchLoading(false);
        return;
      }

      // Track function call

      if (THIS_IS_MAP_KEY === 'TEST_MODE' || !THIS_IS_MAP_KEY) {
        console.log(
          '🧪 [TEST MODE] Mock autocomplete suggestions for query:',
          query,
        );
      } else {
        console.log(
          '🌍 [REAL MODE] Fetching autocomplete suggestions for query:',
          query,
        );
        console.log('🌍 [REAL MODE] API Key available:', !!THIS_IS_MAP_KEY);
      }

      console.log(
        '🔍 [AUTOCOMPLETE API] Making request to:',
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}&key=${THIS_IS_MAP_KEY.substring(
          0,
          10,
        )}...`,
      );

      // Add location bias to get nearby results
      const locationBias =
        currentLocation.latitude && currentLocation.longitude
          ? `&location=${currentLocation.latitude},${currentLocation.longitude}&radius=50000`
          : '';

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}&types=establishment${locationBias}&key=${THIS_IS_MAP_KEY}`,
      );

      const data = await response.json();
      console.log('🔍 [AUTOCOMPLETE API] Response status:', data.status);
      if (data.status !== 'OK') {
        console.warn(
          '🔍 [AUTOCOMPLETE API] Error:',
          data.error_message || data.status,
        );
      }
      if (response.ok && data.status === 'OK') {
        // API call tracking removed - keeping Supabase API guard
        setSuggestions(data.predictions);
        setShowSuggestions(true);
      } else {
        console.error(
          'Error fetching autocomplete suggestions:',
          data.status,
          data.error_message,
        );
        // Fallback to mock suggestions if API fails
        const mockSuggestions = [
          {
            place_id: 'fallback_1',
            description: 'San Francisco General Hospital, San Francisco, CA',
          },
          {
            place_id: 'fallback_2',
            description: 'CVS Pharmacy, San Francisco, CA',
          },
          {
            place_id: 'fallback_3',
            description: 'UCSF Medical Center, San Francisco, CA',
          },
        ];
        setSuggestions(mockSuggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setSearchLoading(false);
    }
  };

  // Get place details from place ID
  const fetchPlaceDetails = async (placeId: any) => {
    try {
      console.log(
        '🔍 [PLACE DETAILS] Starting fetchPlaceDetails for placeId:',
        placeId,
      );

      // Check API guard first (even in test mode for testing)
      try {
        await checkApiAllowed('DirectToPlace');
        console.log('✅ [PLACE DETAILS] API guard check passed');
      } catch (error) {
        console.log(
          '🚫 [PLACE DETAILS] Place Details API call blocked by Supabase guard:',
          (error as Error).message,
        );
        return;
      }

      // API call tracking removed - keeping Supabase API guard

      if (THIS_IS_MAP_KEY === 'TEST_MODE' || !THIS_IS_MAP_KEY) {
        console.log('🧪 [TEST MODE] Mock place details for placeId:', placeId);
        // Mock complete place details for testing
        const mockPlaceDetails = {
          place_id: placeId,
          name: 'Test Healthcare Facility',
          formatted_address: '123 Test Street, Accra, Ghana',
          formatted_phone_number: '+233 20 123 4567',
          website: 'https://testfacility.com',
          rating: 4.5,
          user_ratings_total: 120,
          opening_hours: {
            open_now: true,
            weekday_text: [
              'Monday: 8:00 AM – 6:00 PM',
              'Tuesday: 8:00 AM – 6:00 PM',
              'Wednesday: 8:00 AM – 6:00 PM',
              'Thursday: 8:00 AM – 6:00 PM',
              'Friday: 8:00 AM – 6:00 PM',
              'Saturday: 9:00 AM – 5:00 PM',
              'Sunday: Closed',
            ],
          },
          photos: [
            {photo_reference: 'mock_photo_ref_1'},
            {photo_reference: 'mock_photo_ref_2'},
          ],
          geometry: {
            location: {lat: 6.5244, lng: -1.2244},
          },
          types: ['health', 'establishment'],
          business_status: 'OPERATIONAL',
        };

        console.log(
          '🧪 [TEST MODE] Mock place details created:',
          mockPlaceDetails,
        );

        setSelectedLocation({
          latitude: mockPlaceDetails.geometry.location.lat,
          longitude: mockPlaceDetails.geometry.location.lng,
          placeDetails: mockPlaceDetails, // Store complete details
        });

        console.log('🧪 [TEST MODE] Selected location set with place details');

        // Animate map to selected location
        mapRef.current?.animateToRegion(
          {
            latitude: mockPlaceDetails.geometry.location.lat,
            longitude: mockPlaceDetails.geometry.location.lng,
            latitudeDelta: 0.009,
            longitudeDelta: 0.009,
          },
          1000,
        );
        return;
      }

      console.log(
        '📍 [PLACE DETAILS API] Making request to:',
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${THIS_IS_MAP_KEY.substring(
          0,
          10,
        )}...`,
      );

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${THIS_IS_MAP_KEY}`,
      );

      const data = await response.json();
      console.log('📍 [PLACE DETAILS API] Response status:', data.status);
      if (data.status !== 'OK') {
        console.warn(
          '📍 [PLACE DETAILS API] Error:',
          data.error_message || data.status,
        );
      }
      if (response.ok && data.status === 'OK') {
        // API call tracking removed - keeping Supabase API guard

        console.log(
          '✅ [PLACE DETAILS API] Successfully fetched place details',
        );
        console.log('📍 [PLACE DETAILS API] Place data structure:', {
          name: data.result.name,
          address: data.result.formatted_address,
          phone: data.result.formatted_phone_number,
          website: data.result.website,
          rating: data.result.rating,
          photos: data.result.photos?.length || 0,
          types: data.result.types,
        });

        const {lat, lng} = data.result.geometry.location;
        setSelectedLocation({
          latitude: lat,
          longitude: lng,
          placeDetails: data.result, // Store the complete place details
        });

        console.log(
          '📍 [PLACE DETAILS API] Selected location set with complete place details',
        );

        // Animate map to selected location
        mapRef.current?.animateToRegion(
          {
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.009,
            longitudeDelta: 0.009,
          },
          1000,
        );
      } else {
        console.error(
          '❌ [PLACE DETAILS API] Error fetching place details:',
          data.status,
        );
      }
    } catch (error) {
      console.error('❌ [PLACE DETAILS API] Exception occurred:', error);
    }
  };

  // Handle selecting a suggestion
  const handleSelectSuggestion = (placeId: any, description: any) => {
    setSearchText(description);
    fetchPlaceDetails(placeId);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Handle search input changes (no API calls on typing)
  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
    // Don't call API on typing - user will click search button
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Handle search button press
  const handleSearchButtonPress = () => {
    if (searchText.length > 2) {
      fetchAutocompleteSuggestions(searchText);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // =========== OPTIMIZED FUNCTIONS FROM LOCATOR ============

  // Optimized fetchImage function
  const fetchImage = async (placeId: string) => {
    try {
      // Check API guard for Place Details API (first call) - even in test mode for testing
      try {
        await checkApiAllowed('PlaceDetail');
      } catch (error) {
        console.log(
          '🚫 Place Details API call blocked by Supabase guard:',
          (error as Error).message,
        );
        return null;
      }

      // apiCallTracker.trackFunctionCall('fetchImage');

      if (THIS_IS_MAP_KEY === 'TEST_MODE' || !THIS_IS_MAP_KEY) {
        console.log('🧪 [TEST MODE] Mock image for placeId:', placeId);
        // Return mock image URL for testing
        return 'https://via.placeholder.com/400x300?text=Test+Facility+Image';
      }

      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${THIS_IS_MAP_KEY}`;
      console.log(
        '🖼️ [PLACE DETAILS API] Making request for image to:',
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${THIS_IS_MAP_KEY.substring(
          0,
          10,
        )}...`,
      );

      const response = await fetch(url);
      const data = await response.json();
      console.log('🖼️ [PLACE DETAILS API] Response status:', data.status);
      if (data.status !== 'OK') {
        console.warn(
          '🖼️ [PLACE DETAILS API] Error:',
          data.error_message || data.status,
        );
      }
      if (data?.result?.photos && data?.result?.photos?.length > 0) {
        // Check API guard for Places Photo API (second call) - even in test mode for testing
        try {
          await checkApiAllowed('PlaceImage');
        } catch (error) {
          console.log(
            '🚫 Places Photo API call blocked by Supabase guard:',
            (error as Error).message,
          );
          return null;
        }

        // Track Google API call only after successful Place Details response
        // apiCallTracker.trackAPICall('fetchImage', 'place/details', {placeId});

        const reference = data?.result?.photos[0]?.photo_reference;
        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${reference}&key=${THIS_IS_MAP_KEY}`;
        console.log(
          '📸 [PLACES PHOTO API] Generated photo URL:',
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${reference}&key=${THIS_IS_MAP_KEY.substring(
            0,
            10,
          )}...`,
        );

        // Track Google API call for Places Photo API (this is just URL generation, no actual API call)
        // apiCallTracker.trackAPICall('fetchImage', 'place/photo', {placeId});

        return photoUrl;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching image:', error);
      return null;
    }
  };

  // Enhanced openMarkModal function with comprehensive data handling
  const openMarkModal = async (marker: any) => {
    // Generate unique session ID for this modal opening
    const modalSessionId = Date.now().toString();

    // Validate marker data
    if (!marker || !marker.latitude || !marker.longitude) {
      console.error('❌ [OPEN MODAL] Invalid marker data:', marker);
      return;
    }

    console.log(
      `🚀 [OPEN MODAL:${modalSessionId}] Starting openMarkModal for marker:`,
      {
        id: marker?.id,
        place_id: marker?.place_id,
        name: marker?.facility_name || marker?.name,
        type: marker?.facility_type || 'searched_place',
        coordinates: {lat: marker.latitude, lng: marker.longitude},
      },
    );

    // apiCallTracker.trackFunctionCall('openMarkModal');

    if (!currentLocation.latitude || !currentLocation.longitude) {
      console.error('❌ [OPEN MODAL] User location not available');
      return;
    }

    // Validate coordinates are numbers
    if (
      isNaN(currentLocation.latitude) ||
      isNaN(currentLocation.longitude) ||
      isNaN(marker.latitude) ||
      isNaN(marker.longitude)
    ) {
      console.error('❌ [OPEN MODAL] Invalid coordinates:', {
        currentLocation: {
          lat: currentLocation.latitude,
          lng: currentLocation.longitude,
        },
        marker: {lat: marker.latitude, lng: marker.longitude},
      });
      return;
    }

    // Check if this is a searched place marker (has enhanced data from Google Places)
    const isSearchedPlace = marker?.phone || marker?.website || marker?.rating;

    // Check if this is an existing facility from our database
    const isExistingFacility =
      marker?.facility_type &&
      marker?.gps_address &&
      !marker?.place_id?.startsWith('ChIJ');

    console.log(`🔍 [OPEN MODAL:${modalSessionId}] Marker type detection:`, {
      isSearchedPlace,
      isExistingFacility,
      hasPlaceId: !!marker?.place_id,
      facilityType: marker?.facility_type,
    });

    if (isSearchedPlace) {
      console.log(
        `✅ [OPEN MODAL:${modalSessionId}] Using enhanced data from searched place marker`,
      );
      console.log(
        `📊 [OPEN MODAL:${modalSessionId}] Available enhanced data:`,
        {
          phone: marker?.phone,
          website: marker?.website,
          rating: marker?.rating,
          user_ratings_total: marker?.user_ratings_total,
          business_status: marker?.business_status,
          types: marker?.types,
        },
      );
    } else if (isExistingFacility) {
      console.log('🏥 [OPEN MODAL] Using existing facility data from database');
      console.log('📊 [OPEN MODAL] Available database data:', {
        facility_name: marker?.facility_name,
        facility_type: marker?.facility_type,
        gps_address: marker?.gps_address,
        district: marker?.district,
        area: marker?.area,
        avg_rating: marker?.avg_rating,
        business_hours: marker?.business_hours,
      });
    }

    if (THIS_IS_MAP_KEY === 'TEST_MODE' || !THIS_IS_MAP_KEY) {
      console.log(
        '🧪 [TEST MODE] Mock modal data for marker:',
        marker.facility_name || marker.name,
      );

      // Check if this is an existing facility in test mode
      const isExistingFacility = marker?.facility_type && marker?.gps_address;

      // Mock modal data for testing
      setImage('https://via.placeholder.com/400x300?text=Test+Facility+Image');
      setMarkerInfo({
        name: marker?.name || marker?.facility_name || 'Test Facility',
        vicinity: isExistingFacility
          ? `${marker?.gps_address || ''}, ${marker?.district || ''}, ${
              marker?.area || ''
            }`
              .replace(/^,\s*/, '')
              .replace(/,\s*,/g, ',')
          : marker?.address || marker?.vicinity || 'Test Address',
        distance: '2.5 km',
        travelTime: '8 min',
      });
      setMarkModal(true);
      console.log('🧪 [TEST MODE] Modal opened with mock data');
      return;
    }

    // Check if we have cached modal data for this facility
    const cachedModalData = await ModalCache.getCachedModalData(
      marker.place_id || marker.id,
      currentLocation.latitude,
      currentLocation.longitude,
    );

    if (cachedModalData) {
      // Use cached data - NO API calls needed!
      console.log(
        '🎯 [OPEN MODAL] Using cached modal data for facility:',
        marker.place_id || marker.id,
      );
      setImage(cachedModalData.imageUrl);
      setMarkerInfo({
        name: marker?.name || marker?.facility_name || 'unknown',
        vicinity: isExistingFacility
          ? `${marker?.gps_address || ''}, ${marker?.district || ''}, ${
              marker?.area || ''
            }`
              .replace(/^,\s*/, '')
              .replace(/,\s*,/g, ',')
          : marker?.vicinity || marker?.address || 'unknown place',
        distance: cachedModalData.distance,
        travelTime: cachedModalData.duration,
      });
      setMarkModal(true);
      console.log('🎯 [OPEN MODAL] Modal opened with cached data');
      return;
    }

    // No cache found, fetch fresh data
    console.log(
      '🔄 [OPEN MODAL] Fetching fresh modal data for facility:',
      marker.place_id || marker.id,
    );

    // For searched places, we already have most data, just need image and distance
    if (isSearchedPlace) {
      console.log(
        '🔍 [OPEN MODAL] Searched place - fetching only image and distance data',
      );
    } else if (isExistingFacility) {
      console.log(
        '🏥 [OPEN MODAL] Existing facility - using database data, calculating approximate distance',
      );
    } else {
      console.log('🔍 [OPEN MODAL] Regular facility - fetching all data');
    }

    let imageUrl = null;
    let distanceAndDuration = null;

    if (isSearchedPlace) {
      // For searched places, fetch image and distance from Google APIs
      console.log('🔍 [OPEN MODAL] Starting API calls for searched place:', {
        placeId: marker.place_id || marker.id,
        origin: `${currentLocation.latitude},${currentLocation.longitude}`,
        destination: `${marker?.latitude},${marker?.longitude}`,
      });

      [imageUrl, distanceAndDuration] = await Promise.all([
        fetchImage(marker.place_id || marker.id),
        fetchDistanceAndDuration(
          `${currentLocation.latitude},${currentLocation.longitude}`,
          `${marker?.latitude},${marker?.longitude}`,
        ),
      ]);
    } else if (isExistingFacility) {
      // For existing facilities, check if we have cached modal data first
      const facilityId = marker.id;
      const cachedLocalData = localFacilityModalData[facilityId];

      if (cachedLocalData) {
        console.log(
          '🏥 [OPEN MODAL] Using cached local facility modal data:',
          cachedLocalData,
        );

        // Use cached data for local facility
        setImage(cachedLocalData.image);
        setMarkerInfo({
          name: cachedLocalData.name,
          vicinity: cachedLocalData.vicinity,
          distance: cachedLocalData.distance,
          travelTime: cachedLocalData.travelTime,
        });

        // Small delay to ensure state updates are processed
        setTimeout(() => {
          setMarkModal(true);
          console.log(
            '✅ [OPEN MODAL] Local facility modal opened with cached data',
          );
        }, 100);
        return;
      }

      console.log('🏥 [OPEN MODAL] Creating new local facility modal data');

      // Use existing facility image if available
      if (marker?.mediaUrls?.[0]) {
        imageUrl = marker.mediaUrls[0];
        console.log(
          '🏥 [OPEN MODAL] Using existing facility image from mediaUrls',
        );
      }

      // Use the distance and duration that were already calculated by fetchDistancesAndDirections
      const localDistance = marker.distance || marker.distanceText || 'Unknown';
      const localDuration = marker.duration || 'Unknown';

      distanceAndDuration = {
        distance: localDistance,
        duration: localDuration,
      };

      console.log(
        '📏 [OPEN MODAL] Using pre-calculated distance for existing facility:',
        {
          distance: distanceAndDuration.distance,
          duration: distanceAndDuration.duration,
          markerDistance: marker.distance,
          markerDuration: marker.duration,
        },
      );

      // Store this data in local facility modal cache
      const localModalData = {
        name: marker?.facility_name || 'Unknown',
        vicinity: `${marker?.gps_address || ''}, ${marker?.district || ''}, ${
          marker?.area || ''
        }`
          .replace(/^,\s*/, '')
          .replace(/,\s*,/g, ','),
        distance: localDistance,
        travelTime: localDuration,
        image: imageUrl,
      };

      setLocalFacilityModalData(prev => ({
        ...prev,
        [facilityId]: localModalData,
      }));

      console.log(
        '🏥 [OPEN MODAL] Stored local facility modal data:',
        localModalData,
      );
    } else {
      // For other cases, fetch from Google APIs
      console.log('🔍 [OPEN MODAL] Starting API calls for regular facility:', {
        placeId: marker.place_id || marker.id,
        origin: `${currentLocation.latitude},${currentLocation.longitude}`,
        destination: `${marker?.latitude},${marker?.longitude}`,
      });

      [imageUrl, distanceAndDuration] = await Promise.all([
        fetchImage(marker.place_id || marker.id),
        fetchDistanceAndDuration(
          `${currentLocation.latitude},${currentLocation.longitude}`,
          `${marker?.latitude},${marker?.longitude}`,
        ),
      ]);
    }

    console.log('📊 [OPEN MODAL] API call results:', {
      imageUrl: imageUrl ? 'Available' : 'Not available',
      distanceAndDuration: distanceAndDuration,
      distance: distanceAndDuration?.distance,
      duration: distanceAndDuration?.duration,
      hasDistance: !!distanceAndDuration?.distance,
      hasDuration: !!distanceAndDuration?.duration,
    });

    // Cache the modal data for future use
    await ModalCache.setCachedModalData(
      marker.place_id || marker.id,
      currentLocation.latitude,
      currentLocation.longitude,
      imageUrl,
      distanceAndDuration?.distance || 'unknown',
      distanceAndDuration?.duration || 'unknown',
    );

    // For existing facilities, use their mediaUrls if no Google image found
    if (isExistingFacility && !imageUrl && marker?.mediaUrls?.[0]) {
      setImage(marker.mediaUrls[0]);
      console.log(
        '🏥 [OPEN MODAL] Using existing facility image from mediaUrls',
      );
    } else {
      setImage(imageUrl ?? null);
    }
    // Prepare values for markerInfo
    const finalDistance = distanceAndDuration?.distance || 'Unknown';
    const finalTravelTime = distanceAndDuration?.duration || 'Unknown';

    console.log('🔍 [OPEN MODAL] Setting markerInfo with values:', {
      name: marker?.name || marker?.facility_name || 'unknown',
      vicinity: isExistingFacility
        ? `${marker?.gps_address || ''}, ${marker?.district || ''}, ${
            marker?.area || ''
          }`
        : marker?.vicinity || marker?.address || 'unknown place',
      distance: finalDistance,
      travelTime: finalTravelTime,
      isExistingFacility,
    });

    setMarkerInfo({
      name: marker?.name || marker?.facility_name || 'unknown',
      vicinity: isExistingFacility
        ? `${marker?.gps_address || ''}, ${marker?.district || ''}, ${
            marker?.area || ''
          }`
            .replace(/^,\s*/, '')
            .replace(/,\s*,/g, ',')
        : marker?.vicinity || marker?.address || 'unknown place',
      distance: finalDistance,
      travelTime: finalTravelTime,
    });

    console.log('🔍 [OPEN MODAL] markerInfo state set to:', {
      name: marker?.name || marker?.facility_name || 'unknown',
      vicinity: marker?.vicinity || marker?.address || 'unknown place',
      distance: distanceAndDuration?.distance,
      travelTime: distanceAndDuration?.duration,
    });

    // Small delay to ensure state updates are processed
    setTimeout(() => {
      // Verify we have the essential data before opening modal
      if (marker?.facility_name && finalDistance) {
        setMarkModal(true);
        console.log(
          '✅ [OPEN MODAL] Modal opened with fresh data after state update',
        );
      } else {
        console.error(
          '❌ [OPEN MODAL] Failed to set essential data, modal not opened',
        );
        console.log('❌ [OPEN MODAL] Facility name:', marker?.facility_name);
        console.log('❌ [OPEN MODAL] Final distance:', finalDistance);
      }
    }, 100);
  };

  // =========== EFFECTS ============
  // All useEffect hooks grouped together

  // Debug effect for modal state changes
  useEffect(() => {
    if (selectedMarker) {
      console.log('🔍 [MODAL STATE DEBUG] Modal opened with:', {
        markerInfo: markerInfo,
        image: image,
        selectedMarker: {
          id: selectedMarker.id,
          name: selectedMarker.facility_name,
          distance: selectedMarker.distance,
          duration: selectedMarker.duration,
        },
      });
    }
  }, [selectedMarker, markerInfo, image]);

  useEffect(() => {
    // API tracking removed - keeping Supabase API guard

    // Clear distance cache since we're changing location
    setDistanceCache(new Map());
    setLastCalculatedLocation(null);

    // Check if we're in test mode
    console.log(
      '🔑 [API KEY CHECK] Current API Key:',
      THIS_IS_MAP_KEY ? 'SET' : 'NOT SET',
    );
    console.log(
      '🔑 [API KEY CHECK] Is Test Mode:',
      THIS_IS_MAP_KEY === 'TEST_MODE' || !THIS_IS_MAP_KEY,
    );

    if (THIS_IS_MAP_KEY === 'TEST_MODE' || !THIS_IS_MAP_KEY) {
      console.log('🧪 [TEST MODE] Using mock location data');
      // Set mock location for testing (Ghana coordinates to match database)
      setCurrentLocation({
        latitude: 6.5244, // Accra, Ghana coordinates
        longitude: -1.2244,
      });
      setLoading(false);
      console.log('🧪 [TEST MODE] Location set:', {
        latitude: 6.5244,
        longitude: -1.2244,
      });
    } else {
      console.log('🌍 [REAL MODE] Getting real device location');
      // Real mode: Use actual device location (get from device)
      getLocation();
    }
  }, []);

  useEffect(() => {
    if (currentLocation.latitude && currentLocation.longitude) {
      mapRef.current?.animateToRegion(
        {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.009,
          longitudeDelta: 0.009,
        },
        1000,
      );
    }
  }, [currentLocation]);

  useEffect(() => {
    console.log(
      '⭐ [TOP RATED FILTER] useEffect triggered - topRated:',
      topRated,
    );
    if (topRated) {
      const topRatedMarkers = baseFilteredMarkers.filter(
        marker => parseRating(marker) >= 4.0,
      );
      console.log(
        '⭐ [TOP RATED FILTER] Filtered to top rated markers:',
        topRatedMarkers.length,
      );
      setFilteredMarkers(topRatedMarkers);
    } else {
      console.log(
        '⭐ [TOP RATED FILTER] Showing all base filtered markers:',
        baseFilteredMarkers.length,
      );
      setFilteredMarkers(baseFilteredMarkers);
    }
  }, [baseFilteredMarkers, topRated, parseRating]);

  useEffect(() => {
    console.log('🔄 [FILTER TRIGGER] useEffect triggered for filter changes');
    console.log(
      '🔄 [FILTER TRIGGER] Dependencies changed - selectedFacilityTypes:',
      selectedFacilityTypes,
      'selectedRadius:',
      selectedRadius,
    );
    if (currentLocation.latitude && currentLocation.longitude) {
      console.log('🔄 [FILTER TRIGGER] Calling filterMarkersByDistance...');
      filterMarkersByDistance();
    } else {
      console.log('🔄 [FILTER TRIGGER] Skipping filter - no current location');
    }
  }, [
    currentLocation.latitude,
    currentLocation.longitude,
    selectedFacilityTypes,
    selectedRadius,
    // filterMarkersByDistance,
  ]);

  useEffect(() => {
    if (currentLocation.latitude && currentLocation.longitude && !address) {
      handleFetchAddress();
    }
  }, [
    currentLocation.latitude,
    currentLocation.longitude,
    address,
    // handleFetchAddress,
  ]);

  useEffect(() => {
    (async () => {
      console.log(
        '🔄 [MARKERS] useEffect triggered - API Key:',
        THIS_IS_MAP_KEY ? 'SET' : 'NOT SET',
      );
      console.log('🔑 [API KEY] Value:', THIS_IS_MAP_KEY);
      console.log('🔑 [API KEY] Length:', THIS_IS_MAP_KEY?.length);
      if (THIS_IS_MAP_KEY === 'TEST_MODE' || !THIS_IS_MAP_KEY) {
        console.log('🧪 [TEST MODE] Using mock markers data');
        // Set mock markers for testing
        const mockMarkers = [
          {
            id: 'test_1',
            place_id: 'test_place_1',
            facility_name: 'Test Hospital',
            facility_type: 'hospital',
            latitude: 6.5244,
            longitude: -1.2244,
            address: '123 Test Street, Accra',
            gps_address: 'Test GPS Address',
            district: 'Test District',
            area: 'Test Area',
            facility_ratings: [{avg: '4.5'}],
            mediaUrls: [
              'https://via.placeholder.com/300x200?text=Test+Hospital',
            ],
            business_hours: {
              sunday: {opening: '08:00', closing: '18:00'},
              monday: {opening: '08:00', closing: '18:00'},
              tuesday: {opening: '08:00', closing: '18:00'},
              wednesday: {opening: '08:00', closing: '18:00'},
              thursday: {opening: '08:00', closing: '18:00'},
              friday: {opening: '08:00', closing: '18:00'},
              saturday: {opening: '09:00', closing: '17:00'},
            },
          },
          {
            id: 'test_2',
            place_id: 'test_place_2',
            facility_name: 'Test Pharmacy',
            facility_type: 'pharmacy',
            latitude: 6.5344,
            longitude: -1.2144,
            address: '456 Test Avenue, Accra',
            gps_address: 'Test GPS Address 2',
            district: 'Test District 2',
            area: 'Test Area 2',
            facility_ratings: [{avg: '4.2'}],
            mediaUrls: [
              'https://via.placeholder.com/300x200?text=Test+Pharmacy',
            ],
            business_hours: {
              sunday: {opening: '09:00', closing: '17:00'},
              monday: {opening: '08:00', closing: '20:00'},
              tuesday: {opening: '08:00', closing: '20:00'},
              wednesday: {opening: '08:00', closing: '20:00'},
              thursday: {opening: '08:00', closing: '20:00'},
              friday: {opening: '08:00', closing: '20:00'},
              saturday: {opening: '09:00', closing: '18:00'},
            },
          },
          {
            id: 'test_3',
            place_id: 'test_place_3',
            facility_name: 'Test Clinic',
            facility_type: 'clinic',
            latitude: 6.5144,
            longitude: -1.2344,
            address: '789 Test Boulevard, Accra',
            gps_address: 'Test GPS Address 3',
            district: 'Test District 3',
            area: 'Test Area 3',
            facility_ratings: [{avg: '4.8'}],
            mediaUrls: ['https://via.placeholder.com/300x200?text=Test+Clinic'],
            business_hours: {
              sunday: {opening: '10:00', closing: '16:00'},
              monday: {opening: '07:00', closing: '19:00'},
              tuesday: {opening: '07:00', closing: '19:00'},
              wednesday: {opening: '07:00', closing: '19:00'},
              thursday: {opening: '07:00', closing: '19:00'},
              friday: {opening: '07:00', closing: '19:00'},
              saturday: {opening: '08:00', closing: '17:00'},
            },
          },
        ];
        setMarkers(mockMarkers);
        setFilteredMarkers(mockMarkers);
        setBaseFilteredMarkers(mockMarkers);
        console.log('🧪 [TEST MODE] Mock markers set:', mockMarkers.length);
        console.log('🧪 [TEST MODE] Mock markers data:', mockMarkers);
      } else {
        // Real mode: Fetch actual markers
        console.log(
          '🌍 [REAL MODE] Fetching real markers from Google Places API',
        );
        console.log('🌍 [REAL MODE] API Key available:', !!THIS_IS_MAP_KEY);
        try {
          const data = MapService;
          const markersData = await data.getMapMarkerDetails({});
          console.log('🌍 [REAL MODE] Raw markers data:', markersData);
          setMarkers(markersData);
          setFilteredMarkers(markersData);
          setBaseFilteredMarkers(markersData);
          console.log('🌍 [REAL MODE] Real markers set:', markersData.length);
        } catch (error) {
          console.error('🌍 [REAL MODE] Error fetching markers:', error);
        }
      }
    })();
  }, []);

  // Hide suggestions when user interacts with map
  const handleMapPress = () => {
    setShowSuggestions(false);
  };

  // Early return for loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  // Component render
  return (
    <View style={{flex: 1}}>
      <LocationLayout>
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            gap: 10,
            paddingTop: 10,
          }}>
          {/* SEARCH INPUT */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search for places..."
                placeholderTextColor="#999"
                value={searchText}
                onChangeText={handleSearchTextChange}
                onSubmitEditing={handleSearchButtonPress}
                returnKeyType="search"
              />
              {searchText.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => {
                    setSearchText('');
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }}>
                  <FontAwesome name="times" size={16} color="#666" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.searchButton,
                  {
                    backgroundColor:
                      searchText.length >= 3 ? '#47BE7D' : '#ccc',
                  },
                ]}
                onPress={handleSearchButtonPress}
                disabled={searchText.length < 3 || searchLoading}>
                {searchLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <FontAwesome name="search" size={18} color="#fff" />
                )}
              </TouchableOpacity>
            </View>

            {/* SEARCH SUGGESTIONS */}
            {showSuggestions && suggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                <ScrollView style={styles.suggestionsList} nestedScrollEnabled>
                  {suggestions.map((suggestion: any, index: number) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionItem}
                      onPress={() =>
                        handleSelectSuggestion(
                          suggestion.place_id,
                          suggestion.description,
                        )
                      }>
                      <FontAwesome
                        name="map-marker"
                        size={16}
                        color="#666"
                        style={styles.suggestionIcon}
                      />
                      <Text style={styles.suggestionText}>
                        {suggestion.description}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* FACILITY TYPES  */}
          <ScrollView
            horizontal
            contentContainerStyle={{
              gap: 10,
              paddingHorizontal: 10,
            }}
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}>
            {facilityTypeButtons}
          </ScrollView>
          {/* ADDRESS, RANGE FILTER ROW */}
          <View
            style={[
              styles.addressFilterContainer,
              {gap: 10, alignItems: 'center'},
            ]}>
            {/* GHANA POST GPS ADDRESS */}
            <View
              style={[
                styles.addressInput,
                {flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5},
              ]}>
              <Entypo name="address" size={24} color="#666" />
              <Text style={{color: 'black'}}>
                {address || 'Getting location...'}
              </Text>
            </View>
            {/* RANGE FILTER */}
            <View style={{flex: 0.6, height: '100%'}}>
              <Dropdown
                renderLeftIcon={() => (
                  <Icon
                    style={{marginRight: 10}}
                    name="map-marker-distance"
                    size={20}
                    color="#666"
                  />
                )}
                itemTextStyle={{color: 'black'}}
                selectedTextStyle={{color: 'black'}}
                placeholderStyle={{color: 'black'}}
                style={styles.dropdown}
                data={radiusOptions}
                labelField="label"
                valueField="value"
                placeholder="Select radius"
                value={selectedRadius}
                onChange={item => {
                  console.log(
                    '📏 [RADIUS FILTER] Radius changed from:',
                    selectedRadius,
                    'to:',
                    item.value,
                  );
                  setSelectedRadius(item.value);
                }}
              />
            </View>
          </View>
          {/* TOP RATED FILTER */}
        </View>
        <View
          style={{
            position: 'absolute',
            bottom: 15,
            backgroundColor: 'white',
            flexDirection: 'row',
            alignItems: 'center',
            padding: 10,
            borderRadius: 8,
            marginHorizontal: 10,
            alignSelf: 'center',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            gap: 10,
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
            zIndex: 10,
          }}>
          <Text style={{color: 'black'}}>Top Rated</Text>
          <Switch
            trackColor={{false: '#767577', true: '#3d875f'}}
            thumbColor={topRated ? themeColors.primary : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => {
              const newValue = !topRated;
              console.log(
                '⭐ [TOP RATED FILTER] Top rated changed from:',
                topRated,
                'to:',
                newValue,
              );
              setTopRated(newValue);
            }}
            value={topRated}
          />
        </View>
        {(() => {
          console.log('🗺️ [MAP DEBUG] currentLocation:', currentLocation);
          console.log(
            '🗺️ [MAP DEBUG] latitude:',
            currentLocation.latitude,
            'longitude:',
            currentLocation.longitude,
          );
          const hasLocation = !!(
            currentLocation.latitude && currentLocation.longitude
          );
          console.log('🗺️ [MAP DEBUG] condition result:', hasLocation);
          return hasLocation;
        })() ? (
          THIS_IS_MAP_KEY === 'TEST_MODE' || !THIS_IS_MAP_KEY ? (
            // Test mode: Show a mock map with markers
            <View
              style={{
                width: '100%',
                height: '100%',
                zIndex: -1,
                backgroundColor: '#f0f0f0',
                position: 'relative',
              }}
              onLayout={async () => {
                // Check API guard for test mode map load
                try {
                  console.log(
                    '🔍 [TEST MAP] Calling checkApiAllowed for AndroidMapHit in test mode',
                  );
                  await checkApiAllowed('AndroidMapHit');
                  console.log(
                    '✅ [TEST MAP] checkApiAllowed passed - count should be incremented in Supabase',
                  );
                } catch (error) {
                  console.log(
                    '🚫 [TEST MAP] Map load blocked by Supabase guard:',
                    (error as Error).message,
                  );
                }
              }}>
              <View
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: [{translateX: -50}, {translateY: -50}],
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={{color: '#666', fontSize: 16, marginBottom: 10}}>
                  TEST MODE MAP
                </Text>
                <Text
                  style={{color: '#999', fontSize: 12, textAlign: 'center'}}>
                  Mock Map View{'\n'}
                  Location: {currentLocation.latitude?.toFixed(4)},{' '}
                  {currentLocation.longitude?.toFixed(4)}
                </Text>
              </View>
              {/* Mock markers */}
              {filteredMarkers.slice(0, 20).map((marker, index) => (
                <View
                  key={index}
                  style={{
                    position: 'absolute',
                    left: `${
                      50 +
                      (marker.latitude - (currentLocation.latitude || 0)) * 1000
                    }%`,
                    top: `${
                      50 +
                      (marker.longitude - (currentLocation.longitude || 0)) *
                        1000
                    }%`,
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: themeColors.primary,
                    borderWidth: 2,
                    borderColor: 'white',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onTouchEnd={async () => {
                    setSelectedMarker(marker);
                    showCard();
                    // In test mode, simulate the API guard hits that would occur
                    // when opening the modal: place details, image, and distance
                    try {
                      await checkApiAllowed('PlaceDetail');
                    } catch (e) {
                      console.log(
                        '🚫 [TEST MARKER] PlaceDetail blocked:',
                        (e as Error).message,
                      );
                    }
                    try {
                      await checkApiAllowed('PlaceImage');
                    } catch (e) {
                      console.log(
                        '🚫 [TEST MARKER] PlaceImage blocked:',
                        (e as Error).message,
                      );
                    }
                    try {
                      await checkApiAllowed('SinglePlaceDistance');
                    } catch (e) {
                      console.log(
                        '🚫 [TEST MARKER] SinglePlaceDistance blocked:',
                        (e as Error).message,
                      );
                    }
                  }}>
                  <Text
                    style={{color: 'white', fontSize: 10, fontWeight: 'bold'}}>
                    🏥
                  </Text>
                </View>
              ))}
              {/* Mock selected location marker */}
              {selectedLocation && (
                <View
                  style={{
                    position: 'absolute',
                    left: `${
                      50 +
                      (selectedLocation.latitude -
                        (currentLocation.latitude || 0)) *
                        1000
                    }%`,
                    top: `${
                      50 +
                      (selectedLocation.longitude -
                        (currentLocation.longitude || 0)) *
                        1000
                    }%`,
                    width: 25,
                    height: 25,
                    borderRadius: 12.5,
                    backgroundColor: '#FF6B6B',
                    borderWidth: 3,
                    borderColor: 'white',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text
                    style={{color: 'white', fontSize: 12, fontWeight: 'bold'}}>
                    📍
                  </Text>
                </View>
              )}
              {/* Mock zoom controls */}
              <View
                style={{
                  position: 'absolute',
                  bottom: 20,
                  right: 20,
                  flexDirection: 'column',
                }}>
                <TouchableOpacity
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: 'white',
                    borderRadius: 5,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 5,
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 2},
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                  }}>
                  <Text style={{fontSize: 18, color: '#333'}}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: 'white',
                    borderRadius: 5,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 2},
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                  }}>
                  <Text style={{fontSize: 18, color: '#333'}}>-</Text>
                </TouchableOpacity>
              </View>
              {/* Mock Google logo */}
              <View
                style={{
                  position: 'absolute',
                  bottom: 20,
                  left: 20,
                }}>
                <Text style={{color: '#666', fontSize: 10}}>Google</Text>
              </View>
            </View>
          ) : (
            // Real mode: Show actual MapView
            <MapView
              ref={mapRef}
              style={{
                width: '100%',
                height: '100%',
                zIndex: 1,
              }}
              initialRegion={initialRegion}
              provider={PROVIDER_GOOGLE}
              zoomEnabled
              scrollEnabled
              showsUserLocation={true}
              zoomControlEnabled
              showsMyLocationButton={true}
              showsCompass={false}
              maxZoomLevel={16}
              minZoomLevel={10}
              onPress={handleMapPress}
              onMapReady={async () => {
                console.log('🗺️ [MAP] MapView is ready');
                console.log('🗺️ [MAP] Initial region:', initialRegion);
                console.log('🗺️ [MAP] API Key available:', !!THIS_IS_MAP_KEY);
                console.log('🗺️ [MAP] Provider:', PROVIDER_GOOGLE);
                console.log('🗺️ [MAP] Current location:', currentLocation);
                console.log('🗺️ [MAP] showsUserLocation:', true);
                console.log('🗺️ [MAP] showsMyLocationButton:', true);

                // Check API guard for map load
                try {
                  console.log(
                    '🔍 [MAP LOAD] Calling checkApiAllowed for AndroidMapHit',
                  );
                  await checkApiAllowed('AndroidMapHit');
                  console.log(
                    '✅ [MAP LOAD] checkApiAllowed passed - count should be incremented in Supabase',
                  );
                } catch (error) {
                  console.log(
                    '🚫 [MAP LOAD] Map load blocked by Supabase guard:',
                    (error as Error).message,
                  );
                  return;
                }

                // Track Maps SDK for Android map load
                // API tracking removed - keeping Supabase API guard

                // If we have current location, animate to it
                if (currentLocation.latitude && currentLocation.longitude) {
                  console.log(
                    '📍 [MAP] Animating to user location:',
                    currentLocation,
                  );
                  mapRef.current?.animateToRegion(
                    {
                      latitude: currentLocation.latitude,
                      longitude: currentLocation.longitude,
                      latitudeDelta: 0.009,
                      longitudeDelta: 0.009,
                    },
                    1000,
                  );
                }
              }}
              onRegionChangeComplete={region => {
                console.log('🗺️ [MAP] Region changed to:', region);
              }}
              onLayout={() => {
                console.log('🗺️ [MAP] Map layout completed');
              }}>
              {renderMarkers}
              {selectedLocation && (
                <Marker
                  coordinate={selectedLocation}
                  title="Searched Location"
                  pinColor={themeColors.primary}
                  onPress={() => {
                    console.log(
                      '🔍 [SEARCHED MARKER] Clicked on searched location marker',
                    );
                    console.log(
                      '🔍 [SEARCHED MARKER] Selected location data:',
                      selectedLocation,
                    );

                    // Clear previous marker info before setting new marker
                    setMarkerInfo(null);
                    setImage(null);
                    setMarkModal(false);
                    // Clear local facility modal data when switching to searched place
                    setLocalFacilityModalData({});

                    // Create a complete marker object using the stored place details
                    const searchedMarker = {
                      place_id:
                        selectedLocation.placeDetails?.place_id ||
                        'searched_location',
                      id:
                        selectedLocation.placeDetails?.place_id ||
                        'searched_location',
                      facility_name:
                        selectedLocation.placeDetails?.name ||
                        'Searched Location',
                      name:
                        selectedLocation.placeDetails?.name ||
                        'Searched Location',
                      vicinity:
                        selectedLocation.placeDetails?.formatted_address ||
                        'Unknown Address',
                      address:
                        selectedLocation.placeDetails?.formatted_address ||
                        'Unknown Address',
                      latitude: selectedLocation.latitude,
                      longitude: selectedLocation.longitude,
                      geometry: {
                        location: {
                          lat: selectedLocation.latitude,
                          lng: selectedLocation.longitude,
                        },
                      },
                      // Add all the additional details from place details
                      phone:
                        selectedLocation.placeDetails?.formatted_phone_number,
                      website: selectedLocation.placeDetails?.website,
                      rating: selectedLocation.placeDetails?.rating,
                      user_ratings_total:
                        selectedLocation.placeDetails?.user_ratings_total,
                      opening_hours:
                        selectedLocation.placeDetails?.opening_hours,
                      photos: selectedLocation.placeDetails?.photos,
                      types: selectedLocation.placeDetails?.types,
                      business_status:
                        selectedLocation.placeDetails?.business_status,
                    };

                    console.log(
                      '🔍 [SEARCHED MARKER] Created searched marker object:',
                      searchedMarker,
                    );
                    console.log(
                      '🔍 [SEARCHED MARKER] Calling openMarkModal for enhanced data fetching',
                    );

                    setSelectedMarker(searchedMarker);
                    openMarkModal(searchedMarker); // Call openMarkModal for searched places
                  }}
                />
              )}
              {/* Manual user location marker as fallback */}
              {currentLocation.latitude && currentLocation.longitude && (
                <Marker
                  coordinate={{
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                  }}
                  title="Your Location"
                  description="Current location">
                  <View style={styles.userLocationMarker}>
                    <MaterialCommunityIcons
                      name="crosshairs-gps"
                      size={22}
                      color="#007AFF"
                    />
                  </View>
                </Marker>
              )}
            </MapView>
          )
        ) : (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size="large" color={themeColors.primary} />
            <Text style={{marginTop: 10, color: themeColors.black}}>
              {loading
                ? 'Getting your location...'
                : 'Waiting for location access'}
            </Text>
            <Text
              style={{marginTop: 5, color: themeColors.black, fontSize: 12}}>
              Debug: lat={String(currentLocation.latitude)}, lng=
              {String(currentLocation.longitude)}
            </Text>
          </View>
        )}

        {/* Custom My Location Button - Only show when map is loaded */}
        {(() => {
          const hasLocation = !!(
            currentLocation.latitude && currentLocation.longitude
          );
          return (
            hasLocation &&
            !(THIS_IS_MAP_KEY === 'TEST_MODE' || !THIS_IS_MAP_KEY)
          );
        })() && (
          <TouchableOpacity
            style={styles.myLocationButton}
            onPress={animateToMyLocation}
            disabled={!currentLocation.latitude || !currentLocation.longitude}>
            <MaterialCommunityIcons
              name="crosshairs-gps"
              size={24}
              color={
                currentLocation.latitude && currentLocation.longitude
                  ? themeColors.primary
                  : '#ccc'
              }
            />
          </TouchableOpacity>
        )}

        <Animated.View
          style={[
            styles.cardContainer,
            {
              transform: [{translateY: slideAnim}],
            },
          ]}>
          {markModal && selectedMarker && (
            <View style={styles.card}>
              <View style={styles.cardContent}>
                <Image
                  source={
                    image
                      ? {uri: image}
                      : selectedMarker.mediaUrls?.[0]
                      ? {uri: selectedMarker.mediaUrls?.[0]}
                      : require('../../../assets/hospital1.jpeg')
                  }
                  style={styles.facilityImage}
                />
                <View style={styles.detailsContainer}>
                  {/* NAME & CLOSE ICON */}
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                    }}>
                    <Text
                      style={[styles.facilityName, {flex: 1, color: 'black'}]}>
                      {markerInfo?.name || selectedMarker.facility_name}
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 5,
                      }}>
                      <TouchableOpacity
                        onPress={() => {
                          hideCard();
                          setSelectedMarker(null);
                          setMarkModal(false);
                          // Only clear markerInfo and image, keep localFacilityModalData
                          setMarkerInfo(null);
                          setImage(null);
                        }}>
                        <Icon name="close" size={24} color="#666" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text
                    onLayout={onTabBarLayout}
                    style={[
                      styles.address,
                      {
                        textAlign: 'auto',
                        alignSelf: 'flex-start',
                      },
                    ]}>
                    {markerInfo?.vicinity || selectedMarker.gps_address
                      ? markerInfo?.vicinity || selectedMarker.gps_address
                      : 'Street no 13 Heaven town'}
                    {!markerInfo?.vicinity && !selectedMarker.gps_address && (
                      <>
                        , {selectedMarker.district}, {selectedMarker.area}
                      </>
                    )}
                  </Text>
                  {/* DISTANCE DURAITON ROW */}
                  {isReady && (
                    <View
                      style={{
                        width: rowWidth,
                        flexDirection: 'row',
                        gap: 5,
                        justifyContent: 'space-between',
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          gap: 5,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <MaterialCommunityIcons
                          name="map-marker-distance"
                          size={16}
                          color={themeColors.primary}
                        />
                        <Text style={{color: 'gray', fontSize: 12}}>
                          {(() => {
                            const distance =
                              markerInfo?.distance || selectedMarker.distance;
                            if (distance && typeof distance === 'number') {
                              return `${distance.toFixed(1)} km`;
                            } else if (
                              distance &&
                              typeof distance === 'string'
                            ) {
                              return `${distance} km`;
                            } else {
                              return '1 km';
                            }
                          })()}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          gap: 5,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <MaterialCommunityIcons
                          name="clock"
                          size={16}
                          color={themeColors.primary}
                        />
                        <Text style={{color: 'gray', fontSize: 12}}>
                          {markerInfo?.travelTime ||
                            selectedMarker.duration ||
                            '1'}
                        </Text>
                      </View>
                    </View>
                  )}
                  {/* RATING */}
                  {selectedMarker.avg_rating ? (
                    <View
                      style={{
                        alignItems: 'center',
                        flexDirection: 'row',
                        gap: 5,
                      }}>
                      <View
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                          borderRadius: 16,
                          gap: 2,
                          paddingVertical: 5,
                          alignItems: 'center',
                        }}>
                        {[1, 2, 3, 4, 5].map(starIndex => {
                          const rating =
                            parseFloat(selectedMarker.avg_rating) || 0;
                          const filled = rating >= starIndex;
                          const half = !filled && rating > starIndex - 0.5;
                          return (
                            <FontAwesome
                              key={starIndex}
                              name={
                                filled
                                  ? 'star'
                                  : half
                                  ? 'star-half-full'
                                  : 'star-o'
                              }
                              size={16}
                              color="#FFD700"
                            />
                          );
                        })}
                      </View>
                    </View>
                  ) : null}

                  {/* Google Maps and View Details Buttons - Conditional based on marker type */}
                  <View
                    style={{
                      marginTop: 8,
                      flexDirection: 'row',
                      gap: 5,
                      justifyContent: 'space-between',
                    }}>
                    {/* GOOGLE MAPS BTN - Always show */}
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#4285F4',
                        padding: 8,
                        borderRadius: 5,
                        marginRight:
                          selectedMarker?.facility_type &&
                          selectedMarker?.gps_address
                            ? 5
                            : 0,
                      }}
                      onPress={openInMaps}>
                      <FontAwesome5
                        name="map-marked-alt"
                        size={16}
                        color="white"
                      />
                    </TouchableOpacity>

                    {/* VIEW DETAILS BTN - Only show for local facilities */}
                    {selectedMarker?.facility_type &&
                      selectedMarker?.gps_address && (
                        <TouchableOpacity
                          style={{
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: themeColors.primary,
                            padding: 8,
                            borderRadius: 5,
                          }}
                          onPress={() => {
                            console.log('Selected Marker:', selectedMarker);
                            console.log(
                              '📍 [NAVIGATION] Passing location data:',
                              currentLocation,
                            );

                            navigation?.navigate(SCREENS.FACILITYDETAILS, {
                              id: selectedMarker?.id,
                              currentLocation: currentLocation, // Pass current location
                            });
                          }}>
                          <Feather name="arrow-right" size={16} color="white" />
                        </TouchableOpacity>
                      )}
                  </View>

                  {/* Open/Closed Status Badge */}
                  {selectedMarker.business_hours && (
                    <View
                      style={{
                        marginBottom: 8,
                        flexDirection: 'row',
                        gap: 5,
                        justifyContent: 'space-between',
                      }}>
                      {(() => {
                        const currentDay = new Date()
                          .toLocaleString('en-us', {weekday: 'long'})
                          .toLowerCase();
                        const currentTime = new Date()
                          .toTimeString()
                          .slice(0, 5);

                        // Check if facility is open now
                        const isOpen =
                          selectedMarker.business_hours[currentDay] &&
                          currentTime >=
                            selectedMarker.business_hours[currentDay].opening &&
                          currentTime <=
                            selectedMarker.business_hours[currentDay].closing;

                        // Find next opening day if not open today
                        const findNextOpeningDay = () => {
                          const daysOfWeek = [
                            'sunday',
                            'monday',
                            'tuesday',
                            'wednesday',
                            'thursday',
                            'friday',
                            'saturday',
                          ];
                          const currentDayIndex =
                            daysOfWeek.indexOf(currentDay);

                          // Check each day starting from tomorrow
                          for (let i = 1; i <= 7; i++) {
                            const nextDayIndex = (currentDayIndex + i) % 7;
                            const nextDay = daysOfWeek[nextDayIndex];

                            if (selectedMarker.business_hours[nextDay]) {
                              return {
                                day:
                                  nextDay.charAt(0).toUpperCase() +
                                  nextDay.slice(1), // Capitalize first letter
                                time: selectedMarker.business_hours[nextDay]
                                  .opening,
                              };
                            }
                          }
                          return null; // No open days found
                        };

                        // Get message text
                        let statusText;
                        if (isOpen) {
                          statusText = `Open • Closes at ${selectedMarker.business_hours[currentDay].closing}`;
                        } else if (selectedMarker.business_hours[currentDay]) {
                          statusText = `Closed • Opens at ${selectedMarker.business_hours[currentDay].opening}`;
                        } else {
                          const nextOpenTime = findNextOpeningDay();
                          statusText = nextOpenTime
                            ? `Closed • Opens ${nextOpenTime.day} at ${nextOpenTime.time}`
                            : 'No business hours available';
                        }

                        return (
                          <View
                            style={{
                              maxWidth: '100%',
                              backgroundColor: isOpen ? '#e6f7ed' : '#fff8e6', // Light shade of green or yellow
                              paddingVertical: 4,
                              paddingHorizontal: 8,
                              borderRadius: 4,
                              alignSelf: 'flex-start',
                            }}>
                            <Text
                              style={{
                                color: isOpen ? '#1e8449' : '#daa520', // Darker shade of green or yellow
                                fontSize: 12,
                                fontWeight: '600',
                              }}>
                              {statusText}
                            </Text>
                          </View>
                        );
                      })()}
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}
        </Animated.View>
      </LocationLayout>
    </View>
  );
};

// Add styles
const styles = StyleSheet.create({
  // =========== SEARCH STYLES ============
  searchContainer: {
    paddingHorizontal: 10,
    zIndex: 1000,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 10,
    paddingLeft: 5,
  },
  clearButton: {
    padding: 8,
    marginRight: 5,
  },
  searchButton: {
    backgroundColor: '#47BE7D',
    borderRadius: 20,
    padding: 10,
    marginLeft: 5,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
    height: 40,
  },
  suggestionsContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginTop: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    maxHeight: 200,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionIcon: {
    marginRight: 10,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },

  // =========== EXISTING STYLES ============
  filterContainer: {
    //backgroundColor: '#fff',
    //paddingVertical: 10,
  },
  filterButton: {
    alignItems: 'center',
    gap: 10,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonSelected: {
    backgroundColor: '#47BE7D',
    borderColor: '#47BE7D',
  },
  filterText: {
    fontSize: 14,
    color: '#333',
  },
  filterTextSelected: {
    color: '#fff',
  },
  cardContainer: {
    backgroundColor: 'white',
    position: 'absolute',
    bottom: 20,
    borderRadius: 12,
    left: 10,
    right: 10,
    zIndex: 10,
  },
  card: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 4,
  },
  cardContent: {
    flexDirection: 'row',
  },
  facilityImage: {
    width: 120,
    height: '100%',
    borderRadius: 8,
    marginRight: 12,
  },
  detailsContainer: {
    gap: 5,
    flex: 1,
    justifyContent: 'space-between',
  },
  facilityName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  facilityType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  address: {
    fontSize: 12,
    color: '#888',
  },
  distance: {
    fontSize: 12,
    color: '#007AFF',
  },
  addressFilterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  addressInput: {
    flex: 1,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownContainer: {
    flex: 1,
    //height:"100%",
    //width: '30%',
    zIndex: 1000,
  },
  dropdown: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    height: '100%',
    width: '100%',
  },
  customMarker: {
    overflow: 'visible',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: themeColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  myLocationButton: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  userLocationMarker: {
    // width: 24,
    // height: 24,
    // borderRadius: 12,
    // backgroundColor: 'rgba(255, 255, 255, 0.9)',
    // justifyContent: 'center',
    // alignItems: 'center',
    // borderWidth: 2,
    // borderColor: '#007AFF',
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 1,
    // },
    // shadowOpacity: 0.2,
    // shadowRadius: 2,
    // elevation: 3,
  },
});

export default RegisteredFacilites;
