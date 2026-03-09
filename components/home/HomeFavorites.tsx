import React, { useState, useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity, useWindowDimensions } from "react-native";
import Animated, {
  FadeInRight,
  FadeOutLeft,
  LinearTransition,
} from "react-native-reanimated";
import FacilityCard from "./FacilityCard";
import { useRouter } from "expo-router";
import useFavoritesStore from "@/store/use-favorites-store";

const HomeFavorites = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 600;
  const { favorites } = useFavoritesStore();
  const [activeIndex, setActiveIndex] = useState(0);

  // On large screens, group into pairs for 2-per-slide
  const slides = useMemo(() => {
    if (!isLargeScreen) return favorites.map((f) => [f]);
    const pairs: (typeof favorites)[] = [];
    for (let i = 0; i < favorites.length; i += 2) {
      pairs.push(favorites.slice(i, i + 2));
    }
    return pairs;
  }, [favorites, isLargeScreen]);

  // Rotation Logic
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 8500); // Slightly different timing than TopRated to avoid perfect sync
    return () => clearInterval(interval);
  }, [slides.length]);

  if (favorites.length === 0) return null;

  // Reset index if it goes out of bounds (e.g. after removals)
  const safeIndex = activeIndex >= slides.length ? 0 : activeIndex;
  const activeSlide = slides[safeIndex];

  return (
    <View className="mb-10 px-4">
      {/* Header Row */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-black text-slate-900">Your Favorites</Text>
        <TouchableOpacity
          onPress={() => router.push("/(app)/(auth)/(tabs)/My Account/Favorites" as any)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text className="text-green-600 font-bold">View All</Text>
        </TouchableOpacity>
      </View>

      {/* Reanimated Container */}
      <View className="h-[320px]">
        {activeSlide && (
          <Animated.View
            key={`favorite-slide-${safeIndex}`}
            entering={FadeInRight.duration(800).springify().damping(75)}
            exiting={FadeOutLeft.duration(400)}
            layout={LinearTransition.springify()}
            style={{ flex: 1, flexDirection: "row", gap: 12 }}
          >
            {activeSlide.map((facility) => (
              <View key={facility.id} style={{ flex: 1 }}>
                <FacilityCard
                  facility={facility}
                  onPress={() => router.push(`/Facility/${facility.id}` as any)}
                />
              </View>
            ))}
          </Animated.View>
        )}
      </View>

      {/* Progress Indicators */}
      <View className="flex-row justify-center gap-x-2 mt-2">
        {slides.map((_, i) => (
          <View
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === safeIndex ? "w-6 bg-green-500" : "w-1.5 bg-gray-200"
            }`}
          />
        ))}
      </View>
    </View>
  );
};

export default HomeFavorites;
