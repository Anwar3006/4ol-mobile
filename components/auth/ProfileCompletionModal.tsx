import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import useUserStore from "@/store/use-userstore";
import { CustomDropdown } from "@/components/CustomDropdown";

interface ProfileCompletionModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProfileCompletionModal = ({
  visible,
  onClose,
  onSuccess,
}: ProfileCompletionModalProps) => {
  const { user, setUser } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sex: user?.sex || "",
    dob: user?.dob || "",
    phone_number: user?.phone_number || "",
  });
  const [error, setError] = useState<string | null>(null);

  const sexOptions = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other", value: "other" },
  ];

  const handleUpdate = async () => {
    if (!formData.sex || !formData.dob || !formData.phone_number) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: updateError } = await supabase
        .from("user_profiles")
        .update({
          sex: formData.sex,
          dob: formData.dob,
          phone_number: formData.phone_number,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user?.user_id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update local store
      setUser(data);
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/60 justify-end">
        <View className="bg-white rounded-t-[40px] p-8 pb-12 shadow-2xl">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-black text-slate-900">
              Complete Your Profile
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={32} color="#cbd5e1" />
            </TouchableOpacity>
          </View>

          <Text className="text-slate-500 font-medium mb-8 leading-6">
            To provide you with the best experience in Resident mode, we need a
            few more details.
          </Text>

          <View className="gap-6 mb-8">
            <CustomDropdown
              label="Sex"
              placeholder="Select Gender"
              data={sexOptions}
              value={formData.sex}
              onChange={(item) => setFormData({ ...formData, sex: item.value })}
            />

            <View>
              <Text className="text-sm font-semibold text-gray-400 ml-1 uppercase tracking-wider mb-1.5">
                Date of Birth (YYYY-MM-DD)
              </Text>
              <TextInput
                placeholder="1990-01-01"
                value={formData.dob}
                onChangeText={(t) => setFormData({ ...formData, dob: t })}
                className="h-16 w-full rounded-2xl border border-gray-400 bg-white px-5 font-medium text-black"
              />
            </View>

            <View>
              <Text className="text-sm font-semibold text-gray-400 ml-1 uppercase tracking-wider mb-1.5">
                Phone Number
              </Text>
              <TextInput
                placeholder="+233..."
                value={formData.phone_number}
                onChangeText={(t) =>
                  setFormData({ ...formData, phone_number: t })
                }
                keyboardType="phone-pad"
                className="h-16 w-full rounded-2xl border border-gray-400 bg-white px-5 font-medium text-black"
              />
            </View>
          </View>

          {error && (
            <Text className="text-red-500 font-bold mb-4 text-center">
              {error}
            </Text>
          )}

          <TouchableOpacity
            onPress={handleUpdate}
            disabled={loading}
            className="bg-emerald-600 h-16 rounded-2xl items-center justify-center shadow-lg shadow-emerald-100"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-black text-lg">Save & Switch</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
