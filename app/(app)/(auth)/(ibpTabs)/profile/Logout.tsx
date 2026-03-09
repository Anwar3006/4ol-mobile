import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { authClient } from "@/lib/auth-client";
import { useBiometricAuth } from "@/hooks/use-biometric-auth";
import { useState } from "react";
import { Alert } from "react-native";

export default function MerchantLogoutCard() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { disableBiometric } = useBiometricAuth();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      // Disable biometrics and clear credentials to prevent auto-login glitch
      try {
        await disableBiometric();
      } catch (biometricError) {
        Alert.alert(
          `Failed to disable biometrics during logout,  ${biometricError}`,
        );
      }

      // Clear server session and local auth state
      await authClient.signOut();
      // The AuthProvider will handle the navigation to Login based on session state
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  };

  return (
    <View className="flex-1 items-center justify-center px-6">
      {/* Dimmed Background Backdrop */}
      <Animated.View
        entering={FadeIn.duration(300)}
        className="absolute inset-0 bg-black/60"
      >
        <Pressable
          className="flex-1"
          onPress={() => !isLoggingOut && router.back()}
        />
      </Animated.View>

      {/* The Logout Card */}
      <Animated.View
        entering={ZoomIn.duration(300).springify().damping(60)}
        className="w-full max-w-[340px] bg-white rounded-[40px] p-8 items-center shadow-2xl"
      >
        {/* Icon - Changes based on state */}
        {isLoggingOut ? (
          <View className="bg-gray-50 p-5 rounded-full mb-6">
            <ActivityIndicator size="large" color="#6b7280" />
          </View>
        ) : (
          <View className="bg-red-50 p-5 rounded-full mb-6">
            <Ionicons name="log-out" size={32} color="#ef4444" />
          </View>
        )}

        <Text className="text-2xl font-black text-slate-900 mb-2">
          {isLoggingOut ? "Logging Out..." : "Sign Out?"}
        </Text>

        <Text className="text-gray-500 text-center text-base leading-5 mb-8">
          {isLoggingOut
            ? "Closing your merchant session securely..."
            : "Are you sure you want to sign out of your merchant account?"}
        </Text>

        {isLoggingOut ? (
          <View className="w-full h-14 items-center justify-center rounded-2xl bg-gray-100">
            <Text className="font-semibold text-gray-500">Processing...</Text>
          </View>
        ) : (
          <View className="flex-col gap-y-3 w-full">
            <TouchableOpacity
              onPress={handleLogout}
              activeOpacity={0.8}
              className="w-full h-14 items-center justify-center rounded-2xl bg-red-500"
            >
              <Text className="font-bold text-white text-lg">
                Yes, Sign Me Out
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              className="w-full h-14 items-center justify-center rounded-2xl bg-gray-50 border border-gray-100"
            >
              <Text className="font-bold text-slate-600">Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </View>
  );
}
