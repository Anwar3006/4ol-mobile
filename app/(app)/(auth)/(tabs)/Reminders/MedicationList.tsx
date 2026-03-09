import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMedicationReminders } from "@/hooks/use-medication-reminder";
import { authClient } from "@/lib/auth-client";
import { router, useLocalSearchParams } from "expo-router";
import { MedicationFAB } from "@/components/MedicationFAB";

export default function MedicationsScreen() {
  // const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const activeTab = tab === "history" ? "history" : "active";

  const [page, setPage] = useState(1);
  const { width } = useWindowDimensions();
  const isTablet = width > 600;
  const limit = isTablet ? 12 : 10;
  const { data: session } = authClient.useSession();
  const userId = session?.user.id || "";

  const { data, isLoading, isFetching } = useMedicationReminders({
    limit,
    page,
    userId,
    status: activeTab === "active",
  });

  // Flat list data management
  const [allMeds, setAllMeds] = React.useState<any[]>([]);

  // Clear data when switching tabs to prevent index out of bounds or context errors
  const handleTabChange = (status: boolean) => {
    setAllMeds([]); // Clear previous data immediately
    setPage(1);
    const activeTab = status ? "active" : "history";
    setTimeout(() => {
      router.replace(`/Reminders/MedicationList?tab=${activeTab}`);
    }, 10);
    console.log("Active Tab: ", activeTab);
  };

  React.useEffect(() => {
    if (data) {
      // If it's page 1, we replace the data (crucial for tab switching)
      if (page === 1) {
        setAllMeds(data);
      } else {
        setAllMeds((prev) => [...prev, ...data]);
      }
    }
  }, [data, page]);

  console.log("allMeds: ", allMeds, "page: ", page, "isFetching: ", isFetching);

  return (
    <SafeAreaView className="flex-1 bg-[#EBF9E6]">
      <View className="flex-1 px-4">
        {/* Header */}
        <View className="flex flex-row items-center justify-between">
          <Pressable onPress={() => router.push("/Home")}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </Pressable>
          <View className="mt-6 mb-4">
            <Text className="text-3xl font-black text-slate-900">
              {activeTab === "active"
                ? "Active Medications"
                : "Medication History"}
            </Text>
            <Text className="text-slate-400 text-sm font-semibold text-right">
              {activeTab === "active"
                ? "Your active medications"
                : "Your medication history"}
            </Text>
          </View>
        </View>

        {/* Custom Animated Tabs */}
        <View className="flex-row mb-6 border-b border-gray-200">
          {["active", "history"].map((t) => (
            <Pressable
              key={t}
              onPress={() => handleTabChange(t === "active")}
              className={`flex-1 py-4 items-center ${activeTab === t ? "border-b-4 border-emerald-500" : ""}`}
            >
              <Text
                className={`text-lg font-black capitalize ${activeTab === t ? "text-emerald-500" : "text-slate-300"}`}
              >
                {t === "active" ? "Meds Reminders" : "Calendar"}
              </Text>
            </Pressable>
          ))}
        </View>

        <FlashList
          data={allMeds}
          keyExtractor={(item) => item.id}
          // estimatedItemSize={150}
          numColumns={isTablet ? 2 : 1}
          renderItem={({ item }) => (
            <MedicationCard item={item} status={activeTab} />
          )}
          onEndReachedThreshold={0.1}
          ListEmptyComponent={!isLoading ? <EmptyState /> : null}
          ListFooterComponent={
            <View className="py-6">
              {isFetching ? (
                <ActivityIndicator color="#10b981" />
              ) : !isFetching && allMeds.length > limit ? (
                <TouchableOpacity
                  onPress={() => setPage((p) => p + 1)}
                  className="items-center"
                >
                  <Text className="text-emerald-600 font-bold text-sm">
                    Load More
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          }
        />
      </View>

      {/* Floating Medication FAB */}
      <View className="absolute -bottom-28 right-2">
        <MedicationFAB />
      </View>
    </SafeAreaView>
  );
}

function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center py-12">
      <Ionicons name="medical" size={48} color="#cbd5e1" />
      <Text className="text-slate-400 text-lg font-semibold mt-4">
        No medications found
      </Text>
    </View>
  );
}

// Helper to get styles based on drug type
const getDrugStyles = (type: string = "tablet") => {
  switch (type.toLowerCase()) {
    case "tablet":
    case "pills":
      return {
        bg: "bg-purple-100",
        indicator: "bg-purple-500",
        text: "text-purple-600",
        iconRequest: "pill",
        color: "#a855f7",
      };
    case "capsule":
      return {
        bg: "bg-orange-100",
        indicator: "bg-orange-500",
        text: "text-orange-600",
        iconRequest: "capsule",
        color: "#f97316",
      };
    case "injection":
      return {
        bg: "bg-blue-100",
        indicator: "bg-blue-500",
        text: "text-blue-600",
        iconRequest: "needle",
        color: "#3b82f6",
      };
    case "liquid":
    case "syrup":
      return {
        bg: "bg-yellow-100",
        indicator: "bg-yellow-500",
        text: "text-yellow-600",
        iconRequest: "bottle-tonic",
        color: "#eab308",
      };
    default:
      return {
        bg: "bg-emerald-100",
        indicator: "bg-emerald-500",
        text: "text-emerald-600",
        iconRequest: "pill",
        color: "#10b981",
      };
  }
};

function MedicationCard({ item, status }: any) {
  const handleCardClick = (id: string) => {
    router.push(`/Reminders/${id}`);
  };

  const styles = getDrugStyles(item.drug_type || "tablet");

  return (
    <TouchableOpacity
      onPress={() => handleCardClick(item.id)}
      className="m-2 mb-4 bg-white rounded-[32px] shadow-sm overflow-hidden flex-row"
      activeOpacity={0.9}
    >
      {/* Left Indicator bar */}
      <View className={`w-2 ${styles.indicator}`} />

      <View className="flex-1 p-5 pr-4 flex-row justify-between items-center">
        <View className="flex-row items-center flex-1">
          {/* Icon in circle */}
          <View
            className={`w-14 h-14 rounded-full items-center justify-center mr-4 ${styles.bg}`}
          >
            <MaterialCommunityIcons
              name={styles.iconRequest as any}
              size={28}
              color={styles.color}
            />
          </View>

          {/* Info */}
          <View className="flex-1">
            <Text className="text-xl font-black text-slate-800 mb-0.5">
              {item.drug_name}
            </Text>
            <Text className="text-slate-500 font-bold text-sm mb-2">
              {item.dosage_amount} •{" "}
              {item.drug_type === "liquid" || item.drug_type === "syrup"
                ? "2 ml"
                : "1 tablet"}{" "}
              • 2x daily
            </Text>

            <View className="flex-row items-center mb-1">
              <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
              <Text className="text-slate-400 text-xs ml-1 font-bold">
                Daily
              </Text>
            </View>

            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
              <Text className="text-slate-400 text-xs ml-1 font-bold">
                {item.start_date
                  ? new Date(item.start_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Jan 1, 2026"}{" "}
                -{" "}
                {item.end_date
                  ? new Date(item.end_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Jan 20, 2026"}
              </Text>
            </View>
          </View>
        </View>

        {/* Options icon */}
        <TouchableOpacity className="self-start mt-1">
          <MaterialCommunityIcons name="dots-vertical" size={24} color="#000" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
