import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Calendar } from "react-native-calendars";
import moment from "moment";
import { themeColors } from "@/src/theme/colors";
import { useMedicationReminders } from "@/hooks/use-medication-reminder";
import { useWorkoutReminders } from "@/hooks/use-workout-reminder";
import { useUserNotes } from "@/hooks/use-user-notes";
import { authClient } from "@/lib/auth-client";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { NotesModal } from "./NotesModal";

// ─── Icon helpers ────────────────────────────────────────────────────────────
const getMedicationIcon = (type: string) => {
  switch (type?.toUpperCase()) {
    case "TABLET":
    case "PILLS":    return <MaterialCommunityIcons name="pill"           size={18} color="#fff" />;
    case "CAPSULE":  return <MaterialCommunityIcons name="pill-multiple"  size={18} color="#fff" />;
    case "INJECTION":return <MaterialCommunityIcons name="needle"         size={18} color="#fff" />;
    case "SPRAY":    return <MaterialCommunityIcons name="spray"          size={18} color="#fff" />;
    case "DROPS":    return <MaterialCommunityIcons name="water-plus"     size={18} color="#fff" />;
    case "SOLUTION":
    case "LIQUID":
    case "SYRUP":    return <MaterialCommunityIcons name="bottle-tonic"   size={18} color="#fff" />;
    case "HERBS":    return <MaterialCommunityIcons name="leaf"           size={18} color="#fff" />;
    default:         return <MaterialCommunityIcons name="medical-bag"    size={18} color="#fff" />;
  }
};

const getWorkoutIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case "yoga":     return <MaterialCommunityIcons name="yoga"                size={18} color="#fff" />;
    case "strength": return <MaterialCommunityIcons name="weight-lifter"       size={18} color="#fff" />;
    case "swimming": return <MaterialCommunityIcons name="swim"                size={18} color="#fff" />;
    case "cycling":  return <MaterialCommunityIcons name="bike"                size={18} color="#fff" />;
    case "pilates":  return <MaterialCommunityIcons name="human-female-dance"  size={18} color="#fff" />;
    case "hiit":     return <MaterialCommunityIcons name="lightning-bolt"      size={18} color="#fff" />;
    default:         return <MaterialCommunityIcons name="run"                 size={18} color="#fff" />;
  }
};

const getEmotionIcon = (emotion: string) => {
  switch (emotion?.toLowerCase()) {
    case "terrible": return <MaterialCommunityIcons name="emoticon-dead-outline"     size={18} color="#fff" />;
    case "bad":      return <MaterialCommunityIcons name="emoticon-sad-outline"      size={18} color="#fff" />;
    case "okay":     return <MaterialCommunityIcons name="emoticon-neutral-outline"  size={18} color="#fff" />;
    case "good":     return <MaterialCommunityIcons name="emoticon-happy-outline"    size={18} color="#fff" />;
    case "great":    return <MaterialCommunityIcons name="emoticon-excited-outline"  size={18} color="#fff" />;
    default:         return <MaterialCommunityIcons name="note-text-outline"         size={18} color="#fff" />;
  }
};

// ─── Types ───────────────────────────────────────────────────────────────────
interface CalendarViewProps {
  filterType?: "medication" | "workout" | "all";
}

// ─── Component ───────────────────────────────────────────────────────────────
export function CalendarView({ filterType = "all" }: CalendarViewProps) {
  const today = moment().format("YYYY-MM-DD");
  const [selectedDate, setSelectedDate] = useState(today);
  const [refreshing, setRefreshing] = useState(false);
  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);

  const { data: session } = authClient.useSession();
  const userId = session?.user.id || "";

  const { data: medications, isLoading: isMedLoading, refetch: refetchMeds } =
    useMedicationReminders({ limit: 1000, page: 1, userId, status: true });
  const { data: workouts, isLoading: isWorkoutLoading, refetch: refetchWorkouts } =
    useWorkoutReminders({ limit: 1000, page: 1, userId, status: true });
  const { data: notes, isLoading: isNoteLoading, refetch: refetchNotes } =
    useUserNotes(userId);

  const isLoading = isMedLoading || isWorkoutLoading || isNoteLoading;

  // ── Build marked dates + agenda map ────────────────────────────────────────
  const { markedDates, agendaMap } = useMemo(() => {
    const marks: Record<string, any> = {};
    const agenda: Record<string, any[]> = {};

    const add = (dateKey: string, item: any, color: string) => {
      const existing = marks[dateKey]?.customStyles?.container?.backgroundColor;
      let finalColor = color;
      if (existing === "#10b981") finalColor = "#10b981";
      else if (existing === "#3b82f6" && color === "#8b5cf6") finalColor = "#3b82f6";

      marks[dateKey] = {
        customStyles: {
          container: {
            backgroundColor: finalColor,
            borderRadius: 16,
            width: 32,
            height: 32,
            justifyContent: "center",
            alignItems: "center",
          },
          text: { color: "white", fontWeight: "bold" },
        },
      };
      if (!agenda[dateKey]) agenda[dateKey] = [];
      agenda[dateKey].push(item);
    };

    if (medications && (filterType === "all" || filterType === "medication")) {
      medications.forEach((med: any) => {
        if (med.reminder_timestamps && Array.isArray(med.reminder_timestamps)) {
          med.reminder_timestamps.forEach((ts: string) => {
            const dateKey = moment(ts).format("YYYY-MM-DD");
            add(dateKey, {
              type: "medication",
              id: med.id,
              time: moment(ts).format("h:mm A"),
              title: med.drug_name,
              subtitle: `${med.dosage_amount} ${med.drug_type}`,
              color: "#10b981",
              originalData: med,
            }, "#10b981");
          });
        }
      });
    }

    if (workouts && (filterType === "all" || filterType === "workout")) {
      workouts.forEach((workout: any) => {
        if (workout.days && Array.isArray(workout.days)) {
          workout.days.forEach((day: string) => {
            const start = moment().startOf("month");
            const end = moment().endOf("month").add(1, "month");
            let cur = start.clone();
            while (cur.isBefore(end)) {
              if (cur.format("ddd") === day) {
                add(cur.format("YYYY-MM-DD"), {
                  type: "workout",
                  id: workout.id,
                  time: workout.time || "07:00",
                  title: workout.workout_type || "Workout",
                  subtitle: `${workout.duration} min`,
                  color: "#3b82f6",
                  originalData: workout,
                }, "#3b82f6");
              }
              cur.add(1, "days");
            }
          });
        }
      });
    }

    if (notes) {
      notes.forEach((note: any) => {
        if (!note.timestamp) return;
        if (filterType === "medication" && !note.medication_id) return;
        if (filterType === "workout" && !note.workout_id) return;

        const dateKey = moment(note.timestamp).format("YYYY-MM-DD");
        let noteColor = "#8b5cf6";
        let title = "Daily Note";
        if (note.medication_id) { noteColor = "#10b981"; title = "Medication Note"; }
        else if (note.workout_id) { noteColor = "#3b82f6"; title = "Workout Note"; }

        add(dateKey, {
          type: "note",
          id: note.id,
          time: moment(note.timestamp).format("h:mm A"),
          title,
          subtitle: note.note,
          emotion: note.emotion,
          color: noteColor,
          originalData: note,
        }, noteColor);
      });
    }

    // Mark selected date always
    if (!marks[selectedDate]) {
      marks[selectedDate] = {
        customStyles: {
          container: {
            backgroundColor: themeColors.primary,
            borderRadius: 16,
            width: 32,
            height: 32,
            justifyContent: "center",
            alignItems: "center",
          },
          text: { color: "white", fontWeight: "bold" },
        },
      };
    }

    return { markedDates: marks, agendaMap: agenda };
  }, [medications, workouts, notes, filterType, selectedDate]);

  const todayItems = (agendaMap[selectedDate] || []).sort((a, b) =>
    moment(a.time, "h:mm A").diff(moment(b.time, "h:mm A"))
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchMeds(), refetchWorkouts(), refetchNotes()]);
    setRefreshing(false);
  }, [refetchMeds, refetchWorkouts, refetchNotes]);

  return (
    <View style={styles.container}>
      {/* ── Standard Calendar — renders reliably in any layout ── */}
      <Calendar
        current={selectedDate}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          ...markedDates,
          [selectedDate]: {
            ...(markedDates[selectedDate] || {}),
            customStyles: {
              container: {
                backgroundColor: themeColors.primary,
                borderRadius: 16,
                width: 32,
                height: 32,
                justifyContent: "center",
                alignItems: "center",
              },
              text: { color: "white", fontWeight: "bold" },
            },
          },
        }}
        markingType="custom"
        theme={{
          calendarBackground: "#ffffff",
          selectedDayBackgroundColor: themeColors.primary,
          selectedDayTextColor: "#ffffff",
          todayTextColor: themeColors.primary,
          dayTextColor: "#2d4150",
          arrowColor: themeColors.primary,
          monthTextColor: themeColors.primary,
          textMonthFontWeight: "bold",
          textDayFontWeight: "600",
          textSectionTitleColor: "#94a3b8",
        }}
        firstDay={1}
        enableSwipeMonths
        style={styles.calendar}
      />

      <View style={styles.agendaHeader}>
        <Text style={styles.agendaDateText}>
          {moment(selectedDate).format("dddd, MMMM D")}
        </Text>
        <Text style={styles.agendaCount}>
          {todayItems.length} event{todayItems.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* ── Agenda list for selected day ── */}
      <ScrollView
        style={styles.agendaScroll}
        contentContainerStyle={styles.agendaContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={themeColors.primary}
          />
        }
      >
        {isLoading ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color={themeColors.primary} />
            <Text style={styles.emptyText}>Loading agenda…</Text>
          </View>
        ) : todayItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="calendar-blank" size={52} color="#cbd5e1" />
            <Text style={styles.emptyText}>No events for this day.</Text>
          </View>
        ) : (
          todayItems.map((item, idx) => (
            <View key={`${item.id}-${idx}`} style={styles.itemContainer}>
              <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                {item.type === "medication" && getMedicationIcon(item.originalData?.drug_type)}
                {item.type === "workout" && getWorkoutIcon(item.title)}
                {item.type === "note" && getEmotionIcon(item.emotion)}
              </View>
              <View style={styles.details}>
                <View style={styles.timeRow}>
                  <Ionicons name="time-outline" size={13} color="#94a3b8" />
                  <Text style={styles.timeText}>{item.time}</Text>
                </View>
                <Text style={styles.titleText}>{item.title}</Text>
                {item.type === "note" && item.emotion && (
                  <Text style={[styles.emotionText, { color: item.color }]}>
                    Feeling {item.emotion}
                  </Text>
                )}
                {item.subtitle ? (
                  <Text style={styles.subtitleText} numberOfLines={2}>
                    {item.subtitle}
                  </Text>
                ) : null}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Note FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsNoteModalVisible(true)}
      >
        <MaterialCommunityIcons name="pencil-plus" size={28} color="white" />
      </TouchableOpacity>

      <NotesModal
        isVisible={isNoteModalVisible}
        onClose={() => setIsNoteModalVisible(false)}
      />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  calendar: {
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  agendaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  agendaDateText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
  },
  agendaCount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94a3b8",
  },
  agendaScroll: {
    flex: 1,
  },
  agendaContent: {
    padding: 16,
    paddingBottom: 100,
  },
  itemContainer: {
    flexDirection: "row",
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  details: {
    flex: 1,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  timeText: {
    fontSize: 12,
    color: "#94a3b8",
    marginLeft: 4,
    fontWeight: "600",
  },
  titleText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 2,
    textTransform: "capitalize",
  },
  subtitleText: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
    fontWeight: "500",
  },
  emotionText: {
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  emptyContainer: {
    paddingTop: 60,
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 50,
  },
});
