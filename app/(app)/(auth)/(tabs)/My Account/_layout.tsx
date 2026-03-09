import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";

const ProfileLayout = () => {
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: "#EBF9E6" } }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Settings",
          headerLargeTitleEnabled: true,
          headerTransparent: true,
        }}
      />

      <Stack.Screen
        name="UserProfile"
        options={{
          headerShown: false,
          title: "User Profile",
          headerLargeTitleEnabled: true,
          headerTransparent: true,
        }}
      />

      <Stack.Screen
        name="Favorites"
        options={{
          headerShown: false,
          title: "Favorites",
        }}
      />
      <Stack.Screen
        name="HelpCenter"
        options={{
          headerShown: false,
          title: "Help Center",
        }}
      />

      {/* Privacy Policy is defined in the public/legal folder */}

      <Stack.Screen
        name="PasswordManager"
        options={{
          headerShown: false,
          title: "Password Manager",
          presentation: "transparentModal",
          animation: "fade",
          contentStyle: { backgroundColor: "transparent" },
        }}
      />
      <Stack.Screen
        name="PaymentOptions"
        options={{
          headerShown: false,
          title: "Payment Options",
          headerLargeTitleEnabled: true,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="Settings"
        options={{
          headerShown: false,
          title: "Settings",
        }}
      />
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
};

export default ProfileLayout;
