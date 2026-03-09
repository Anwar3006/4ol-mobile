import { View, Text, Pressable } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import ChangePasswordForm from "@/components/myaccount/ChangePasswordForm";

const PasswordManagerCard = () => {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center px-6">
      {/* Dimmed Background Backdrop */}
      <Animated.View
        entering={FadeIn.duration(300)}
        className="absolute inset-0 bg-black/60"
      >
        <Pressable className="flex-1" onPress={() => router.back()} />
      </Animated.View>

      <Animated.View
        entering={ZoomIn.duration(300).springify().damping(60)}
        className="w-full max-w-[340px] bg-white rounded-[40px] p-8 items-center shadow-2xl"
      >
        {/* Warning Icon */}
        <View className="bg-green-50 p-5 rounded-full mb-6">
          <Ionicons name="shield-checkmark" size={32} color="#10b981" />
        </View>

        <Text className="text-2xl font-black text-slate-900 mb-5">
          Password Manager
        </Text>

        <ChangePasswordForm />
      </Animated.View>
    </View>
  );
};

export default PasswordManagerCard;
