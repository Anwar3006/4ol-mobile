import { Stack } from "expo-router";
import React from "react";

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="Business" />
      <Stack.Screen
        name="Logout"
        options={{
          headerShown: false,
          title: "Logout",
          presentation: "transparentModal",
          animation: "fade",
          contentStyle: { backgroundColor: "transparent" },
        }}
      />
    </Stack>
  );
}
