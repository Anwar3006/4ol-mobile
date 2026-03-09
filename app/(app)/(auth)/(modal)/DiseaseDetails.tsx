import React, { useEffect, useState } from "react";
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
import { getDiseaseDetailsById } from "@/src/services/diseases";
import { useCondition } from "@/hooks/use-condition";
import { themeColors } from "@/src/theme/colors";
import { SafeAreaView } from "react-native-safe-area-context";

const DiseaseDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [disease, setDisease] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { width } = useWindowDimensions();

  const { data: conditionData, isLoading: conditionLoading } = useCondition({ 
    id: id as string, 
    enabled: !!id 
  });

  useEffect(() => {
    if (id) {
      if (conditionData) {
        setDisease(conditionData);
        setLoading(false);
      } else if (!conditionLoading) {
        // Fallback to legacy service if hook returns nothing
        getDiseaseDetailsById(id as string, 
          () => setLoading(true),
          (data: any) => {
            setDisease(data);
            setLoading(false);
          },
          (err: any) => {
            console.log("Legacy fetch failed", err);
            setLoading(false);
          }
        );
      }
    }
  }, [id, conditionData, conditionLoading]);

  const isLoading = loading || (conditionLoading && !disease);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-100">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons name="arrow-back" size={24} color={themeColors.darkGray} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800">Disease Details</Text>
        <View className="w-10" />
      </View>

      <ScrollView 
        contentContainerStyle={{ padding: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {disease ? (
          <>
            <Text className="text-3xl font-bold text-slate-900 mb-6 leading-tight">
                {disease.condition_name || disease.name}
            </Text>
            
            <View className="bg-slate-50 p-4 rounded-2xl mb-6">
                 {disease.about && (
                    <RenderHTML
                        contentWidth={width - 80}
                        source={{ html: disease.about }}
                        baseStyle={{
                            fontSize: 16,
                            color: '#334155', // slate-700
                            lineHeight: 24,
                        }}
                    />
                 )}
            </View>

            {/* Sections */}
            {['symptoms', 'diagnosis', 'treating', 'prevention', 'complications'].map((section) => (
                disease[section] ? (
                    <View key={section} className="mb-8">
                        <Text className="text-xl font-bold text-slate-800 mb-3 capitalize">
                            {section}
                        </Text>
                        <RenderHTML
                            contentWidth={width - 48}
                            source={{ html: disease[section] }}
                            baseStyle={{
                                fontSize: 16,
                                color: '#475569', // slate-600
                                lineHeight: 24,
                            }}
                        />
                    </View>
                ) : null
            ))}

            {disease.attribution && (
                <View className="mt-4 pt-4 border-t border-slate-100">
                    <Text className="text-xs text-slate-400 italic">
                        Source: {disease.attribution}
                    </Text>
                </View>
            )}
          </>
        ) : (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-lg text-slate-400">Disease details not found</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DiseaseDetails;
