import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import useUserStore from "@/store/use-userstore";
import { getSymptomDetailsById } from "@/src/services/symptoms";
import { themeColors } from "@/src/theme/colors";
import { fonts } from "@/src/theme/fonts";
import { size } from "@/src/theme/fontStyle";

const SymptomDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user: userData } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [symptomDetails, setSymptomDetails] = useState<any>(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      getSymptomDetailsById(id as string)
        .then((data) => setSymptomDetails(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={themeColors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Symptom Details</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {symptomDetails ? (
          <>
            <Text style={styles.title}>{symptomDetails.name}</Text>
            <Text style={styles.content}>{symptomDetails.description}</Text>
          </>
        ) : (
          <Text>Symptom not found</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.gray,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.QuincyCFBold,
    color: themeColors.black,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.QuincyCFBold,
    color: themeColors.primary,
    marginBottom: 20,
  },
  content: {
    fontSize: 16,
    fontFamily: fonts.OpenSansRegular,
    color: themeColors.black,
    lineHeight: 24,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SymptomDetails;
