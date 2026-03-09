import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useUserMode } from "@/store/useUserMode";
import useUserStore from "@/store/use-userstore";
import { router } from "expo-router";
import { ProfileCompletionModal } from "@/components/auth/ProfileCompletionModal";
import { useState } from "react";

const IBPProfile = () => {
  const { setMode } = useUserMode();
  const { user, logoutUser } = useUserStore();
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const handleSwitchToPersonal = () => {
    if (user?.role === "super_admin") {
      setMode("user");
      // router.replace("/(app)/(auth)/(tabs)/Home");
      return;
    }

    if (user?.user_type === "business_provider") {
      const isComplete = user.sex && user.dob && user.phone_number;
      if (!isComplete) {
        setShowCompletionModal(true);
        return;
      }
    }

    // Navigate first from valid context before AuthProvider's useEffect fires.
    setMode("user");
    router.replace("/(app)/(auth)/(tabs)/Home");
  };

  const handleLogoutPress = () => {
    router.push("/(app)/(auth)/(ibpTabs)/profile/Logout" as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6">
        <View className="mt-8 mb-8 items-center">
          <View className="bg-slate-100 w-24 h-24 rounded-full items-center justify-center mb-4">
            <Text className="text-slate-400 text-3xl font-black">
              {user?.first_name?.substring(0, 1) || "B"}
            </Text>
          </View>
          <Text className="text-2xl font-black text-slate-900">
            {user?.first_name} {user?.last_name}
          </Text>
          <Text className="text-slate-500 font-bold">
            Facility Administrator
          </Text>
        </View>

        <View className="gap-3">
          <TouchableOpacity
            onPress={handleSwitchToPersonal}
            className="bg-emerald-600 p-5 rounded-[24px] flex-row items-center shadow-lg shadow-emerald-100"
          >
            <Ionicons name="swap-horizontal" size={24} color="white" />
            <Text className="text-white font-black text-lg ml-3">
              Switch to Resident Mode
            </Text>
          </TouchableOpacity>

          <View className="h-4" />

          <TouchableOpacity
            onPress={() =>
              router.push("/(app)/(auth)/(ibpTabs)/profile/Business/Settings")
            }
            className="bg-slate-50 p-5 rounded-[24px] flex-row items-center border border-slate-100"
          >
            <Ionicons name="settings-outline" size={24} color="#64748b" />
            <Text className="text-slate-800 font-bold text-lg ml-3">
              Business Settings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              router.push("/(app)/(auth)/(ibpTabs)/profile/Business/Billing")
            }
            className="bg-slate-50 p-5 rounded-[24px] flex-row items-center border border-slate-100"
          >
            <Ionicons name="card-outline" size={24} color="#64748b" />
            <Text className="text-slate-800 font-bold text-lg ml-3">
              Billing & Invoices
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              router.push("/(app)/(auth)/(ibpTabs)/profile/Business/Support")
            }
            className="bg-slate-50 p-5 rounded-[24px] flex-row items-center border border-slate-100"
          >
            <Ionicons name="help-circle-outline" size={24} color="#64748b" />
            <Text className="text-slate-800 font-bold text-lg ml-3">
              Business Support
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogoutPress}
            className="mt-4 bg-rose-50 p-5 rounded-[24px] flex-row items-center border border-rose-100"
          >
            <Ionicons name="log-out-outline" size={24} color="#e11d48" />
            <Text className="text-rose-600 font-bold text-lg ml-3">Logout</Text>
          </TouchableOpacity>
        </View>

        <ProfileCompletionModal
          visible={showCompletionModal}
          onClose={() => setShowCompletionModal(false)}
          onSuccess={() => {
            setShowCompletionModal(false);
            setMode("user");
            router.replace("/(app)/(auth)/(tabs)/Home");
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default IBPProfile;
