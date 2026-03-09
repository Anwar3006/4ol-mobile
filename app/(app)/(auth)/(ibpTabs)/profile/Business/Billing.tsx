import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const BillingInvoices = () => {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-6 py-4 border-b border-slate-50">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-slate-900">Billing & Invoices</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-8">
        <View className="bg-emerald-600 p-8 rounded-[40px] mb-8 shadow-lg shadow-emerald-100">
           <Text className="text-emerald-100 font-bold uppercase text-[10px] tracking-widest mb-1">Current Plan</Text>
           <Text className="text-white text-3xl font-black mb-4">Enterprise Pro</Text>
           <View className="h-[1px] bg-white/20 mb-4" />
           <View className="flex-row justify-between items-center">
             <View>
               <Text className="text-emerald-100 text-xs">Next Billing Date</Text>
               <Text className="text-white font-bold">March 15, 2026</Text>
             </View>
             <TouchableOpacity className="bg-white/20 px-4 py-2 rounded-xl">
               <Text className="text-white font-bold text-xs">Manage</Text>
             </TouchableOpacity>
           </View>
        </View>

        <Text className="text-xl font-black text-slate-900 mb-4">Recent Invoices</Text>
        <View className="gap-3">
          <InvoiceItem date="Feb 15, 2026" amount="GHS 450.00" status="Paid" />
          <InvoiceItem date="Jan 15, 2026" amount="GHS 450.00" status="Paid" />
          <InvoiceItem date="Dec 15, 2025" amount="GHS 450.00" status="Paid" />
        </View>

        <TouchableOpacity className="mt-8 flex-row items-center justify-center bg-slate-50 p-5 rounded-[24px] border border-slate-100">
           <Ionicons name="card-outline" size={20} color="#64748b" />
           <Text className="text-slate-600 font-bold ml-2">Update Payment Method</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const InvoiceItem = ({ date, amount, status }: any) => (
  <TouchableOpacity className="bg-white p-5 rounded-[24px] flex-row items-center border border-slate-100 shadow-sm">
    <View className="bg-slate-50 p-3 rounded-2xl mr-4">
      <Ionicons name="document-text-outline" size={22} color="#64748b" />
    </View>
    <View className="flex-1">
      <Text className="text-slate-800 font-bold">{date}</Text>
      <Text className="text-slate-400 text-xs font-medium">{status}</Text>
    </View>
    <Text className="text-slate-900 font-black mr-3">{amount}</Text>
    <Ionicons name="download-outline" size={20} color="#10b981" />
  </TouchableOpacity>
);

export default BillingInvoices;
