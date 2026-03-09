import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import useSearchStore from "@/store/use-searchStore";
import { themeColors } from "@/src/theme/colors";
import { fonts } from "@/src/theme/fonts";
import { size } from "@/src/theme/fontStyle";
import { Ionicons } from "@expo/vector-icons";

const CategoryResultsScreen = () => {
  const { category } = useLocalSearchParams();
  const router = useRouter();
  const { results, query } = useSearchStore();

  const categoryData =
    results?.find((item) => item.table === category)?.results || [];

  const navigateToDetails = (id: string) => {
    switch (category) {
      case "illness_and_conditions":
        router.push({ pathname: "/(app)/(auth)/(modal)/DiseaseDetails", params: { id } });
        break;
      case "symptoms":
        router.push({ pathname: "/(app)/(auth)/(modal)/SymptomDetails", params: { id } });
        break;
      case "facilities":
        router.push({ pathname: "/(app)/(auth)/Facility/[id]", params: { id } });
        break;
    }
  };

  const tableNameMapping: Record<string, string> = {
    illness_and_conditions: "Illness and Conditions",
    symptoms: "Symptoms",
    healthy_living: "Healthy Living",
    facilities: "Facilities",
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={themeColors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tableNameMapping[category as string] || "Results"}</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={categoryData}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigateToDetails(item.id)}
          >
            <Text style={styles.itemText}>{item.name || item.title || query}</Text>
            <Ionicons name="chevron-forward" size={20} color={themeColors.primary} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.gray,
  },
  headerTitle: {
    fontSize: size.lg,
    fontFamily: fonts.QuincyCFBold,
    color: themeColors.black,
  },
  listContent: {
    padding: 20,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: themeColors.lightGray,
    borderRadius: 10,
    marginBottom: 10,
  },
  itemText: {
    fontSize: size.md,
    fontFamily: fonts.OpenSansRegular,
    color: themeColors.black,
  },
});

export default CategoryResultsScreen;
