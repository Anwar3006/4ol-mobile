import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  useMedicationReminder,
  useDeleteMedication,
} from "@/hooks/use-medication-reminder";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const SingleMedicationReminderScreen = () => {
  const { id: reminderId } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading } = useMedicationReminder(reminderId);
  const { mutateAsync: deleteMedication, isPending: isDeleting } =
    useDeleteMedication();
  const { width } = useWindowDimensions();
  const router = useRouter();

  const isWide = width > 600;

  const handleDelete = () => {
    Alert.alert(
      "Delete Medication",
      `Are you sure you want to delete "${data?.drug_name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMedication(reminderId);
              router.replace(
                "/(app)/(auth)/(tabs)/Reminders/MedicationList",
              );
            } catch (e) {
              Alert.alert("Error", "Failed to delete medication. Please try again.");
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-slate-400 animate-pulse">Loading details...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Custom Header */}
      <View className="px-6 py-4 flex-row items-center justify-between bg-white border-b border-slate-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="chevron-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-900">Details</Text>
        <TouchableOpacity
          onPress={handleDelete}
          disabled={isDeleting}
          className="p-2 -mr-2"
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color="#ef4444" />
          ) : (
            <Ionicons name="trash-outline" size={22} color="#ef4444" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section - The "Anti-Boring" Visual */}
        <View className="items-center py-8 bg-white border-b border-slate-100">
          <View className="bg-emerald-50 w-24 h-24 rounded-[32px] items-center justify-center mb-4 shadow-sm shadow-emerald-100">
            <MaterialCommunityIcons name="pill" size={48} color="#10b981" />
          </View>
          <Text className="text-2xl font-black text-slate-900 text-center px-6">
            {data?.drug_name}
          </Text>
          <Text className="text-slate-400 font-medium uppercase tracking-widest text-[10px] mt-1">
            {data?.generic_name || "Generic Info Unavailable"}
          </Text>

          <View className="mt-4 flex-row gap-2">
            <View className="bg-slate-100 px-4 py-1.5 rounded-full">
              <Text className="text-slate-600 text-xs font-bold">
                {data?.dosage_amount}
              </Text>
            </View>
            <View
              className={cn(
                "px-4 py-1.5 rounded-full",
                data?.is_active ? "bg-emerald-100" : "bg-slate-200",
              )}
            >
              <Text
                className={cn(
                  "text-xs font-bold",
                  data?.is_active ? "text-emerald-700" : "text-slate-500",
                )}
              >
                {data?.is_active ? "Active" : "Paused"}
              </Text>
            </View>
          </View>
        </View>

        {/* Content Body */}
        <View className={cn("p-6", isWide ? "flex-row flex-wrap" : "flex-col")}>
          {/* Schedule Section */}
          <SectionContainer title="Schedule" isWide={isWide}>
            <InfoRow
              icon="time-outline"
              label="Frequency"
              value={`Every ${data?.interval_hours} Hours`}
            />
            <InfoRow
              icon="calendar-outline"
              label="Started"
              value={
                data?.start_date
                  ? format(new Date(data.start_date), "PPP")
                  : "N/A"
              }
            />
            {data?.end_date && (
              <InfoRow
                icon="stop-circle-outline"
                label="Ends"
                value={format(new Date(data.end_date), "PPP")}
              />
            )}
          </SectionContainer>

          {/* Usage Section */}
          <SectionContainer title="Purpose & Usage" isWide={isWide}>
            <Text className="text-slate-600 leading-6 text-sm">
              {data?.purpose ||
                "No specific instructions provided by OpenFDA for this record."}
            </Text>
          </SectionContainer>

          {/* Instructions Section */}
          <SectionContainer title="Administration" isWide={isWide}>
            <View className="bg-white/70 p-4 rounded-2xl border border-blue-100">
              <Text className="text-blue-900 text-sm leading-6 italic">
                "
                {data?.instructions ||
                  "Follow your healthcare provider's advice."}
                "
              </Text>
            </View>
          </SectionContainer>

          {/* Side Effects Section */}
          {data?.side_effects && (
            <SectionContainer title="Potential Side Effects" isWide={isWide}>
              <Text className="text-rose-900/60 text-sm leading-6">
                {data.side_effects}
              </Text>
            </SectionContainer>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper Components for Clean Code
const SectionContainer = ({ title, children, isWide }: any) => (
  <View
    style={{
      width: isWide ? "48%" : "100%",
      marginBottom: 24,
      paddingRight: isWide ? 12 : 0,
    }}
  >
    <Text className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-3">
      {title}
    </Text>
    <View className="bg-[#EBF9E6] p-5 rounded-[24px] border border-slate-100 shadow-sm">
      {children}
    </View>
  </View>
);

const InfoRow = ({ icon, label, value }: any) => (
  <View className="flex-row items-center mb-4 last:mb-0">
    <View className="bg-slate-50 p-2 rounded-lg mr-3">
      <Ionicons name={icon} size={16} color="#64748b" />
    </View>
    <View>
      <Text className="text-[10px] text-slate-400 font-bold uppercase">
        {label}
      </Text>
      <Text className="text-slate-900 font-bold text-sm">{value}</Text>
    </View>
  </View>
);

export default SingleMedicationReminderScreen;
