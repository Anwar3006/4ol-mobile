import { useState, useEffect } from "react";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import * as Sentry from "@sentry/react-native";

const BIOMETRIC_ENABLED_KEY = "biometric_enabled";
const BIOMETRIC_USER_EMAIL_KEY = "biometric_user_email";

export type BiometricType = "fingerprint" | "facial" | "iris" | null;

export function useBiometrics() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricType>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          checkBiometricAvailability(),
          checkBiometricEnabled()
        ]);
      } catch (error) {
        console.error("Biometric initialization error:", error);
        Sentry.captureException(error, {
          tags: { section: "biometrics", action: "initialization" },
        });
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  /**
   * Check if biometric authentication is available on device
   */
  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        setIsAvailable(false);
        return;
      }

      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        setIsAvailable(false);
        return;
      }

      // Get biometric types available
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType("facial");
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType("fingerprint");
      } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        setBiometricType("iris");
      }

      setIsAvailable(true);
    } catch (error) {
      console.error("Error checking biometric availability:", error);
      Sentry.captureException(error, {
        tags: { section: "biometrics", action: "check_availability" },
      });
      setIsAvailable(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Check if user has enabled biometrics for this app
   */
  const checkBiometricEnabled = async () => {
    try {
      const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
      setIsEnabled(enabled === "true");
    } catch (error) {
      console.error("Error checking biometric status:", error);
      Sentry.captureException(error, {
        tags: { section: "biometrics", action: "check_status" },
      });
      setIsEnabled(false);
    }
  };

  /**
   * Enable biometric authentication for user
   */
  const enableBiometrics = async (email: string): Promise<boolean> => {
    try {
      await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, "true");
      await SecureStore.setItemAsync(BIOMETRIC_USER_EMAIL_KEY, email);
      setIsEnabled(true);
      return true;
    } catch (error) {
      console.error("Error enabling biometrics:", error);
      return false;
    }
  };

  /**
   * Disable biometric authentication
   */
  const disableBiometrics = async (): Promise<boolean> => {
    try {
      await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
      await SecureStore.deleteItemAsync(BIOMETRIC_USER_EMAIL_KEY);
      setIsEnabled(false);
      return true;
    } catch (error) {
      console.error("Error disabling biometrics:", error);
      return false;
    }
  };

  /**
   * Authenticate with biometrics
   */
  const authenticate = async (): Promise<{
    success: boolean;
    email?: string;
    error?: string;
  }> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to login",
        fallbackLabel: "Use passcode",
        cancelLabel: "Cancel",
        disableDeviceFallback: false,
      });

      if (result.success) {
        // Get stored email
        const email = await SecureStore.getItemAsync(BIOMETRIC_USER_EMAIL_KEY);
        if (!email) {
          return {
            success: false,
            error: "No user found. Please login with email and password.",
          };
        }

        return { success: true, email };
      } else {
        return {
          success: false,
          error: result.error || "Authentication failed",
        };
      }
    } catch (error: any) {
      console.error("Biometric authentication error:", error);
      Sentry.captureException(error, {
        tags: { section: "biometrics", action: "authenticate" },
      });
      return {
        success: false,
        error: error.message || "Authentication failed",
      };
    }
  };

  /**
   * Get biometric type name for display
   */
  const getBiometricName = (): string => {
    if (Platform.OS === "ios") {
      return biometricType === "facial" ? "Face ID" : "Touch ID";
    }
    return "Biometric";
  };

  return {
    isAvailable,
    isEnabled,
    isLoading,
    biometricType,
    biometricName: getBiometricName(),
    enableBiometrics,
    disableBiometrics,
    authenticate,
  };
}
