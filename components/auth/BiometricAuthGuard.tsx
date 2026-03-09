import React, { useCallback, useEffect, useRef, useState } from "react";
import { AppState, View, Text, Modal, TouchableOpacity } from "react-native";
import { useBiometricAuth } from "@/hooks/use-biometric-auth";
import { Ionicons } from "@expo/vector-icons";

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

export const BiometricAuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAvailable, isEnrolled, authenticate, biometricType } = useBiometricAuth();
  const [isLocked, setIsLocked] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const isAuthenticatingRef = useRef(false);
  const appState = useRef(AppState.currentState);
  const lastBackgroundTime = useRef<number | null>(null);

  const handleAuthentication = useCallback(async () => {
    if (isAuthenticatingRef.current) return;

    // If biometrics not available or not enrolled, we can't lock the user out
    // For now, if not available, we let them through.
    if (!isAvailable || !isEnrolled) {
      setIsLocked(false);
      return;
    }

    setIsAuthenticating(true);
    isAuthenticatingRef.current = true;
    const success = await authenticate();
    if (success) {
      setIsLocked(false);
    } else {
      setIsLocked(true);
    }
    setIsAuthenticating(false);
    isAuthenticatingRef.current = false;
  }, [isAvailable, isEnrolled, authenticate]);

  // Handle initial auth on mount
  useEffect(() => {
    if (isAvailable && isEnrolled) {
      setIsLocked(true);
      handleAuthentication();
    }
  }, [isAvailable, isEnrolled, handleAuthentication]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/active/) &&
        (nextAppState === "background" || nextAppState === "inactive")
      ) {
        lastBackgroundTime.current = Date.now();
      }

      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        const now = Date.now();
        if (lastBackgroundTime.current) {
          const elapsed = now - lastBackgroundTime.current;

          // Implementation of "relogin after the app is closed for 5 minutes"
          // We use the 5 minute threshold for background -> foreground transitions.
          // For "close and reopen" (app kill), the mount useEffect handles it.
          const shouldLock = elapsed >= INACTIVITY_TIMEOUT;

          if (shouldLock) {
            setIsLocked(true);
            handleAuthentication();
          }
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [handleAuthentication]);

  return (
    <View style={{ flex: 1 }}>
      {children}
      {isLocked && (
        <Modal visible={isLocked} transparent animationType="fade">
          <View className="flex-1 bg-slate-900/98 items-center justify-center px-8">
            <View className="bg-white p-8 rounded-[40px] items-center shadow-2xl w-full max-w-sm">
              <View className="bg-green-100 p-6 rounded-full mb-6">
                <Ionicons
                    name={biometricType === "facial" ? "scan" : "finger-print"}
                    size={60}
                    color="#10b981"
                />
              </View>
              <Text className="text-2xl font-black text-slate-900 mb-2 text-center">
                Security Check
              </Text>
              <Text className="text-slate-500 text-center mb-8 font-medium">
                {biometricType === "facial"
                  ? "Scan your face to continue to 4OL."
                  : "Use your fingerprint to continue to 4OL."}
              </Text>

              <TouchableOpacity
                className="bg-green-600 w-full p-4 rounded-2xl items-center shadow-lg shadow-green-200"
                onPress={handleAuthentication}
                disabled={isAuthenticating}
              >
                <Text className="text-white font-bold text-lg">
                  {isAuthenticating ? "Verifying..." : "Authenticate"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};
