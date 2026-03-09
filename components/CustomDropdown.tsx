import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
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

      <TouchableOpacity
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        className={cn(
          "h-16 w-full rounded-2xl border bg-white/5 px-5 flex-row items-center justify-between",
          error && touched
            ? "border-red-500/50"
            : "border-gray-400",
          disabled && "opacity-50"
        )}
      >
        <Text
          className={cn(
            "font-medium",
            selectedItem ? "text-black" : "text-gray-500"
          )}
        >
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#94a3b8" />
      </TouchableOpacity>

      {error && touched ? (
        <Text className="text-xs text-red-400 ml-1 font-medium">{error}</Text>
      ) : null}

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setIsOpen(false)}
        >
          <View className="flex-1 justify-end">
            <Pressable
              className="bg-white rounded-t-3xl max-h-[70%]"
              onPress={(e) => e.stopPropagation()}
            >
              <View className="p-6 border-b border-gray-200">
                <Text className="text-xl font-bold text-black">
                  {label || "Select"}
                </Text>
                <TouchableOpacity
                  onPress={() => setIsOpen(false)}
                  className="absolute right-6 top-6"
                >
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={data}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      onChange(item);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "p-4 border-b border-gray-100",
                      item.value === value && "bg-green-50"
                    )}
                  >
                    <Text
                      className={cn(
                        "text-base",
                        item.value === value
                          ? "text-green-600 font-semibold"
                          : "text-gray-700"
                      )}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};
