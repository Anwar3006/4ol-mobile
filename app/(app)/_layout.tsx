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
 * AuthProvider — single source of truth for auth + mode routing.
 *
 * KEY DESIGN PRINCIPLE — one LoadingScreen, one-way door:
 *
 *   isReady starts false. The guard effect waits until it has everything it
 *   needs (session + profile for authenticated users), makes exactly ONE
 *   routing decision, then sets isReady = true permanently.
 *
 *   After isReady is true, LoadingScreen is NEVER shown again. This prevents
 *   the "profile re-validates → LoadingScreen → navigation stack unmounts →
 *   guard redirects to Home" bug that was kicking users off Facility/[id].
 *
 * ROUTE GUARD RULES (evaluated in order):
 *   1. Session still loading  → hold (max 5s timeout)
 *   2. Authenticated but profile loading → hold (prevents ibpTabs flash)
 *   3. Unauthenticated + in auth group → Login
 *   4. Unauthenticated + not in public group → GetStarted or Login
 *   5. Authenticated + not in auth group → correct tab group
 *   6. Authenticated + in tab group but wrong mode → swap tab group
 *      (standalone auth screens like Facility/[id] are intentionally skipped)
 */
function AuthProvider({ children }: { children: React.ReactNode }) {
  const segments = useSegments();
  const router = useRouter();
  const { setUser, logoutUser, hasSeenOnboarding } = useUserStore();
  const { currentMode, setMode } = useUserMode();

  const { data: sessionData, isPending: isSessionLoading } = authClient.useSession();

  const userId = sessionData?.user?.id ?? '';
  const { data: userProfile, isLoading: isProfileLoading } = useUserProfile(userId);

  // isReady = false → show LoadingScreen (initial boot only)
  // isReady = true  → never block again; navigation stack stays mounted
  const [isReady, setIsReady] = useState(false);

  // Safety valve: if BetterAuth never resolves (slow emulator / no network),
  // unblock after 5s and treat as unauthenticated.
  const [sessionTimedOut, setSessionTimedOut] = useState(false);
  useEffect(() => {
    if (!isSessionLoading) return;
    const t = setTimeout(() => {
      console.warn('[AuthProvider] Session timed out — treating as unauthenticated.');
      setSessionTimedOut(true);
    }, 5000);
    return () => clearTimeout(t);
  }, [isSessionLoading]);

  // ── Sync profile → store, derive authoritative mode from server ──────────
  useEffect(() => {
    if (userProfile) {
      setUser(userProfile);
      // Mode MUST come from the server field, not MMKV, to prevent stale
      // business-mode from a previous session leaking into a new user session.
      setMode(userProfile.user_type === 'business_provider' ? 'business' : 'user');
    }
    if (!sessionData && !isSessionLoading) {
      logoutUser();
      setMode('user');
    }
  }, [userProfile, sessionData, isSessionLoading]);

  // ── Navigation guard ─────────────────────────────────────────────────────
  useEffect(() => {
    // ── Hold conditions — do not make a routing decision yet ────────────────
    // 1. Session still resolving
    if (isSessionLoading && !sessionTimedOut) return;

    // 2. Authenticated user's profile not yet loaded.
    //    Without this, children would render with stale MMKV mode before the
    //    server-authoritative user_type arrives, causing ibpTabs to flash.
    if (userId && isProfileLoading) return;

    // ── We have everything we need — make the routing decision ───────────────
    const pathString = segments.join('/');
    const inPublicGroup  = pathString.includes('(public)');
    const inAuthGroup    = pathString.includes('(auth)');
    const inIbpTabs      = pathString.includes('(ibpTabs)');
    const inUserTabs     = pathString.includes('(tabs)') && !inIbpTabs;
    const inModal        = pathString.includes('(modal)');
    const isAuthenticated = !!sessionData?.user;

    if (!isAuthenticated) {
      // ── 3. Unauthenticated on a protected screen ─────────────────────────
      if (inAuthGroup) {
        router.replace('/(app)/(public)/Login');
        setIsReady(true);
        return;
      }
      // ── 4. Unauthenticated, not yet in any group (cold-start) ────────────
      if (!inPublicGroup) {
        router.replace(
          hasSeenOnboarding
            ? '/(app)/(public)/Login'
            : '/(app)/(public)/GetStarted',
        );
      }
      setIsReady(true);
      return;
    }

    // ── 5. Authenticated but outside the auth group ──────────────────────
    if (!inAuthGroup) {
      router.replace(
        currentMode === 'business'
          ? '/(app)/(auth)/(ibpTabs)'
          : '/(app)/(auth)/(tabs)/Home',
      );
      setIsReady(true);
      return;
    }

    // ── 6. Authenticated, in auth group — enforce tab-group/mode match ───
    //
    // ONLY run this check when the user is already INSIDE a tab group.
    // Standalone (auth) screens such as Facility/[id], (modal)/*, etc. are
    // perfectly valid routes within (auth) and must NOT trigger a redirect.
    //
    // If we checked inUserTabs on Facility/[id] it would be false, and the
    // old code would redirect to Home — that's the bug this prevents.
    const inAnyTabGroup = inUserTabs || inIbpTabs;
    if (!inModal && inAnyTabGroup) {
      if (currentMode === 'business' && !inIbpTabs) {
        router.replace('/(app)/(auth)/(ibpTabs)');
      } else if (currentMode !== 'business' && !inUserTabs) {
        router.replace('/(app)/(auth)/(tabs)/Home');
      }
    }

    // Mark the app as ready — LoadingScreen will never show again after this.
    setIsReady(true);
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

  // Show LoadingScreen ONLY during initial boot, before the first routing
  // decision. Once isReady is true this block is never entered again, so
  // background profile re-validates and segment changes can never unmount
  // the navigation stack.
  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <Animated.View entering={FadeIn.duration(400)} className="flex-1">
      {children}
    </Animated.View>
  );
}
