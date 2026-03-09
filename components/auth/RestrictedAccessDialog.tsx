import React from "react";
import { View, Text, Modal, TouchableOpacity, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface RestrictedAccessDialogProps {
  visible: boolean;
  onClose: () => void;
}

export const RestrictedAccessDialog = ({ visible, onClose }: RestrictedAccessDialogProps) => {
  const handleContactSupport = () => {
    Linking.openURL("mailto:support@4ourlife.com?subject=Facility Owner Access Request");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/60 items-center justify-center p-6">
        <View className="bg-white w-full rounded-[40px] p-8 items-center shadow-2xl">
          <View className="bg-amber-100 p-6 rounded-full mb-6">
            <Ionicons name="lock-closed" size={50} color="#d97706" />
          </View>
          
          <Text className="text-2xl font-black text-slate-900 text-center mb-4">
            Merchant Access Restricted
          </Text>
          
          <Text className="text-slate-500 text-center mb-8 font-medium leading-6">
            You are currently on a Resident account. Merchant mode is reserved for Facility Owners and IBPs.
          </Text>

          <View className="w-full gap-3">
            <TouchableOpacity 
              onPress={handleContactSupport}
              className="bg-emerald-600 h-16 rounded-2xl items-center justify-center shadow-lg shadow-emerald-100"
            >
              <Text className="text-white font-black text-lg">Contact Support</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={onClose}
              className="h-16 rounded-2xl items-center justify-center"
            >
              <Text className="text-slate-400 font-bold text-lg">Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
