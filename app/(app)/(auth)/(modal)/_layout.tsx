import React from "react";
import { Stack } from "expo-router";

export default function ModalLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: "modal",
      }}
    >
      <Stack.Screen name="SearchResultModal" />
      <Stack.Screen name="DiseaseDetails" />
      <Stack.Screen name="SymptomDetails" />
    </Stack>
  );
}
