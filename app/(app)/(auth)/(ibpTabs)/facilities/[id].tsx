import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFacilityProfile } from "@/hooks/use-facilities";

const ManageFacility = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: facility, isLoading } = useFacilityProfile({ id, enabled: !!id });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6">
        {/* Header */}
        <View className="flex-row items-center justify-between mt-6 mb-8">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#0f172a" />
          </TouchableOpacity>
          <Text className="text-xl font-black text-slate-900">Manage Facility</Text>
          <TouchableOpacity className="bg-slate-100 p-2 rounded-xl">
             <Ionicons name="settings-outline" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View className="bg-emerald-600 p-6 rounded-[32px] mb-8 shadow-lg shadow-emerald-100">
           <Text className="text-white text-2xl font-black">{facility?.facility_name}</Text>
           <Text className="text-emerald-100 font-bold mt-1 uppercase text-xs tracking-widest">
             {facility?.facility_type} • {facility?.status}
           </Text>
           <View className="flex-row mt-6 gap-4">
              <View className="bg-white/20 px-4 py-2 rounded-2xl">
                 <Text className="text-white font-bold text-xs">Edit Info</Text>
              </View>
              <View className="bg-white/20 px-4 py-2 rounded-2xl">
                 <Text className="text-white font-bold text-xs">View Public</Text>
              </View>
           </View>
        </View>

        {/* Management Actions */}
        <Text className="text-xl font-black text-slate-900 mb-4">Administration</Text>
        <View className="gap-4 mb-4">
           <ControlTile icon="calendar" label="Appointment Slots" subText="Manage your booking availability" />
           <ControlTile icon="people" label="Staff Members" subText="Assign roles to your employees" />
           <ControlTile icon="pricetags" label="Offerings & Pricing" subText="Subscriptions and package deals" />
           <ControlTile icon="stats-chart" label="Revenue Analytics" subText="Track your earnings this month" />
        </View>

        <TouchableOpacity className="mt-4 bg-rose-50 p-6 rounded-[32px] border border-rose-100 flex-row items-center mb-10">
           <Ionicons name="power" size={24} color="#e11d48" />
           <Text className="text-rose-600 font-black text-lg ml-3">Temporarily Deactivate</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const ControlTile = ({ icon, label, subText }: any) => (
  <TouchableOpacity className="bg-slate-50 border border-slate-100 p-6 rounded-[32px] flex-row items-center">
    <View className="bg-white p-3 rounded-2xl mr-4 shadow-sm">
      <Ionicons name={icon} size={24} color="#059669" />
    </View>
    <View className="flex-1">
      <Text className="text-lg font-black text-slate-800">{label}</Text>
      <Text className="text-slate-500 font-medium text-xs">{subText}</Text>
    </View>
    <Ionicons name="chevron-forward" size={24} color="#cbd5e1" />
  </TouchableOpacity>
);

export default ManageFacility;
