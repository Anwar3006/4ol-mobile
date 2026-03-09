import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const IBPDashboard = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6">
        <View className="mt-8 mb-6">
          <Text className="text-3xl font-black text-slate-900">Manager Dashboard</Text>
          <Text className="text-slate-500 font-medium">Overview of your healthcare business</Text>
        </View>

        {/* Metric Cards Row */}
        <View className="flex-row justify-between mb-8">
          <View className="bg-emerald-50 border border-emerald-100 rounded-3xl p-5 w-[48%] shadow-sm shadow-emerald-100">
            <View className="bg-white w-10 h-10 rounded-full items-center justify-center mb-4">
              <Ionicons name="eye" size={20} color="#10b981" />
            </View>
            <Text className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Facility Views</Text>
            <Text className="text-2xl font-black text-slate-800">1,284</Text>
          </View>

          <View className="bg-blue-50 border border-blue-100 rounded-3xl p-5 w-[48%] shadow-sm shadow-blue-100">
            <View className="bg-white w-10 h-10 rounded-full items-center justify-center mb-4">
              <Ionicons name="star" size={20} color="#3b82f6" />
            </View>
            <Text className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Avg Rating</Text>
            <Text className="text-2xl font-black text-slate-800">4.8</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text className="text-xl font-black text-slate-900 mb-4">Quick Actions</Text>
        <View className="gap-4">
          <TouchableOpacity className="bg-slate-50 border border-slate-100 p-6 rounded-[32px] flex-row items-center">
            <View className="bg-emerald-100 p-3 rounded-2xl mr-4">
              <Ionicons name="add" size={24} color="#059669" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-black text-slate-800">New Facility</Text>
              <Text className="text-slate-500 font-medium">Register a new business</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#cbd5e1" />
          </TouchableOpacity>

          <TouchableOpacity className="bg-slate-50 border border-slate-100 p-6 rounded-[32px] flex-row items-center">
            <View className="bg-blue-100 p-3 rounded-2xl mr-4">
              <MaterialCommunityIcons name="bullhorn" size={24} color="#2563eb" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-black text-slate-800">Post Update</Text>
              <Text className="text-slate-500 font-medium">Announce services to users</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#cbd5e1" />
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <View className="mt-8 mb-10">
          <Text className="text-xl font-black text-slate-900 mb-4">Recent Activity</Text>
          <View className="bg-slate-50 rounded-[32px] p-6 border border-slate-100">
             <Text className="text-slate-400 font-bold text-center">No recent activity to show.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default IBPDashboard;
