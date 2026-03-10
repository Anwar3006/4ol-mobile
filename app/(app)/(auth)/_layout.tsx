import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { Platform } from "react-native";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import useUserStore from "@/store/use-userstore";
import { MedicalDisclaimerModal } from "@/components/auth/MedicalDisclaimerModal";

/**
 * ATT is iOS-only. Calling it on Android can sometimes cause issues if called too early.
 * We wrap it in a platform check and handle it as a fire-and-forget task.
 */
const requestATT = () => {
  if (Platform.OS === "ios") {
    requestTrackingPermissionsAsync().catch((err) => {
      console.warn("ATT Request Error:", err);
    });
  }
};

const AuthScreensLayout = () => {
  const { 
    hasAcknowledgedDisclaimer, 
    setHasAcknowledgedDisclaimer, 
    _hasHydrated,
    user // Check if user is authenticated
  } = useUserStore();
  
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  // 1. Robust Hydration & Disclaimer Guard
  useEffect(() => {
    // Only proceed if hydration is complete
    if (_hasHydrated) {
      if (!hasAcknowledgedDisclaimer) {
        // Small delay to ensure the UI thread is not bogged down by the initial hydration/render
        const timer = setTimeout(() => {
          setShowDisclaimer(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [_hasHydrated, hasAcknowledgedDisclaimer]);

  // 2. Prevent rendering the Stack until hydration is complete to avoid partial state renders
  if (!_hasHydrated) {
    return null; 
  }

  const handleDisclaimerAck = () => {
    // Fire-and-forget updates
    setHasAcknowledgedDisclaimer(true);
    setShowDisclaimer(false);

    // Request ATT after a short delay to ensure modal dismissal doesn't conflict
    setTimeout(() => {
      requestATT();
    }, 1000);
  };

  return (
    <>
      <MedicalDisclaimerModal
        visible={showDisclaimer}
        onAcknowledge={handleDisclaimerAck}
      />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(ibpTabs)" />

        <Stack.Screen
          name="Facility/[id]"
          options={{
            presentation: "card",
            animation: "slide_from_right",
          }}
        />

        <Stack.Screen
          name="(modal)"
          options={{
            presentation: "modal",
          }}
        />
      </Stack>
    </>
  );
};

export default AuthScreensLayout;
