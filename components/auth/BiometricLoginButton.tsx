import React, { useState } from "react";
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useBiometricAuth } from "@/hooks/use-biometric-auth";
import * as Haptics from "expo-haptics";

interface BiometricLoginButtonProps {
  onSuccess: (credentials: { email: string; password: string }) => void;
}

export function BiometricLoginButton({ onSuccess }: BiometricLoginButtonProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const {
    isAvailable,
    isEnrolled,
    isBiometricEnabled,
    biometricType,
    authenticate,
    getStoredCredentials,
  } = useBiometricAuth();

  // Don't show button if biometric is not available or not enabled
  if (!isAvailable || !isEnrolled || !isBiometricEnabled) {
    return null;
  }

  const handleBiometricLogin = async () => {
    try {
      setIsAuthenticating(true);

      // Trigger haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Authenticate with biometrics
      const success = await authenticate();

      if (success) {
        // Get stored credentials
        const credentials = await getStoredCredentials();

        if (credentials) {
          // Success haptic
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
          onSuccess(credentials);
        } else {
          // Error: credentials not found
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error
          );
          Alert.alert(
            "Error",
            "Biometric credentials not found. Please sign in with your password."
          );
        }
      } else {
        // Authentication failed or cancelled
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      console.error("Biometric login error:", error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Authentication Failed",
        "Unable to authenticate with biometrics. Please try again."
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  const getBiometricLabel = () => {
    switch (biometricType) {
      case "facial":
        return "Use Face ID";
      case "fingerprint":
        return "Use Touch ID";
      case "iris":
        return "Use Iris";
      default:
        return "Use Biometric Login";
    }
  };

  const getBiometricIcon = () => {
    switch (biometricType) {
      case "facial":
        return "scan";
      case "fingerprint":
        return "finger-print";
      case "iris":
        return "eye";
      default:
        return "shield-checkmark";
    }
  };

  console.log("Biometrics -> ", isAvailable, isEnrolled, isBiometricEnabled);

  return (
    <TouchableOpacity
      onPress={handleBiometricLogin}
      disabled={isAuthenticating}
      activeOpacity={0.7}
      className="mt-1 items-center"
    >
      <View className="flex-row items-center bg-green-50 px-6 py-4 rounded-2xl border border-green-200">
        {isAuthenticating ? (
          <ActivityIndicator size="small" color="#16a34a" />
        ) : (
          <Ionicons name={getBiometricIcon()} size={24} color="#16a34a" />
        )}
        <Text className="text-green-700 font-bold text-base ml-3">
          {isAuthenticating ? "Authenticating..." : getBiometricLabel()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
