import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFacilityProfile, useToggleFavorite } from "@/hooks/use-facilities";
import Animated, { FadeInUp } from "react-native-reanimated";
import {
  cn,
  formatTextToTitleCase,
  getLiveStatus,
  toUppercaseFirstLetter,
} from "@/lib/utils";
import { Image } from "expo-image";
import useFavoritesStore from "@/store/use-favorites-store";
import useUserStore from "@/store/use-userstore";

const { width } = Dimensions.get("window");

export default function FacilityDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: facility, isLoading } = useFacilityProfile({
    id,
    enabled: !!id,
  });

  const { isOpen, label } = getLiveStatus(facility?.business_hours || []);
  
  const { user } = useUserStore();
  const { isFavorite } = useFavoritesStore();
  const { mutate: toggleFavorite } = useToggleFavorite();

  const isCurrentlyFavorite = isFavorite(facility?.id || "");

  // Build the public image URL from the feature image and the Supabase config
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
  const bucketName = process.env.EXPO_PUBLIC_SUPABASE_BUCKET_NAME || '';
  
  let imageUrl = null;
  if (facility?.featured_image_url) {
    if (facility.featured_image_url.startsWith('http')) {
      imageUrl = facility.featured_image_url;
    } else {
      imageUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${facility.featured_image_url}`;
    }
  }

  // console.log("Image: ", imageUrl)

  if (isLoading)
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="font-bold text-emerald-600">LOADING...</Text>
      </View>
    );

  const getOwnershipStyles = (type: string) => {
    return type?.toLowerCase() === "private"
      ? { bg: "bg-blue-100", text: "text-blue-700", label: "Private" }
      : { bg: "bg-orange-100", text: "text-orange-700", label: "Government" };
  };


  return (
    <View className="flex-1 bg-white">
      {/* Immersive Header */}
      <View
        style={{
          position: "absolute",
          top: insets.top,
          zIndex: 10,
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 20,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-2xl bg-white/90 shadow-sm"
        >
          <Ionicons name="chevron-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => {
            // user_id is the correct field on MobileUserProfile (not .id)
            const activeUserId = user?.user_id;
            if (activeUserId && facility) {
              toggleFavorite({ userId: activeUserId, facility });
            }
          }}
          className="w-10 h-10 items-center justify-center rounded-2xl bg-white/90 shadow-sm"
        >
          <Ionicons 
            name={isCurrentlyFavorite ? "heart" : "heart-outline"} 
            size={22} 
            color={isCurrentlyFavorite ? "#ef4444" : "#0f172a"} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Image Gallery Hero */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={{ height: 300 }}
        >
          {(() => {
            if (imageUrl) {
              return (
                <Image
                  source={{ uri: imageUrl }}
                  style={{ width, height: 300 }}
                  contentFit="cover"
                />
              );
            } else {
              return (
                <View
                  style={{ width, height: 300 }}
                  className="bg-slate-200 items-center justify-center"
                >
                  <Ionicons name="images" size={48} color="#94a3b8" />
                </View>
              );
            }
          })()}

          <View className="absolute bottom-12 left-6 z-20">
            <Animated.View
              entering={FadeInUp.delay(400)}
              className={cn(
                "px-4 py-2 rounded-2xl shadow-xl border-2 border-white/20",
                isOpen ? "bg-emerald-500" : "bg-rose-500",
              )}
            >
              <Text className="text-white font-black text-[10px] uppercase tracking-[2px]">
                ● {label}
              </Text>
            </Animated.View>
          </View>
        </ScrollView>

        <Animated.View
          entering={FadeInUp.delay(200)}
          className="px-6 -mt-8 bg-white rounded-t-[40px] pt-8"
        >
          {/* Title Section */}
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              {/* BADGE ROW */}
              <View className="flex-row flex-wrap gap-2 mb-2">
                {/* Original Type Badge */}
                <View className="bg-emerald-100 px-3 py-1 rounded-full">
                  <Text className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                    {facility?.facility_type?.replace(/_/g, " ")}
                  </Text>
                </View>

                {/* NEW: Ownership Badge (Private/Government) */}
                <View
                  className={cn(
                    "px-3 py-1 rounded-full",
                    getOwnershipStyles(facility?.ownership || "Private").bg,
                  )}
                >
                  <Text
                    className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      getOwnershipStyles(facility?.ownership || "Private").text,
                    )}
                  >
                    {facility?.ownership || "Private"}
                  </Text>
                </View>

                {/* NEW: NHIS Badge */}
                {facility?.accepts_nhis && (
                  <View className="bg-purple-100 px-3 py-1 rounded-full flex-row items-center">
                    <MaterialCommunityIcons
                      name="card-account-details-outline"
                      size={12}
                      color="#7e22ce"
                    />
                    <Text className="text-[10px] font-black text-purple-700 uppercase tracking-widest ml-1">
                      Accepts NHIS
                    </Text>
                  </View>
                )}
              </View>

              <Text className="text-3xl font-black text-slate-900 leading-tight">
                {facility?.facility_name}
              </Text>
              <View className="flex-row items-center mt-2">
                <Ionicons name="location" size={16} color="#10b981" />
                <Text className="text-slate-500 font-medium ml-1">
                  {facility?.area},{" "}
                  {formatTextToTitleCase(facility?.region as string, " ")}
                </Text>
              </View>
            </View>
            <View className="items-end">
              <View className="bg-amber-50 px-3 py-2 rounded-2xl items-center">
                <Ionicons name="star" size={20} color="#fbbf24" />
                <Text className="text-sm font-black text-slate-800 mt-1">
                  {facility?.avg_rating || "5.0"}
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View className="flex-row justify-between mt-8 border-b border-slate-50 pb-4">
            <QuickAction
              icon="phone"
              label="Call"
              onPress={() => Linking.openURL(`tel:${facility?.contact_number}`)}
            />
            {facility?.whatsapp_number && (
              <QuickAction
                icon="whatsapp"
                label="Chat"
                color="#25D366"
                onPress={() =>
                  Linking.openURL(
                    `whatsapp://send?phone=${facility?.whatsapp_number}`,
                  )
                }
              />
            )}
            <QuickAction
              icon="email"
              label="Email"
              onPress={() => Linking.openURL(`mailto:${facility?.email}`)}
            />
            <QuickAction icon="map-marker" label="Route" onPress={() => {}} />
          </View>

          {/* Services Section */}
          <SectionTitle title="Facility Services" />
          <View className="flex-row flex-wrap mt-2">
            {facility?.services?.map((service: string, i: number) => (
              <View
                key={i}
                className="bg-slate-50 border border-slate-300 px-4 py-2 rounded-2xl mr-2 mb-2"
              >
                <Text className="text-slate-700 font-bold text-xs">
                  {service}
                </Text>
              </View>
            ))}
          </View>

          <SectionTitle title="Facility Amenities" />
          <View className="flex-row flex-wrap mt-2">
            {facility?.amenities?.map((amenity: string, i: number) => (
              <View
                key={i}
                className="bg-slate-200 border border-gray-400 px-4 py-2 rounded-2xl mr-2 mb-2"
              >
                <Text className="text-slate-700 font-bold text-xs">
                  {amenity}
                </Text>
              </View>
            ))}
          </View>

          {/* Business Hours */}
          <SectionTitle title="Operating Hours" />
          <View className="bg-zinc-600 rounded-[32px] p-6 mt-2">
            {facility?.business_hours?.map((item: any, i: number) => (
              <View
                key={i}
                className="flex-row justify-between py-2 border-b border-slate-100 last:border-0"
              >
                <Text
                  className={`font-bold ${item.isClosed ? "text-slate-400" : "text-white"}`}
                >
                  {item.day}
                </Text>
                <Text
                  className={cn(
                    "text-white font-medium",
                    item.isClosed && "text-red-400",
                  )}
                >
                  {item.isClosed ? "Closed" : `${item.open} - ${item.close}`}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Floating Bottom Booking Button */}
      <View
        className="absolute bottom-0 w-full bg-white/80 p-6"
        style={{ paddingBottom: insets.bottom + 10 }}
      >
        <TouchableOpacity className="bg-slate-900 h-16 rounded-3xl items-center justify-center shadow-xl shadow-slate-400">
          <Text className="text-white font-black text-lg">
            Book Appointment
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const QuickAction = ({ icon, label, onPress, color = "#0f172a" }: any) => (
  <TouchableOpacity onPress={onPress} className="items-center">
    <View className="w-14 h-14 bg-slate-100 rounded-2xl items-center justify-center mb-2">
      <MaterialCommunityIcons name={icon} size={24} color={color} />
    </View>
    <Text className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
      {label}
    </Text>
  </TouchableOpacity>
);

const SectionTitle = ({ title }: { title: string }) => (
  <Text className="text-lg font-black text-slate-900 mt-8 mb-2 tracking-tight">
    {title}
  </Text>
);
