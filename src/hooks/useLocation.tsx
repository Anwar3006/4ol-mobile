import {useState, useEffect, useCallback} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {useToast} from 'react-native-toast-notifications';

const useLocation = () => {
  const toast = useToast();
  const [location, setLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [locationError, setLocationError] = useState(false);

  /**
   * Request runtime location permission on Android.
   * Mirrors the working logic from the map screen (RegisteredFacilites).
   */
  const requestLocationPermission = useCallback(async () => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message:
            'We need access to your location to show nearby facilities.',
          buttonPositive: 'OK',
        },
      );

      const hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;

      if (!hasPermission) {
        console.log(
          '❌ [useLocation] Location permission denied – setting locationError=true',
        );
        setLocationError(true);
        setLocation(null);
      }

      return hasPermission;
    } catch (err: any) {
      console.log(
        '❌ [useLocation] Error while requesting location permission:',
        err?.message || err,
      );
      setLocationError(true);
      setLocation(null);
      return false;
    }
  }, []);

  /**
   * Get current device location.
   * Uses the same options that are known to work in RegisteredFacilites.
   */
  const getLocation = useCallback(async () => {
    console.log('📍 [useLocation] Starting location request...');

    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      console.log(
        '🚫 [useLocation] Permission not granted – aborting location request',
      );
      return;
    }

    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude, accuracy} = position.coords;
        console.log('✅ [useLocation] Location obtained:', {
          latitude,
          longitude,
          accuracy,
        });

        setLocation({latitude, longitude});
        setLocationError(false);
      },
      error => {
        console.log(
          '❌ [useLocation] Error getting location:',
          error.message,
          error.code,
        );

        // Optionally surface the error to the user
        // toast.show(error.message, {
        //   type: 'danger',
        //   placement: 'top',
        //   duration: 4000,
        //   animationType: 'slide-in',
        // });

        setLocationError(true);
        setLocation(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000, // 30s timeout so we don't hang on "Fetching location..."
        maximumAge: 10000,
      },
    );
  }, [requestLocationPermission]);

  useEffect(() => {
    // Auto-fetch location on mount (home screen, wrappers, etc.)
    getLocation();
  }, [getLocation]);

  return {
    location,
    locationError,
    retryLocation: getLocation,
    setLocation,
  };
};

export default useLocation;
