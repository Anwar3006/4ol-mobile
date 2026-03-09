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
        name="DisableBiometrics"
        options={{
          headerShown: false,
          title: "User Profile",
          headerLargeTitleEnabled: true,
          headerTransparent: true,
        }}
      />

      <Stack.Screen
        name="DeleteAccount"
        options={{
          headerShown: false,
          title: "Delete Account",
        }}
      />
      {/* <Stack.Screen
        name="PasswordManager"
        options={{
          headerShown: false,
          title: "Password Manager",
          presentation: "transparentModal",
          animation: "fade",
          contentStyle: { backgroundColor: "transparent" },
        }}
      /> */}
    </Stack>
  );
};

export default ProfileLayout;
