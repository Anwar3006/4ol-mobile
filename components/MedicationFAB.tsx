import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  Keyboard,
  ActivityIndicator,
  useWindowDimensions,
  KeyboardEvent,
  Animated,
  Platform,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetRxNorm } from "@/hooks/use-medication-reminder";
import { useRouter } from "expo-router";

export const MedicationFAB = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const router = useRouter();

  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Animation for modal lift
  const modalTranslateY = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(1)).current;

  // Enforce 2/3 height
  const modalHeight = height * 0.67;
  const modalWidth = width > 768 ? 550 : width;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e: KeyboardEvent) => {
        setIsKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);

        // Calculate how much to lift the modal so it clears the keyboard
        // Modal is anchored at bottom, so we lift by the full keyboard height
        // minus any safe area already accounted for
        const liftAmount = Platform.OS === "ios"
          ? e.endCoordinates.height
          : e.endCoordinates.height;

        Animated.parallel([
          Animated.spring(modalTranslateY, {
            toValue: -liftAmount,
            useNativeDriver: true,
            tension: 150,
            friction: 15,
          }),
          Animated.spring(modalScale, {
            toValue: 0.98,
            useNativeDriver: true,
            tension: 150,
            friction: 15,
          }),
        ]).start();
      },
    );

    const hideSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);

        // Return modal to original position
        Animated.parallel([
          Animated.spring(modalTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 150,
            friction: 15,
          }),
          Animated.spring(modalScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 150,
            friction: 15,
          }),
        ]).start();
      },
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const { data: suggestions, isLoading } = useGetRxNorm(debouncedQuery);

  const handleMedicationSelect = (medicationName: string) => {
    // Close modal and reset search
    setModalVisible(false);
    setSearchTerm("");

    router.push({
      pathname: "/Reminders/AddMedication",
      params: { medication: medicationName },
    });
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 80, right: 20 }]}
        className="bg-pink-700 shadow-xl items-center justify-center"
        onPress={() => setModalVisible(true)}
      >
        <MaterialCommunityIcons name="pill" size={40} color="white" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        statusBarTranslucent
        onRequestClose={() => {
          setModalVisible(false);
          setSearchTerm("");
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            Keyboard.dismiss();
            setModalVisible(false);
            setSearchTerm("");
          }}
          style={styles.modalOverlay}
        >
          <Animated.View
            style={[
              styles.modalContainer,
              {
                width: modalWidth,
                height: modalHeight,
                transform: [
                  { translateY: modalTranslateY },
                  { scale: modalScale },
                ],
              },
            ]}
          >
            {/* Prevent tap from closing when clicking inside modal */}
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {}}
              style={{ flex: 1 }}
            >
              {/* Visual Handle */}
              <View className="items-center pt-2 pb-1">
                <View className="w-12 h-1.5 bg-gray-200 rounded-full" />
              </View>

              {/* Header Section */}
              <View className="flex-row items-center justify-between px-6 mb-2">
                <View>
                  <Text className="text-2xl font-black text-slate-900 tracking-tight">
                    New Medication
                  </Text>
                  <Text className="text-slate-500 font-medium text-sm">
                    Select from clinical database
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                    setSearchTerm("");
                  }}
                  className="bg-slate-100 p-2 rounded-full"
                >
                  <Ionicons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              {/* Search Input Section - Fixed at top */}
              <View className="px-6 mt-2 mb-4">
                <View className="flex-row items-center bg-slate-50 rounded-2xl border border-slate-200 px-4">
                  <Ionicons name="search" size={20} color="#94a3b8" />
                  <TextInput
                    className="flex-1 py-4 ml-3 text-lg font-bold text-slate-900"
                    placeholder="e.g. Ibuprofen"
                    placeholderTextColor="#94a3b8"
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    autoFocus
                    returnKeyType="search"
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />
                  {isLoading && (
                    <ActivityIndicator size="small" color="#10b981" />
                  )}
                </View>
              </View>

              {/* Results Section with keyboard-aware scrolling */}
              <View className="flex-1 px-6">
                <FlashList
                  data={suggestions || []}
                  // estimatedItemSize={85}
                  keyExtractor={(item, index) => `${item}-${index}`}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingBottom: isKeyboardVisible
                      ? keyboardHeight + 20 // Extra padding when keyboard is up
                      : insets.bottom + 20,
                  }}
                  renderItem={({ item }: { item: string }) => (
                    <TouchableOpacity
                      onPress={() => handleMedicationSelect(item)}
                      className="flex-row items-center py-4 border-b border-slate-50 active:bg-slate-50"
                    >
                      <View className="bg-emerald-100/50 p-3 rounded-2xl mr-4">
                        <MaterialCommunityIcons
                          name="pill-multiple"
                          size={22}
                          color="#059669"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-[17px] font-bold text-slate-800">
                          {item}
                        </Text>
                        <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                          Verified Entry
                        </Text>
                      </View>
                      <View className="bg-emerald-50 p-1.5 rounded-full">
                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color="#10b981"
                        />
                      </View>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={() => (
                    <View className="py-10 items-center">
                      <View className="bg-slate-50 p-6 rounded-full">
                        <Ionicons
                          name="medical-outline"
                          size={40}
                          color="#cbd5e1"
                        />
                      </View>
                      <Text className="text-slate-400 font-bold mt-4 text-center px-10">
                        {searchTerm.length > 2 && !isLoading
                          ? `No match found for "${searchTerm}"`
                          : "Start typing to see clinical suggestions..."}
                      </Text>
                    </View>
                  )}
                />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    zIndex: 1000,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
});
