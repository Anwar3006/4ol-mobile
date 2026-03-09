import { refine, z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// import { authClient } from "@/lib/auth-client"; // Your Better Auth client
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CustomInput } from "../CustomInput";
import { authClient } from "@/lib/auth-client";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";

const changePasswordSchema = z
  .object({
    currentPassword: z.string("Please enter your current password"),
    newPassword: z.string("Please enter your new password"),
    confirmNewPassword: z.string("Please re-enter your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordForm() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "" },
  });

  // useEffect(() => {
  //   setValue("currentPassword", currentPassword);
  // }, [currentPassword]);

  const onSubmit = async (data: ChangePasswordFormValues) => {
    await authClient.changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      fetchOptions: {
        onError: (ctx: any) => {
          Alert.alert("Failed to change password", ctx.error.message);
        },
        onSuccess: () => {
          router.reload();
        },
      },
    });
  };

  return (
    <View className="w-full gap-y-5">
      <Controller
        control={control}
        name="currentPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <CustomInput
            label="Current Password"
            secureTextEntry
            placeholder="*********"
            autoCapitalize="none"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={errors.currentPassword?.message}
            icon="lock-closed-outline"
          />
        )}
      />

      <View className="mt-5 gap-y-5">
        <Controller
          control={control}
          name="newPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput
              label="New Password"
              placeholder="••••••••"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.newPassword?.message}
              icon="lock-closed-outline"
            />
          )}
        />

        <Controller
          control={control}
          name="confirmNewPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput
              label="Confirm New Password"
              placeholder="••••••••"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.confirmNewPassword?.message}
              icon="lock-closed-outline"
            />
          )}
        />
      </View>

      <View className="flex-col gap-y-3 w-full">
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          activeOpacity={0.8}
          className="mt-6 h-16 w-full flex-row items-center justify-center rounded-3xl bg-green-600 shadow-sm"
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text className="text-lg font-bold text-white mr-2">
                Change Password
              </Text>
              <Ionicons name="checkmark-done" size={20} color="white" />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="w-full h-14 items-center justify-center rounded-2xl bg-gray-50 border border-gray-100"
        >
          <Text className="font-bold text-slate-600">Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
