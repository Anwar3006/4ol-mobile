import '@/global.css';
import { useUserProfile } from '@/hooks/use-userProfile';
import { useUserMode } from '@/store/useUserMode';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';
import useUserStore from '@/store/use-userstore';
import { authClient } from '@/lib/auth-client';
import LoadingScreen from '@/components/LoadingScreen';

SplashScreen.setOptions({ duration: 200, fade: true });

export default function AppLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(public)" />
        <Stack.Screen name="(auth)" />
      </Stack>
    </AuthProvider>
  );
}

/**
 * AuthProvider — single source of truth for auth + mode + onboarding routing.
 *
 * Decision order (highest → lowest priority):
 *  1. Session still loading → LoadingScreen (5s safety timeout)
 *  2. First launch → GetStarted
 *  3. Not authenticated → Login
 *  4. Authenticated but profile not yet loaded → wait (prevents ibpTabs flicker)
 *  5. Authenticated + profile loaded → redirect to correct tab group
 */
function AuthProvider({ children }: { children: React.ReactNode }) {
  const segments = useSegments();
  const router = useRouter();
  const { setUser, logoutUser, hasSeenOnboarding } = useUserStore();
  const { currentMode, setMode } = useUserMode();

  const { data: sessionData, isPending: isSessionLoading } =
    authClient.useSession();

  // Only fetch profile when we have a user ID
  const userId = sessionData?.user?.id ?? '';
  const { data: userProfile, isLoading: isProfileLoading } =
    useUserProfile(userId);

  // ── Safety timeout: if BetterAuth isPending never resolves, unblock after 5s ──
  const [sessionTimedOut, setSessionTimedOut] = useState(false);
  useEffect(() => {
    if (!isSessionLoading) return;
    const t = setTimeout(() => {
      console.warn('[AuthProvider] Session timed out — proceeding as unauthenticated.');
      setSessionTimedOut(true);
    }, 5000);
    return () => clearTimeout(t);
  }, [isSessionLoading]);

  // ── Sync profile to store + derive authoritative mode ────────────────────
  useEffect(() => {
    if (userProfile) {
      setUser(userProfile);
      // ALWAYS derive mode from the server-side user_type field, never MMKV,
      // so a stale "business" mode from a previous session never leaks.
      setMode(userProfile.user_type === 'business_provider' ? 'business' : 'user');
    }

    if (!sessionData && !isSessionLoading) {
      logoutUser();
      setMode('user');
    }
  }, [userProfile, sessionData, isSessionLoading]);

  // ── Navigation guard ─────────────────────────────────────────────────────
  useEffect(() => {
    // Wait for session to resolve (or timeout)
    if (isSessionLoading && !sessionTimedOut) return;

    const pathString = segments.join('/');
    const inPublicGroup = pathString.includes('(public)');
    const inAuthGroup = pathString.includes('(auth)');
    const inIbpTabs = pathString.includes('(ibpTabs)');
    const inUserTabs = pathString.includes('(tabs)') && !inIbpTabs;
    const inModal = pathString.includes('(modal)');
    const isAuthenticated = !!sessionData?.user;

    // ── 1. FIRST LAUNCH ONBOARDING ─────────────────────────────────────────
    // Must come before auth check so unauthenticated first-time users see
    // GetStarted rather than Login.
    if (!hasSeenOnboarding) {
      if (!pathString.includes('GetStarted') && !pathString.includes('index')) {
        router.replace('/(app)/(public)/GetStarted');
      }
      return;
    }

    // ── 2. UNAUTHENTICATED ─────────────────────────────────────────────────
    if (!isAuthenticated) {
      if (!inPublicGroup) {
        router.replace('/(app)/(public)/Login');
      }
      return;
    }

    // ── 3. AUTHENTICATED — wait for profile before mode-based routing ───────
    // Without this guard, the navigation runs with the stale MMKV mode value
    // (potentially "business") before the server profile loads, causing a
    // visible flicker: ibpTabs → Home.
    // Exception: if userId exists but profile is still loading, hold.
    if (userId && isProfileLoading) return;

    // ── 4. AUTHENTICATED but outside auth group ────────────────────────────
    if (!inAuthGroup) {
      router.replace(
        currentMode === 'business'
          ? '/(app)/(auth)/(ibpTabs)'
          : '/(app)/(auth)/(tabs)/Home',
      );
      return;
    }

    // ── 5. AUTHENTICATED in auth group — enforce mode matching ──────────────
    // Skip modals; they float above the navigator.
    if (!inModal) {
      if (currentMode === 'business' && !inIbpTabs) {
        router.replace('/(app)/(auth)/(ibpTabs)');
      } else if (currentMode !== 'business' && !inUserTabs) {
        router.replace('/(app)/(auth)/(tabs)/Home');
      }
    }
  }, [
    sessionData,
    segments,
    isSessionLoading,
    sessionTimedOut,
    currentMode,
    hasSeenOnboarding,
    userProfile,
    isProfileLoading,
    userId,
  ]);

  // Block rendering only while session is genuinely loading
  if (isSessionLoading && !sessionTimedOut) {
    return <LoadingScreen />;
  }

  return (
    <Animated.View entering={FadeIn.duration(400)} className="flex-1">
      {children}
    </Animated.View>
  );
}
