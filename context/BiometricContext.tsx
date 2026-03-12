import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useBiometrics } from "@/hooks/use-biometrics";
import * as Sentry from "@sentry/react-native";

interface BiometricContextType {
  isLocked: boolean;
  isLoading: boolean;
  unlock: () => Promise<boolean>;
}

const BiometricContext = createContext<BiometricContextType | undefined>(undefined);

const GRACE_PERIOD_MS = 30000; // 30 seconds
const LAST_ACTIVE_KEY = "last_active_time";

/**
 * BiometricProvider manages the application's biometric locking logic.
 * 
 * The main challenge being addressed here is the AppState transition that occurs
 * when a system biometric modal (Face ID / Touch ID) is shown.
 * - When the modal appears: AppState becomes 'inactive'
 * - When the modal dismisses: AppState becomes 'active'
 * 
 * Without careful handling, this 'active' transition can trigger a new authentication request,
 * creating an infinite loop of modals.
 */
export const BiometricProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLocked, setIsLocked] = useState(false);
  const { isEnabled, authenticate, isAvailable, isLoading } = useBiometrics();
  
  // Track current AppState to compare with next state
  const appState = useRef(AppState.currentState);
  
  // Track if we are currently performing biometric auth to ignore AppState changes
  const biometricBusy = useRef(false);
  
  // Track if we just successfully unlocked to prevent immediate re-locking
  const wasJustUnlocked = useRef(false);
  
  // Track the timestamp when the app was last in a foreground/active state
  const lastActiveTimestamp = useRef<number>(Date.now());

  /**
   * Performs the biometric authentication.
   * Sets biometricBusy to true to ensure AppState listeners don't interfere.
   */
  const performAuth = async () => {
    // If already busy or not enabled, don't start a new request
    if (biometricBusy.current || !isEnabled || !isAvailable) return false;
    
    console.log("LOG: Starting biometric authentication...");
    biometricBusy.current = true;
    
    try {
      const result = await authenticate();
      
      if (result.success) {
        console.log("LOG: Authentication successful");
        
        // Mark as unlocked and update state
        wasJustUnlocked.current = true;
        setIsLocked(false);
        lastActiveTimestamp.current = Date.now();
        await SecureStore.setItemAsync(LAST_ACTIVE_KEY, Date.now().toString());

        // Shield the app from re-locking for a short period to allow state to settle
        setTimeout(() => {
          wasJustUnlocked.current = false;
        }, 2000);

        return true;
      } else {
        console.log("LOG: Authentication failed or cancelled");
        return false;
      }
    } catch (error) {
      console.error("LOG: Biometric error:", error);
      Sentry.captureException(error, {
        tags: { section: "biometrics", action: "context_perform_auth" },
      });
      return false;
    } finally {
      // Small delay before releasing the "busy" flag to allow the AppState 
      // 'active' transition (triggered by modal dismissal) to be processed/ignored first.
      setTimeout(() => {
        biometricBusy.current = false;
        console.log("LOG: Biometric busy flag cleared");
      }, 500);
    }
  };

  useEffect(() => {
    // Wait for biometric initialization (checking hardware/settings)
    if (isLoading) return;

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      const prevState = appState.current;
      console.log(`LOG: AppState transition: ${prevState} -> ${nextAppState}`);

      // 1. If biometric modal is active, IGNORE ALL AppState changes.
      // This is the critical fix for the infinite loop.
      if (biometricBusy.current) {
        console.log("LOG: Biometric in progress, ignoring state change");
        appState.current = nextAppState;
        return;
      }

      // 2. Handle going AWAY (inactive or background)
      if (nextAppState.match(/inactive|background/)) {
        // If we were active, store the time we left
        if (prevState === "active") {
          const now = Date.now();
          lastActiveTimestamp.current = now;
          await SecureStore.setItemAsync(LAST_ACTIVE_KEY, now.toString());
          console.log(`LOG: App went away, saved timestamp: ${now}`);
        }
      }

      // 3. Handle coming BACK (active)
      if (prevState.match(/inactive|background/) && nextAppState === "active") {
        console.log("LOG: App returned to active");

        // If we just unlocked, don't trigger anything
        if (wasJustUnlocked.current) {
          console.log("LOG: Blocking re-lock: Just unlocked");
          appState.current = nextAppState;
          return;
        }

        // Check if biometrics are enabled before calculating logic
        if (isEnabled && isAvailable) {
          const now = Date.now();
          
          // Get the last active time from ref (fast) or SecureStore (backup)
          let lastTime = lastActiveTimestamp.current;
          const storedTime = await SecureStore.getItemAsync(LAST_ACTIVE_KEY);
          if (storedTime) lastTime = parseInt(storedTime, 10);

          const timeAway = now - lastTime;
          console.log(`LOG: Time away from active: ${timeAway}ms (Grace: ${GRACE_PERIOD_MS}ms)`);

          // Only lock if grace period exceeded
          if (timeAway >= GRACE_PERIOD_MS) {
            console.log("LOG: Grace period exceeded, locking app");
            setIsLocked(true);
            
            // Trigger auth modal
            // We use a small timeout to ensure the UI has time to show the lock shield
            setTimeout(() => {
              performAuth();
            }, 500);
          }
        }
      }

      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    /**
     * Cold start check: If app opens fresh and biometrics are enabled,
     * lock immediately and prompt for auth.
     */
    // const initialCheck = async () => {
    //   if (isEnabled && isAvailable) {
    //     console.log("LOG: Cold start, locking app");
    //     setIsLocked(true);
    //     setTimeout(() => {
    //       performAuth();
    //     }, 800);
    //   }
    // };
    
    // initialCheck();

    return () => {
      subscription.remove();
    };
  }, [isEnabled, isAvailable, isLoading]);

  // Memoize the context value so that consumers (e.g. AppContent) don't
  // re-render on every BiometricProvider render caused by useBiometrics state
  // churn (setIsAvailable, setIsEnabled, etc.). Without this, each of those
  // intermediate state updates creates a new object reference → all consumers
  // re-render → AppContent re-renders → Slot re-renders → navigation loop.
  const contextValue = useMemo(
    () => ({ isLocked, isLoading, unlock: performAuth }),
    [isLocked, isLoading],
  );

  return (
    <BiometricContext.Provider value={contextValue}>
      {children}
    </BiometricContext.Provider>
  );
};

export const useBiometricLock = () => {
  const context = useContext(BiometricContext);
  if (context === undefined) {
    throw new Error("useBiometricLock must be used within a BiometricProvider");
  }
  return context;
};