import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import EditUserInfoForm from "@/components/myaccount/EditUserInfoForm";

const UserProfile = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const isLargeScreen = width > 600;

  return (
    <View className="flex-1 bg-white">
      <View
        style={{ paddingTop: insets.top + 10 }}
        className="flex-row items-center justify-between px-6 pb-8 bg-white"
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#334155" />
        </TouchableOpacity>

        <Text className="text-xl font-black text-slate-800">User Profile</Text>

        <View className="w-6" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: isLargeScreen ? width * 0.2 : 24,
        }}
      >
        <EditUserInfoForm />
      </ScrollView>
    </View>
  );
};

export default UserProfile;
