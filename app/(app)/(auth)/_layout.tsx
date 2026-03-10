import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { Platform } from "react-native";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import useUserStore from "@/store/use-userstore";
import { MedicalDisclaimerModal } from "@/components/auth/MedicalDisclaimerModal";

// ATT is iOS-only. Calling it on Android blocks the UI thread.
// Fire-and-forget — we never await this in a button handler.
const requestATT = () => {
  if (Platform.OS === "ios") {
    requestTrackingPermissionsAsync().catch(() => {
      // ATT errors are non-fatal — ignore silently
    });
  }
};

const AuthScreensLayout = () => {
  // 1. Destructure _hasHydrated from the store
  const { 
    hasAcknowledgedDisclaimer, 
    setHasAcknowledgedDisclaimer, 
    _hasHydrated 
  } = useUserStore();
  
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  // useEffect(() => {
  //   // 2. Use the correctly destructured variable
  //   if (_hasHydrated && !hasAcknowledgedDisclaimer) {
  //     setShowDisclaimer(true);
  //   }
  // }, [_hasHydrated, hasAcknowledgedDisclaimer]);

  // 3. Prevent rendering the Stack until hydration is complete
  if (!_hasHydrated) {
    return null; 
  }

  const handleDisclaimerAck = () => {
    setHasAcknowledgedDisclaimer(true);
    setShowDisclaimer(false);
    requestATT();
  };

  return (
    <>
      {/* <MedicalDisclaimerModal
        visible={showDisclaimer}
        onAcknowledge={handleDisclaimerAck}
      /> */}
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(ibpTabs)" options={{ headerShown: false }} />

        <Stack.Screen
          name="Facility/[id]"
          options={{
            headerShown: false,
            presentation: "card",
            animation: "slide_from_right",
          }}
        />

        <Stack.Screen
          name="(modal)"
          options={{
            presentation: "modal",
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
};

export default AuthScreensLayout;
