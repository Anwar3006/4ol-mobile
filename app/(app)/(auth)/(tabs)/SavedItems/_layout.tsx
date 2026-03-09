import { Stack } from "expo-router";

export default function SavedItemsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Saved Items",
          headerShown: false,
        }}
      />

    </Stack>
  );
}