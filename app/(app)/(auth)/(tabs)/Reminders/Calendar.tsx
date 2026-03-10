import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { CalendarView } from "@/components/CalendarView";

export default function CalendarScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      {/* Header */}
      <View className="px-6 py-4 pt-12 flex-row items-center justify-between bg-white border-b border-gray-100">
          <TouchableOpacity onPress={() => router.push("/Reminders")} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text className="text-xl font-black text-slate-900">Calendar & Agenda</Text>
          <View className="w-8" />
      </View>

      <CalendarView filterType="all" />
    </View>
  );
}
