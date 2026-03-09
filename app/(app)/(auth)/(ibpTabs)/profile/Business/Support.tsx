import React from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const BusinessSupport = () => {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-6 py-4 border-b border-slate-50">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-slate-900">Business Support</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-8">
        <View className="items-center mb-8">
          <View className="bg-blue-50 w-20 h-20 rounded-3xl items-center justify-center mb-4">
            <Ionicons name="headset" size={40} color="#3b82f6" />
          </View>
          <Text className="text-2xl font-black text-slate-800 text-center">How can we help?</Text>
          <Text className="text-slate-500 font-medium text-center mt-2 px-4">
            Our merchant success team is available 24/7 to assist with your facilities.
          </Text>
        </View>

        <View className="gap-4 mb-8">
          <TouchableOpacity className="bg-emerald-50 p-6 rounded-[32px] border border-emerald-100 flex-row items-center">
            <View className="bg-white p-3 rounded-2xl mr-4 shadow-sm">
               <Ionicons name="chatbubbles" size={24} color="#10b981" />
            </View>
            <View className="flex-1">
              <Text className="text-emerald-900 font-black text-lg">Live Chat</Text>
              <Text className="text-emerald-700 font-medium text-xs">Typical response: 2 mins</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#10b981" />
          </TouchableOpacity>

          <TouchableOpacity className="bg-blue-50 p-6 rounded-[32px] border border-blue-100 flex-row items-center">
            <View className="bg-white p-3 rounded-2xl mr-4 shadow-sm">
               <Ionicons name="mail" size={24} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="text-blue-900 font-black text-lg">Email Support</Text>
              <Text className="text-blue-700 font-medium text-xs">Typical response: 2 hours</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        <Text className="text-xl font-black text-slate-900 mb-4">FAQs</Text>
        <View className="gap-3 mb-10">
          <FAQItem question="How do I add a new location?" />
          <FAQItem question="When will my facility be approved?" />
          <FAQItem question="How to manage staff permissions?" />
          <FAQItem question="Pricing for multiple centers?" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const FAQItem = ({ question }: any) => (
  <TouchableOpacity className="bg-slate-50 p-5 rounded-[24px] border border-slate-100 flex-row justify-between items-center">
    <Text className="text-slate-800 font-bold flex-1 mr-4">{question}</Text>
    <Ionicons name="add" size={20} color="#cbd5e1" />
  </TouchableOpacity>
);

export default BusinessSupport;
