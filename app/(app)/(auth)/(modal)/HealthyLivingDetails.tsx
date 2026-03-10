import React from "react";
import {
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import RenderHTML from "react-native-render-html";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useHealthyLivingTopic } from "@/hooks/use-healthy-living";
import { themeColors } from "@/src/theme/colors";
import { SafeAreaView } from "react-native-safe-area-context";

const HealthyLivingDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const { data: topic, isLoading } = useHealthyLivingTopic({
    id: id as string,
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-100">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons name="arrow-back" size={24} color={themeColors.darkGray} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800">Healthy Living</Text>
        <View className="w-10" />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {topic ? (
          <>
            <Text className="text-3xl font-bold text-slate-900 mb-2 leading-tight">
              {topic.topic_name}
            </Text>

            {topic.category && (
              <View className="bg-emerald-50 self-start px-3 py-1 rounded-full mb-6">
                <Text className="text-emerald-700 text-xs font-bold uppercase tracking-wide">
                  {topic.category}
                </Text>
              </View>
            )}

            {topic.about && (
              <View className="bg-slate-50 p-4 rounded-2xl mb-6">
                <RenderHTML
                  contentWidth={width - 80}
                  source={{ html: topic.about }}
                  baseStyle={{
                    fontSize: 16,
                    color: "#334155",
                    lineHeight: 24,
                  }}
                />
              </View>
            )}

            {/* Additional fields if present */}
            {["benefits", "tips", "recommendations", "advice"].map((field) =>
              topic[field] ? (
                <View key={field} className="mb-8">
                  <Text className="text-xl font-bold text-slate-800 mb-3 capitalize">
                    {field}
                  </Text>
                  <RenderHTML
                    contentWidth={width - 48}
                    source={{ html: topic[field] }}
                    baseStyle={{
                      fontSize: 16,
                      color: "#475569",
                      lineHeight: 24,
                    }}
                  />
                </View>
              ) : null
            )}

            {topic.attribution && (
              <View className="mt-4 pt-4 border-t border-slate-100">
                <Text className="text-xs text-slate-400 italic">
                  Source: {topic.attribution}
                </Text>
              </View>
            )}
          </>
        ) : (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-lg text-slate-400">Topic not found</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HealthyLivingDetails;
