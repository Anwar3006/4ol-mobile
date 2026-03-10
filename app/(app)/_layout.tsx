import '@/global.css';
import {useBiometricAuth} from '@/hooks/use-biometric-auth';
import {useUserProfile} from '@/hooks/use-userProfile';
import {useUserMode} from '@/store/useUserMode';
import {Stack, useRouter, useSegments} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {useEffect, useState} from 'react';
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
 */
function AuthProvider({children}: {children: React.ReactNode}) {
  const segments = useSegments();
  const router = useRouter();
  const {setUser, logoutUser, hasSeenOnboarding} = useUserStore();
  const {currentMode, setMode} = useUserMode();

  const {data: sessionData, isPending: isSessionLoading} = authClient.useSession();
  const {data: userProfile} = useUserProfile(sessionData?.user?.id ?? '');

  const [isReady, setIsReady] = useState(false);

  // ── Sync profile & derive mode ──────────────────────────────────────────
  useEffect(() => {
    if (userProfile) {
      setUser(userProfile);
      const isBusinessProvider = userProfile.user_type === 'business_provider';
      setMode(isBusinessProvider ? 'business' : 'user');
    }

    if (!sessionData && !isSessionLoading) {
      logoutUser();
      setMode('user');
    }
  }, [userProfile, sessionData, isSessionLoading]);

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

    // 1. Handle Unauthenticated State
    if (!isAuthenticated) {
      if (!inPublicGroup) {
        router.replace('/(app)/(public)/Login');
      }
      setIsReady(true);
      return;
    }

    // 2. Handle Authenticated but not in Auth Group
    if (!inAuthGroup) {
      if (currentMode === 'business') {
        router.replace('/(app)/(auth)/(ibpTabs)');
      } else {
        router.replace('/(app)/(auth)/(tabs)/Home');
      }
      setIsReady(true);
      return;
    }

    // 3. Handle Onboarding
    if (!hasSeenOnboarding && !inPublicGroup && !inModal) {
      // Correctly check if we're already on GetStarted to avoid loops
      if (!pathString.includes('GetStarted')) {
        router.replace('/(app)/(public)/GetStarted');
      }
      setIsReady(true);
      return;
    }

    // 4. Mode-based Redirection
    if (!inModal) {
      if (currentMode === 'business' && !inIbpTabs) {
        router.replace('/(app)/(auth)/(ibpTabs)');
      } else if (currentMode !== 'business' && !inUserTabs) {
        router.replace('/(app)/(auth)/(tabs)/Home');
      }
    }

    setIsReady(true);
  }, [sessionData, segments, isSessionLoading, currentMode, hasSeenOnboarding]);

  if (isSessionLoading || !isReady) {
    return <LoadingScreen />;
  }

  return (
    <Animated.View entering={FadeIn.duration(400)} className="flex-1">
      {children}
    </Animated.View>
  );
}
