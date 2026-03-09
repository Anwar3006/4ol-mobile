import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { useWindowDimensions } from "react-native";

interface CategorySmallProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  screen: string;
  containerClassName?: string;
}

export const CategorySmall = ({
  title,
  icon,
  value,
  screen,
  containerClassName,
}: CategorySmallProps) => {
  const router = useRouter();
  const { width } = useWindowDimensions();

  // Scale factors for narrow screens (like Galaxy Z Fold folded)
  // Usually folded screen width is around 280-320px
  const isNarrow = width < 340;
  const iconSize = isNarrow ? 36 : 48;
  const textSize = isNarrow ? "text-[9px]" : "text-xs";
  const padding = isNarrow ? "p-1" : "p-2";

  const handlePress = () => {
    if (value === "diseases") {
      router.push("/(app)/(auth)/(tabs)/Home/Categories/Diseases");
    } else if (value === "healthy_living") {
      router.push("/(app)/(auth)/(tabs)/Home/Categories/HealthyLiving");
    } else if (value === "wellness_facilities") {
      router.push("/(app)/(auth)/(tabs)/Home/Categories/Wellness");
    } else {
      router.push("/(app)/(auth)/(tabs)/Home/Categories/Symptoms");
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(
        value === "wellness_facilities" ? "/(app)/(auth)/(tabs)/Home/Categories/Wellness" : 
        value === "diseases" ? "/(app)/(auth)/(tabs)/Home/Categories/Diseases" : 
        value === "healthy_living" ? "/(app)/(auth)/(tabs)/Home/Categories/HealthyLiving" : 
        "/(app)/(auth)/(tabs)/Home/Categories/Symptoms"
      )}
      className={cn(
        "aspect-square bg-white rounded-[2rem] items-center justify-center shadow-sm border border-gray-100",
        padding,
        containerClassName,
      )}
    >
      <View
        style={{ height: iconSize, width: iconSize }}
        className="items-center justify-center mb-1"
      >
        {icon}
      </View>

      <Text
        numberOfLines={2}
        className={cn(
          "font-black text-gray-700 text-center leading-3 px-1 tracking-tighter uppercase",
          textSize,
        )}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};
