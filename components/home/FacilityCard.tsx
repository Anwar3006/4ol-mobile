import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TFacilityProfileOutput } from "@4ol/db/schemas/facility-profile.schema";
import useFavoritesStore from "@/store/use-favorites-store";
import { useToggleFavorite } from "@/hooks/use-facilities";
import useUserStore from "@/store/use-userstore";

interface FacilityCardProps {
  facility: TFacilityProfileOutput;
  onPress?: () => void;
}

const FacilityCard = ({ facility, onPress }: FacilityCardProps) => {
  const { user } = useUserStore();
  const { isFavorite } = useFavoritesStore();
  const toggleFavoriteMutation = useToggleFavorite();

  const favorite = isFavorite(facility.id);

  const handleToggleFavorite = () => {
    if (!user) return; // Maybe show a login prompt?
    toggleFavoriteMutation.mutate({ userId: user.user_id, facility });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="bg-white rounded-[32px] overflow-hidden mb-6 shadow-lg border border-gray-200"
    >
      {/* Image Section */}
      <View className="relative h-48 w-full">
        <Image
          source={{ uri: facility.featured_image_url }}
          className="w-full h-full"
          resizeMode="cover"
        />

        {/* Rating Overlay (Glassmorphism effect) */}
        <View
          className="absolute top-4 right-4 bg-white/90 px-3 py-1.5 rounded-2xl flex-row items-center shadow-sm"
          style={{ backdropFilter: "blur(10px)" }}
        >
          <Ionicons name="star" size={14} color="#f59e0b" />
          <Text className="text-xs font-bold text-slate-900 ml-1">
            {facility.avg_rating?.toFixed(1)}
          </Text>
        </View>

        {/* Facility Type Badge */}
        <View className="absolute bottom-4 left-4 bg-green-600 px-4 py-1.5 rounded-full">
          <Text className="text-white text-[10px] font-black uppercase tracking-widest">
            {facility.facility_type.split("_").join(" ")}
          </Text>
        </View>
      </View>

      {/* Content Section */}
      <View className="p-5">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text
              numberOfLines={1}
              className="text-xl font-black text-slate-900 tracking-tight"
            >
              {facility.facility_name}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={handleToggleFavorite}
            className="bg-slate-50 p-2 rounded-full"
          >
            <Ionicons 
              name={favorite ? "heart" : "heart-outline"} 
              size={20} 
              color={favorite ? "#ef4444" : "#64748b"} 
            />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center mb-4">
          <Ionicons name="location-sharp" size={14} color="#10b981" />
          <Text
            numberOfLines={1}
            className="text-gray-500 text-sm ml-1 font-medium flex-1"
          >
            {facility.street || facility.area}
          </Text>
        </View>

        {/* Bottom Action Row */}
        <View className="flex-row items-center justify-between pt-4 border-t border-gray-50">
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={16} color="#94a3b8" />
            <Text className="text-slate-400 text-xs font-bold ml-1 uppercase">
              Open 24/7
            </Text>
          </View>

          <TouchableOpacity className="flex-row items-center" onPress={onPress}>
            <Text className="text-green-600 font-bold text-sm mr-1">
              View Details
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#16a34a" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default FacilityCard;
