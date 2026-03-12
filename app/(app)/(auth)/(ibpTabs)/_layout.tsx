import React from "react";
import { Tabs } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function IBPTabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#10b981",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          borderTopWidth: 1,
          borderTopColor: "#f1f5f9",
          backgroundColor: "white",
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          marginBottom: 4,
        },
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      {/* ── Tab 1: Dashboard ─────────────────────────────────────── */}
      <Tabs.Screen
        name="index"
        options={{
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

      {/* ── Tab 2: My Business (facilities) ──────────────────────── */}
      <Tabs.Screen
        name="facilities"
        options={{
          title: "My Business",
          tabBarIcon: ({ size, focused, color }) => (
            <MaterialCommunityIcons
              name={focused ? "office-building" : "office-building-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* ── Tab 3: Chat ───────────────────────────────────────────── */}
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ size, focused, color }) => (
            <Ionicons
              name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* ── Tab 4: More ───────────────────────────────────────────── */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ size, focused, color }) => (
            <Ionicons
              name={focused ? "ellipsis-horizontal-circle" : "ellipsis-horizontal-circle-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* ── Hidden routes (file-system siblings, not shown in tab bar) ─ */}
      <Tabs.Screen name="marketing" options={{ href: null }} />
      <Tabs.Screen name="analytics" options={{ href: null }} />
      {/* <Tabs.Screen name="profile" options={{ href: null }} /> */}
    </Tabs>
  );
}
