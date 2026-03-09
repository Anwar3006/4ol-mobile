import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { useState, useEffect, useCallback } from "react";
import { Platform } from "react-native";
import * as Sentry from "@sentry/react-native";

// Storage keys
const BIOMETRIC_ENABLED_KEY = "biometric_enabled";
const STORED_EMAIL_KEY = "biometric_email";
const STORED_PASSWORD_KEY = "biometric_password";

export type BiometricType = "fingerprint" | "facial" | "iris" | null;

interface BiometricAuthHook {
  isAvailable: boolean;
  isEnrolled: boolean;
  biometricType: BiometricType;
  isBiometricEnabled: boolean;
  authenticate: () => Promise<boolean>;
  enableBiometric: (email: string, password: string) => Promise<boolean>;
  disableBiometric: () => Promise<void>;
  getStoredCredentials: () => Promise<{ email: string; password: string } | null>;
  checkBiometricSupport: () => Promise<void>;
  refreshBiometricStatus: () => Promise<void>;
}

export function useBiometricAuth(): BiometricAuthHook {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricType>(null);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  // Check biometric support on mount
  useEffect(() => {
    checkBiometricSupport();
    checkIfBiometricEnabled();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      // Check if device has biometric hardware
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsAvailable(compatible);

      if (compatible) {
        // Check if user has enrolled biometrics
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setIsEnrolled(enrolled);

        // Get biometric type
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType("facial");
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType("fingerprint");
        } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
          setBiometricType("iris");
        }
      }
    } catch (error) {
      console.error("Error checking biometric support:", error);
      Sentry.captureException(error, {
        tags: { section: "biometrics", action: "check_support" },
      });
      setIsAvailable(false);
    }
  };

  const checkIfBiometricEnabled = async () => {
    try {
      const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
      setIsBiometricEnabled(enabled === "true");
    } catch (error) {
      console.error("Error checking biometric enabled status:", error);
    }
  };

  /**
   * Refresh biometric status - useful after toggling
   */
  const refreshBiometricStatus = useCallback(async () => {
    await checkIfBiometricEnabled();
  }, []);

  /**
   * Authenticate user with biometrics
   * ALWAYS shows native biometric prompt
   */
  const authenticate = useCallback(async (): Promise<boolean> => {
    try {
      if (!isAvailable || !isEnrolled) {
        console.warn("Biometric not available or not enrolled");
        return false;
      }

      const biometricName = getBiometricName(biometricType);
      
      // IMPORTANT: This ALWAYS shows the native biometric prompt
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Use ${biometricName} to sign in`,
        fallbackLabel: "Use passcode",
        cancelLabel: "Cancel",
        disableDeviceFallback: false, // Allow device passcode as fallback
      });

      console.log("Biometric authentication result:", result);
      return result.success;
    } catch (error) {
      console.error("Biometric authentication error:", error);
      Sentry.captureException(error, {
        tags: { section: "biometrics", action: "authenticate_hook" },
      });
      return false;
    }
  }, [isAvailable, isEnrolled, biometricType]);

  /**
   * Enable biometric authentication and store credentials securely
   */
  const enableBiometric = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      if (!isAvailable || !isEnrolled) {
        console.warn("Biometric not available or not enrolled");
        return false;
      }

      // IMPORTANT: Show native prompt to confirm enabling
      const authenticated = await authenticate();
      
      if (!authenticated) {
        console.log("User cancelled or authentication failed");
        return false;
      }

      console.log("Storing biometric credentials...");

      // Store credentials securely
      await SecureStore.setItemAsync(STORED_EMAIL_KEY, email);
      await SecureStore.setItemAsync(STORED_PASSWORD_KEY, password);
      await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, "true");
      
      // Update state immediately
      setIsBiometricEnabled(true);
      
      console.log("Biometric credentials stored successfully");
      return true;
    } catch (error) {
      console.error("Error enabling biometric:", error);
      Sentry.captureException(error, {
        tags: { section: "biometrics", action: "enable_biometric" },
      });
      return false;
    }
  };

  /**
   * Disable biometric authentication and clear stored credentials
   */
  const disableBiometric = async (): Promise<void> => {
    try {
      console.log("Disabling biometric authentication...");
      
      // Delete all biometric data
      await SecureStore.deleteItemAsync(STORED_EMAIL_KEY);
      await SecureStore.deleteItemAsync(STORED_PASSWORD_KEY);
      await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
      
      // IMPORTANT: Update state immediately
      setIsBiometricEnabled(false);
      
      console.log("Biometric authentication disabled successfully");
    } catch (error) {
      console.error("Error disabling biometric:", error);
      // Even if there's an error, try to update the state
      setIsBiometricEnabled(false);
      throw error; // Re-throw so the UI can handle it
    }
  };

  /**
   * Get stored credentials after successful biometric authentication
   */
  const getStoredCredentials = async (): Promise<{
    email: string;
    password: string;
  } | null> => {
    try {
      const email = await SecureStore.getItemAsync(STORED_EMAIL_KEY);
      const password = await SecureStore.getItemAsync(STORED_PASSWORD_KEY);

      if (email && password) {
        return { email, password };
      }

      console.warn("Stored credentials not found");
      return null;
    } catch (error) {
      console.error("Error getting stored credentials:", error);
      return null;
    }
  };

  return {
    isAvailable,
    isEnrolled,
    biometricType,
    isBiometricEnabled,
    authenticate,
    enableBiometric,
    disableBiometric,
    getStoredCredentials,
    checkBiometricSupport,
    refreshBiometricStatus,
  };
}

/**
 * Get user-friendly name for biometric type
 */
function getBiometricName(type: BiometricType): string {
  switch (type) {
    case "facial":
      return Platform.OS === "ios" ? "Face ID" : "Face Recognition";
    case "fingerprint":
      return Platform.OS === "ios" ? "Touch ID" : "Fingerprint";
    case "iris":
      return "Iris Recognition";
    default:
      return "Biometric";
  }
}

/**
 * Get icon name for biometric type
 */
export function getBiometricIcon(type: BiometricType): string {
  switch (type) {
    case "facial":
      return "face-recognition";
    case "fingerprint":
      return "fingerprint";
    case "iris":
      return "eye";
    default:
      return "shield-checkmark";
  }
}
