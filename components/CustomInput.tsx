import { cn } from "@/lib/utils";
import { forwardRef, useState } from "react";
import {
  Text,
  TextInput,
  TextInputProps,
  View,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CountryPicker, {
  CountryCode,
  Country,
} from "react-native-country-picker-modal";

interface CustomInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  isPhoneNumber?: boolean;
  countryCode?: string;
  onCountrySelect?: (country: Country) => void;
}

export const CustomInput = forwardRef<TextInput, CustomInputProps>(
  (
    {
      label,
      error,
      containerClassName,
      className,
      icon,
      secureTextEntry,
      isPhoneNumber,
      countryCode = "GH",
      onCountrySelect,
      ...props
    },
    ref
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [showPicker, setShowPicker] = useState(false);

    const isActuallySecure = secureTextEntry && !isPasswordVisible;

    return (
      <View className={cn("flex flex-col gap-1.5 w-full", containerClassName)}>
        {label ? (
          <Text className="text-sm font-semibold text-gray-400 ml-1 uppercase tracking-wider">
            {label}
          </Text>
        ) : null}

        <View className="relative w-full justify-center">
          {/* Phone/Flag Logic */}
          {isPhoneNumber ? (
            <TouchableOpacity
              onPress={() => setShowPicker(true)}
              className="absolute left-4 z-10 flex-row items-center gap-x-1 border-r border-gray-400/50 pr-2"
            >
              <CountryPicker
                countryCode={countryCode as CountryCode}
                withFilter
                withFlag
                withCallingCode
                withAlphaFilter
                onSelect={(country) => onCountrySelect?.(country)}
                visible={showPicker}
                onClose={() => setShowPicker(false)}
                theme={{
                  backgroundColor: "#dbdbdb",
                  fontSize: 16,
                  primaryColor: "red",
                }}
              />
              <Ionicons name="chevron-down" size={12} color="#94a3b8" />
            </TouchableOpacity>
          ) : icon ? (
            <View className="absolute left-4 z-10">
              <Ionicons name={icon} size={20} color="#94a3b8" />
            </View>
          ) : null}

          <TextInput
            ref={ref}
            placeholderTextColor="#64748b"
            secureTextEntry={isActuallySecure}
            className={cn(
              "h-16 w-full rounded-2xl border bg-white/5 text-black font-medium transition-all",
              isPhoneNumber ? "pl-24" : icon ? "pl-12" : "px-5",
              secureTextEntry ? "pr-12" : "pr-5",
              error
                ? "border-red-500/50"
                : "border-gray-400 focus:border-green-500",
              className
            )}
            {...props}
          />

          {secureTextEntry ? (
            <TouchableOpacity
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              className="absolute right-4 p-1"
            >
              <Ionicons
                name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#94a3b8"
              />
            </TouchableOpacity>
          ) : null}
        </View>

        {error ? (
          <Text className="text-xs text-red-400 ml-1 font-medium">{error}</Text>
        ) : null}
      </View>
    );
  }
);
