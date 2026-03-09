import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, useWindowDimensions } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTopRatedFacilities } from "@/hooks/use-facilities";
import FacilityCard from "@/components/home/FacilityCard";

const TopRatedScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 600;

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = 
    useTopRatedFacilities({ limit: 10 });

  const facilities = data?.pages.flatMap((page) => page.facilities) || [];

  return (
    <View className="flex-1 bg-[#EBF9E6]">
      {/* Header */}
      <View
        style={{ paddingTop: insets.top + 10 }}
        className="flex-row items-center justify-between px-6 pb-6 bg-[#EBF9E6]"
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#334155" />
        </TouchableOpacity>

        <Text className="text-xl font-black text-slate-800">
          Top Rated
        </Text>

        <View className="w-6" />
      </View>

      <FlashList
        data={facilities}
        keyExtractor={(item) => item.id}
        numColumns={isLargeScreen ? 2 : 1}
        renderItem={({ item }) => (
          <View
            style={{
              flex: 1,
              paddingHorizontal: isLargeScreen ? 8 : 20,
              paddingBottom: 4,
            }}
          >
            <FacilityCard 
              facility={item} 
              onPress={() => router.push(`/Facility/${item.id}` as any)}
            />
          </View>
        )}
        contentContainerStyle={{ paddingHorizontal: isLargeScreen ? 12 : 0 }}
        // @ts-ignore
        estimatedItemSize={300}
        onEndReached={() => {
          if (hasNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center justify-center py-20">
              <Text className="text-gray-500 font-medium">No top rated facilities found</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator size="small" color="#10b981" className="py-4" />
          ) : <View className="h-20" />
        }
      />
    </View>
  );
};

export default TopRatedScreen;
