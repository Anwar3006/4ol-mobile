import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { Platform } from "react-native";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import useUserStore from "@/store/use-userstore";
import { MedicalDisclaimerModal } from "@/components/auth/MedicalDisclaimerModal";

/**
 * ATT is iOS-only.
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
    // Only proceed if hydration is complete AND user is authenticated
    // The disclaimer should only show once per account registration.
    if (_hasHydrated && user && !hasAcknowledgedDisclaimer) {
      const timer = setTimeout(() => {
        setShowDisclaimer(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [_hasHydrated, hasAcknowledgedDisclaimer, !!user]);

  // 2. Prevent rendering the Stack until hydration is complete
  if (!_hasHydrated) {
    return null; 
  }

  const handleDisclaimerAck = () => {
    setHasAcknowledgedDisclaimer(true);
    setShowDisclaimer(false);

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
