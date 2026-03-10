import React, { useMemo } from "react";
import { ScrollView, TouchableOpacity, Text, View } from "react-native";
import { cn } from "@/lib/utils";
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

type IconLibrary = "Ionicons" | "MaterialIcons" | "MaterialCommunityIcons";

export const CATEGORIES = [
  { id: "all",                   name: "All",           icon: "apps",              library: "MaterialIcons"          as IconLibrary, color: "#64748b" },
  { id: "near_me",               name: "Near Me",       icon: "near-me",           library: "MaterialIcons"          as IconLibrary, color: "#3b82f6" },
  { id: "hospital_/_clinic",     name: "Hospitals",     icon: "local-hospital",    library: "MaterialIcons"          as IconLibrary, color: "#ef4444" },
  { id: "pharmacy",              name: "Pharmacies",    icon: "local-pharmacy",    library: "MaterialIcons"          as IconLibrary, color: "#8b5cf6" },
  { id: "wellness",       name: "Wellness",      icon: "spa",               library: "MaterialIcons"          as IconLibrary, color: "#10b981" },
  { id: "herbal_center",         name: "Herbal",        icon: "leaf",              library: "MaterialCommunityIcons" as IconLibrary, color: "#84cc16" },
  { id: "diagnostic_lab",        name: "Labs",          icon: "biotech",           library: "MaterialIcons"          as IconLibrary, color: "#f59e0b" },
  { id: "dental_clinic",         name: "Dental",        icon: "tooth-outline",     library: "MaterialCommunityIcons" as IconLibrary, color: "#06b6d4" },
  { id: "eye_clinic",            name: "Eye Care",      icon: "visibility",        library: "MaterialIcons"          as IconLibrary, color: "#6366f1" },
  { id: "physiotherapy_center",  name: "Physio",        icon: "arm-flex-outline",  library: "MaterialCommunityIcons" as IconLibrary, color: "#f97316" },
  { id: "psychiatric_center",    name: "Mental Health", icon: "psychology",        library: "MaterialIcons"          as IconLibrary, color: "#ec4899" },
  { id: "home",                  name: "Home Care",     icon: "home-heart",        library: "MaterialCommunityIcons" as IconLibrary, color: "#14b8a6" },
  { id: "health_school",         name: "Schools",       icon: "school",            library: "MaterialIcons"          as IconLibrary, color: "#a78bfa" },
  { id: "osteopathy_center",     name: "Osteopathy",    icon: "self-improvement",  library: "MaterialIcons"          as IconLibrary, color: "#fb923c" },
  { id: "prosthetics_center",    name: "Prosthetics",   icon: "accessible",        library: "MaterialIcons"          as IconLibrary, color: "#94a3b8" },
];

/** Renders the correct icon component based on the library field */
export const CategoryIcon = ({
  icon,
  library,
  size,
  color,
}: {
  icon: string;
  library: IconLibrary;
  size: number;
  color: string;
}) => {
  switch (library) {
    case "MaterialIcons":
      return <MaterialIcons name={icon as any} size={size} color={color} />;
    case "MaterialCommunityIcons":
      return <MaterialCommunityIcons name={icon as any} size={size} color={color} />;
    case "Ionicons":
    default:
      return <Ionicons name={icon as any} size={size} color={color} />;
  }
};

/** Look up icon name + colour by facility_type id */
export const getCategoryMeta = (facilityType: string) => {
  const type = (facilityType || "").toLowerCase();
  const cat = CATEGORIES.find((c) => 
    c.id === type || 
    type.startsWith(c.id) || 
    c.id.startsWith(type) ||
    type.includes(c.id)
  );
  return (
    cat ?? {
      id: "hospital_/_clinic",
      name: "Hospitals",
      icon: "local-hospital",
      library: "MaterialIcons" as IconLibrary,
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
      library: opt.library,
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
              <CategoryIcon
                icon={category.icon}
                library={category.library}
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
