import React from "react";
import { Tabs } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function IBPTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#10b981",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: {
          height: 72,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 700,
        },
        headerShown: false
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Dashboard",
          tabBarIcon: ({ size, focused, color }) => (
            <Ionicons
              name={focused ? "grid" : "grid-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="facilities"
        options={{
          headerShown: false,
          title: "My Facilities",
          tabBarIcon: ({ size, color }) => (
            <MaterialCommunityIcons
              name={"hospital-building"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          headerShown: false,
          title: "Analytics",
          tabBarIcon: ({ size, focused, color }) => (
            <Ionicons
              name={focused ? "stats-chart" : "stats-chart-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          title: "Profile",
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Business"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="ManageFacility"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
