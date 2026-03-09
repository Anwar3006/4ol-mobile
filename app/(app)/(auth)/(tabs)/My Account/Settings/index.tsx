import ProfileMenuItem from "@/components/myaccount/ProfileMenuItem";
import { useBiometricAuth } from "@/hooks/use-biometric-auth";
import useUserStore from "@/store/use-userstore";
import { Ionicons } from "@expo/vector-icons";
import { Route, useRouter } from "expo-router";
import {
  ScrollView,
  View,
  Text,
  useWindowDimensions,
  TouchableOpacity,
  Linking,
  Share, // Native sharing
  Platform,
  Switch,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// ... other imports

const Settings = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { user } = useUserStore();
  const {
    isBiometricEnabled: isEnabled,
    disableBiometric,
    biometricType,
  } = useBiometricAuth();
  const isLargeScreen = width > 600;

  console.log("Bio enabled: ", isEnabled);

  const handleShareApp = async () => {
    try {
      await Share.share({
        message:
          "Check out 4 Our Life - your personal health companion! Download it here: https://4ourlife.com",
        title: "4 Our Life",
      });
    } catch (error) {
      console.error("Sharing failed", error);
    }
  };

  const handleRateApp = () => {
    const itunesItemId = "ID_FROM_APPLE"; // Replace with real ID
    const playStoreId = "com.fourthpay.fourourlife"; // Replace with real ID

    const url = Platform.select({
      ios: `itms-apps://itunes.apple.com/app/viewContentsUserReviews/id${itunesItemId}?action=write-review`,
      android: `market://details?id=${playStoreId}`,
    });

    if (url) {
      Linking.openURL(url).catch(() => {
        // Fallback for browsers
        const webUrl = Platform.select({
          ios: `https://apps.apple.com/app/id${itunesItemId}`,
          android: `https://play.google.com/store/apps/details?id=${playStoreId}`,
        });
        if (webUrl) Linking.openURL(webUrl);
      });
    }
  };

  const handleGetInTouch = () => {
    // Updated with official contact from privacy policy
    Linking.openURL(
      "mailto:disrupt@4th-pay.com?subject=4 Our Life App Support",
    );
  };

  // TODO: Make sure the toggle works and when you disable it, it actually disables
  // Also, if enabled, you need to see the Scan working as well

  const toggleBiometrics = async () => {
    if (isEnabled) {
      await disableBiometric();
    } else {
      Alert.alert(
        "Enable Biometric Login",
        "For security, biometric login can only be enabled during your next sign-in. Please sign out and sign back in to set it up.",
        [{ text: "OK" }],
      );
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header Bar */}
      <View
        style={{ paddingTop: insets.top + 10 }}
        className="flex-row items-center justify-between px-6 pb-4 bg-white"
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#334155" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-slate-800">Settings</Text>
        <View className="w-6" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: isLargeScreen ? width * 0.2 : 24,
        }}
      >
        <View className="mt-4">
          <ProfileMenuItem
            label={isEnabled ? "Biometrics Enabled" : "Biometrics Disabled"}
            subText="Secure your health data with FaceID/Fingerprint"
            icon="finger-print"
            rightElement={
              <Switch
                value={isEnabled}
                onValueChange={toggleBiometrics}
                // High-end styling: Emerald green when on, subtle gray when off
                trackColor={{ false: "#e2e8f0", true: "#10b981" }}
                thumbColor={Platform.OS === "ios" ? undefined : "#ffffff"}
                ios_backgroundColor="#e2e8f0"
              />
            }
          />
          <ProfileMenuItem
            label="Delete Account"
            subText="Permanently remove your data from 4 Our Life"
            icon="trash-outline"
            href={"/My Account/Biometrics" as Route}
          />

          {/* Action-based Items */}
          <ProfileMenuItem
            label="Share App"
            subText="Invite friends and family to join"
            icon="share-social-outline"
            onPress={handleShareApp}
          />
          <ProfileMenuItem
            label="Rate App"
            subText="Help us improve on the PlayStore/App Store"
            icon="star-outline"
            onPress={handleRateApp}
          />
          <ProfileMenuItem
            label="Get in Touch"
            subText="Contact our support team directly"
            icon="chatbubble-ellipses-outline"
            onPress={handleGetInTouch}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default Settings;
