import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import useFavoritesStore from "@/store/use-favorites-store";
import FacilityCard from "@/components/home/FacilityCard";

const Favorites = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { favorites } = useFavoritesStore();

  return (
    <View className="flex-1 bg-white">
      <View
        style={{ paddingTop: insets.top + 10 }}
        className="flex-row items-center justify-between px-6 pb-8 bg-white"
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#334155" />
        </TouchableOpacity>

        <Text className="text-xl font-black text-slate-800">
          Liked Facilities
        </Text>

        <View className="w-6" />
      </View>

      <FlashList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="px-5">
            <FacilityCard 
              facility={item} 
              onPress={() => router.push(`/Facility/${item.id}` as any)}
            />
          </View>
        )}
        // @ts-ignore
        estimatedItemSize={300}
        ListEmptyComponent={
          <View className="items-center justify-center py-20 px-10">
            <Ionicons name="heart-outline" size={64} color="#e2e8f0" />
            <Text className="text-gray-500 font-bold text-center mt-4">
              Your favorites will appear here even when you're offline.
            </Text>
          </View>
        }
        ListFooterComponent={<View className="h-20" />}
      />
    </View>
  );
};

export default Favorites;
