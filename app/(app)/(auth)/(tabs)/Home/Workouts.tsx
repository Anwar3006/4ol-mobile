import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Workouts = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 600;
  const router = useRouter();

  return (
    <ScrollView
      contentContainerStyle={{
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 10,
        paddingHorizontal: isLargeScreen ? width * 0.1 : 20,
      }}
      showsVerticalScrollIndicator={false}
      className="flex-1"
    >
      <View className="px-6 py-4 flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-white p-2 rounded-full shadow-sm"
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-black text-slate-900 ml-4">
          Workouts
        </Text>
      </View>

      <View className="flex-1 items-center justify-center p-6">
        <View className="bg-blue-50 p-6 rounded-full mb-6">
          <Ionicons name="fitness" size={80} color="#3b82f6" />
        </View>
        <Text className="text-2xl font-black text-slate-900 mb-2">
          Coming Soon
        </Text>
        <Text className="text-gray-500 text-center leading-6">
          Personalized workouts and training programs are under development.
          {"\n"}
          Stay tuned for updates!
        </Text>
      </View>
    </ScrollView>
  );
};

export default Workouts;
