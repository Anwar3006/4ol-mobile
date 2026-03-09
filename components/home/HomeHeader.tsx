import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  Animated,
  TouchableOpacity,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { themeColors } from "@/src/theme/colors";
import useUserStore from "@/store/use-userstore";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const HomeHeader = () => {
  const insets = useSafeAreaInsets();
  const { user: userData } = useUserStore();
  const paddingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animatePadding = () => {
      Animated.sequence([
        Animated.timing(paddingAnim, {
          toValue: 10,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(paddingAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]).start(() => animatePadding());
    };
    animatePadding();
  }, [paddingAnim]);

  const paddingInterpolated = paddingAnim.interpolate({
    inputRange: [0, 10],
    outputRange: [3, 6],
  });

  return (
    <View 
      style={{ 
        height: 60 + insets.top, 
        paddingTop: insets.top,
        backgroundColor: themeColors.white,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
      }}
    >
      <TouchableOpacity
        onPress={() => router.push("/(app)/(auth)/(tabs)/My Account/UserProfile")}
        className="bg-gray-200 w-10 h-10 rounded-full justify-center items-center"
      >
        <Text className="text-pink-600 font-bold text-sm">
          {`${userData?.first_name?.[0] || ""}${userData?.last_name?.[0] || ""}`}
        </Text>
      </TouchableOpacity>

      <Animated.View
        style={{
          backgroundColor: themeColors.primary,
          padding: paddingInterpolated,
          borderRadius: 8,
        }}
      >
        <Image
          source={require("@/assets/images/logo2.png")}
          style={{ width: 24, height: 24 }}
          resizeMode="contain"
        />
      </Animated.View>

      <TouchableOpacity
        onPress={() => router.push("/(app)/(auth)/(modal)/SearchResultModal")} // Fallback if Notifications doesn't exist
        className="p-1"
      >
        <Ionicons name="notifications-outline" size={26} color={themeColors.darkGray} />
      </TouchableOpacity>
    </View>
  );
};
