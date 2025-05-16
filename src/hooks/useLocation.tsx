import {useState, useEffect} from 'react';
import {PermissionsAndroid, Platform, Alert} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {useToast} from 'react-native-toast-notifications';

const useLocation = () => {
  const toast = useToast();
  const [location, setLocation] = useState<any>(null);
  const [locationError, setLocationError] = useState(false);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message:
              'We need access to your location to show nearby facilities.',
            // buttonNeutral: 'Ask Me Later',
            // buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getLocation();
        } else {
          setLocationError(true);
          setLocation(null);
        }
      } catch (err: any) {
        // toast.show(err.message, {
        //   type: 'danger',
        //   placement: 'top',
        //   duration: 4000,
        //   animationType: 'slide-in',
        // });
        setLocationError(true);
        setLocation(null);
      }
    } else {
      getLocation();
    }
  };

  const getLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setLocation({latitude, longitude});
        setLocationError(false);
      },
      error => {
        // toast.show(error.message, {
        //   type: 'danger',
        //   placement: 'top',
        //   duration: 4000,
        //   animationType: 'slide-in',
        // });
        setLocationError(true);
        setLocation(null);
      },
    );
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  return {
    location,
    locationError,
    retryLocation: requestLocationPermission,
    setLocation,
  };
};

export default useLocation;
