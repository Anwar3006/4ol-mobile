import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import useUserStore from "@/store/use-userstore";
import { MedicalDisclaimerModal } from "@/components/auth/MedicalDisclaimerModal";


const AuthScreensLayout = () => {
  const { hasAcknowledgedDisclaimer, setHasAcknowledgedDisclaimer } =
    useUserStore();
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    const initCompliance = async () => {
      if (!hasAcknowledgedDisclaimer) {
        setShowDisclaimer(true);
      } else {
        // If already acknowledged, check/request ATT
        await requestTrackingPermissionsAsync();
      }
    };
    initCompliance();
  }, [hasAcknowledgedDisclaimer]);

  const handleDisclaimerAck = async () => {
    setHasAcknowledgedDisclaimer(true);
    setShowDisclaimer(false);
    // Request ATT immediately after acknowledgment
    await requestTrackingPermissionsAsync();
  };


  return (
    <>
      <MedicalDisclaimerModal
        visible={showDisclaimer}
        onAcknowledge={handleDisclaimerAck}
      />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(ibpTabs)" options={{ headerShown: false }} />

        {/* Full-Screen Routes */}
        <Stack.Screen
          name="Facility/[id]"
          options={{
            headerShown: false,
            presentation: "card", // Standard push navigation
            animation: "slide_from_right",
          }}
        />

        {/* Modal Routes */}
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

// We can handle switching between IBPs and Personal account.
// We wil look at the security side: App must be fully secure and robust. What
