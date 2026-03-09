import React, { useMemo } from "react"; 
import { ScrollView, TouchableOpacity, Text, View } from "react-native";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";

export const CATEGORIES = [
  { id: "all", name: "All", icon: "grid-outline", color: "#64748b" },
  { id: "near_me", name: "Near Me", icon: "location-outline", color: "#3b82f6" },
  { id: "hospital_/_clinic", name: "Hospitals", icon: "medical-outline", color: "#ef4444" },
  { id: "pharmacy", name: "Pharmacies", icon: "flask-outline", color: "#8b5cf6" },
  { id: "wellness_center", name: "Wellness", icon: "leaf-outline", color: "#10b981" },
  { id: "herbal_center", name: "Herbal", icon: "flower-outline", color: "#84cc16" },
  { id: "diagnostic_lab", name: "Labs", icon: "thermometer-outline", color: "#f59e0b" },
  { id: "dental_clinic", name: "Dental", icon: "happy-outline", color: "#06b6d4" },
  { id: "eye_clinic", name: "Eye Care", icon: "eye-outline", color: "#6366f1" },
  { id: "physiotherapy_center", name: "Physio", icon: "body-outline", color: "#f97316" },
  { id: "psychiatric_center", name: "Mental Health", icon: "pulse-outline", color: "#ec4899" },
  { id: "home", name: "Home Care", icon: "home-outline", color: "#14b8a6" },
  { id: "health_school", name: "Schools", icon: "school-outline", color: "#a78bfa" },
  { id: "osteopathy_center", name: "Osteopathy", icon: "fitness-outline", color: "#fb923c" },
  { id: "prosthetics_center", name: "Prosthetics", icon: "accessibility-outline", color: "#94a3b8" },
];

/** Look up icon name + colour by facility_type id */
export const getCategoryMeta = (facilityTypeId: string) => {
  return (
    CATEGORIES.find((c) => c.id === facilityTypeId) ?? {
      icon: "medical-outline",
      color: "#10b981",
    }
  );
};

interface MapFiltersProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  /** Called when the "Near Me" chip is tapped */
  onNearMePress?: () => void;
}

export const MapFilters = ({
  selectedCategory,
  onSelectCategory,
  onNearMePress,
}: MapFiltersProps) => {

  const facilityTypes = useMemo(() =>
    CATEGORIES.map(opt => ({
      label: opt.name,
      value: opt.id,
      icon: opt.icon,
      color: opt.color,
    })), []);
  
  return (
    <View className="py-2"> 
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 10, paddingBottom: 8 }}
      >
        {facilityTypes.map((category) => {
          const isActive = selectedCategory === category.value;
          const isNearMe = category.value === "near_me";
          return (
            <TouchableOpacity
              key={category.value}
              activeOpacity={0.7}
              onPress={() => {
                if (isNearMe && onNearMePress) {
                  onNearMePress();
                } else {
                  onSelectCategory(category.value);
                }
              }}
              className={cn(
                "flex-row items-center px-5 py-2.5 rounded-2xl border shadow-sm",
                isActive
                  ? "border-transparent"
                  : "bg-white border-slate-200 shadow-slate-100"
              )}
              style={isActive ? { backgroundColor: category.color, borderColor: category.color } : undefined}
            >
              <Ionicons
                name={category.icon as any}
                size={18}
                color={isActive ? "white" : category.color}
              />
              <Text
                className={cn(
                  "ml-2 font-bold text-xs tracking-tight",
                  isActive ? "text-white" : "text-slate-600"
                )}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};