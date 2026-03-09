import { View, Text, SafeAreaView } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

const Chats = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center p-6">
        <View className="bg-green-50 p-6 rounded-full mb-6">
          <Ionicons name="chatbubbles-outline" size={80} color="#10b981" />
        </View>
        <Text className="text-2xl font-black text-slate-900 mb-2">
          Messages
        </Text>
        <Text className="text-gray-500 text-center leading-6">
          Our new Chat feature is coming soon!{"\n"}
          Connect with IBP and Facility Owners directly.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default Chats;
