import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  FadeIn,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

const LoadingScreen = () => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    // Continuous pulse animation
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 800, easing: Easing.ease }),
        withTiming(1, { duration: 800, easing: Easing.ease })
      ),
      -1, // Loop indefinitely
      true
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.6, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View className="flex-1 items-center justify-center bg-[#EBF9E6]">
      <Animated.View
        entering={FadeIn.duration(500)}
        style={[animatedStyle, styles.logoContainer]}
      >
        {/* Replace with your actual App Logo Image */}
        <Ionicons name="medical" size={80} color="#10b981" />
      </Animated.View>

      {/* Subtle indicator for high-end feel */}
      <View className="absolute bottom-20">
        <Animated.Text
          className="text-emerald-700 font-bold tracking-[4px] uppercase text-xs"
          style={{ opacity: 0.5 }}
        >
          Securing Connection
        </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
});

export default LoadingScreen;
