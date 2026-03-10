import { cn } from "@/lib/utils";
import { useState, useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface DropdownOption {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  label?: string;
  placeholder?: string;
  data: DropdownOption[];
  value: string;
  onChange: (item: DropdownOption) => void;
  error?: string;
  touched?: boolean;
  containerClassName?: string;
  disabled?: boolean;
}

export const CustomDropdown = ({
  label,
  placeholder = "Select an option",
  data,
  value,
  onChange,
  error,
  touched,
  containerClassName,
  disabled = false,
}: CustomDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedItem = data.find((item) => item.value === value);

  return (
    <View className={cn("flex flex-col gap-1.5 w-full", containerClassName)}>
      {label ? (
        <Text className="text-sm font-semibold text-gray-400 ml-1 uppercase tracking-wider">
          {label}
        </Text>
      ) : null}

      <View style={{ position: "relative", zIndex: 99 }}>
        <TouchableOpacity
          onPress={() => !disabled && setIsOpen((v) => !v)}
          disabled={disabled}
          className={cn(
            "h-16 w-full rounded-2xl border bg-white px-5 flex-row items-center justify-between",
            error && touched ? "border-red-500/50" : "border-gray-400",
            disabled && "opacity-50"
          )}
        >
          <Text
            className={cn(
              "font-medium text-base",
              selectedItem ? "text-black" : "text-gray-500"
            )}
          >
            {selectedItem ? selectedItem.label : placeholder}
          </Text>
          <Ionicons
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={20}
            color="#94a3b8"
          />
        </TouchableOpacity>

        {/* Inline dropdown — no Modal, no portal, no navigation context issue */}
        {isOpen && (
          <View
            style={{
              position: "absolute",
              top: 68,
              left: 0,
              right: 0,
              backgroundColor: "#fff",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#e2e8f0",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 12,
              elevation: 10,
              maxHeight: 240,
              zIndex: 999,
              overflow: "hidden",
            }}
          >
            <FlatList
              data={data}
              keyExtractor={(item) => item.value}
              scrollEnabled={data.length > 5}
              nestedScrollEnabled
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onChange(item);
                    setIsOpen(false);
                  }}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: "#f1f5f9",
                    backgroundColor:
                      item.value === value ? "#f0fdf4" : "#fff",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: item.value === value ? "700" : "500",
                      color: item.value === value ? "#059669" : "#374151",
                    }}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      {error && touched ? (
        <Text className="text-xs text-red-400 ml-1 font-medium">{error}</Text>
      ) : null}
    </View>
  );
};
