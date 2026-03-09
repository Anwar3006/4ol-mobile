import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// import { authClient } from "@/lib/auth-client"; // Your Better Auth client
import { Link, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CustomInput } from "../CustomInput";
import { Checkbox } from "../Checkbox";
import { authClient } from "@/lib/auth-Client";
import * as Sentry from "@sentry/react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useSignUpStore } from "@/store/use-signupStore";
import { useCreateUserProfile } from "@/hooks/use-userProfile";

const signUpSchema = z
  .object({
    // Step 1
    first_name: z.string().min(2, "First name is too short"),
    last_name: z.string().min(2, "Last name is too short"),
    dob: z.string().min(1, "Date of birth is required"),
    sex: z.enum(["Male", "Female", "Other"], {
      error: () => ({ message: "Please select your sex" }),
    }),
    // Step 2
    email: z.email("Invalid email").optional().or(z.literal("")),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    acceptContract: z.literal(true, {
      error: () => ({ message: "You must accept the terms" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpForm() {
  const [step, setStep] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date()); // Temporary state for iOS "scrolling"
  const router = useRouter();

  const { first_name, last_name, dob, sex, email, setStep1Data, phone_number } =
    useSignUpStore();

  const { mutateAsync, isPending } = useCreateUserProfile();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
    defaultValues: {
      first_name: first_name || "",
      last_name: last_name || "",
      dob: dob || "",
      sex: sex as any,
      email: email || "",
      password: "",
      confirmPassword: "",
      acceptContract: true,
    },
  });

  useEffect(() => {
    if (first_name) setValue("first_name", first_name);
    if (last_name) setValue("last_name", last_name);
    if (dob) setValue("dob", dob);
    if (sex) setValue("sex", sex as any);
  }, [first_name, last_name, dob, sex, setValue]);

  const prevStep = () => setStep(1);

  // Handle "Next" with validation for specific fields
  const handleNext = async () => {
    const fieldsToValidate: (keyof SignUpFormValues)[] = [
      "first_name",
      "last_name",
      "dob",
      "sex",
    ];
    const isStep1Valid = await trigger(fieldsToValidate);

    if (isStep1Valid) {
      // Get current values from the form
      const currentValues = watch();

      // Save to Zustand Store
      setStep1Data({
        first_name: currentValues.first_name,
        last_name: currentValues.last_name,
        dob: currentValues.dob,
        sex: currentValues.sex,
      });

      // Crucial: Ensure the form internal state is updated
      // This prevents the "invalid_type" error during final submission
      fieldsToValidate.forEach((field) => {
        setValue(field, currentValues[field]);
      });

      setStep(2);
    }
  };

  const onSubmit = async (data: SignUpFormValues) => {
    console.log("About to submit");
    try {
      // Merge step 1 data from store with step 2 data from form
      const completeData = {
        ...data,
        first_name: first_name || data.first_name,
        last_name: last_name || data.last_name,
        dob: dob || data.dob,
        sex: sex || data.sex,
      };

      // 1. Create auth user with Better Auth
      const authResult = await authClient.signUp.email({
        name: `${completeData.first_name} ${completeData.last_name}`,
        email: completeData.email!,
        password: completeData.password,
      });

      if (authResult.error) {
        Alert.alert("Registration Failed", authResult.error.message);

        // Manual capture for handled business-logic errors
        Sentry.captureMessage("Auth Signup Failed", {
          level: "warning",
          extra: { error: authResult.error.message, email: data.email },
        });
        return;
      }

      const userId = authResult.data?.user?.id;
      if (!userId) throw new Error("User ID missing from auth response");

      // 2. Create user profile with hook
      // mutateAsync will throw its own error if it fails, hitting our catch block
      await mutateAsync({
        user_id: userId,
        first_name: completeData.first_name,
        last_name: completeData.last_name,
        email: completeData.email,
        phone_number: phone_number,
        sex: completeData.sex,
        dob: completeData.dob,
        role: "user",
        user_type: "customer",
      });

      Alert.alert("Success", "Account created successfully!");
      router.replace("/(app)/(auth)/(tabs)/Home");
    } catch (error: any) {
      // Capture unexpected crashes or network failures
      Sentry.captureException(error, {
        tags: { section: "signup_flow" },
      });

      Alert.alert(
        "Connection Error",
        "We couldn't reach our servers. Please check your internet and try again.",
      );
    }
  };

  const formatDisplayDate = (date: string): string => {
    if (!date) return "";
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };

  const onDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
      if (date) setValue("dob", date.toISOString().split("T")[0]);
    } else {
      // iOS: Just update temp date while user scrolls
      if (date) setTempDate(date);
    }
  };

  const confirmIOSDate = () => {
    setValue("dob", tempDate.toISOString().split("T")[0]);
    setShowDatePicker(false);
  };

  return (
    <View className="w-full gap-y-4">
      {/* Step Indicator */}
      <View className="flex-row gap-x-2 mb-2">
        <View
          className={`h-1 flex-1 rounded-full ${step >= 1 ? "bg-green-500" : "bg-gray-200"}`}
        />
        <View
          className={`h-1 flex-1 rounded-full ${step >= 2 ? "bg-green-500" : "bg-gray-200"}`}
        />
      </View>

      {step === 1 ? (
        <View
          style={{ display: step === 1 ? "flex" : "none" }}
          className="gap-y-4"
        >
          <Controller
            control={control}
            name="first_name"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="First Name"
                placeholder="Kweku"
                keyboardType="default"
                autoCapitalize="none"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.first_name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="last_name"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="Last Name"
                placeholder="The Traveler"
                keyboardType="default"
                autoCapitalize="none"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.last_name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="dob"
            render={({ field: { value } }) => (
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <View pointerEvents="none">
                  <CustomInput
                    label="Date of Birth"
                    placeholder="Select Date"
                    value={formatDisplayDate(value)}
                    icon="calendar-outline"
                    error={errors.dob?.message}
                  />
                </View>
              </TouchableOpacity>
            )}
          />

          {/* iOS DATE PICKER MODAL */}
          {Platform.OS === "ios" && (
            <Modal visible={showDatePicker} transparent animationType="slide">
              <View className="flex-1 justify-end bg-black/40">
                <View className="bg-[#1c1c1e] rounded-t-[32px] p-6 pb-10">
                  <View className="flex-row justify-between items-center mb-4">
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text className="text-gray-400 font-medium">Cancel</Text>
                    </TouchableOpacity>
                    <Text className="text-white font-bold text-lg">
                      Birth date
                    </Text>
                    <TouchableOpacity onPress={confirmIOSDate}>
                      <Text className="text-green-500 font-bold">Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={tempDate}
                    mode="date"
                    display="spinner"
                    maximumDate={new Date()}
                    onChange={onDateChange}
                    textColor="white"
                  />
                </View>
              </View>
            </Modal>
          )}

          {/* ANDROID DATE PICKER */}
          {Platform.OS === "android" && showDatePicker && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              display="default"
              maximumDate={new Date()}
              onChange={onDateChange}
            />
          )}

          <View className="gap-y-1.5">
            <Text className="text-sm font-semibold text-gray-400 uppercase tracking-wider ml-1">
              Sex
            </Text>
            <View className="flex-row gap-x-4">
              {["Male", "Female", "Other"].map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => setValue("sex", option as any)}
                  className={cn(
                    "flex-1 h-14 rounded-2xl border items-center justify-center bg-white/5",
                    watch("sex") === option
                      ? "border-green-500 bg-green-500/10"
                      : "border-gray-400",
                  )}
                >
                  <Text
                    className={cn(
                      "font-bold",
                      watch("sex") === option
                        ? "text-green-500"
                        : "text-gray-400",
                    )}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.sex && (
              <Text className="text-xs text-red-400 ml-1">
                {errors.sex.message}
              </Text>
            )}
          </View>

          <TouchableOpacity
            onPress={handleNext}
            className="mt-6 h-16 w-full items-center justify-center rounded-2xl bg-green-600 shadow-sm"
          >
            <Text className="text-lg font-bold text-white">Continue</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View
          style={{ display: step === 2 ? "flex" : "none" }}
          className="gap-y-4"
        >
          {/* Email Field */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="Email Address"
                placeholder="kwakuTheTraveller@gmail.com"
                keyboardType="email-address"
                autoCapitalize="none"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.email?.message}
                icon="mail-outline"
              />
            )}
          />

          {/* Password Field */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="Password"
                placeholder="••••••••"
                secureTextEntry
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.password?.message}
                icon="lock-closed-outline"
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <CustomInput
                label="Confirm Password"
                placeholder="••••••••"
                secureTextEntry
                icon="shield-checkmark-outline"
                onChangeText={onChange}
                value={value}
                error={errors.confirmPassword?.message}
              />
            )}
          />

          {/* Accept Contract */}
          <Controller
            control={control}
            name="acceptContract"
            render={({ field: { onChange, value } }) => (
              <Checkbox
                value={value}
                onValueChange={onChange}
                error={errors.acceptContract?.message}
                label={
                  <Text className="text-gray-300 text-sm leading-5">
                    I agree to the{" "}
                    <Link
                      href="/(app)/(public)/(legal)/Terms"
                      className="text-green-500 font-bold underline"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/(app)/(public)/(legal)/Privacy"
                      className="text-green-500 font-bold underline"
                    >
                      Privacy Policy
                    </Link>
                  </Text>
                }
              />
            )}
          />
          {errors.acceptContract && (
            <Text className="text-red-500 text-xs">
              {errors.acceptContract.message}
            </Text>
          )}

          <View className="flex-row gap-x-4 mt-4">
            <TouchableOpacity
              onPress={prevStep}
              className="h-16 flex-[2] items-center justify-center rounded-2xl bg-black border border-white/10"
            >
              <Text className="text-white font-bold">Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                handleSubmit(onSubmit, (errors) => {
                  console.log("Validation Errors:", errors);
                })();
              }}
              disabled={isSubmitting}
              activeOpacity={0.8}
              className="h-16 flex-[3] flex-row items-center justify-center rounded-2xl bg-green-600 shadow-sm"
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-lg font-bold text-white">Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
