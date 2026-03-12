import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import useUserStore from "@/store/use-userstore";
import { useInfiniteLiveCampaigns } from "@/hooks/use-marketing";
import { FlashList } from "@shopify/flash-list";
import CampaignBox from "@/components/CampaignBox";
import { cn } from "@/lib/utils";

const { width } = Dimensions.get("window");

const IBPDashboard = () => {
  const { user: userData } = useUserStore();
  const [dateFilter, setDateFilter] = useState("Today");
  
  // Fetch Ads for the carousel at the bottom
  const { data: campaignData, isLoading: loadingCampaigns } = useInfiniteLiveCampaigns();
  const campaigns = campaignData?.pages.flatMap(page => page) || [];
  const availableWidth = width - 48; // Account for padding

  // Type definition - determining if user gets revenue tab
  const canSeeRevenue = userData?.user_type === 'business_provider' || userData?.facility_type === 'wellness';

  const DateChip = ({ label }: { label: string }) => (
    <TouchableOpacity 
      onPress={() => setDateFilter(label)}
      className={cn(
        "px-4 py-1.5 rounded-full border border-slate-200 mr-2",
        dateFilter === label ? "bg-slate-900 border-slate-900" : "bg-white"
      )}
    >
      <Text className={cn(
        "text-xs font-bold",
        dateFilter === label ? "text-white" : "text-slate-500"
      )}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#f8fafc]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white z-10">
        <View className="flex-row items-center">
           <View className="w-10 h-10 rounded-full bg-slate-200 items-center justify-center mr-3">
             <Text className="text-slate-600 font-bold">TS</Text>
           </View>
        </View>
        <View className="bg-emerald-50 w-10 h-10 rounded-xl items-center justify-center">
            <Ionicons name="leaf" size={20} color="#10b981" />
        </View>
        <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center">
          <Ionicons name="notifications-outline" size={24} color="#64748b" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Greetings */}
        <View className="items-center mt-6 mb-8 px-6">
          <Text className="text-2xl text-slate-800">
             Hi, <Text className="font-bold text-rose-500">{userData?.first_name || 'Business Name'}</Text>
          </Text>
        </View>

        {/* Filters */}
        <View className="flex-row justify-center mb-6">
           <DateChip label="Today" />
           <DateChip label="This Week" />
           <DateChip label="This Month" />
        </View>

        {/* Graph Card */}
        {canSeeRevenue && (
          <View className="mx-6 bg-emerald-500 rounded-3xl p-5 shadow-sm mb-4">
             <Text className="text-white font-medium text-sm">Total Transactions: 236</Text>
             <Text className="text-yellow-300 font-bold text-xl mb-4">Total Income: $3,254</Text>
             
             {/* Mock Graph Layout */}
             <View className="bg-white rounded-xl h-40 w-full p-2 justify-end mb-2">
                {/* SVG/Graph placeholder */}
                <View className="flex-1 border-b border-l border-slate-200 ml-6 pb-2 relative">
                   {/* Mock lines */}
                   <View className="absolute bottom-[20%] w-full h-[1px] bg-slate-100" />
                   <View className="absolute bottom-[40%] w-full h-[1px] bg-slate-100" />
                   <View className="absolute bottom-[60%] w-full h-[1px] bg-slate-100" />
                   <View className="absolute bottom-[80%] w-full h-[1px] bg-slate-100" />
                   
                   {/* Plot line mock */}
                   <View className="absolute bottom-0 left-0 right-0 h-full">
                       <Ionicons name="analytics" size={130} color="#bbf7d0" style={{position:'absolute', bottom:-10, left: 10, opacity: 0.5}} />
                   </View>
                </View>
                <View className="flex-row justify-between ml-6 mt-1 px-2">
                   {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                     <Text key={day} className="text-[9px] text-slate-400 font-bold">{day}</Text>
                   ))}
                </View>
             </View>

             <View className="bg-white/90 self-start px-2 py-1 rounded">
                <Text className="text-emerald-600 text-[10px] font-bold">↑ 2.1% less than last month</Text>
             </View>
          </View>
        )}

        {/* Stats Row */}
        <View className="flex-row justify-between px-6 mb-6">
           <View className="bg-white flex-1 mr-2 border-2 border-emerald-500 rounded-2xl items-center justify-center p-4">
               <Text className="text-3xl font-light text-blue-600 mb-1">336</Text>
               <Text className="text-[10px] text-emerald-600 font-bold">Total Customers</Text>
           </View>
           
           <View className="bg-white flex-1 mr-2 border-2 border-emerald-500 rounded-2xl items-center justify-center p-4">
               <Text className="text-3xl font-light text-blue-600 mb-1">14</Text>
               <Text className="text-[10px] text-emerald-600 font-bold">Total Products</Text>
           </View>
           
           <View className="bg-white flex-1 border-2 border-emerald-500 rounded-2xl items-center justify-center p-4">
               <Text className="text-3xl font-light text-blue-600 mb-1">1,362</Text>
               <Text className="text-[10px] text-emerald-600 font-bold text-center">Total Page Visits</Text>
           </View>
        </View>

        {/* Recent Transactions List */}
        <View className="mx-6 bg-slate-100 border-2 border-slate-200 rounded-lg overflow-hidden mb-8">
            <View className="p-3 border-b-2 border-slate-200">
               <Text className="text-emerald-600 font-medium">Recent Transactions:</Text>
            </View>
            
            <View className="p-3 flex-row justify-between border-b-2 border-slate-200 items-center">
               <View>
                 <Text className="text-emerald-600 font-bold">Kofi Peter</Text>
                 <Text className="text-[10px] text-slate-400">10/03/2026 - 15:22</Text>
               </View>
               <View className="items-center">
                 <Text className="text-emerald-600 font-bold">Gym Membership</Text>
                 <Text className="text-[10px] text-slate-400">(1 Month)</Text>
               </View>
               <View className="items-end">
                 <Text className="text-emerald-600 font-bold">GHC 200.00</Text>
                 <Text className="text-[10px] text-slate-400">ID:840611030</Text>
               </View>
            </View>
            
            <View className="p-3 flex-row justify-between items-center bg-emerald-50/50">
               <View>
                 <Text className="text-emerald-600 font-bold">Habiba Abena</Text>
                 <Text className="text-[10px] text-slate-400">10/03/2026 - 15:22</Text>
               </View>
               <View className="items-center">
                 <Text className="text-emerald-600 font-bold">Spa Booking</Text>
                 <Text className="text-[10px] text-slate-400">(3 Hours)</Text>
               </View>
               <View className="items-end">
                 <Text className="text-emerald-600 font-bold">GHC 150.00</Text>
                 <Text className="text-[10px] text-slate-400">ID:840611030</Text>
               </View>
            </View>
        </View>

        {/* Ads Carousel */}
        <View className="px-6 min-h-[200px]">
          {!loadingCampaigns && campaigns.length > 0 ? (
            <FlashList
              data={campaigns}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              estimatedItemSize={availableWidth || 400}
              keyExtractor={(item: any) => item.id}
              renderItem={({ item }) => (
                <View style={{ width: availableWidth }}>
                  <CampaignBox campaign={item} />
                </View>
              )}
            />
          ) : (
            <View className="bg-slate-200 rounded-3xl h-40 items-center justify-center">
               <Text className="text-slate-500 font-bold">Ads Carousel Loading...</Text>
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default IBPDashboard;
