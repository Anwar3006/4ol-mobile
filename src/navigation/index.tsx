import {useDispatch, useSelector} from 'react-redux';
import {user} from '../store/selectors';
import AppNavigation from './AppNavigation';
import AuthStackNavigation from './AuthStackNavigation';
import {useEffect, useRef, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getUserProfile} from '../services/auth';
import {isBiometricUser, setUserData} from '../store/slices/User';
import {Dispatch, UnknownAction} from '@reduxjs/toolkit';
import {ActivityIndicator, AppState, StyleSheet, View} from 'react-native';
import {themeColors} from '../theme/colors';
import TouchID from 'react-native-touch-id';
import {size} from '../theme/fontStyle';
import {fonts} from '../theme/fonts';
import LoginScreen from '../screens/authStack/Login';
import {NavigationContainer} from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';
import {notificationListeners} from '../utils/notificationServiceHelper';
import {setPeriodTracker} from '../store/slices/periodTracker';
import {supabase} from '../utils/supabaseClient';
import {logDAU, logDownloads, logMAU} from '../services/appPerformanceService';
import React from 'react';
import {navigationRef} from '../services/NavigationRef';
import {checkRedirect} from '../services/checkRedirect';
import * as Sentry from '@sentry/react-native';
const Route = () => {
  const optionalConfigObject = {
    title: 'Please Authenticate', // Android
    imageColor: themeColors.primary, // Android
    imageErrorColor: '#ff0000', // Android
    sensorDescription: 'Touch the sensor', // Android
    sensorErrorDescription: 'Authentication Failed', // Android
    cancelText: 'Cancel', // Android
    fallbackLabel: 'Show Passcode', // iOS (if empty, then label is hidden)
    unifiedErrors: false, // use unified error messages (default false)
    passcodeFallback: false, // iOS - allows the device to fall back to using the passcode, if faceid/touch is not available. this does not mean that if touchid/faceid fails the first few times it will revert to passcode, rather that if the former are not enrolled, then it will use the passcode.
  };

  const dispatch = useDispatch<Dispatch<UnknownAction>>();
  const userData: any = useSelector(user);
  const {isBiometricUserAvailable} = useSelector(
    (state: any) => state.userData,
  );

  //console.log('isBiometricUserAvailable', isBiometricUserAvailable);
  //console.log('user-data-----', userData);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [routeHandlingBiometric, setRouteHandlingBiometric] = useState(false); // Track if Route is handling biometric

  const appState = useRef(AppState.currentState);
  const biometricInProgressRef = useRef(false);
  const lastResumeAtRef = useRef(0);

  useEffect(() => {
    // checkRedirect();
    const handleAppStateChange = async (nextAppState: any) => {
      try {
        // Add Sentry breadcrumb
        Sentry.addBreadcrumb({
          message: 'App state changed',
          category: 'app-lifecycle',
          data: {
            previousState: appState.current,
            newState: nextAppState,
          },
        });

        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          const now = Date.now();
          if (now - lastResumeAtRef.current < 3000) {
            // Throttle resume handling to avoid burst re-entries
            return;
          }
          lastResumeAtRef.current = now;
          const lastMinimizedTime = await AsyncStorage.getItem(
            'lastMinimizedTime',
          );
          const currentTime = new Date().getTime();
          if (
            lastMinimizedTime &&
            currentTime - parseInt(lastMinimizedTime) >= 30000 // Check if 30 seconds have passed
          ) {
            Sentry.addBreadcrumb({
              message: 'Triggering biometric after 30 seconds',
              category: 'biometric',
            });
            if (!biometricInProgressRef.current) {
              biometricInProgressRef.current = true;
              // dispatch(isBiometricUser(true));
              triggerBiometricLogin().finally(() => {
                biometricInProgressRef.current = false;
              });
            }
          }
        } else if (nextAppState.match(/inactive|background/)) {
          const currentTime = new Date().getTime();
          await AsyncStorage.setItem(
            'lastMinimizedTime',
            currentTime.toString(),
          );
        }

        appState.current = nextAppState;
      } catch (error) {
        Sentry.captureException(error, {
          tags: {component: 'app-state-change'},
        });
      }
    };

    const handleAppClose = async () => {
      // This will be triggered when the app is closed (unmounted)
      const currentTime = new Date().getTime();
      await AsyncStorage.setItem('lastMinimizedTime', currentTime.toString());
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
      handleAppClose();
    };
  }, []);

  useEffect(() => {
    const checkBiometricOnStartup = async () => {
      const lastMinimizedTime = await AsyncStorage.getItem('lastMinimizedTime');
      const currentTime = new Date().getTime();
      const isAuthenticatedJSON = await AsyncStorage.getItem('isAuthenticated');
      const isAuthenticated = isAuthenticatedJSON
        ? JSON.parse(isAuthenticatedJSON)
        : false;

      // Detect cold start - if no lastMinimizedTime OR it's very old (>5 minutes),
      // it means app was completely closed/killed
      const isColdStart =
        !lastMinimizedTime ||
        (lastMinimizedTime &&
          currentTime - parseInt(lastMinimizedTime) > 300000); // 5 minutes

      if (isColdStart) {
        // On cold start, always reset auth state so LoginScreen can request biometric
        await AsyncStorage.setItem('isAuthenticated', JSON.stringify(false));
        await AsyncStorage.removeItem('routeBiometricInProgress').catch(
          () => {},
        );
        // Clear old lastMinimizedTime to ensure next cold start is detected
        if (lastMinimizedTime) {
          await AsyncStorage.removeItem('lastMinimizedTime');
        }
        // Check if user is logged in with biometric enabled
        const userId = await AsyncStorage.getItem('user_id');
        const isLoggedInJSON = await AsyncStorage.getItem('isLoggedIn');
        const isLoggedIn = isLoggedInJSON ? JSON.parse(isLoggedInJSON) : false;
        const biometricEnabledJSON = await AsyncStorage.getItem(
          'biometricEnabled',
        );
        const biometricEnabled = biometricEnabledJSON
          ? JSON.parse(biometricEnabledJSON)
          : false;

        // If user is logged in with biometric enabled, show LoginScreen
        if (userId && isLoggedIn && biometricEnabled) {
          dispatch(isBiometricUser(true));
        } else {
          dispatch(isBiometricUser(false));
        }
        return; // Exit early on cold start - don't trigger biometric in Route
      }

      // Only trigger biometric on app resume (not cold start)
      if (
        (lastMinimizedTime &&
          currentTime - parseInt(lastMinimizedTime) >= 30000) || // Check if 30 seconds have passed
        !isAuthenticated
      ) {
        // Route will handle biometric - set flag immediately to prevent LoginScreen from triggering
        setRouteHandlingBiometric(true);
        AsyncStorage.setItem(
          'routeBiometricInProgress',
          JSON.stringify(true),
        ).catch(() => {});
        // Don't set isBiometricUser(true) - Route handles biometric directly, LoginScreen only shows if needed for retry
        triggerBiometricLogin();
      }
    };

    checkBiometricOnStartup(); // Trigger biometric check when the app is opened
  }, []);

  const triggerBiometricLogin = async () => {
    try {
      Sentry.addBreadcrumb({
        message: 'Biometric authentication triggered',
        category: 'auth',
      });

      await AsyncStorage.setItem('isAuthenticated', JSON.stringify(false));
      // Set flag to indicate Route is handling biometric (prevent LoginScreen from triggering)
      await AsyncStorage.setItem(
        'routeBiometricInProgress',
        JSON.stringify(true),
      );

      const userId = await AsyncStorage.getItem('user_id');
      const isLoggedInJSON = await AsyncStorage.getItem('isLoggedIn');
      const isLoggedIn = isLoggedInJSON ? JSON.parse(isLoggedInJSON) : false;
      const biometricEnabledJSON = await AsyncStorage.getItem(
        'biometricEnabled',
      );
      const biometricEnabled = biometricEnabledJSON
        ? JSON.parse(biometricEnabledJSON)
        : false;

      if (userId && isLoggedIn && biometricEnabled) {
        TouchID.authenticate(
          'Authenticate to access the app',
          optionalConfigObject,
        )
          .then(async (success: any) => {
            Sentry.addBreadcrumb({
              message: 'Biometric authentication successful',
              category: 'auth',
            });
            console.log('success biometric', success);
            console.log('Biometric authentication success');
            setIsModalVisible(false);
            await AsyncStorage.setItem('isAuthenticated', JSON.stringify(true));
            // Clear the flag after successful authentication
            setRouteHandlingBiometric(false);
            await AsyncStorage.removeItem('routeBiometricInProgress');
            dispatch(isBiometricUser(false));
          })
          .catch(async (error: any) => {
            // Capture biometric errors
            Sentry.captureException(error, {
              tags: {
                component: 'biometric-auth',
                userId: userId,
              },
              extra: {
                isAuthenticated: await AsyncStorage.getItem('isAuthenticated'),
                lastMinimizedTime: await AsyncStorage.getItem(
                  'lastMinimizedTime',
                ),
                biometricEnabled: biometricEnabled,
              },
            });
            await AsyncStorage.removeItem('isAuthenticated');
            // Clear the flag on error - but wait a moment before allowing LoginScreen to trigger
            // This prevents double triggering if Route's modal retry is used
            setTimeout(() => {
              setRouteHandlingBiometric(false);
              AsyncStorage.removeItem('routeBiometricInProgress').catch(
                () => {},
              );
            }, 500);
            // await AsyncStorage.removeItem('isLoggedIn');
            dispatch(setUserData(''));
            console.log('Biometric authentication failed', error);
            setIsModalVisible(true);
            // Don't set isBiometricUser(true) here - let user use modal retry first
            // Only show LoginScreen if user navigates there manually or modal retry fails multiple times
          });
      } else {
        // Clear the flag if conditions aren't met
        setRouteHandlingBiometric(false);
        await AsyncStorage.removeItem('routeBiometricInProgress');
        dispatch(isBiometricUser(false));
      }
    } catch (error) {
      // Clear the flag on exception
      setRouteHandlingBiometric(false);
      await AsyncStorage.removeItem('routeBiometricInProgress').catch(() => {});
      Sentry.captureException(error, {
        tags: {component: 'biometric-flow'},
      });
    }
  };

  const handleRetryAuthentication = () => {
    setIsModalVisible(false);
    // Don't set isBiometricUser(true) here - Route will handle the retry
    // LoginScreen will only show if biometric fails multiple times
    triggerBiometricLogin(); // Retry biometric authentication
  };

  useEffect(() => {
    const fetchUserData = async () => {
      // await AsyncStorage.setItem('isLoginFlow', 'true');

      try {
        Sentry.addBreadcrumb({
          message: 'Fetching user data',
          category: 'user-data',
        });

        const userId = await AsyncStorage.getItem('user_id');
        const value = await AsyncStorage.getItem('isLoggedIn');
        const isLoggedIn = value ? JSON.parse(value) : false;

        const getFcmToken = async () => {
          try {
            const token = await messaging().getToken();
            //console.log('FCM Token:', token);
            return token; // Token ko return karna
          } catch (error) {
            console.log('Error retrieving FCM token:', error);
            return null; // Agar error ho toh null return karna
          }
        };

        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        let token: any = null;
        if (enabled) {
          token = await getFcmToken();
        }

        if (userId && isLoggedIn) {
          notificationListeners();
          getUserProfile(
            token,
            userId,
            () => setLoading(true),
            (successData: any) => {
              dispatch(setUserData(successData));
              setLoading(false);
              logDAU(
                successData.id,
                successData?.sex,
                () => {
                  //console.log('logging DAU');
                },
                () => {
                  //console.log('DAU logged');
                },
                () => {
                  //console.log('Error logging DAU');
                },
              );
              logMAU(
                successData.id,
                successData?.sex,
                () => {
                  //console.log('logging MAU');
                },
                () => {
                  //console.log('MAU logged');
                },
                () => {
                  //console.log('Error logging MAU');
                },
              );
              logDownloads(
                successData.id,
                successData?.sex,
                () => {
                  //console.log('logging Downloads');
                },
                () => {
                  //console.log('Downloads logged');
                },
                () => {
                  //console.log('Error logging Downloads');
                },
              );
            },
            (error: any) => {
              console.log('Error while fetching user:', error);
              setLoading(false);
            },
          );
        } else {
          setLoading(false);
        }
      } catch (error) {
        Sentry.captureException(error, {
          tags: {component: 'user-data-fetch'},
        });
        console.log('Error retrieving user ID from AsyncStorage:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [dispatch]);

  const getPeriodData = async () => {
    try {
      Sentry.addBreadcrumb({
        message: 'Fetching period tracker data',
        category: 'supabase',
        data: {userId: userData.id},
      });

      const {data, error} = await supabase
        .from('tracker_logs')
        .select('*')
        .eq('user_id', userData.id);

      if (data) {
        //console.log('~ data :', data);
        dispatch(setPeriodTracker(data as any[]));
      }
    } catch (error) {
      Sentry.captureException(error, {
        tags: {component: 'period-data-fetch'},
        extra: {userId: userData.id},
      });
      console.error('~ error fetching tracker logs:', error);
    }
  };

  useEffect(() => {
    getPeriodData();
  }, [userData?.id]);

  // 🔧 DEV MODE: Bypass authentication for testing
  // Comment out this block and uncomment the original code below to restore auth
  useEffect(() => {
    if (!userData?.id) {
      // Set mock user data to bypass auth
      dispatch(
        setUserData({
          id: 'dev-user-123',
          email: 'dev@test.com',
          name: 'Dev User',
          // Add other required user fields here
        }),
      );
    }
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => console.log('Navigation is ready')}>
      {/* 🔧 DEV MODE: Always show main app */}
      {/* <AppNavigation /> */}

      {/* 🔧 ORIGINAL AUTH CODE - Uncomment to restore authentication */}
      {isBiometricUserAvailable && !routeHandlingBiometric ? (
        <LoginScreen />
      ) : isBiometricUserAvailable && routeHandlingBiometric ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      ) : userData?.id ? (
        <AppNavigation />
      ) : (
        <AuthStackNavigation />
      )}

      {/* Bypass authentication for dev */}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  message: {
    fontSize: size.md,
    fontFamily: fonts.OpenSansMedium,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default Route;
