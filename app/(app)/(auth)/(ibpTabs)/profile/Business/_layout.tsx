import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";

const BusinessLayout = () => {
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: "#EBF9E6" } }}>
      <Stack.Screen
        name="Billing"
        options={{
          headerShown: false,
          title: "Billing",
          //   headerLargeTitleEnabled: true,
          //   headerTransparent: true,
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
        name="Support"
        options={{
          headerShown: false,
          title: "Support",
        }}
      />

      {/* <Stack.Screen
        name="PaymentOptions"
        options={{
          headerShown: false,
          title: "Payment Options",
          headerLargeTitleEnabled: true,
          headerTransparent: true,
        }}
      /> */}

    </Stack>
  );
};

export default BusinessLayout;
