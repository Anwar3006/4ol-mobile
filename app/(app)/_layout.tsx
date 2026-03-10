import '@/global.css';
import {useBiometricAuth} from '@/hooks/use-biometric-auth';
import {useUserProfile} from '@/hooks/use-userProfile';
import {useUserMode} from '@/store/useUserMode';
import {Stack, useRouter, useSegments} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {useEffect} from 'react';
import Animated, {FadeIn} from 'react-native-reanimated';
import useUserStore from '@/store/use-userstore';
import {authClient} from '@/lib/auth-client';
import LoadingScreen from '@/components/LoadingScreen';

SplashScreen.setOptions({duration: 200, fade: true});

export default function AppLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{headerShown: false}}>
        <Stack.Screen name="(public)" />
        <Stack.Screen name="(auth)" />
      </Stack>
    </AuthProvider>
  );
}

/**
 * AuthProvider — single source of truth for auth + mode routing.
 *
 * Rules:
 *  1. While session is loading → show LoadingScreen, render nothing.
 *  2. NOT authenticated → always redirect to Login (regardless of current segment).
 *  3. Authenticated → check if first time:
 *     - hasSeenOnboarding === false → redirect to GetStarted
 *     - hasSeenOnboarding === true → derive mode from server-side user_type
 *       - user_type === "business_provider"  → business mode → ibpTabs
 *       - anything else                       → user mode    → (tabs)/Home
 *  4. On logout → reset mode and onboarding flags to safe defaults.
 */
function AuthProvider({children}: {children: React.ReactNode}) {
  const segments = useSegments();
  const router = useRouter();
  const {setUser, logoutUser, hasSeenOnboarding, setHasSeenOnboarding} =
    useUserStore();
  const {currentMode, setMode} = useUserMode();

  const {data: sessionData, isPending: isSessionLoading} =
    authClient.useSession();

  const {data: userProfile} = useUserProfile(sessionData?.user?.id ?? '');

  // ── Sync profile & derive mode from server user_type ─────────────────────
  useEffect(() => {
    if (userProfile) {
      setUser(userProfile);

      // Mark as having seen onboarding if not already marked
      if (!hasSeenOnboarding) {
        setHasSeenOnboarding(true);
      }

      // Derive mode from the authoritative server-side field, not from MMKV.
      // This prevents a stale "business" mode from a previous session
      // granting access to ibpTabs for a regular user.
      const isBusinessProvider = userProfile.user_type === 'business_provider';
      setMode(isBusinessProvider ? 'business' : 'user');
    }

    if (!sessionData && !isSessionLoading) {
      // User signed out — clear profile and reset mode to safe default
      logoutUser();
      setMode('user');
    }
  }, [userProfile, sessionData, isSessionLoading]);

  console.log("Current mode: ", currentMode);

  // ── Navigation guard ──────────────────────────────────────────────────────
  useEffect(() => {
    if (isSessionLoading) return;

    const pathString = segments.join('/');
    const inPublicGroup = pathString.includes('(public)');
    const inAuthGroup = pathString.includes('(auth)');
    const inIbpTabs = pathString.includes('(ibpTabs)');
    const inUserTabs = pathString.includes('(tabs)') && !inIbpTabs;
    const inModal = pathString.includes('(modal)');
    const isAuthenticated = !!sessionData?.user;

    if (!isAuthenticated) {
      // RULE 2: unauthenticated — always land on Login, no exceptions.
      // Guard against redirect loops by checking we're not already there.
      if (!inPublicGroup) {
        router.replace('/(app)/(public)/Login');
      }
      return;
    }

    // ── From here the user IS authenticated ──────────────────────────────
    if (!inAuthGroup) {
      // Authenticated but sitting on a public/unknown screen → push to app
      if (currentMode === 'business') {
        router.replace('/(app)/(auth)/(ibpTabs)');
      } else {
        router.replace('/(app)/(auth)/(tabs)/Home');
      }
      return;
    }

    // ── Check for first-time user onboarding ──────────────────────────────
    // If authenticated and in auth group but hasn't seen onboarding,
    // redirect to GetStarted (OneTime screen to introduce the app)
    if (!hasSeenOnboarding && !inPublicGroup && !inModal) {
      router.replace('/(app)/(public)/GetStarted');
      return;
    }

    // Authenticated and in auth group — make sure the active tab group
    // matches the current mode. Skip modals (they sit above the navigator).
    if (!inModal) {
      setTimeout(() => {
        if (currentMode === 'business' && !inIbpTabs) {
          router.replace('/(app)/(auth)/(ibpTabs)');
        } else if (currentMode !== 'business' && !inUserTabs) {
          router.replace('/(app)/(auth)/(tabs)/Home');
        }
      }, 0);
    }
  }, [sessionData, segments, isSessionLoading, currentMode, hasSeenOnboarding]);

  if (isSessionLoading) {
    return <LoadingScreen />;
  }

  return (
    <Animated.View entering={FadeIn.duration(400)} className="flex-1">
      {children}
    </Animated.View>
  );
}
