import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as Haptics from "expo-haptics";
import { cn } from "@/lib/utils";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSignUpStore } from "@/store/use-signupStore";
import Constants from "expo-constants";

const CODE_LENGTH = 6;

export default function OTPForm() {
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const router = useRouter();
  const { phoneNumber } = useLocalSearchParams<{ phoneNumber: string }>();

  // Auto-focus on mount
  useEffect(() => {
    if (phoneNumber) {
      useSignUpStore.getState().setPhoneNumber(phoneNumber);
    }
    setTimeout(() => inputRef.current?.focus(), 500);
  }, [phoneNumber]);

  const handleTextChange = (text: string) => {
    setCode(text);
    setError(null);
    if (text.length === CODE_LENGTH) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      handleVerify(text);
    }
  };

  const handleVerify = async (otp: string) => {
    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phoneNumber,
            otp,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to verify OTP");
      }

      // Success! Navigate to next screen (e.g., complete registration)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Phone number verified successfully!");
      // TODO: Navigate to the next step in registration
      router.push("/(app)/(public)/SignUp");
    } catch (err: any) {
      console.error("Verify OTP error:", err);
      setError(err.message || "Invalid verification code. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setCode(""); // Clear the code on error
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/send-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phoneNumber }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to resend OTP");
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "A new verification code has been sent!");
    } catch (err: any) {
      console.error("Resend OTP error:", err);
      setError(err.message || "Failed to resend code. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View className="w-full items-center gap-y-8">
      {/* Hidden input to handle keyboard and focus */}
      <TextInput
        ref={inputRef}
        value={code}
        onChangeText={handleTextChange}
        maxLength={CODE_LENGTH}
        keyboardType="number-pad"
        textContentType="oneTimeCode" // Enables iOS "From Messages" autofill
        autoFocus
        style={{ opacity: 0, position: "absolute", width: 1 }}
      />

      {/* Visual Boxes */}
      <Pressable
        onPress={() => inputRef.current?.focus()}
        className="flex-row justify-between w-full gap-x-2"
      >
        {Array.from({ length: CODE_LENGTH }).map((_, index) => {
          const char = code[index];
          const isFocused = code.length === index;

          return (
            <View
              key={index}
              className={cn(
                "h-16 flex-1 rounded-2xl border bg-white/5 items-center justify-center transition-all",
                isFocused
                  ? "border-green-500 bg-white/10 scale-105 shadow-lg shadow-green-500/20"
                  : "border-gray-400",
                char ? "border-green-500/50" : "",
              )}
            >
              <Text className="text-2xl font-black text-black">
                {char || (isFocused ? "" : "•")}
              </Text>
            </View>
          );
        })}
      </Pressable>

      {error && (
        <View className="w-full p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <Text className="text-red-500 text-center">{error}</Text>
        </View>
      )}

      <View className="items-center gap-y-4 w-full">
        <TouchableOpacity
          disabled={isVerifying || code.length !== CODE_LENGTH}
          onPress={() => handleVerify(code)}
          className={cn(
            "h-16 w-full rounded-2xl flex-row items-center justify-center shadow-xl transition-all",
            code.length === CODE_LENGTH
              ? "bg-green-600 shadow-green-900"
              : "bg-gray-800 opacity-50",
          )}
        >
          {isVerifying ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-lg font-bold text-white uppercase tracking-widest">
              Verify & Continue
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResend} disabled={isResending}>
          <Text className="text-gray-400 font-medium">
            Didn't receive the code?{" "}
            {isResending ? (
              <ActivityIndicator size="small" color="#10b981" />
            ) : (
              <Text className="text-green-500 font-bold underline">Resend</Text>
            )}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
