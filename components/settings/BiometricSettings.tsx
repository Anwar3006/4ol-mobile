import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  Switch,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useBiometricAuth } from "@/hooks/use-biometric-auth";
import { CustomInput } from "@/components/CustomInput";
import * as Haptics from "expo-haptics";
import { authClient } from "@/lib/auth-Client";

export function BiometricSettings() {
  const {
    isAvailable,
    isEnrolled,
    isBiometricEnabled,
    biometricType,
    disableBiometric,
    enableBiometric,
    refreshBiometricStatus,
  } = useBiometricAuth();

  const [isToggling, setIsToggling] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Refresh status when component mounts or when isBiometricEnabled changes
  useEffect(() => {
    refreshBiometricStatus();
  }, []);

  // Don't show if biometric is not available
  if (!isAvailable || !isEnrolled) {
    return null;
  }

  const handleToggleBiometric = async (value: boolean) => {
    if (isToggling) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (value) {
        // Enabling biometric - show password modal
        setShowPasswordModal(true);
      } else {
        // Disabling biometric
        Alert.alert(
          "Disable Biometric Login?",
          "You will need to sign in with your password next time.",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Disable",
              style: "destructive",
              onPress: async () => {
                setIsToggling(true);
                try {
                  await disableBiometric();

                  // Wait a moment for SecureStore to complete
                  await new Promise((resolve) => setTimeout(resolve, 100));

                  // Refresh the status to ensure UI is in sync
                  await refreshBiometricStatus();

                  await Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success,
                  );

                  Alert.alert("Disabled", "Biometric login has been disabled.");
                } catch (error) {
                  console.error("Error disabling biometric:", error);
                  Alert.alert(
                    "Error",
                    "Failed to disable biometric login. Please try again.",
                  );
                } finally {
                  setIsToggling(false);
                }
              },
            },
          ],
        );
      }
    } catch (error) {
      console.error("Error toggling biometric:", error);
      Alert.alert("Error", "Unable to update biometric settings.");
      setIsToggling(false);
    }
  };

  const handleEnableBiometric = async () => {
    if (!password.trim()) {
      Alert.alert(
        "Password Required",
        "Please enter your password to continue.",
      );
      return;
    }

    setIsVerifying(true);

    try {
      // Get current user's email
      const session = await authClient.getSession();
      const userEmail = session?.data?.user?.email;

      if (!userEmail) {
        Alert.alert("Error", "Unable to get your email. Please sign in again.");
        setShowPasswordModal(false);
        setPassword("");
        setIsVerifying(false);
        return;
      }

      // Verify password by attempting to sign in
      const verifyResult = await authClient.signIn.email({
        email: userEmail,
        password: password,
      });

      if (verifyResult.error) {
        Alert.alert(
          "Incorrect Password",
          "The password you entered is incorrect. Please try again.",
        );
        setPassword("");
        setIsVerifying(false);
        return;
      }

      // Password is correct, enable biometric
      const success = await enableBiometric(userEmail, password);

      if (success) {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
        Alert.alert(
          "Success!",
          `${getBiometricName()} has been enabled. You can now use it to sign in.`,
        );
        setShowPasswordModal(false);
        setPassword("");
        await refreshBiometricStatus();
      } else {
        Alert.alert(
          "Setup Failed",
          "Unable to enable biometric authentication. Please try again.",
        );
      }
    } catch (error: any) {
      console.error("Error enabling biometric:", error);
      Alert.alert(
        "Error",
        error?.message ||
          "An error occurred while setting up biometric authentication.",
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const getBiometricName = () => {
    switch (biometricType) {
      case "facial":
        return "Face ID";
      case "fingerprint":
        return "Touch ID";
      case "iris":
        return "Iris Recognition";
      default:
        return "Biometric Login";
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

  return (
    <>
      <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-3">
              <Ionicons name={getBiometricIcon()} size={20} color="#16a34a" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-gray-900">
                {getBiometricName()}
              </Text>
              <Text className="text-sm text-gray-500">
                {isBiometricEnabled ? "Enabled" : "Disabled"}
              </Text>
            </View>
          </View>
          <Switch
            value={isBiometricEnabled}
            onValueChange={handleToggleBiometric}
            disabled={isToggling}
            trackColor={{ false: "#d1d5db", true: "#86efac" }}
            thumbColor={isBiometricEnabled ? "#16a34a" : "#f3f4f6"}
          />
        </View>

        {isBiometricEnabled && (
          <View className="mt-3 pt-3 border-t border-gray-100">
            <Text className="text-xs text-gray-500">
              Your credentials are stored securely on this device and are never
              sent to our servers.
            </Text>
          </View>
        )}
      </View>

      {/* Password Verification Modal */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!isVerifying) {
            setShowPasswordModal(false);
            setPassword("");
          }
        }}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-6">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <View className="items-center mb-4">
              <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center mb-3">
                <Ionicons name={getBiometricIcon()} size={32} color="#16a34a" />
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2">
                Enable {getBiometricName()}
              </Text>
              <Text className="text-sm text-gray-600 text-center">
                Enter your password to securely enable biometric login
              </Text>
            </View>

            <View className="mb-6">
              <CustomInput
                label="Password"
                placeholder="Enter your password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                icon="lock-closed-outline"
                autoFocus
              />
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  setShowPasswordModal(false);
                  setPassword("");
                }}
                disabled={isVerifying}
                className="flex-1 h-12 items-center justify-center rounded-xl bg-gray-100"
              >
                <Text className="text-gray-700 font-semibold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleEnableBiometric}
                disabled={isVerifying || !password.trim()}
                className={`flex-1 h-12 items-center justify-center rounded-xl ${
                  isVerifying || !password.trim()
                    ? "bg-green-300"
                    : "bg-green-600"
                }`}
              >
                {isVerifying ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold">Enable</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
