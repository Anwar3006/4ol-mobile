import {
  ScrollView,
  View,
  Text,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import ProfileAvatar from "@/components/myaccount/ProfileAvatar";
import ProfileMenuItem from "@/components/myaccount/ProfileMenuItem";
import useUserStore from "@/store/use-userstore";
import { useUserMode } from "@/store/useUserMode";
import { RestrictedAccessDialog } from "@/components/auth/RestrictedAccessDialog";
import { ProfileCompletionModal } from "@/components/auth/ProfileCompletionModal";
import { useState } from "react";

const MyAccount = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { user } = useUserStore();
  const { currentMode, setMode } = useUserMode();
  const isLargeScreen = width > 600;

  const [showRestrictedDialog, setShowRestrictedDialog] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  if (!user) return null;

  const handleSwitchToBusiness = () => {
    const userType = user?.user_type; // 'customer', 'business_provider', 'both'
    const userRole = user?.role; // 'super_admin', 'admin', 'user', etc.

    // super_admin can toggle freely without any restrictions
    if (userRole === "super_admin") {
      if (currentMode === "user") {
        setMode("business");
        router.replace("/(app)/(auth)/(ibpTabs)");
      } else {
        setMode("user");
        router.replace("/(app)/(auth)/(tabs)/Home");
      }
    }

    if (currentMode === "user") {
      // Trying to switch to Business mode
      if (userType === "customer") {
        // Customer-only accounts cannot use merchant mode
        setShowRestrictedDialog(true);
      } else {
        // 'business_provider' or 'both' -> allow switch
        // Navigate first from this valid context before AuthProvider's
        // useEffect can fire and attempt navigation from an invalid context.
        setMode("business");
        router.replace("/(app)/(auth)/(ibpTabs)");
      }
    } else {
      // Trying to switch back to User / Resident mode
      if (userType === "business_provider") {
        // Need to check if user profile is complete before allowing switch
        const isComplete = user.sex && user.dob && user.phone_number;
        if (!isComplete) {
          setShowCompletionModal(true);
        } else {
          setMode("user");
          router.replace("/(app)/(auth)/(tabs)/Home");
        }
      } else {
        // 'both' or 'customer' -> allow switch freely
        setMode("user");
        router.replace("/(app)/(auth)/(tabs)/Home");
      }
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View
        style={{ paddingTop: insets.top + 10 }}
        className="flex-row items-center justify-between px-6 pb-4 bg-white"
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#334155" />
        </TouchableOpacity>

        <Text className="text-xl font-black text-slate-800">My Account</Text>

        <View className="w-6" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: isLargeScreen ? width * 0.2 : 24,
        }}
      >
        {/* Avatar Section */}
        <ProfileAvatar
          uri="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400"
          name={`${user?.first_name} ${user?.last_name}`}
        />

        {/* Role Switcher Section */}
        <View className="mt-8 mb-4">
          <Text className="text-slate-400 font-bold mb-4 uppercase text-xs tracking-widest ml-1">
            Account Mode
          </Text>
          <TouchableOpacity
            onPress={handleSwitchToBusiness}
            className="bg-emerald-600 p-5 rounded-[24px] flex-row items-center shadow-lg shadow-emerald-100"
          >
            <Ionicons name="swap-horizontal" size={24} color="white" />
            <Text className="text-white font-black text-lg ml-3">
              Switch to Merchant Mode
            </Text>
          </TouchableOpacity>
        </View>

        <RestrictedAccessDialog
          visible={showRestrictedDialog}
          onClose={() => setShowRestrictedDialog(false)}
        />

        <ProfileCompletionModal
          visible={showCompletionModal}
          onClose={() => setShowCompletionModal(false)}
          onSuccess={() => {
            setShowCompletionModal(false);
            setMode("user");
            router.replace("/(app)/(auth)/(tabs)/Home");
          }}
        />

        {/* Menu List */}
        <View className="mt-4">
          <ProfileMenuItem
            label="Profile"
            icon="person-outline"
            href="/My Account/UserProfile"
          />
          <ProfileMenuItem
            label="Favourite"
            icon="heart-outline"
            href="/My Account/Favorites"
          />
          <ProfileMenuItem
            label="Help Center"
            icon="information-circle-outline"
            href="/My Account/HelpCenter"
          />
          <ProfileMenuItem
            label="Privacy Policy"
            icon="shield-checkmark-outline"
            href="/(app)/(public)/(legal)/Privacy"
          />
          <ProfileMenuItem
            label="Settings"
            icon="settings-outline"
            href="/My Account/Settings"
          />
          {/* <ProfileMenuItem
            label="Payment Options"
            icon="card-outline"
            href="/My Account/PaymentOptions"
          /> */}
          <ProfileMenuItem
            label="Password Manager"
            icon="lock-closed-outline"
            href="/My Account/PasswordManager"
          />

          <View className="mt-4">
            <ProfileMenuItem
              label="Log out"
              icon="log-out-outline"
              href="/My Account/Logout"
              isLogout
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default MyAccount;
