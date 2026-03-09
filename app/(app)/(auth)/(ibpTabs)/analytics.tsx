import React from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// Basic Placeholder Chart (Simulated with Views)
const AnalyticsScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6">
        <View className="mt-8 mb-6">
          <Text className="text-3xl font-black text-slate-900">Performance</Text>
          <Text className="text-slate-500 font-medium">Insights into your business reach</Text>
        </View>

        {/* Visitor Trend Placeholder */}
        <View className="bg-slate-50 rounded-[32px] p-6 border border-slate-100 mb-6">
          <Text className="text-lg font-black text-slate-800 mb-4">Visitor Trends</Text>
          <View className="h-40 flex-row items-end justify-between px-2">
            {[40, 60, 45, 80, 55, 90, 70].map((h, i) => (
              <View 
                key={i} 
                style={{ height: `${h}%` }} 
                className="w-8 bg-emerald-500/20 rounded-t-lg border-t-2 border-emerald-500" 
              />
            ))}
          </View>
          <View className="flex-row justify-between mt-4 px-1">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <Text key={i} className="text-slate-400 font-bold text-xs">{d}</Text>
            ))}
          </View>
        </View>

        {/* Demographics */}
        <Text className="text-xl font-black text-slate-900 mb-4">Top Reach</Text>
        <View className="gap-4 mb-10">
          <View className="bg-slate-50 p-6 rounded-[32px] flex-row items-center border border-slate-100">
             <View className="bg-white w-12 h-12 rounded-full items-center justify-center mr-4 shadow-sm shadow-slate-200">
                <Text className="text-emerald-600 font-black">72%</Text>
             </View>
             <View className="flex-1">
                <Text className="text-slate-800 font-black text-lg">Female Audience</Text>
                <Text className="text-slate-400 font-bold text-xs uppercase tracking-widest">Dominant Demographic</Text>
             </View>
          </View>

          <View className="bg-slate-50 p-6 rounded-[32px] flex-row items-center border border-slate-100">
             <View className="bg-white w-12 h-12 rounded-full items-center justify-center mr-4 shadow-sm shadow-slate-200">
                <Text className="text-blue-600 font-black">45%</Text>
             </View>
             <View className="flex-1">
                <Text className="text-slate-800 font-black text-lg">Returning Visitors</Text>
                <Text className="text-slate-400 font-bold text-xs uppercase tracking-widest">Customer Loyalty</Text>
             </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AnalyticsScreen;
