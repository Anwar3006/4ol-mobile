import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Linking,
  Platform,
} from "react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const HelpCenter = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const faqs = [
    {
      question: "How do I add a medication?",
      answer: "Go to the Medications tab and tap the '+' button at the bottom right.",
    },
    {
      question: "Can I set multiple reminders?",
      answer: "Yes, once a medication is added, you can configure flexible reminder intervals.",
    },
    {
      question: "How do I update my profile?",
      answer: "Navigate to My Account > Profile to update your personal information.",
    },
    {
      question: "Is my data secure?",
      answer: "We use encrypted local storage for sensitive data like biometrics and secure backend sessions.",
    },
  ];

  const handleContact = (type: "whatsapp" | "email" | "call") => {
    switch (type) {
      case "whatsapp":
        Linking.openURL("whatsapp://send?phone=+233550000000"); // Replace with actual support number
        break;
      case "email":
        Linking.openURL("mailto:support@4ourlife.com");
        break;
      case "call":
        Linking.openURL("tel:+233550000000");
        break;
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View
        style={{ paddingTop: insets.top + 10 }}
        className="flex-row items-center justify-between px-6 pb-4 bg-white"
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#334155" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-slate-800">Help Center</Text>
        <View className="w-6" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Support Options */}
        <View className="px-6 py-6">
          <Text className="text-2xl font-black text-slate-900 mb-6">
            How can we help?
          </Text>

          <View className="flex-row justify-between gap-x-4 mb-8">
            <TouchableOpacity
              onPress={() => handleContact("whatsapp")}
              className="flex-1 bg-emerald-50 p-6 rounded-[32px] items-center border border-emerald-100"
            >
              <MaterialCommunityIcons name="whatsapp" size={32} color="#10b981" />
              <Text className="mt-3 font-bold text-emerald-800">WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleContact("email")}
              className="flex-1 bg-blue-50 p-6 rounded-[32px] items-center border border-blue-100"
            >
              <MaterialCommunityIcons name="email-outline" size={32} color="#3b82f6" />
              <Text className="mt-3 font-bold text-blue-800">Email</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => handleContact("call")}
            className="w-full flex-row items-center bg-gray-50 p-6 rounded-[32px] border border-gray-100 mb-8"
          >
            <View className="bg-white p-3 rounded-2xl shadow-sm mr-4">
              <Ionicons name="call-outline" size={24} color="#64748b" />
            </View>
            <View>
              <Text className="font-bold text-slate-900">Call Support</Text>
              <Text className="text-slate-500 text-xs">Available 24/7 for emergencies</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" className="ml-auto" />
          </TouchableOpacity>

          {/* FAQs */}
          <Text className="text-xl font-black text-slate-900 mb-4">FAQs</Text>
          {faqs.map((faq, index) => (
            <View key={index} className="mb-4 bg-gray-50 p-5 rounded-3xl border border-gray-100">
              <Text className="font-bold text-slate-800 mb-2">{faq.question}</Text>
              <Text className="text-slate-500 leading-5 text-sm">{faq.answer}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default HelpCenter;
