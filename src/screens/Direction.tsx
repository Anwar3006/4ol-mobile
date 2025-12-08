import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Dimensions,
  Linking,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {THIS_IS_MAP_KEY} from '../../config/variables';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Geolocation from '@react-native-community/geolocation';
import {Platform, PermissionsAndroid} from 'react-native';
import {size} from '../theme/fontStyle';
import {themeColors} from '../theme/colors';
import {fonts} from '../theme/fonts';
import LocationLayout from '../components/common/LocationLayout';

const {width, height} = Dimensions.get('window');

type DirectionScreenProps = {
  navigation?: NativeStackNavigationProp<any>;
  route?: {
    params: {
      destination?: {
        latitude: number;
        longitude: number;
      };
    };
  };
};

const DirectionScreen: React.FC<DirectionScreenProps> = ({
  navigation,
  route,
}) => {
  const {destination} = route?.params || {};
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number | null;
    longitude: number | null;
  }>({
    latitude: null,
    longitude: null,
  });
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [mode, setMode] = useState<'DRIVING' | 'WALKING'>('DRIVING');
  const [refreshing, setRefreshing] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [region, setRegion] = useState({
    latitude: 6.75756303403614, // Default to Ghana coordinates
    longitude: -1.5849064104259014,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Smart location tracking states
  const [lastApiCallPosition, setLastApiCallPosition] = useState<{
    latitude: number | null;
    longitude: number | null;
  }>({latitude: null, longitude: null});
  const [userHasMovedMap, setUserHasMovedMap] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [routeKey, setRouteKey] = useState(0); // Key to force route recalculation
  const [isRecalculating, setIsRecalculating] = useState(false); // Prevent multiple recalculations

  // Map reference for zoom controls
  const mapRef = useRef<MapView>(null);

  // Calculate distance between two coordinates in meters
  const calculateDistance = (
    pos1: {latitude: number; longitude: number},
    pos2: {latitude: number; longitude: number},
  ): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (pos1.latitude * Math.PI) / 180;
    const φ2 = (pos2.latitude * Math.PI) / 180;
    const Δφ = ((pos2.latitude - pos1.latitude) * Math.PI) / 180;
    const Δλ = ((pos2.longitude - pos1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Debug logging
  useEffect(() => {
    console.log('📍 [DIRECTION] Route params:', route?.params);
    console.log('📍 [DIRECTION] Destination:', destination);
    console.log('📍 [DIRECTION] User location:', currentLocation);
    console.log('📍 [DIRECTION] API Key available:', !!THIS_IS_MAP_KEY);
    console.log('📍 [DIRECTION] API Key length:', THIS_IS_MAP_KEY?.length);
  }, [route?.params, destination, currentLocation]);

  // Validate API key and configuration
  const validateApiConfiguration = async () => {
    if (!THIS_IS_MAP_KEY || THIS_IS_MAP_KEY.trim() === '') {
      return {
        isValid: false,
        error: 'Google Maps API key is not configured',
      };
    }

    if (THIS_IS_MAP_KEY.length < 30) {
      return {
        isValid: false,
        error: 'Google Maps API key appears to be invalid (too short)',
      };
    }

    if (!destination?.latitude || !destination?.longitude) {
      return {
        isValid: false,
        error: 'Destination coordinates are missing',
      };
    }

    if (!currentLocation?.latitude || !currentLocation?.longitude) {
      return {
        isValid: false,
        error: 'User location is not available',
      };
    }

    // Check if Directions API is enabled via API guard
    try {
      const isAllowed = await checkApiAllowed('Direction');
      console.log('🔍 [DIRECTION] API Guard validation result:', isAllowed);

      if (!isAllowed) {
        console.log('❌ [DIRECTION] API Guard says Directions API not allowed');
        return {
          isValid: false,
          error:
            'Directions API is not enabled in your Google API key. Please enable it in Google Cloud Console.',
        };
      }

      console.log('✅ [DIRECTION] API Guard validation passed');
    } catch (error) {
      console.error('❌ [DIRECTION] API Guard validation failed:', error);
      return {
        isValid: false,
        error:
          'Unable to verify API permissions. Please check your internet connection.',
      };
    }

    return {isValid: true, error: null};
  };

  // Check if Directions API is allowed via Supabase function
  const checkApiAllowed = async (action: string) => {
    try {
      console.log('🔍 [DIRECTION] Checking API guard for action:', action);
      console.log(
        '🔍 [DIRECTION] API Guard URL: https://bqdohqgwdqrpmzffmsva.supabase.co/functions/v1/api-guard',
      );

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

      console.log('🔍 [DIRECTION] API Guard HTTP status:', res.status);
      console.log('🔍 [DIRECTION] API Guard headers:', res.headers);

      const data = await res.json();
      console.log(
        '🔍 [DIRECTION] API Guard response data:',
        JSON.stringify(data, null, 2),
      );

      if (!data.ok) {
        console.error(
          '❌ [DIRECTION] API Guard returned not ok:',
          data.message,
        );
        throw new Error(data.message);
      }

      console.log('✅ [DIRECTION] API Guard check successful');
      return true;
    } catch (error) {
      console.error('❌ [DIRECTION] API Guard check failed:', error);
      console.error('❌ [DIRECTION] Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace',
        name: error instanceof Error ? error.name : 'Unknown error',
      });
      return false;
    }
  };

  // Get facility icon based on type
  const getFacilityIcon = (facilityType: string) => {
    switch (facilityType?.toLowerCase()) {
      case 'pharmacy':
        return 'pills';
      case 'hospital':
      case 'clinic':
        return 'hospital';
      case 'laboratory':
      case 'diagnostic':
        return 'flask';
      case 'dental':
        return 'tooth';
      case 'ambulance':
        return 'ambulance';
      case 'herbal':
        return 'leaf';
      case 'eye care':
        return 'eye';
      case 'physiotherapy':
        return 'user-md';
      default:
        return 'hospital';
    }
  };

  // Test Google Maps API connectivity
  const testGoogleMapsAPI = async () => {
    try {
      console.log('🔍 [DIRECTION] Testing Google Maps API directly...');

      // First check if Directions API is allowed via API guard
      const isAllowed = await checkApiAllowed('Direction');
      console.log('🔍 [DIRECTION] API Guard result:', isAllowed);

      if (!isAllowed) {
        console.log('⚠️ [DIRECTION] API Guard says Directions API not allowed');
        // Let's test the API directly anyway to see if it's actually working
      }

      // Test with a simple Geocoding API call first
      const testUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=test&key=${THIS_IS_MAP_KEY}`;
      console.log('🔍 [DIRECTION] Testing URL:', testUrl);

      const response = await fetch(testUrl);
      const data = await response.json();
      console.log('🔍 [DIRECTION] Google Maps API response:', data);

      if (data.status === 'REQUEST_DENIED') {
        console.error('❌ [DIRECTION] API Key rejected:', data.error_message);
        return {
          isValid: false,
          error: `API Key rejected: ${data.error_message}`,
        };
      } else if (data.status === 'OK') {
        console.log('✅ [DIRECTION] API Key working');
        return {isValid: true, error: null};
      } else {
        console.warn('⚠️ [DIRECTION] API response:', data.status);
        return {isValid: true, error: null}; // Still allow to proceed
      }
    } catch (error) {
      console.error('❌ [DIRECTION] API test failed:', error);
      return {isValid: true, error: null}; // Allow to proceed on network errors
    }
  };

  // Update region when location or destination changes
  useEffect(() => {
    if (currentLocation?.latitude && destination?.latitude) {
      const newRegion = {
        latitude: (currentLocation.latitude + destination.latitude) / 2,
        longitude: (currentLocation.longitude + destination.longitude) / 2,
        latitudeDelta:
          Math.abs(currentLocation.latitude - destination.latitude) * 1.5,
        longitudeDelta:
          Math.abs(currentLocation.longitude - destination.longitude) * 1.5,
      };

      // Ensure minimum zoom level
      newRegion.latitudeDelta = Math.max(newRegion.latitudeDelta, 0.01);
      newRegion.longitudeDelta = Math.max(newRegion.longitudeDelta, 0.01);

      setRegion(newRegion);
    }
  }, [currentLocation, destination]);

  // Location handling functions (like in RegisteredFacilities)
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
    console.log('📍 [DIRECTION] Starting location request...');
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      console.log('🚫 [DIRECTION] Permission denied');
      return;
    }
    console.log(
      '✅ [DIRECTION] Permission granted, getting current position...',
    );

    Geolocation.getCurrentPosition(
      position => {
        console.log('✅ [DIRECTION] Initial location obtained:', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCurrentLocation(newLocation);
        setLastApiCallPosition(newLocation);

        // Start continuous location tracking
        startLocationTracking();
      },
      error => {
        console.log(
          '❌ [DIRECTION] Error getting location:',
          error.message,
          error.code,
        );
      },
      {enableHighAccuracy: true, timeout: 30000, maximumAge: 10000},
    );
  };

  const startLocationTracking = () => {
    // Prevent multiple tracking instances
    if (watchId !== null) {
      console.log(
        '📍 [DIRECTION] Location tracking already active, skipping...',
      );
      return;
    }

    console.log('📍 [DIRECTION] Starting continuous location tracking...');

    const id = Geolocation.watchPosition(
      position => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        console.log('📍 [DIRECTION] Location update:', {
          latitude: newLocation.latitude,
          longitude: newLocation.longitude,
          accuracy: position.coords.accuracy,
        });

        // Check if we need to recalculate route
        if (
          lastApiCallPosition?.latitude &&
          lastApiCallPosition?.longitude &&
          !isRecalculating
        ) {
          const distance = calculateDistance(newLocation, lastApiCallPosition);
          console.log(
            `📍 [DIRECTION] Distance from last API call: ${distance.toFixed(
              2,
            )}m`,
          );

          if (distance > 100) {
            console.log(
              '🔄 [DIRECTION] Distance > 100m, recalculating route...',
            );
            setIsRecalculating(true);
            setCurrentLocation(newLocation);
            setLastApiCallPosition(newLocation);
            // Trigger route recalculation by updating route key
            setRouteKey(prev => prev + 1);

            // Safety timeout to reset recalculating flag if API doesn't respond
            setTimeout(() => {
              setIsRecalculating(false);
            }, 10000); // 10 seconds timeout
          } else {
            console.log(
              '📍 [DIRECTION] Distance < 100m, just updating location...',
            );
            setCurrentLocation(newLocation);
          }
        } else {
          // First location update or already recalculating
          setCurrentLocation(newLocation);
        }
      },
      error => {
        console.log('❌ [DIRECTION] Location tracking error:', error.message);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Update every 10 meters
        interval: 5000, // Update every 5 seconds
      },
    );

    setWatchId(id);
  };

  const stopLocationTracking = () => {
    if (watchId !== null) {
      console.log('📍 [DIRECTION] Stopping location tracking...');
      Geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };

  const fitToRoute = () => {
    if (mapRef.current && currentLocation?.latitude && destination?.latitude) {
      console.log('📍 [DIRECTION] Fitting map to show route...');

      // Calculate bounds to fit both user location and destination
      const coordinates = [
        {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        },
        {
          latitude: destination.latitude,
          longitude: destination.longitude,
        },
      ];

      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: {top: 100, right: 50, bottom: 200, left: 50},
        animated: true,
      });

      // Reset the user has moved map flag
      setUserHasMovedMap(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setApiError(null);
    try {
      await getLocation();
    } catch (error) {
      console.error('Error refreshing location:', error);
      Alert.alert('Error', 'Failed to refresh location. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleModeChange = (newMode: 'DRIVING' | 'WALKING') => {
    if (mode === newMode) return;

    setMode(newMode);
    setDistance(null);
    setDuration(null);
    setApiError(null);
    setIsCalculating(true);
    // Trigger route recalculation
    setRouteKey(prev => prev + 1);
  };

  const handleDirectionsReady = (result: any) => {
    setIsCalculating(false);
    setIsRecalculating(false); // Reset recalculating flag
    setApiError(null);
    if (result && result.distance && result.duration) {
      setDistance(result.distance);
      setDuration(result.duration);
      console.log('✅ [DIRECTION] Route calculated successfully:', {
        distance: result.distance,
        duration: result.duration,
        mode,
      });
    }
  };

  const handleDirectionsError = (errorMessage: string) => {
    setIsCalculating(false);
    setIsRecalculating(false); // Reset recalculating flag
    console.error('❌ [DIRECTION] Directions error:', errorMessage);
    setApiError(errorMessage);

    // Provide specific error messages based on error type
    let userMessage =
      'Unable to calculate route. Please check your location and try again.';

    if (errorMessage.includes('REQUEST_DENIED')) {
      userMessage =
        'Google Maps API access denied. Please check API key configuration.';
    } else if (errorMessage.includes('OVER_QUERY_LIMIT')) {
      userMessage = 'Google Maps API quota exceeded. Please try again later.';
    } else if (errorMessage.includes('ZERO_RESULTS')) {
      userMessage = 'No route found between these locations.';
    } else if (errorMessage.includes('NOT_FOUND')) {
      userMessage = 'One or both locations could not be found.';
    }

    Alert.alert('Navigation Error', userMessage, [
      {text: 'OK'},
      {
        text: 'Check API Config',
        onPress: () => {
          console.log('🔧 [DIRECTION] API Key:', THIS_IS_MAP_KEY);
          console.log(
            '🔧 [DIRECTION] API Key length:',
            THIS_IS_MAP_KEY?.length,
          );
          Alert.alert(
            'API Configuration',
            `API Key: ${THIS_IS_MAP_KEY ? 'Configured' : 'Missing'}\nLength: ${
              THIS_IS_MAP_KEY?.length || 0
            }`,
          );
        },
      },
    ]);
  };

  const openInMaps = () => {
    if (!destination?.latitude || !destination?.longitude) {
      Alert.alert('Error', 'Destination coordinates not available');
      return;
    }

    const destinationStr = `${destination.latitude},${destination.longitude}`;
    const travelMode = mode.toLowerCase();
    const googleMapsWebUrl = `https://www.google.com/maps/dir/?api=1&destination=${destinationStr}&travelmode=${travelMode}`;
    const googleMapsAppUrl = `comgooglemaps://?daddr=${destinationStr}&directionsmode=${travelMode}`;

    const handleOpen = async () => {
      try {
        if (Platform.OS === 'ios') {
          const canOpenGoogleMaps = await Linking.canOpenURL(
            'comgooglemaps://',
          );
          if (canOpenGoogleMaps) {
            await Linking.openURL(googleMapsAppUrl);
          } else {
            await Linking.openURL(googleMapsWebUrl);
          }
        } else {
          await Linking.openURL(googleMapsWebUrl);
        }
      } catch (err) {
        console.error('Error opening Google Maps:', err);
        Alert.alert('Error', 'Failed to open Google Maps');
      }
    };

    Alert.alert('Open in Maps', 'Would you like to open this route in Maps?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Open',
        onPress: () => {
          handleOpen();
        },
      },
    ]);
  };

  // State for API validation
  const [apiValidation, setApiValidation] = useState<{
    isValid: boolean;
    error: string | null;
  }>({isValid: true, error: null});

  // Get location when component mounts
  useEffect(() => {
    getLocation();

    // Cleanup location tracking when component unmounts
    return () => {
      stopLocationTracking();
    };
  }, []);

  // Run API validation when component mounts
  useEffect(() => {
    const runValidation = async () => {
      const validation = await validateApiConfiguration();
      setApiValidation(validation);
    };
    runValidation();
  }, [currentLocation, destination]);

  // Show loading state if location or destination is not available
  if (!currentLocation?.latitude || !destination?.latitude) {
    return (
      <LocationLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={styles.loadingText}>
            {!currentLocation?.latitude
              ? 'Getting your location...'
              : !destination?.latitude
              ? 'Destination coordinates not available'
              : 'Loading map...'}
          </Text>
          {!destination?.latitude && (
            <Text style={styles.errorText}>Please go back and try again</Text>
          )}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
              <Icon name="refresh" size={16} color={themeColors.white} />
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.retryButton, styles.backButton]}
              onPress={() => navigation?.goBack()}>
              <Icon name="arrow-left" size={16} color={themeColors.white} />
              <Text style={styles.retryButtonText}>Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LocationLayout>
    );
  }

  // Show loading state while validating API
  if (
    apiValidation.isValid === true &&
    apiValidation.error === null &&
    (!currentLocation?.latitude || !destination?.latitude)
  ) {
    return (
      <LocationLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={styles.loadingText}>
            Validating API configuration...
          </Text>
        </View>
      </LocationLayout>
    );
  }

  // Show loading state while validating API
  if (!apiValidation.isValid) {
    return (
      <LocationLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={styles.loadingText}>Loading directions...</Text>
        </View>
      </LocationLayout>
    );
  }

  return (
    <LocationLayout>
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={region}
          region={region}
          onRegionChangeComplete={newRegion => {
            // Only update region if user manually moved the map
            if (userHasMovedMap || !currentLocation?.latitude) {
              setRegion(newRegion);
            }
          }}
          onPanDrag={() => {
            // Mark that user has manually moved the map
            setUserHasMovedMap(true);
          }}
          zoomEnabled={true}
          scrollEnabled={true}
          showsUserLocation={true}
          zoomControlEnabled={true}
          showsCompass={true}
          // Hide the blue target "my location" button
          showsMyLocationButton={false}
          showsScale={true}
          onUserLocationChange={event => {
            const {latitude, longitude}: any = event.nativeEvent.coordinate;
            setCurrentLocation({latitude, longitude});
          }}>
          {/* User location marker */}
          <Marker
            coordinate={currentLocation}
            title="Your Location"
            description="You are here"
            pinColor="blue"
          />

          {/* Destination marker */}
          <Marker
            coordinate={destination}
            title="Destination"
            description="Healthcare Facility"
            pinColor="red"
          />

          {/* Directions route */}
          <MapViewDirections
            key={routeKey}
            origin={currentLocation}
            destination={destination}
            apikey={THIS_IS_MAP_KEY}
            strokeWidth={4}
            strokeColor={themeColors.primary}
            mode={mode}
            resetOnChange={false}
            onReady={handleDirectionsReady}
            onError={handleDirectionsError}
            optimizeWaypoints={true}
            precision="high"
          />
        </MapView>

        {/* Enhanced Distance and Duration Info */}
        <View style={styles.infoContainer}>
          {isCalculating ? (
            <View style={styles.calculatingContainer}>
              <ActivityIndicator size="small" color={themeColors.primary} />
              <Text style={styles.calculatingText}>Calculating route...</Text>
            </View>
          ) : distance && duration ? (
            <View style={styles.routeInfo}>
              <View style={styles.infoHeader}>
                <Icon
                  name={getFacilityIcon(
                    destination?.facilityType || 'hospital',
                  )}
                  size={24}
                  color={themeColors.primary}
                />
                <Text style={styles.facilityTypeText}>
                  {destination?.facilityType || 'Healthcare Facility'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="road" size={18} color={themeColors.primary} />
                <Text style={styles.infoText}>{distance.toFixed(2)} km</Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="clock" size={18} color={themeColors.primary} />
                <Text style={styles.infoText}>{formatDuration(duration)}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.infoText}>Tap mode to calculate route</Text>
          )}
        </View>

        {/* Transportation Mode Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, mode === 'DRIVING' && styles.activeButton]}
            onPress={() => handleModeChange('DRIVING')}>
            <Icon name="car" size={20} color="#fff" />
            <Text style={styles.buttonText}>Driving</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, mode === 'WALKING' && styles.activeButton]}
            onPress={() => handleModeChange('WALKING')}>
            <Icon name="walking" size={20} color="#fff" />
            <Text style={styles.buttonText}>Walking</Text>
          </TouchableOpacity>
        </View>

        {/* Zoom Controls - Top Right */}
        {/* Re-center Button */}
        <View style={styles.recenterControls}>
          <TouchableOpacity style={styles.recenterButton} onPress={fitToRoute}>
            <Icon name="crosshairs" size={20} color={themeColors.primary} />
          </TouchableOpacity>
        </View>

        {/* API Error Display */}
        {apiError && (
          <View style={styles.errorSnackbar}>
            <Icon
              name="exclamation-circle"
              size={16}
              color={themeColors.white}
            />
            <Text style={styles.errorSnackbarText}>
              Directions error: {apiError}
            </Text>
            <TouchableOpacity onPress={() => setApiError(null)}>
              <Icon name="times" size={16} color={themeColors.white} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </LocationLayout>
  );
};

const formatDuration = (duration: number) => {
  const days = Math.floor(duration / (60 * 24));
  const hours = Math.floor((duration % (60 * 24)) / 60);
  const minutes = Math.round(duration % 60);

  return days > 0
    ? `${days} day${days > 1 ? 's' : ''} ${hours} hr${
        hours > 1 ? 's' : ''
      } ${minutes} min`
    : hours > 0
    ? `${hours} hr${hours > 1 ? 's' : ''} ${minutes} min`
    : `${minutes} min`;
};

export default DirectionScreen;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 15,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 60,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  infoText: {
    fontSize: size.md,
    color: themeColors.black,
    fontFamily: fonts.OpenSansRegular,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeButton: {
    backgroundColor: '#0056b3',
  },
  buttonText: {
    fontSize: size.md,
    color: themeColors.white,
    fontFamily: fonts.OpenSansBold,
    marginLeft: 10,
  },
  errorText: {
    color: 'red',
    fontSize: size.md,
    textAlign: 'center',
  },
  helpText: {
    color: themeColors.darkGray,
    fontSize: size.s,
    textAlign: 'center',
    fontFamily: fonts.OpenSansRegular,
    marginTop: 10,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: size.lg,
    color: themeColors.black,
    fontFamily: fonts.OpenSansRegular,
    marginTop: 10,
  },
  errorTitle: {
    fontSize: size.xlg,
    color: themeColors.primary,
    fontFamily: fonts.OpenSansBold,
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 20,
    width: '100%',
    justifyContent: 'space-around',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: themeColors.white,
    fontSize: size.md,
    fontFamily: fonts.OpenSansBold,
    marginLeft: 5,
  },
  backButton: {
    backgroundColor: themeColors.darkGray,
  },
  testApiButton: {
    backgroundColor: themeColors.primary,
  },
  bypassButton: {
    backgroundColor: themeColors.gray,
  },
  calculatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  calculatingText: {
    fontSize: size.md,
    color: themeColors.primary,
    fontFamily: fonts.OpenSansRegular,
    marginLeft: 5,
  },
  routeInfo: {
    marginTop: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  openMapsButton: {
    position: 'absolute',
    bottom: 10,
    backgroundColor: themeColors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  openMapsButtonText: {
    color: themeColors.white,
    fontSize: size.md,
    fontFamily: fonts.OpenSansBold,
    marginLeft: 5,
  },
  errorSnackbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: themeColors.red,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1000,
  },
  errorSnackbarText: {
    color: themeColors.white,
    fontSize: size.md,
    fontFamily: fonts.OpenSansRegular,
    flex: 1,
    marginLeft: 10,
  },
  zoomControls: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: themeColors.white,
    borderRadius: 8,
    padding: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  zoomButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    backgroundColor: themeColors.white,
    borderRadius: 6,
  },
  recenterControls: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: themeColors.white,
    borderRadius: 8,
    padding: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  recenterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: themeColors.white,
    borderRadius: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.lightGray,
  },
  facilityTypeText: {
    fontSize: size.md,
    fontFamily: fonts.OpenSansBold,
    color: themeColors.primary,
    marginLeft: 8,
    textTransform: 'capitalize',
  },
});
