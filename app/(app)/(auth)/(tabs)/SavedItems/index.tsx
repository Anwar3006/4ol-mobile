import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import useUserStore from "@/store/use-userstore";
import useFavoritesStore from "@/store/use-favorites-store";
import { useSyncFavorites, useToggleFavorite } from "@/hooks/use-facilities";
import { themeColors } from "@/src/theme/colors";
import { fonts } from "@/src/theme/fonts";
import { size } from "@/src/theme/fontStyle";

const SavedItems = () => {
  const router = useRouter();
  const { user: userData } = useUserStore();
  const { favorites } = useFavoritesStore();
  const { isLoading } = useSyncFavorites(userData?.user_id);
  const toggleFavorite = useToggleFavorite();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Items</Text>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="heart-dislike-outline" size={60} color={themeColors.darkGray} />
          <Text style={styles.noFavoritesText}>No saved items yet</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push({ pathname: "/(app)/(auth)/Facility/[id]", params: { id: item.id } })}
            >
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.facility_name}</Text>
                <Text style={styles.cardType}>{item.facility_type?.replace(/_/g, ' ')}</Text>
                <View style={styles.cardLocation}>
                  <Ionicons name="location-outline" size={16} color={themeColors.primary} />
                  <Text style={styles.cardLocationText}>{item.area}, {item.region}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => toggleFavorite.mutate({ userId: userData?.user_id!, facility: item })}
              >
                <Ionicons name="heart" size={24} color={themeColors.primary} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.white,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.gray,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: size.lg,
    fontFamily: fonts.QuincyCFBold,
    color: themeColors.black,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noFavoritesText: {
    marginTop: 10,
    fontSize: size.md,
    fontFamily: fonts.OpenSansRegular,
    color: themeColors.darkGray,
  },
  listContent: {
    padding: 20,
  },
  card: {
    backgroundColor: themeColors.white,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: size.md,
    fontFamily: fonts.OpenSansBold,
    color: themeColors.black,
  },
  cardType: {
    fontSize: size.s,
    fontFamily: fonts.OpenSansRegular,
    color: themeColors.darkGray,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  cardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  cardLocationText: {
    fontSize: size.s,
    fontFamily: fonts.OpenSansRegular,
    color: themeColors.black,
    marginLeft: 5,
  },
});

export default SavedItems;
