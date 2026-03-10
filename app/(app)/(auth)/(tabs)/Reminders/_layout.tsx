import { Stack } from "expo-router";

export default function MedicationsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Reminders",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="MedicationList"
        options={{
          title: "Medication Reminder",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="WorkoutList"
        options={{
          title: "Workout Reminders",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="Calendar"
        options={{
          title: "Calendar",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="[id]"
        options={{
          title: "Medication Details",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="AddMedication"
        options={{
          title: "Add Medication",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="AddWorkout"
        options={{
          title: "Add Workout",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
