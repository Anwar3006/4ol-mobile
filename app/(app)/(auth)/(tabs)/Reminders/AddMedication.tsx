import {
  View,
  Text,
  useWindowDimensions,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import React, { useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  useOpenFDAMedicationData,
  useUpsertMedication,
} from "@/hooks/use-medication-reminder";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatOpenFDAData } from "@/lib/medication-formatter";
import { Ionicons } from "@expo/vector-icons";
import { authClient } from "@/lib/auth-client";
import { CustomDropdown } from "@/components/CustomDropdown";

const dosageUnits = [
  { label: "mg", value: "mg" },
  { label: "ml", value: "ml" },
  { label: "g", value: "g" },
  { label: "tablet(s)", value: "tablets" },
  { label: "capsule(s)", value: "capsules" },
  { label: "drop(s)", value: "drops" },
  { label: "puff(s)", value: "puffs" },
];

const intervalUnits = [
  { label: "Minutes", value: "minutes" },
  { label: "Hours", value: "hours" },
  { label: "Days", value: "days" },
];

const drugTypes = [
  { label: "Pill / Tablet", value: "tablet" },
  { label: "Capsule", value: "capsule" },
  { label: "Liquid / Syrup", value: "liquid" },
  { label: "Injection", value: "injection" },
  { label: "Inhaler", value: "inhaler" },
  { label: "Drops", value: "drops" },
  { label: "Cream / Gel", value: "cream" },
  { label: "Other", value: "other" },
];

const MedicationReminder = () => {
  const { data: sessionData } = authClient.useSession();
  const { medication } = useLocalSearchParams<{ medication: string }>();
  const { data, isLoading } = useOpenFDAMedicationData(medication);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const { mutateAsync: saveMedication, isPending: isSavingMedication } =
    useUpsertMedication();

  const [step, setStep] = useState(1);
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>([]);
  const formattedData = useMemo(() => formatOpenFDAData(data), [data]);

  // Form State
  const [formData, setFormData] = useState({
    dosage_amount: "",
    dosage_unit: "mg",
    interval: "8",
    interval_unit: "hours",
    instructions: "",
    custom_purpose: "",
    drug_type: "tablet",
  });

  // Sync API data to form once loaded
  React.useEffect(() => {
    if (formattedData) {
      setFormData((prev) => ({
        ...prev,
        instructions: formattedData.instructions,
        purpose: formattedData.purpose,
        drug_type: formattedData.drug_type || "tablet",
      }));
      // Default select the first suggestion
      if (formattedData.purpose?.length > 0) {
        setSelectedPurposes([formattedData.purpose[0]]);
      }
    }
  }, [formattedData]);

  const togglePurpose = (purpose: string) => {
    setSelectedPurposes((prev) =>
      prev.includes(purpose)
        ? prev.filter((p) => p !== purpose)
        : [...prev, purpose],
    );
  };

  const isWideScreen = width > 600; // Handling Z-Folds and Tablets

  const handleFinalSave = async () => {
    // Combine selected tags with custom purpose
    const finalPurposes = [...selectedPurposes];
    if (formData.custom_purpose.trim()) {
      finalPurposes.push(formData.custom_purpose.trim());
    }

    const payload = {
      drug_name: medication,
      generic_name: formattedData?.generic_name,
      rxcui: formattedData?.rxcui,
      dosage_amount: `${formData.dosage_amount} ${formData.dosage_unit}`,
      interval: formData.interval,
      interval_units: formData.interval_unit,
      drug_type: formData.drug_type,
      purpose: finalPurposes,
      instructions: formData.instructions,
      side_effects: formattedData?.side_effects,
      raw_openfda_data: formattedData?.raw_data, // Save full response for future use
      is_active: true,
      is_enabled: true,
    };

    console.log("Medication: ", payload);

    try {
      await saveMedication({
        userId: sessionData?.user?.id as string,
        reminderId: null,
        values: payload,
      });
      // Reset form state
      setStep(1);
      setSelectedPurposes([]);
      setFormData({
        dosage_amount: "",
        dosage_unit: "mg",
        interval: "8",
        interval_unit: "hours",
        instructions: "",
        custom_purpose: "",
        drug_type: "tablet",
      });
      router.replace("/(app)/(auth)/(tabs)/Reminders/MedicationList");
    } catch (e) {
      console.error("Save failed", e);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View className="gap-6">
            <View>
              <Text className="text-slate-400 font-bold mb-2 uppercase text-xs">
                Drug
              </Text>
              <View className="bg-slate-100 p-4 rounded-2xl border border-slate-200">
                <Text className="text-lg font-bold text-slate-800">
                  {medication}
                </Text>
              </View>
            </View>

            <View>
              <Text className="text-slate-400 font-bold mb-2 uppercase text-xs">
                Type
              </Text>
              <CustomDropdown
                label="Drug Type"
                data={drugTypes}
                value={formData.drug_type}
                onChange={(item) =>
                  setFormData({ ...formData, drug_type: item.value })
                }
              />
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-red-400 font-bold mb-2 uppercase text-xs">
                  Dosage
                </Text>
                <TextInput
                  className="bg-white p-4 h-16 rounded-2xl border border-slate-200 text-lg font-medium"
                  placeholder="e.g. 500"
                  keyboardType="numeric"
                  value={formData.dosage_amount}
                  onChangeText={(t) =>
                    setFormData({ ...formData, dosage_amount: t })
                  }
                />
              </View>
              <View className="w-40">
                <CustomDropdown
                  label="Unit"
                  data={dosageUnits}
                  value={formData.dosage_unit}
                  onChange={(item) =>
                    setFormData({ ...formData, dosage_unit: item.value })
                  }
                />
              </View>
            </View>
          </View>
        );
      case 2:
        return (
          <View className="gap-6">
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-slate-400 font-bold mb-2 uppercase text-xs">
                  Interval
                </Text>
                <TextInput
                  className="bg-white p-4 h-16 rounded-2xl border border-slate-200 text-lg font-medium"
                  keyboardType="numeric"
                  value={formData.interval}
                  onChangeText={(t) => setFormData({ ...formData, interval: t })}
                />
              </View>
              <View className="w-40">
                <CustomDropdown
                  label="Frequency"
                  data={intervalUnits}
                  value={formData.interval_unit}
                  onChange={(item) =>
                    setFormData({ ...formData, interval_unit: item.value })
                  }
                />
              </View>
            </View>

            <View>
              <Text className="text-slate-400 font-bold mb-2 uppercase text-xs">
                What is this for?
              </Text>
              <TextInput
                className="bg-white p-4 rounded-2xl border border-slate-200 text-lg font-medium mb-4"
                placeholder="Add custom purpose..."
                value={formData.custom_purpose}
                onChangeText={(t) =>
                  setFormData({ ...formData, custom_purpose: t })
                }
              />
              <View className="flex-row flex-wrap gap-2">
                {formattedData?.purpose?.map((p: string, idx: number) => (
                  <TouchableOpacity
                    key={`${p}-${idx}`}
                    onPress={() => togglePurpose(p)}
                    className={`px-4 py-2 rounded-full border ${selectedPurposes.includes(p) ? "bg-green-600 border-green-600" : "bg-white border-slate-200"}`}
                  >
                    <Text
                      className={`font-bold text-xs ${selectedPurposes.includes(p) ? "text-white" : "text-slate-600"}`}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );
      case 3:
        return (
          <View className="gap-4">
            <Text className="text-slate-900 text-xl font-bold">
              Confirm Instructions
            </Text>
            <TextInput
              multiline
              className="bg-white p-4 rounded-2xl border border-slate-200 min-h-[150px] text-slate-600 leading-6"
              value={formData.instructions}
              onChangeText={(t) =>
                setFormData({ ...formData, instructions: t })
              }
            />

            {/* Side Effects Info Section */}
            <View className="bg-amber-50 p-5 rounded-3xl border border-amber-100">
              <View className="flex-row items-center mb-2">
                <Ionicons name="warning" size={20} color="#b45309" />
                <Text className="ml-2 text-amber-800 font-bold uppercase text-xs">
                  Side Effects Info
                </Text>
              </View>
              <Text className="text-amber-900/70 leading-5 text-sm italic">
                {formattedData?.side_effects?.substring(0, 300)}...
              </Text>
            </View>
          </View>
        );
    }
  };

  if (isLoading)
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Fetching details...</Text>
      </View>
    );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", paddingTop: insets.top }}>
      {/* Responsive Header */}
      <View className="px-6 py-4 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => (step > 1 ? setStep((s) => s - 1) : router.back())}
        >
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <View className="flex-row gap-1">
          {[1, 2, 3].map((i) => (
            <View
              key={i}
              className={`h-1.5 w-8 rounded-full ${step >= i ? "bg-green-500" : "bg-slate-200"}`}
            />
          ))}
        </View>
        <View className="w-6" />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 100,
        }}
        className="flex-1"
      >
        <View
          style={{
            alignSelf: isWideScreen ? "center" : "auto",
            width: isWideScreen ? 600 : "100%",
            marginTop: 40,
          }}
        >
          <Text className="text-3xl font-black text-slate-900 mb-5">
            Medication Reminder Setup
          </Text>

          <Text className="text-3xl font-black text-slate-700 mb-2">
            Step {step}
          </Text>
          <Text className="text-slate-500 mb-8 font-medium">
            {step === 1
              ? "Identify your dose"
              : step === 2
                ? "Set your schedule"
                : "Review administration"}
          </Text>

          {renderStep()}
        </View>
      </ScrollView>

      <View
        style={{ paddingBottom: insets.bottom + 16 }}
        className="absolute bottom-0 left-0 right-0 bg-white/80 border-t border-slate-100 px-6 pt-4 flex-row gap-4"
      >
        <TouchableOpacity
          className="flex-1 bg-slate-100 p-5 rounded-3xl items-center"
          onPress={() => router.replace("/(app)/(auth)/(tabs)/Reminders/MedicationList")}
        >
          <Text className="text-slate-600 font-bold text-lg">Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-[2] bg-green-600 p-5 rounded-3xl items-center shadow-lg"
          disabled={isSavingMedication}
          onPress={() => (step < 3 ? setStep((s) => s + 1) : handleFinalSave())}
        >
          {isSavingMedication ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">
              {step === 3 ? "Save Reminder" : "Continue"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MedicationReminder;
