import React from "react";
import { View, Text, Modal, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

interface BiometricSetupPromptProps {
  visible: boolean;
  biometricType: "fingerprint" | "facial" | "iris" | null;
  onEnable: () => void;
  onLater: () => void;
}

export function BiometricSetupPrompt({
  visible,
  biometricType,
  onEnable,
  onLater,
}: BiometricSetupPromptProps) {
  const getBiometricInfo = () => {
    switch (biometricType) {
      case "facial":
        return {
          icon: "scan" as const,
          title: Platform.OS === "ios" ? "Enable Face ID" : "Enable Face Recognition",
          description: "Use your face to quickly and securely sign in to your account",
        };
      case "fingerprint":
        return {
          icon: "finger-print" as const,
          title: Platform.OS === "ios" ? "Enable Touch ID" : "Enable Fingerprint",
          description: "Use your fingerprint to quickly and securely sign in to your account",
        };
      case "iris":
        return {
          icon: "eye" as const,
          title: "Enable Iris Recognition",
          description: "Use iris recognition to quickly and securely sign in to your account",
        };
      default:
        return {
          icon: "shield-checkmark" as const,
          title: "Enable Biometric Login",
          description: "Use biometrics to quickly and securely sign in to your account",
        };
    }
  };

  const { icon, title, description } = getBiometricInfo();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <BlurView intensity={20} tint="dark" style={{ flex: 1 }}>
        <View className="flex-1 items-center justify-center px-6">
          {/* Card */}
          <View className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl">
            {/* Icon Section */}
            <View className="bg-green-50 pt-8 pb-6 items-center">
              <View className="w-20 h-20 rounded-full bg-green-100 items-center justify-center mb-4">
                <Ionicons name={icon} size={40} color="#16a34a" />
              </View>
              <Text className="text-2xl font-black text-gray-900">
                {title}
              </Text>
            </View>

            {/* Content */}
            <View className="p-6">
              <Text className="text-base text-gray-600 text-center leading-6 mb-6">
                {description}
              </Text>

              {/* Benefits */}
              <View className="space-y-3 mb-6">
                <BenefitItem icon="flash" text="Sign in instantly" />
                <BenefitItem icon="lock-closed" text="More secure than passwords" />
                <BenefitItem icon="shield-checkmark" text="Your data stays on device" />
              </View>

              {/* Buttons */}
              <View className="space-y-3">
                <TouchableOpacity
                  onPress={onEnable}
                  activeOpacity={0.8}
                  className="h-14 bg-green-600 rounded-2xl items-center justify-center shadow-sm"
                >
                  <Text className="text-white font-bold text-base">
                    Enable {Platform.OS === "ios" && biometricType === "facial" ? "Face ID" : 
                           Platform.OS === "ios" && biometricType === "fingerprint" ? "Touch ID" : 
                           "Biometric"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onLater}
                  activeOpacity={0.8}
                  className="h-14 bg-gray-100 rounded-2xl items-center justify-center"
                >
                  <Text className="text-gray-700 font-semibold text-base">
                    Maybe Later
                  </Text>
                </TouchableOpacity>
              </View>

              <Text className="text-xs text-gray-400 text-center mt-4">
                You can change this anytime in settings
              </Text>
            </View>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

function BenefitItem({ icon, text }: { icon: any; text: string }) {
  return (
    <View className="flex-row items-center">
      <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-3">
        <Ionicons name={icon} size={16} color="#16a34a" />
      </View>
      <Text className="text-sm text-gray-700 flex-1">{text}</Text>
    </View>
  );
}
