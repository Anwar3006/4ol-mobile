import React from "react";
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { authClient } from "@/lib/auth-client";
import { useUserFacilities } from "@/hooks/use-facilities";
import { useRouter } from "expo-router";

const IBPFacilities = () => {
  const { data: sessionData } = authClient.useSession();
  const router = useRouter();
  const { data: facilities, isLoading } = useUserFacilities(sessionData?.user?.id);

  const handleManageFacility = (id: string) => {
    router.push({
      pathname: "/(app)/(auth)/(ibpTabs)/facilities/[id]",
      params: { id }
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6">
        <View className="mt-8 mb-6 flex-row justify-between items-center">
          <View>
            <Text className="text-3xl font-black text-slate-900">My Facilities</Text>
            <Text className="text-slate-500 font-medium">Manage your business locations</Text>
          </View>
          <TouchableOpacity className="bg-emerald-600 w-12 h-12 rounded-full items-center justify-center shadow-lg shadow-emerald-200">
            <Ionicons name="add" size={28} color="white" />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#10b981" />
            <Text className="text-slate-400 font-bold mt-4">Loading your facilities...</Text>
          </View>
        ) : (
          <FlatList
            data={facilities}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item }) => (
              <TouchableOpacity 
                onPress={() => handleManageFacility(item.id)}
                className="bg-slate-50 border border-slate-100 rounded-[32px] p-4 mb-4 flex-row overflow-hidden shadow-sm"
              >
                <Image source={{ uri: item.featured_image_url || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=200" }} className="w-24 h-24 rounded-2xl bg-slate-200" />
                <View className="flex-1 ml-4 justify-center">
                  <View className="flex-row justify-between items-start">
                    <Text className="text-lg font-black text-slate-800 flex-1 mr-2" numberOfLines={1}>{item.facility_name}</Text>
                    <View className={`px-2 py-1 rounded-full ${item.status === "active" ? "bg-emerald-100" : "bg-amber-100"}`}>
                      <Text className={`text-[10px] font-black uppercase ${item.status === "active" ? "text-emerald-700" : "text-amber-700"}`}>
                        {item.status}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-slate-500 font-bold text-xs mt-1">{item.facility_type} • {item.area}</Text>
                  
                  <View className="flex-row mt-3 items-center">
                     <Text className="text-emerald-600 font-black text-sm">Manage Settings</Text>
                     <Ionicons name="arrow-forward" size={16} color="#059669" className="ml-1" />
                  </View>
                </View>
              </TouchableOpacity>
            )}
          ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center py-20">
              <Ionicons name="business-outline" size={64} color="#cbd5e1" />
              <Text className="text-slate-400 font-bold mt-4">You haven't added any facilities yet.</Text>
            </View>
          )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default IBPFacilities;
