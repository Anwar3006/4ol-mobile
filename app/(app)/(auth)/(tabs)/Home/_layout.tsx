import React from "react";
import { Stack } from "expo-router";

const ProfileLayout = () => {
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: "#EBF9E6" } }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Home",
          headerLargeTitleEnabled: true,
          headerTransparent: true,
        }}
      />

      <Stack.Screen
        name="Categories"
        options={{
          headerShown: false,
          title: "Categories",
          headerLargeTitleEnabled: true,
          headerTransparent: true,
        }}
      />

      <Stack.Screen
        name="top-rated"
        options={{
          headerShown: false,
          title: "Top Rated",
          headerLargeTitleEnabled: true,
          headerTransparent: true,
        }}
      />

      <Stack.Screen
        name="Workouts"
        options={{
          headerShown: false,
          title: "Workouts",
          headerLargeTitleEnabled: true,
          headerTransparent: true,
        }}
      />
    </Stack>
  );
};

export default ProfileLayout;
