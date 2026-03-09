import React, { useState, useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, useWindowDimensions } from "react-native";
import Animated, {
  FadeInRight,
  FadeOutLeft,
  LinearTransition,
} from "react-native-reanimated";
import FacilityCard from "./FacilityCard";
import { useRouter } from "expo-router";
import { useTopRatedFacilities } from "@/hooks/use-facilities";

const TopRated = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 600;
  const { data, isLoading, isError, error } = useTopRatedFacilities({ limit: 5 });
  const [activeIndex, setActiveIndex] = useState(0);

  const topFacilities = useMemo(() => 
    data?.pages.flatMap((page) => page.facilities) || [], 
  [data]);

  // On large screens, group into pairs for 2-per-slide
  const slides = useMemo(() => {
    if (!isLargeScreen) return topFacilities.map((f) => [f]);
    const pairs: (typeof topFacilities)[] = [];
    for (let i = 0; i < topFacilities.length; i += 2) {
      pairs.push(topFacilities.slice(i, i + 2));
    }
    return pairs;
  }, [topFacilities, isLargeScreen]);

  // Rotation Logic
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [slides.length]);

  if (isLoading) return (
    <View className="h-40 items-center justify-center">
      <ActivityIndicator color="#10b981" />
    </View>
  );
  
  if (isError) return <Text className="text-red-500 px-4">Error: {error?.message}</Text>;
  if (slides.length === 0) return null;

  const activeSlide = slides[activeIndex];

  return (
    <View className="mb-6 px-4">
      {/* Header Row */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-black text-slate-900">Top Rated</Text>
        <TouchableOpacity
          onPress={() => router.push("/Home/top-rated" as any)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text className="text-green-600 font-bold">View All</Text>
        </TouchableOpacity>
      </View>

      {/* Reanimated Container */}
      <View className={isLargeScreen ? "h-[320px]" : "h-[320px]"}>
        {activeSlide && (
          <Animated.View
            key={`slide-${activeIndex}`}
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

      {/* Premium Progress Indicators */}
      <View className="flex-row justify-center gap-x-2 mt-2">
        {slides.map((_: any, i: any) => (
          <View
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === activeIndex ? "w-6 bg-green-500" : "w-1.5 bg-gray-200"
            }`}
          />
        ))}
      </View>
    </View>
  );
};

export default TopRated;
