import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { authClient } from "@/lib/auth-client";
import { useUpsertWorkout } from "@/hooks/use-workout-reminder";
import { CustomDropdown } from "@/components/CustomDropdown";

// Native HH:mm formatter — no moment/dayjs required
const formatTime = (date: Date): string => {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
};

// ─── Zod Schema ───────────────────────────────────────────────────────────────
const workoutSchema = z.object({
  workout_type: z.string().min(1, "Please select a workout type"),
  duration: z.string().min(1, "Please select a duration"),
  time: z.string().min(1, "Please set a reminder time"),
  days: z.array(z.string()).min(1, "Select at least one day"),
  goals: z.string().optional(),
});

type WorkoutFormValues = z.infer<typeof workoutSchema>;

// ─── Constants ────────────────────────────────────────────────────────────────
const WORKOUT_TYPES = [
  { label: "Yoga",             value: "yoga",      icon: "yoga"               },
  { label: "Cardio / Running", value: "cardio",    icon: "run"                },
  { label: "Strength",         value: "strength",  icon: "weight-lifter"      },
  { label: "Swimming",         value: "swimming",  icon: "swim"               },
  { label: "Cycling",          value: "cycling",   icon: "bike"               },
  { label: "Pilates",          value: "pilates",   icon: "human-female-dance" },
  { label: "HIIT",             value: "hiit",      icon: "lightning-bolt"     },
  { label: "Other",            value: "other",     icon: "dots-horizontal"    },
] as const;

const DURATION_OPTIONS = [
  { label: "15 min",  value: "15"  },
  { label: "30 min",  value: "30"  },
  { label: "45 min",  value: "45"  },
  { label: "1 hour",  value: "60"  },
  { label: "1.5 hrs", value: "90"  },
  { label: "2 hours", value: "120" },
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Fields validated per step — used before advancing
const STEP_FIELDS: Record<number, (keyof WorkoutFormValues)[]> = {
  1: ["workout_type", "duration"],
  2: ["days", "time"],
  3: [],
};

// ─── Component ────────────────────────────────────────────────────────────────
const AddWorkout = () => {
  const { width } = useWindowDimensions();
  const isWideScreen = width > 600;
  const { data: session } = authClient.useSession();

  const [step, setStep] = useState(1);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const { mutateAsync: upsertWorkout, isPending: isSaving } = useUpsertWorkout();

  const {
    control,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      workout_type: "cardio",
      duration: "30",
      time: "07:00",
      days: ["Mon", "Wed", "Fri"],
      goals: "",
    },
    mode: "onChange",
  });

  // Live-watch values for display
  const watchedType = watch("workout_type");
  const watchedTime = watch("time");
  const watchedDays = watch("days");

  // ── Step validation before advancing ──────────────────────────────────────
  const handleNext = async () => {
    const valid = await trigger(STEP_FIELDS[step]);
    if (valid) setStep((s) => s + 1);
  };

  // ── Final submit ───────────────────────────────────────────────────────────
  const onSubmit = async (values: WorkoutFormValues) => {
    if (!session?.user?.id) return;
    try {
      await upsertWorkout({
        userId: session.user.id,
        reminderId: null,
        values: {
          workout_type: values.workout_type,
          duration: values.duration,
          time: values.time,
          days: values.days,
          goals: values.goals ?? "",
          is_active: true,
          is_enabled: true,
        },
      });
      router.replace("/(app)/(auth)/(tabs)/Reminders/WorkoutList");
    } catch (e) {
      console.error("Save failed", e);
    }
  };

  // ── Field error helper ─────────────────────────────────────────────────────
  const FieldError = ({ name }: { name: keyof WorkoutFormValues }) =>
    errors[name] ? (
      <Text className="text-red-500 text-xs font-bold mt-2">
        {errors[name]?.message as string}
      </Text>
    ) : null;

  // ── Render Steps ───────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {
      // ── Step 1: Workout type + Duration ─────────────────────────────────
      case 1:
        return (
          <View style={{ gap: 24 }}>
            {/* Workout Type */}
            <View>
              <Text className="text-slate-400 font-bold mb-3 uppercase text-xs tracking-widest">
                What type of workout?
              </Text>
              <Controller
                control={control}
                name="workout_type"
                render={({ field: { value, onChange } }) => (
                  <View className="flex-row flex-wrap gap-3">
                    {WORKOUT_TYPES.map((type) => {
                      const isSelected = value === type.value;
                      return (
                        <TouchableOpacity
                          key={type.value}
                          onPress={() => onChange(type.value)}
                          className={`flex-row items-center px-4 py-3 rounded-2xl border-2 ${
                            isSelected
                              ? "bg-blue-600 border-blue-600"
                              : "bg-white border-slate-100"
                          }`}
                        >
                          <MaterialCommunityIcons
                            name={type.icon as any}
                            size={20}
                            color={isSelected ? "white" : "#64748b"}
                          />
                          <Text
                            className={`ml-2 font-black text-sm ${
                              isSelected ? "text-white" : "text-slate-600"
                            }`}
                          >
                            {type.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              />
              <FieldError name="workout_type" />
            </View>

            {/* Duration */}
            <View style={{ zIndex: 10 }}>
              <Text className="text-slate-400 font-bold mb-3 uppercase text-xs tracking-widest">
                Target Duration
              </Text>
              <Controller
                control={control}
                name="duration"
                render={({ field: { value, onChange } }) => (
                  <CustomDropdown
                    data={DURATION_OPTIONS}
                    value={value}
                    onChange={(item) => onChange(item.value)}
                    placeholder="Select duration"
                  />
                )}
              />
              <FieldError name="duration" />
            </View>
          </View>
        );

      // ── Step 2: Days + Time ──────────────────────────────────────────────
      case 2:
        return (
          <View style={{ gap: 28 }}>
            {/* Day Picker */}
            <View>
              <Text className="text-slate-400 font-bold mb-3 uppercase text-xs tracking-widest">
                Weekly Schedule
              </Text>
              <Controller
                control={control}
                name="days"
                render={({ field: { value, onChange } }) => (
                  <View className="flex-row justify-between">
                    {DAYS_OF_WEEK.map((day) => {
                      const isSelected = value.includes(day);
                      return (
                        <TouchableOpacity
                          key={day}
                          onPress={() => {
                            const next = isSelected
                              ? value.filter((d) => d !== day)
                              : [...value, day];
                            onChange(next);
                          }}
                          className={`w-11 h-11 items-center justify-center rounded-full border-2 ${
                            isSelected
                              ? "bg-blue-600 border-blue-600"
                              : "bg-white border-slate-200"
                          }`}
                        >
                          <Text
                            className={`font-black text-xs ${
                              isSelected ? "text-white" : "text-slate-400"
                            }`}
                          >
                            {day[0]}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              />
              <FieldError name="days" />
            </View>

            {/* Time Picker */}
            <View>
              <Text className="text-slate-400 font-bold mb-3 uppercase text-xs tracking-widest">
                Reminder Time
              </Text>
              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                className="bg-white border-2 border-blue-100 rounded-[28px] p-6 items-center"
                activeOpacity={0.8}
              >
                <Text className="text-5xl font-black text-slate-800 tracking-tighter">
                  {watchedTime}
                </Text>
                <View className="flex-row items-center mt-3 gap-1">
                  <Ionicons name="time-outline" size={14} color="#3b82f6" />
                  <Text className="text-blue-500 font-bold text-sm">
                    Tap to change
                  </Text>
                </View>
              </TouchableOpacity>
              <FieldError name="time" />

              <DateTimePickerModal
                isVisible={showTimePicker}
                mode="time"
                date={(() => {
                  const [h, m] = watchedTime.split(":").map(Number);
                  const d = new Date();
                  d.setHours(h, m, 0, 0);
                  return d;
                })()}
                onConfirm={(date) => {
                  setShowTimePicker(false);
                  setValue("time", formatTime(date), { shouldValidate: true });
                }}
                onCancel={() => setShowTimePicker(false)}
                display={Platform.OS === "ios" ? "spinner" : "default"}
              />
            </View>

            {/* Live schedule summary */}
            {watchedDays.length > 0 && (
              <View className="bg-blue-50 rounded-[24px] p-5 border border-blue-100">
                <Text className="text-blue-800 font-black text-sm mb-2 uppercase tracking-widest">
                  Your Schedule
                </Text>
                <Text className="text-blue-900 font-bold text-base">
                  Every {watchedDays.join(", ")} at {watchedTime}
                </Text>
              </View>
            )}
          </View>
        );

      // ── Step 3: Goals + Review ────────────────────────────────────────────
      case 3:
        return (
          <View style={{ gap: 24 }}>
            <View>
              <Text className="text-slate-400 font-bold mb-3 uppercase text-xs tracking-widest">
                Notes / Motivation (optional)
              </Text>
              <Controller
                control={control}
                name="goals"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    multiline
                    numberOfLines={5}
                    className="bg-slate-50 p-5 rounded-[28px] border border-slate-100 text-base font-medium text-slate-700"
                    style={{ minHeight: 140, textAlignVertical: "top" }}
                    placeholder="e.g. Preparing for summer marathon! Focus on core strength."
                    placeholderTextColor="#94a3b8"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
            </View>

            {/* Confirmation summary */}
            <View className="bg-slate-50 rounded-[28px] p-6 border border-slate-100" style={{ gap: 12 }}>
              <Text className="text-slate-400 font-black text-xs uppercase tracking-widest">
                Review
              </Text>
              <SummaryRow
                icon="fitness"
                label="Type"
                value={
                  WORKOUT_TYPES.find((t) => t.value === watchedType)?.label ??
                  watchedType
                }
              />
              <SummaryRow
                icon="time-outline"
                label="Duration"
                value={
                  DURATION_OPTIONS.find((d) => d.value === watch("duration"))?.label ??
                  watch("duration")
                }
              />
              <SummaryRow
                icon="calendar-outline"
                label="Days"
                value={watchedDays.join(", ") || "—"}
              />
              <SummaryRow icon="alarm-outline" label="Time" value={watchedTime} />
            </View>

            <View className="bg-blue-50 p-5 rounded-[24px] border border-blue-100 flex-row items-center" style={{ gap: 16 }}>
              <View className="bg-blue-200/60 p-3 rounded-full">
                <Ionicons name="stats-chart" size={22} color="#2563eb" />
              </View>
              <View className="flex-1">
                <Text className="text-blue-900 font-black text-base">Goal Tracking</Text>
                <Text className="text-blue-700/60 font-medium text-sm">
                  We'll help you stay consistent.
                </Text>
              </View>
            </View>
          </View>
        );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* ── Progress Header ─────────────────────────────────────────────── */}
      <View className="px-6 py-4 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => (step > 1 ? setStep((s) => s - 1) : router.back())}
          className="bg-slate-50 w-12 h-12 rounded-full items-center justify-center border border-slate-100"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color="#0f172a" />
        </TouchableOpacity>

        {/* Animated step dots */}
        <View className="flex-row gap-2">
          {[1, 2, 3].map((i) => (
            <View
              key={i}
              style={{
                height: 8,
                width: step === i ? 28 : 8,
                borderRadius: 4,
                backgroundColor: step >= i ? "#2563eb" : "#e2e8f0",
              }}
            />
          ))}
        </View>

        <View className="w-12" />
      </View>

      {/* ── Scrollable body ─────────────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            alignSelf: isWideScreen ? "center" : "auto",
            width: isWideScreen ? 600 : "100%",
            marginTop: 32,
          }}
        >
          {/* Badge */}
          <View className="flex-row items-center mb-4" style={{ gap: 8 }}>
            <View className="bg-blue-100 p-2 rounded-xl">
              <Ionicons name="fitness" size={20} color="#2563eb" />
            </View>
            <Text className="text-blue-600 font-black tracking-widest uppercase text-xs">
              New Workout Reminder — Step {step} of 3
            </Text>
          </View>

          {/* Title */}
          <Text className="text-4xl font-black text-slate-900 mb-8 leading-[46px]">
            {step === 1
              ? "Choose your\nworkout"
              : step === 2
              ? "Schedule\nyour time"
              : "Perfect your\nroutine"}
          </Text>

          {renderStep()}
        </View>
      </ScrollView>

      {/* ── Footer Actions ───────────────────────────────────────────────── */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 pt-4 pb-8 flex-row gap-3">
        <TouchableOpacity
          className="flex-1 bg-slate-100 h-16 rounded-[22px] items-center justify-center"
          onPress={() => router.back()}
        >
          <Text className="text-slate-500 font-black text-base">Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-[2] bg-blue-600 h-16 rounded-[22px] items-center justify-center shadow-lg shadow-blue-200"
          disabled={isSaving}
          onPress={step < 3 ? handleNext : handleSubmit(onSubmit)}
        >
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <View className="flex-row items-center gap-2">
              <Text className="text-white font-black text-base">
                {step === 3 ? "Set Reminder" : "Continue"}
              </Text>
              {step < 3 ? (
                <Ionicons name="arrow-forward" size={18} color="white" />
              ) : (
                <Ionicons name="checkmark-circle" size={18} color="white" />
              )}
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ─── Summary row helper ───────────────────────────────────────────────────────
function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center" style={{ gap: 12 }}>
      <View className="w-8 h-8 bg-white rounded-full items-center justify-center border border-slate-200">
        <Ionicons name={icon} size={14} color="#3b82f6" />
      </View>
      <Text className="text-slate-400 font-bold text-sm w-16">{label}</Text>
      <Text className="text-slate-800 font-black text-sm flex-1 capitalize">
        {value}
      </Text>
    </View>
  );
}

export default AddWorkout;
