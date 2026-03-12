import React from "react";
import { Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { cn } from "@/lib/utils";

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

  // Each card is 23% of the available container width (container has 40px total
  // horizontal padding on the Home screen). Scale icon + text relative to that
  // card size so it looks correct on phones, foldables AND tablets/iPads.
  const containerPadding = 40;
  const cardWidth = (width - containerPadding) * 0.23;

  // Icon box is 55% of the card, clamped between 36 and 96
  const iconBoxSize = Math.round(Math.min(Math.max(cardWidth * 0.55, 36), 96));

  // Text scales with card width, clamped to readable range
  const fontSize = Math.round(Math.min(Math.max(cardWidth * 0.06, 9), 16));

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
      onPress={handlePress}
      className={cn(
        "aspect-square bg-white rounded-[2rem] items-center justify-center shadow-sm border border-gray-100",
        containerClassName,
      )}
    >
      <View
        style={{ height: iconBoxSize, width: iconBoxSize }}
        className="items-center justify-center mb-1"
      >
        {icon}
      </View>

      <Text
        numberOfLines={2}
        style={{ fontSize }}
        className="font-black text-gray-700 text-center leading-3 px-1 tracking-tighter uppercase"
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};
