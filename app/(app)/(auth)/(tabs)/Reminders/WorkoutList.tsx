import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  Pressable,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useWorkoutReminders, useDeleteWorkout } from "@/hooks/use-workout-reminder";
import { authClient } from "@/lib/auth-client";
import { router, useLocalSearchParams } from "expo-router";
import { CalendarView } from "@/components/CalendarView";
import { NotesModal } from "@/components/NotesModal";

// ─── Types ────────────────────────────────────────────────────────────────────
type WorkoutItem = {
  id: string;
  workout_type?: string;
  duration?: string;
  time?: string;
  days?: string[];
  goals?: string;
};

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function WorkoutListScreen() {
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState<"active" | "calendar">(
    tab === "calendar" ? "calendar" : "active"
  );

  const [page, setPage] = useState(1);
  const { width } = useWindowDimensions();
  const isTablet = width > 600;
  const limit = isTablet ? 12 : 10;
  const { data: session } = authClient.useSession();
  const userId = session?.user.id || "";

  // ── Modal state — all lifted to screen level ──────────────────────────────
  const [actionTarget, setActionTarget] = useState<WorkoutItem | null>(null);
  const [deleteTarget, setDeleteTarget]  = useState<WorkoutItem | null>(null);
  const [noteTarget, setNoteTarget]       = useState<string | undefined>();
  const [isNoteVisible, setIsNoteVisible] = useState(false);

  const { mutate: deleteWorkout, isPending: isDeleting } = useDeleteWorkout();

  const { data, isLoading, isFetching } = useWorkoutReminders({
    limit, page, userId, status: true,
  });
  const [allWorkouts, setAllWorkouts] = useState<WorkoutItem[]>([]);

  useEffect(() => {
    if (tab === "calendar") setActiveTab("calendar");
    else setActiveTab("active");
  }, [tab]);

  useEffect(() => {
    if (data) {
      if (page === 1) setAllWorkouts(data);
      else setAllWorkouts((prev) => [...prev, ...data]);
    }
  }, [data, page]);

  // ── Callbacks passed down to cards ────────────────────────────────────────
  const handleMenuPress = useCallback((item: WorkoutItem) => {
    setActionTarget(item);
  }, []);

  const handleNote = useCallback((id: string) => {
    setNoteTarget(id);
    setIsNoteVisible(true);
    setActionTarget(null);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    deleteWorkout(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
      onError: () => setDeleteTarget(null),
    });
  }, [deleteTarget, deleteWorkout]);

  return (
    <SafeAreaView className="flex-1 bg-[#E6F0FA]" edges={["top"]}>
      <View className="flex-1">
        {/* Header */}
        <View className="px-4 pt-2 flex-row items-center justify-between">
          <Pressable
            onPress={() => router.push("/Reminders")}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </Pressable>
          <View className="mt-4 mb-3">
            <Text className="text-3xl font-black text-slate-900 text-right">
              {activeTab === "active" ? "Active Workouts" : "Workout Calendar"}
            </Text>
            <Text className="text-slate-400 text-sm font-semibold text-right">
              {activeTab === "active" ? "Your upcoming workouts" : "Your workout schedule"}
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View className="px-4 flex-row border-b border-gray-200">
          {(["active", "calendar"] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => setActiveTab(t)}
              hitSlop={{ top: 8, bottom: 8 }}
              className={`flex-1 py-4 items-center ${activeTab === t ? "border-b-4 border-blue-500" : ""}`}
            >
              <Text className={`text-lg font-black capitalize ${activeTab === t ? "text-blue-500" : "text-slate-300"}`}>
                {t === "active" ? "Workout Reminders" : "Calendar"}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Content */}
        <View className="flex-1">
          {activeTab === "active" ? (
            <View style={{ flex: 1, paddingHorizontal: 16 }}>
              <FlashList
                data={allWorkouts}
                keyExtractor={(item) => item.id}
                numColumns={isTablet ? 2 : 1}
                estimatedItemSize={160}
                renderItem={({ item }) => (
                  <WorkoutCard item={item} onMenuPress={handleMenuPress} />
                )}
                onEndReachedThreshold={0.1}
                ListEmptyComponent={!isLoading ? <EmptyState /> : null}
                ListFooterComponent={
                  <View className="py-6">
                    {isFetching ? (
                      <ActivityIndicator color="#3b82f6" />
                    ) : !isFetching && allWorkouts.length >= limit ? (
                      <TouchableOpacity onPress={() => setPage((p) => p + 1)} className="items-center">
                        <Text className="text-blue-600 font-bold text-sm">Load More</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                }
              />
            </View>
          ) : (
            <CalendarView filterType="workout" />
          )}
        </View>
      </View>

      {/* FAB */}
      {activeTab === "active" && (
        <View className="absolute bottom-6 right-6">
          <TouchableOpacity
            onPress={() => router.push("/Reminders/AddWorkout")}
            className="bg-blue-600 w-16 h-16 rounded-full items-center justify-center"
            style={{ elevation: 8, shadowColor: "#2563eb", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 }}
          >
            <Ionicons name="add" size={32} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {/* ── Action sheet modal ──────────────────────────────────────────────── */}
      <Modal
        visible={!!actionTarget}
        transparent
        animationType="fade"
        onRequestClose={() => setActionTarget(null)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" }}
          onPress={() => setActionTarget(null)}
        >
          <Pressable onPress={() => {}}>
            <View style={{
              backgroundColor: "white",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingTop: 12,
              paddingBottom: 40,
              paddingHorizontal: 20,
            }}>
              {/* Handle bar */}
              <View style={{ width: 40, height: 4, backgroundColor: "#e2e8f0", borderRadius: 2, alignSelf: "center", marginBottom: 20 }} />

              {/* Title */}
              <Text style={{ fontSize: 13, fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16, paddingHorizontal: 4 }}>
                {actionTarget?.workout_type ?? "Workout"} — options
              </Text>

              {/* View */}
              <ActionRow
                icon="eye-outline"
                iconColor="#64748b"
                label="View"
                labelColor="#1e293b"
                onPress={() => {
                  setActionTarget(null);
                  router.push(`/Reminders/${actionTarget?.id}`);
                }}
              />

              {/* Edit */}
              <ActionRow
                icon="pencil-outline"
                iconColor="#2563eb"
                label="Edit"
                labelColor="#2563eb"
                onPress={() => {
                  setActionTarget(null);
                  // Edit route — placeholder
                }}
              />

              {/* Add Note */}
              <ActionRow
                icon="document-text-outline"
                iconColor="#8b5cf6"
                label="Add Note"
                labelColor="#8b5cf6"
                onPress={() => actionTarget && handleNote(actionTarget.id)}
              />

              {/* Divider */}
              <View style={{ height: 1, backgroundColor: "#f1f5f9", marginVertical: 8 }} />

              {/* Delete */}
              <ActionRow
                icon="trash-outline"
                iconColor="#ef4444"
                label="Delete"
                labelColor="#ef4444"
                onPress={() => {
                  const target = actionTarget;
                  setActionTarget(null);
                  setDeleteTarget(target);
                }}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Delete confirmation modal ───────────────────────────────────────── */}
      <Modal
        visible={!!deleteTarget}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteTarget(null)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}>
          <View style={{ backgroundColor: "white", borderRadius: 28, padding: 28, width: "100%", maxWidth: 380 }}>
            {/* Icon */}
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "#fef2f2", justifyContent: "center", alignItems: "center", alignSelf: "center", marginBottom: 20 }}>
              <Ionicons name="trash-outline" size={30} color="#ef4444" />
            </View>

            <Text style={{ fontSize: 22, fontWeight: "900", color: "#0f172a", textAlign: "center", marginBottom: 10 }}>
              Delete Workout?
            </Text>
            <Text style={{ fontSize: 15, color: "#64748b", textAlign: "center", lineHeight: 22, marginBottom: 28 }}>
              Are you sure you want to delete{" "}
              <Text style={{ fontWeight: "700", color: "#1e293b", textTransform: "capitalize" }}>
                {deleteTarget?.workout_type}
              </Text>
              ? This cannot be undone.
            </Text>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() => setDeleteTarget(null)}
                style={{ flex: 1, backgroundColor: "#f1f5f9", borderRadius: 18, paddingVertical: 16, alignItems: "center" }}
              >
                <Text style={{ fontWeight: "900", color: "#64748b", fontSize: 16 }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDeleteConfirm}
                disabled={isDeleting}
                style={{ flex: 1, backgroundColor: "#ef4444", borderRadius: 18, paddingVertical: 16, alignItems: "center" }}
              >
                {isDeleting ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={{ fontWeight: "900", color: "white", fontSize: 16 }}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Notes modal ─────────────────────────────────────────────────────── */}
      <NotesModal
        isVisible={isNoteVisible}
        onClose={() => setIsNoteVisible(false)}
        workoutId={noteTarget}
      />
    </SafeAreaView>
  );
}

// ─── Action sheet row ─────────────────────────────────────────────────────────
function ActionRow({ icon, iconColor, label, labelColor, onPress }: {
  icon: any; iconColor: string; label: string; labelColor: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 4,
        gap: 16,
      }}
    >
      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "#f8fafc", justifyContent: "center", alignItems: "center" }}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={{ fontSize: 16, fontWeight: "700", color: labelColor, flex: 1 }}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
    </TouchableOpacity>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center py-12">
      <Ionicons name="fitness" size={48} color="#cbd5e1" />
      <Text className="text-slate-400 text-lg font-semibold mt-4">No workouts found</Text>
    </View>
  );
}

// ─── Workout type styles ──────────────────────────────────────────────────────
const getWorkoutStyles = (type: string = "cardio") => {
  switch (type.toLowerCase()) {
    case "yoga":     return { bg: "bg-purple-100", icon: "yoga",               color: "#a855f7" };
    case "strength": return { bg: "bg-red-100",    icon: "weight-lifter",       color: "#ef4444" };
    case "swimming": return { bg: "bg-cyan-100",   icon: "swim",                color: "#06b6d4" };
    case "cycling":  return { bg: "bg-orange-100", icon: "bike",                color: "#f97316" };
    case "pilates":  return { bg: "bg-pink-100",   icon: "human-female-dance",  color: "#ec4899" };
    case "hiit":     return { bg: "bg-yellow-100", icon: "lightning-bolt",      color: "#eab308" };
    default:         return { bg: "bg-blue-100",   icon: "run",                 color: "#3b82f6" };
  }
};

// ─── Card — only renders the card, calls parent callbacks ─────────────────────
function WorkoutCard({ item, onMenuPress }: {
  item: WorkoutItem;
  onMenuPress: (item: WorkoutItem) => void;
}) {
  const styles = getWorkoutStyles(item.workout_type);

  return (
    <View
      className="m-2 mb-4 bg-white rounded-[32px] shadow-sm flex-row"
      style={{ elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 }}
    >
      {/* Coloured left bar */}
      <View style={{ backgroundColor: styles.color, width: 8, borderTopLeftRadius: 32, borderBottomLeftRadius: 32 }} />

      <View className="flex-1 p-5 pr-3 flex-row items-start">
        {/* Icon */}
        <View className={`w-14 h-14 rounded-full items-center justify-center mr-4 ${styles.bg}`}>
          <MaterialCommunityIcons name={styles.icon as any} size={28} color={styles.color} />
        </View>

        {/* Content */}
        <View className="flex-1">
          <Text className="text-xl font-black text-slate-800 mb-0.5 capitalize">
            {item.workout_type || "Workout"}
          </Text>
          <Text className="text-slate-500 font-bold text-sm mb-2">
            {item.duration || "30"} min • {item.time || "07:00"}
          </Text>
          <View className="flex-row flex-wrap">
            {item.days?.map((day, idx) => (
              <View key={idx} className="bg-slate-100 px-2 py-1 rounded-md mr-1 mb-1">
                <Text className="text-slate-500 text-xs font-bold">{day}</Text>
              </View>
            ))}
          </View>
          {item.goals ? (
            <Text className="text-slate-400 text-xs mt-1 italic" numberOfLines={1}>
              "{item.goals}"
            </Text>
          ) : null}
        </View>

        {/* Ellipsis — just calls parent, no local menu state */}
        <TouchableOpacity
          onPress={() => onMenuPress(item)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          className="ml-2 p-1"
        >
          <MaterialCommunityIcons name="dots-vertical" size={22} color="#94a3b8" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
