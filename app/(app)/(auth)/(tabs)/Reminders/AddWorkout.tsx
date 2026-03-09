import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { CustomDropdown } from "@/components/CustomDropdown";

const workoutTypes = [
  { label: "Yoga", value: "yoga", icon: "yoga" },
  { label: "Cardio / Running", value: "cardio", icon: "run" },
  { label: "Strength Training", value: "strength", icon: "weight-lifter" },
  { label: "Swimming", value: "swimming", icon: "swim" },
  { label: "Cycling", value: "cycling", icon: "bike" },
  { label: "Pilates", value: "pilates", icon: "human-female-dance" },
  { label: "HIIT", value: "hiit", icon: "lightning-bolt" },
  { label: "Other", value: "other", icon: "dots-horizontal" },
];

const durationOptions = [
  { label: "15 min", value: "15" },
  { label: "30 min", value: "30" },
  { label: "45 min", value: "45" },
  { label: "1 hour", value: "60" },
  { label: "1.5 hours", value: "90" },
  { label: "2 hours", value: "120" },
];

const AddWorkout = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWideScreen = width > 600;

  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    workoutType: "cardio",
    duration: "30",
    time: "07:00",
    days: ["Mon", "Wed", "Fri"] as string[],
    goals: "",
  });

  const toggleDay = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day],
    }));
  };

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call for now (since we don't have a specific workout reminder hook yet)
    setTimeout(() => {
      setIsSaving(false);
      router.replace("/(app)/(auth)/(tabs)/Reminders");
    }, 1500);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View className="gap-6">
            <View>
              <Text className="text-slate-400 font-bold mb-3 uppercase text-xs">
                What type of workout?
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {workoutTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    onPress={() =>
                      setFormData({ ...formData, workoutType: type.value })
                    }
                    className={`flex-row items-center px-4 py-3 rounded-2xl border-2 ${
                      formData.workoutType === type.value
                        ? "bg-emerald-600 border-emerald-600 shadow-md"
                        : "bg-white border-slate-100"
                    }`}
                  >
                    <MaterialCommunityIcons
                      name={type.icon as any}
                      size={20}
                      color={
                        formData.workoutType === type.value
                          ? "white"
                          : "#64748b"
                      }
                    />
                    <Text
                      className={`ml-2 font-black text-sm ${
                        formData.workoutType === type.value
                          ? "text-white"
                          : "text-slate-600"
                      }`}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text className="text-slate-400 font-bold mb-3 uppercase text-xs">
                Target Duration
              </Text>
              <CustomDropdown
                label="Duration"
                data={durationOptions}
                value={formData.duration}
                onChange={(item) =>
                  setFormData({ ...formData, duration: item.value })
                }
              />
            </View>
          </View>
        );
      case 2:
        return (
          <View className="gap-6">
            <View>
              <Text className="text-slate-400 font-bold mb-3 uppercase text-xs">
                Weekly Schedule
              </Text>
              <View className="flex-row justify-between">
                {daysOfWeek.map((day) => (
                  <TouchableOpacity
                    key={day}
                    onPress={() => toggleDay(day)}
                    className={`w-11 h-11 items-center justify-center rounded-full border-2 ${
                      formData.days.includes(day)
                        ? "bg-blue-600 border-blue-600"
                        : "bg-white border-slate-100"
                    }`}
                  >
                    <Text
                      className={`font-black text-xs ${
                        formData.days.includes(day)
                          ? "text-white"
                          : "text-slate-400"
                      }`}
                    >
                      {day[0]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text className="text-slate-400 font-bold mb-3 uppercase text-xs">
                Reminder Time
              </Text>
              <View className="bg-slate-50 p-6 rounded-[32px] items-center border border-slate-100">
                <Text className="text-5xl font-black text-slate-800 tracking-tighter">
                  {formData.time}
                </Text>
                <Text className="text-slate-400 font-bold mt-2">
                  Tap to change
                </Text>
              </View>
            </View>
          </View>
        );
      case 3:
        return (
          <View className="gap-6">
            <Text className="text-slate-900 text-2xl font-black">
              Set Your Goals
            </Text>
            <View>
              <Text className="text-slate-400 font-bold mb-3 uppercase text-xs">
                Notes / Motivation
              </Text>
              <TextInput
                multiline
                numberOfLines={4}
                className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 text-lg font-medium text-slate-700 min-h-[150px]"
                placeholder="e.g. Preparing for summer marathon! Focus on core."
                value={formData.goals}
                onChangeText={(t) => setFormData({ ...formData, goals: t })}
              />
            </View>

            <View className="bg-blue-50 p-6 rounded-[32px] border border-blue-100 flex-row items-center">
              <View className="bg-blue-200/50 p-3 rounded-full mr-4">
                <Ionicons name="stats-chart" size={24} color="#2563eb" />
              </View>
              <View className="flex-1">
                <Text className="text-blue-900 font-black text-lg">
                  Goal Tracking
                </Text>
                <Text className="text-blue-800/60 font-medium">
                  We'll help you stay consistent.
                </Text>
              </View>
            </View>
          </View>
        );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => (step > 1 ? setStep((s) => s - 1) : router.back())}
          className="bg-slate-50 w-12 h-12 rounded-full items-center justify-center border border-slate-100"
        >
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <View className="flex-row gap-1.5">
          {[1, 2, 3].map((i) => (
            <View
              key={i}
              className={`h-2 w-10 rounded-full ${step >= i ? "bg-blue-600" : "bg-slate-100"}`}
            />
          ))}
        </View>
        <View className="w-12" />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 100,
        }}
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            alignSelf: isWideScreen ? "center" : "auto",
            width: isWideScreen ? 600 : "100%",
            marginTop: 40,
          }}
        >
          <View className="flex-row items-center mb-4">
            <View className="bg-blue-100 p-2 rounded-xl mr-3">
              <Ionicons name="fitness" size={24} color="#2563eb" />
            </View>
            <Text className="text-blue-600 font-black tracking-widest uppercase text-sm">
              New Workout Reminder
            </Text>
          </View>

          <Text className="text-4xl font-black text-slate-900 mb-8 leading-[44px]">
            {step === 1
              ? "Choose your workout"
              : step === 2
                ? "Schedule your time"
                : "Perfect your routine"}
          </Text>

          {renderStep()}
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View
        style={{ paddingBottom: insets.bottom + 16 }}
        className="absolute bottom-0 left-0 right-0 bg-white/90 border-t border-slate-50 px-6 pt-4 flex-row gap-4"
      >
        <TouchableOpacity
          className="flex-1 bg-slate-50 h-16 rounded-[24px] items-center justify-center"
          onPress={() => router.back()}
        >
          <Text className="text-slate-500 font-black text-lg">Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-[2] bg-blue-600 h-16 rounded-[24px] items-center justify-center shadow-lg shadow-blue-200"
          disabled={isSaving}
          onPress={() => (step < 3 ? setStep((s) => s + 1) : handleSave())}
        >
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-black text-lg">
              {step === 3 ? "Set Reminder" : "Continue"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddWorkout;
