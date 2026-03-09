import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Route, useRouter } from "expo-router";

interface MenuItemProps {
  label: string;
  subText?: string;
  icon: keyof typeof Ionicons.glyphMap;
  href?: Route; // Optional now
  onPress?: () => void; // Added for actions
  isLogout?: boolean;
  rightElement?: React.ReactNode;
}

const ProfileMenuItem = ({
  label,
  subText,
  icon,
  href,
  onPress,
  isLogout,
  rightElement,
}: MenuItemProps) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (href) {
      router.push(href as any);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.6}
      className="flex-row items-center justify-between py-5 border-b border-gray-200"
    >
      <View className="flex-row items-center max-w-xs" style={{ gap: 16 }}>
        <View
          className={`p-2 rounded-xl ${isLogout ? "bg-red-50" : "bg-transparent"}`}
        >
          <Ionicons
            name={icon}
            size={24}
            color={isLogout ? "#ef4444" : "#10b981"}
          />
        </View>

        <View className="flex-1" style={{ gap: 4 }}>
          <Text
            className={`text-base font-semibold ${isLogout ? "text-red-500" : "text-slate-700"}`}
          >
            {label}
          </Text>

          {subText ? (
            <Text className="text-sm text-wrap text-gray-500">{subText}</Text>
          ) : null}
        </View>
      </View>

      {/* If rightElement exists (Switch), show it; otherwise show Chevron */}
      {rightElement ? (
        rightElement
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
      )}
    </TouchableOpacity>
  );
};

export default ProfileMenuItem;
