import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const ReminderSelection = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width > 600;

  // Memoised so the array reference is stable across renders
  const options = useMemo(
    () => [
      {
        title: "Medication",
        description: "Keep track of your meds and never miss a dose",
        icon: <MaterialCommunityIcons name="pill" size={40} color="#10b981" />,
        bg: "bg-emerald-50",
        border: "border-emerald-100",
        route: "/Reminders/MedicationList",
      },
      {
        title: "Workouts",
        description: "Set reminders for your exercise and fitness goals",
        icon: <Ionicons name="fitness" size={40} color="#3b82f6" />,
        bg: "bg-blue-50",
        border: "border-blue-100",
        route: "/Reminders/WorkoutList",
      },
      {
        title: "Calendar & Notes",
        description: "View all your schedules and track your daily notes",
        icon: <MaterialCommunityIcons name="calendar-month" size={40} color="#8b5cf6" />,
        bg: "bg-purple-50",
        border: "border-purple-100",
        route: "/Reminders/Calendar",
      },
    ],
    []
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F1EDEA]" edges={["top"]}>
      <View className="flex-1 px-6">
        {/* Header */}
        <View className="mt-8 mb-10">
          <Text className="text-4xl font-black text-slate-900 mb-2">Reminders</Text>
          <Text className="text-slate-500 text-lg font-medium">
            Choose what you'd like to be reminded of
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <View className={`flex-row flex-wrap gap-4 ${isTablet ? "justify-center" : ""}`}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => router.push(option.route as any)}
                className={`${option.bg} ${option.border} border-2 rounded-[40px] p-8 ${isTablet ? "w-[300px]" : "w-full"} mb-4`}
                activeOpacity={0.75}
                // Larger touch area + no delay
                delayPressIn={0}
              >
                <View className="bg-white w-20 h-20 rounded-full items-center justify-center mb-6 shadow-sm">
                  {option.icon}
                </View>
                <Text className="text-2xl font-black text-slate-800 mb-2">
                  {option.title}
                </Text>
                <Text className="text-slate-600 font-bold leading-6">
                  {option.description}
                </Text>
                <View className="flex-row items-center mt-6">
                  <Text className="text-emerald-600 font-black mr-2">Getting Started</Text>
                  <Ionicons name="arrow-forward" size={18} color="#059669" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ReminderSelection;
