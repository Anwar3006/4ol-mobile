import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  Animated,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Tabs, useRouter, useSegments } from "expo-router";
// Using Expo icons for better reliability and variety
import { FontAwesome5, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { themeColors } from "@/src/theme/colors";
// import { useNavigationMode } from "react-native-navigation-mode";
import useUserStore from "@/store/use-userstore";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TabsLayout = () => {
  const insets = useSafeAreaInsets();
  const { user: userData } = useUserStore();

  return (
    <Tabs
      screenOptions={{
        tabBarHideOnKeyboard: true,
        tabBarStyle: { 
          height: Platform.OS === 'ios' ? 60 + insets.bottom - 20 : 70,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom  : 10,
          backgroundColor: themeColors.white,
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
        },
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#10b981", 
        tabBarInactiveTintColor: themeColors.darkGray,
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          tabBarIcon: ({ focused }) => (
            <FontAwesome5
              name="home"
              size={24}
              color={focused ? themeColors.primary : themeColors.darkGray}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Map"
        options={{
          tabBarIcon: ({ focused }) => (
            <FontAwesome5
              name="location-arrow"
              size={24}
              color={focused ? themeColors.primary : themeColors.darkGray}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Reminders"
        options={{
          // Set to false here because we've handled global visibility in screenOptions, 
          // but keeping it explicit if you want a custom header later
          headerShown: false, 
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="alarm-outline"
              size={28}
              color={focused ? themeColors.primary : themeColors.darkGray}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="SavedItems"
        options={{
          href: null,
          tabBarIcon: ({ focused }) => (
            <MaterialIcons
              name="favorite-outline"
              size={26}
              color={focused ? themeColors.primary : themeColors.darkGray}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Chats"
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={26}
              color={focused ? themeColors.primary : themeColors.darkGray}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="My Account"
        options={{
          // href: null,
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <FontAwesome5
              name="ellipsis-h"
              size={20}
              color={focused ? themeColors.primary : themeColors.darkGray}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;