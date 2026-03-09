import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

interface EnableBiometricsPromptProps {
  visible: boolean;
  biometricType: "facial" | "fingerprint" | "iris" | null;
  onEnable: () => void;
  onSkip: () => void;
}

export function EnableBiometricsPrompt({
  visible,
  biometricType,
  onEnable,
  onSkip,
}: EnableBiometricsPromptProps) {
  const getBiometricInfo = () => {
    if (Platform.OS === "ios") {
      if (biometricType === "facial") {
        return {
          icon: "scan" as const,
          title: "Enable Face ID",
          description: "Use Face ID to login quickly and securely",
        };
      }
      return {
        icon: "finger-print" as const,
        title: "Enable Touch ID",
        description: "Use Touch ID to login quickly and securely",
      };
    }
    
    return {
      icon: "finger-print" as const,
      title: "Enable Biometric Login",
      description: "Use your fingerprint to login quickly and securely",
    };
  };

  const { icon, title, description } = getBiometricInfo();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onSkip}
    >
      <View style={styles.overlay}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} />
        
        <View style={styles.container}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={64} color="#16a34a" />
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Description */}
          <Text style={styles.description}>{description}</Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={onEnable}
              style={styles.enableButton}
              activeOpacity={0.8}
            >
              <Text style={styles.enableButtonText}>Enable</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onSkip}
              style={styles.skipButton}
              activeOpacity={0.7}
            >
              <Text style={styles.skipButtonText}>Not Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 32,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  enableButton: {
    backgroundColor: "#16a34a",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  enableButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  skipButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  skipButtonText: {
    color: "#6b7280",
    fontSize: 16,
    fontWeight: "600",
  },
});
