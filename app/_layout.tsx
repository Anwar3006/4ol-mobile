// import 'react-native-url-polyfill/auto';
// import React, { useEffect, useMemo, useState } from 'react';
// import { Provider, useDispatch } from 'react-redux';
// import { Slot, useRouter, useSegments } from 'expo-router';
// import { ActivityIndicator, View, StyleSheet } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ToastProvider } from 'react-native-toast-notifications';

// import { setUserData } from '../src/store/slices/User';
// import { getUserProfile } from '../src/services/auth';
// import { themeColors } from '../src/theme/colors';
// import { isAuthenticated } from '../lib/auth-client';
// import { store } from '../src/store';
// import { NotificationProvider } from '../src/context/NotificationContext';
// import { configureForegroundNotificationBehaviour } from '../src/services/notifeeBackgroundHandler';

// configureForegroundNotificationBehaviour();

// function AuthGate() {
//   const segments = useSegments();
//   const router = useRouter();
//   const dispatch = useDispatch();

//   const [loading, setLoading] = useState(true);
//   const [isAuth, setIsAuth] = useState<boolean | null>(null);

//   useEffect(() => {
//     const initAuth = async () => {
//       try {
//         const authenticated = await isAuthenticated();
//         setIsAuth(authenticated);

//         const userId = await AsyncStorage.getItem('user_id');

//         if (authenticated && userId) {
//           getUserProfile(undefined,
//             userId,
//             () => {},
//             (successData: any) => {
//               dispatch(setUserData(successData));
//               setLoading(false);
//             },
//             (error: any) => {
//               console.error('Profile fetch failed:', error);
//               setLoading(false);
//             },
//           );
//         } else {
//           setLoading(false);
//         }
//       } catch (e) {
//         console.error('Init auth error:', e);
//         setLoading(false);
//       }
//     };

//     initAuth();
//   }, [dispatch]);

//   useEffect(() => {
//     if (loading || isAuth === null) return;

//     const inAppGroup = segments[0] === '(app)';
//     const inPublicGroup = (segments as string[]).includes('(public)');

//     if (isAuth) {
//       if (inPublicGroup || !inAppGroup) {
//         router.replace('/(app)/(auth)/(tabs)/Home');
//       }
//     } else {
//       if (!inPublicGroup) {
//         router.replace('/(app)/(public)/Login');
//       }
//     }
//   }, [isAuth, segments, loading, router]);

//   if (loading) {
//     return (
//       <View style={styles.loaderContainer}>
//         <ActivityIndicator size="large" color={themeColors.primary} />
//       </View>
//     );
//   }

//   return <Slot />;
// }

// function AppProviders({ children }: { children: React.ReactNode }) {
//   const queryClient = useMemo(() => new QueryClient(), []);

//   return (
//     <GestureHandlerRootView style={styles.flex}>
//       <Provider store={store}>
//         <QueryClientProvider client={queryClient}>
//           <ToastProvider placement="top">
//             <NotificationProvider>{children}</NotificationProvider>
//           </ToastProvider>
//         </QueryClientProvider>
//       </Provider>
//     </GestureHandlerRootView>
//   );
// }

// export default function RootLayout() {
//   return (
//     <AppProviders>
//       <AuthGate />
//     </AppProviders>
//   );
// }

// const styles = StyleSheet.create({
//   flex: {
//     flex: 1,
//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { Slot } from "expo-router";
import * as Notifications from "expo-notifications";
import { useFonts } from "expo-font";
import * as Sentry from "@sentry/react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import { NotificationProvider } from "@/context/NotificationContext";
import {
  BiometricProvider,
  useBiometricLock,
} from "@/context/BiometricContext";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSyncFavorites } from "@/hooks/use-facilities";
import useUserStore from "@/store/use-userstore";

// Initialize Sentry
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  attachScreenshot: true,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 1.0,
  enableAppHangTracking: true,
  enableStallTracking: true,
  debug: true, // Enable debug mode to see Sentry logs in development
  enableNative: true,
  tracesSampleRate: 1.0,
  integrations: [
    Sentry.mobileReplayIntegration({
      maskAllImages: false,
      maskAllText: false,
    }),
    Sentry.httpContextIntegration(),
  ],
});

const queryClient = new QueryClient();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: false,
  }),
});

const LockScreen = () => {
  const { unlock } = useBiometricLock();

  return (
    <View className="flex-1 bg-white items-center justify-center p-6">
      <View className="bg-emerald-100 p-6 rounded-full mb-6">
        <Ionicons name="lock-closed" size={60} color="#10b981" />
      </View>
      <Text className="text-2xl font-black text-slate-900 mb-2">
        App Locked
      </Text>
      <Text className="text-gray-500 text-center mb-8 font-medium">
        Please authenticate to continue using 4 Our Life
      </Text>
      <TouchableOpacity
        onPress={unlock}
        className="bg-emerald-600 px-8 py-4 rounded-2xl flex-row items-center justify-center w-full shadow-lg"
      >
        <Ionicons
          name="finger-print"
          size={24}
          color="white"
          className="mr-2"
        />
        <Text className="text-white font-bold text-lg">Unlock App</Text>
      </TouchableOpacity>
    </View>
  );
};

const AppContent = () => {
  const { isLocked, isLoading } = useBiometricLock();
  const { user } = useUserStore();

  // Hydrate favorites on mount/login
  useSyncFavorites(user?.user_id);

  if (isLoading) {
    return null; // Or a splash screen
  }

  if (isLocked) {
    return <LockScreen />;
  }

  return <Slot />;
};

const RootLayout = () => {

  // Reanimated logger, disable logger
  useEffect(() => {
    configureReanimatedLogger({
      level: ReanimatedLogLevel.warn,
      strict: false,
    });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BiometricProvider>
        <NotificationProvider>
          <QueryClientProvider client={queryClient}>
            <AppContent />
          </QueryClientProvider>
        </NotificationProvider>
      </BiometricProvider>
    </GestureHandlerRootView>
  );
};

export default Sentry.wrap(RootLayout);
