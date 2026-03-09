import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const BusinessSettings = () => {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-6 py-4 border-b border-slate-50">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-slate-900">Business Settings</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-8">
        <View className="items-center mb-10">
          <View className="bg-emerald-50 w-20 h-20 rounded-3xl items-center justify-center mb-4">
            <Ionicons name="business" size={40} color="#10b981" />
          </View>
          <Text className="text-2xl font-black text-slate-800 text-center">Manage Your Enterprise</Text>
          <Text className="text-slate-500 font-medium text-center mt-2 px-4">
            Update your business profile, notification preferences, and employee access.
          </Text>
        </View>

        <View className="gap-4">
          <MenuOption icon="person-outline" label="Company Profile" subText="Name, Logo, and Address" />
          <MenuOption icon="notifications-outline" label="Push Notifications" subText="Manage alerts for bookings and ratings" />
          <MenuOption icon="people-outline" label="Team Members" subText="Manage access for your staff" />
          <MenuOption icon="shield-checkmark-outline" label="Security" subText="Two-factor authentication and passwords" />
        </View>

        <View className="mt-12 bg-slate-50 p-6 rounded-[32px] border border-slate-100">
           <Text className="text-slate-400 font-bold text-center italic">
             Additional enterprise settings will be unlocked once your business is verified.
           </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const MenuOption = ({ icon, label, subText }: any) => (
  <TouchableOpacity className="bg-slate-50 p-5 rounded-[24px] flex-row items-center border border-slate-100">
    <View className="bg-white p-3 rounded-2xl mr-4 shadow-sm">
      <Ionicons name={icon} size={22} color="#64748b" />
    </View>
    <View className="flex-1">
      <Text className="text-slate-800 font-bold text-lg">{label}</Text>
      <Text className="text-slate-500 font-medium text-xs">{subText}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
  </TouchableOpacity>
);

export default BusinessSettings;
