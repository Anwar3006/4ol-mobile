import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useEffect, useMemo } from "react";
import { Slot } from "expo-router";
import * as Notifications from "expo-notifications";
import * as Sentry from "@sentry/react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import { NotificationProvider } from "@/context/NotificationContext";
import { BiometricProvider, useBiometricLock } from "@/context/BiometricContext";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSyncFavorites } from "@/hooks/use-facilities";
import useUserStore from "@/store/use-userstore";
import { SafeAreaProvider } from "react-native-safe-area-context";

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  attachScreenshot: true,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 1.0,
  enableAppHangTracking: true,
  enableStallTracking: true,
  debug: true,
  enableNative: true,
  tracesSampleRate: 1.0,
  integrations: [
    Sentry.mobileReplayIntegration({ maskAllImages: false, maskAllText: false }),
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
      <Text className="text-2xl font-black text-slate-900 mb-2">App Locked</Text>
      <Text className="text-gray-500 text-center mb-8 font-medium">
        Please authenticate to continue using 4 Our Life
      </Text>
      <TouchableOpacity
        onPress={unlock}
        className="bg-emerald-600 px-8 py-4 rounded-2xl flex-row items-center justify-center w-full shadow-lg"
      >
        <Ionicons name="finger-print" size={24} color="white" className="mr-2" />
        <Text className="text-white font-bold text-lg">Unlock App</Text>
      </TouchableOpacity>
    </View>
  );
};

const AppContent = () => {
  const { isLocked } = useBiometricLock();
  const { user } = useUserStore();

  useSyncFavorites(user?.user_id);

  // ALWAYS render <Slot /> — never conditionally replace it with another component.
  //
  // Expo Router processes navigation events (from AuthProvider's router.replace
  // calls) when <Slot /> is in the tree. If we conditionally return a different
  // component instead of <Slot />, Expo Router tries to process a navigation
  // action against an unmounted/changing tree, creating a synchronous
  // render→navigate→render loop that exceeds React's update limit and throws
  // "Maximum update depth exceeded".
  //
  // The correct pattern: always render <Slot /> and overlay any blocking UI
  // (LockScreen, etc.) on top via absolute positioning.
  return (
    <View style={styles.container}>
      <Slot />
      {isLocked && (
        <View style={StyleSheet.absoluteFillObject}>
          <LockScreen />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

const RootLayout = () => {
  useEffect(() => {
    configureReanimatedLogger({ level: ReanimatedLogLevel.warn, strict: false });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BiometricProvider>
          <NotificationProvider>
            <QueryClientProvider client={queryClient}>
              <AppContent />
            </QueryClientProvider>
          </NotificationProvider>
        </BiometricProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default Sentry.wrap(RootLayout);
