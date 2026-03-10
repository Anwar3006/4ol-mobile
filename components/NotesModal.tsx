import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import Modal from "react-native-modal";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";
import { themeColors } from "@/src/theme/colors";
import { useUpsertUserNote } from "@/hooks/use-user-notes";
import { authClient } from "@/lib/auth-client";

interface NotesModalProps {
  isVisible: boolean;
  onClose: () => void;
  medicationId?: string;
  workoutId?: string;
}

const EMOTIONS = [
  { label: "Terrible", icon: "emoticon-dead-outline", value: "terrible" },
  { label: "Bad", icon: "emoticon-sad-outline", value: "bad" },
  { label: "Okay", icon: "emoticon-neutral-outline", value: "okay" },
  { label: "Good", icon: "emoticon-happy-outline", value: "good" },
  { label: "Great", icon: "emoticon-excited-outline", value: "great" },
];

export function NotesModal({
  isVisible,
  onClose,
  medicationId,
  workoutId,
}: NotesModalProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<string>("okay");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

  const { data: session } = authClient.useSession();
  const userId = session?.user.id || "";
  const upsertNote = useUpsertUserNote();

  const handleConfirmDate = (selectedDate: Date) => {
    const newDate = new Date(date);
    newDate.setFullYear(selectedDate.getFullYear());
    newDate.setMonth(selectedDate.getMonth());
    newDate.setDate(selectedDate.getDate());
    setDate(newDate);
    setDatePickerVisibility(false);
  };

  const handleConfirmTime = (selectedTime: Date) => {
    const newDate = new Date(date);
    newDate.setHours(selectedTime.getHours());
    newDate.setMinutes(selectedTime.getMinutes());
    setDate(newDate);
    setTimePickerVisibility(false);
  };

  const handleAddNote = () => {
    if (!userId) return;

    upsertNote.mutate(
      {
        userId,
        noteId: null,
        values: {
          note,
          emotion: selectedEmotion,
          timestamp: date.toISOString(),
          medication_id: medicationId,
          workout_id: workoutId,
        },
      },
      {
        onSuccess: () => {
          setNote("");
          setSelectedEmotion("okay");
          setDate(new Date());
          onClose();
        },
      }
    );
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      animationIn="zoomIn"
      animationOut="zoomOut"
      backdropOpacity={0.5}
      style={styles.modal}
      avoidKeyboard={true}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>I am feeling</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Emotion selection */}
          <View style={styles.emotionContainer}>
            {EMOTIONS.map((emotion) => (
              <TouchableOpacity
                key={emotion.value}
                onPress={() => setSelectedEmotion(emotion.value)}
                style={styles.emotionItem}
              >
                <MaterialCommunityIcons
                  name={emotion.icon as any}
                  size={36}
                  color={selectedEmotion === emotion.value ? themeColors.primary : "#94a3b8"}
                />
                <Text
                  style={[
                    styles.emotionLabel,
                    selectedEmotion === emotion.value && styles.activeEmotionLabel,
                  ]}
                >
                  {emotion.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Notes input */}
          <Text style={styles.inputLabel}>Notes</Text>
          <View style={styles.textareaContainer}>
            <TextInput
              style={styles.textarea}
              multiline
              placeholder="Enter your notes here..."
              placeholderTextColor="#cbd5e1"
              value={note}
              onChangeText={setNote}
              maxLength={500}
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={Keyboard.dismiss}
            />
            <Text style={styles.charCount}>{note.length}/500</Text>
          </View>

        {/* Datetime picker */}
        <View style={styles.dateTimeRow}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setDatePickerVisibility(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={themeColors.primary} />
            <Text style={styles.dateTimeText}>{moment(date).format("MMM D, YYYY")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setTimePickerVisibility(true)}
          >
            <Ionicons name="time-outline" size={20} color={themeColors.primary} />
            <Text style={styles.dateTimeText}>{moment(date).format("h:mm A")}</Text>
          </TouchableOpacity>
        </View>

        {/* Add button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddNote}
          disabled={upsertNote.isPending}
        >
          <Text style={styles.addButtonText}>
            {upsertNote.isPending ? "Adding..." : "Add"}
          </Text>
        </TouchableOpacity>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirmDate}
          onCancel={() => setDatePickerVisibility(false)}
          date={date}
        />

        <DateTimePickerModal
          isVisible={isTimePickerVisible}
          mode="time"
          onConfirm={handleConfirmTime}
          onCancel={() => setTimePickerVisibility(false)}
          date={date}
        />
      </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 20,
    justifyContent: "center",
  },
  container: {
    backgroundColor: "white",
    borderRadius: 30,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0f172a",
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    right: -10,
    top: -5,
    padding: 10,
  },
  emotionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  emotionItem: {
    alignItems: "center",
    flex: 1,
  },
  emotionLabel: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "600",
    marginTop: 4,
  },
  activeEmotionLabel: {
    color: themeColors.primary,
    fontWeight: "bold",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748b",
    marginBottom: 8,
  },
  textareaContainer: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    padding: 12,
    height: 120,
    marginBottom: 20,
  },
  textarea: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "right",
    marginTop: 4,
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  dateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  timeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  dateTimeText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1e293b",
  },
  addButton: {
    backgroundColor: themeColors.primary,
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "900",
  },
});
