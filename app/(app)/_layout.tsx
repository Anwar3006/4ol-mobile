import "@/global.css";
import { BiometricAuthGuard } from "@/components/auth/BiometricAuthGuard";
import { useBiometricAuth } from "@/hooks/use-biometric-auth";
import { useUserProfile } from "@/hooks/use-userProfile";
import { useUserMode } from "@/store/useUserMode";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import Animated, { FadeIn } from "react-native-reanimated";
import useUserStore from "@/store/use-userstore";
import { authClient } from "@/lib/auth-client";
import LoadingScreen from "@/components/LoadingScreen";


// Set splash screen options
SplashScreen.setOptions({
  duration: 200,
  fade: true,
});

export default function AppLayout() {
  return (
    <AuthProvider>
      {/* <BiometricAuthGuard> //UNDO */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(public)" />
        <Stack.Screen name="(auth)" />
      </Stack>
      {/* </BiometricAuthGuard> */}
    </AuthProvider>
  );
}

/**
 * Auth Provider - Single source of truth for authentication
 *
 * Key principles:
 * 1. Lives at root level (never unmounts)
 * 2. Uses ONLY session.isPending (no custom flags)
 * 3. Shows loader BEFORE any route renders
 * 4. Let BetterAuth manage loading state
 */
function AuthProvider({ children }: { children: React.ReactNode }) {
  const segments = useSegments();
  const router = useRouter();
  const { setUser, logoutUser } = useUserStore();
  const { currentMode } = useUserMode();
  const {
    isAvailable: isBiometricAvailable,
    isEnrolled: isBiometricEnrolled,

    isBiometricEnabled,
  } = useBiometricAuth();

  // Single source of truth: BetterAuth session
  const { data: sessionData, isPending: isSessionLoading } =
    authClient.useSession();

  const { data: userProfile } = useUserProfile(sessionData?.user?.id ?? "");

  // Sync user profile to store
  useEffect(() => {
    if (userProfile) {
      setUser(userProfile);
    }

    // Clear user data when session is gone (and not loading)
    if (!sessionData && !isSessionLoading) {
      logoutUser();
    }
  }, [userProfile, sessionData, isSessionLoading]);

  // Navigation guard
  useEffect(() => {
    // Don't navigate while loading session
    if (isSessionLoading) return;

    const pathString = segments.join("/");
    const inAuthGroup = pathString.includes("(auth)");
    const inIbpTabs = pathString.includes("(ibpTabs)");
    const inUserTabs = pathString.includes("(tabs)");
    const inModal = pathString.includes("(modal)");
    const legalPages = pathString.includes("(legal)");
    const isAuthenticated = !!sessionData?.user;

    // Redirect logic
    if (!isAuthenticated && inAuthGroup) {
      // Not logged in but trying to access auth routes → Login
      router.replace("/(app)/(public)/Login");
    } else if (isAuthenticated && !inAuthGroup && !legalPages) {
      // Logged in but on public routes → Redirect to correct tab group based on mode
      // if (isBiometricAvailable && isBiometricEnrolled && !isBiometricEnabled) {
      //   return;
      // }

      if (currentMode === "business") {
        router.replace("/(app)/(auth)/(ibpTabs)");
      } else {
        router.replace("/(app)/(auth)/(tabs)/Home");
      }
    } else if (isAuthenticated && inAuthGroup && !inModal) {
      // Logged in and in auth group -> Check if mode matches the current tab group.
      // We skip this check if we are in a modal.
      // Use setTimeout to defer by one tick: if the component that triggered the mode
      // change already called router.replace, segments will have updated by the time
      // this fires, preventing a double-navigation and the "no navigation context" crash.
      setTimeout(() => {
        if (currentMode === "business" && !inIbpTabs) {
          router.replace("/(app)/(auth)/(ibpTabs)");
        } else if (currentMode === "user" && !inUserTabs) {
          router.replace("/(app)/(auth)/(tabs)/Home");
        }
      }, 0);
    }
  }, [sessionData, segments, isSessionLoading, currentMode]);

  // Don't render anything while session is loading or while deciding navigation state
  if (isSessionLoading) {
    return <LoadingScreen />
  }

  return (
    <Animated.View entering={FadeIn.duration(400)} className="flex-1">
      {children}
    </Animated.View>
  );
}
