import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import useFavoritesStore from "@/store/use-favorites-store";
import FacilityCard from "@/components/FacilityCard";

const CARD_GAP = 10;
const H_PADDING = 20;

const Favorites = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { favorites } = useFavoritesStore();

  // 2-column grid — same card width formula as the home carousel
  const cardWidth = Math.floor((width - H_PADDING * 2 - CARD_GAP) / 2);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#334155" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Liked Facilities</Text>
        <View style={{ width: 26 }} />
      </View>

      <FlashList
        data={favorites}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item, index }) => (
          <View
            style={[
              styles.cardWrapper,
              index % 2 === 0
                ? { marginRight: CARD_GAP / 2 }
                : { marginLeft: CARD_GAP / 2 },
            ]}
          >
            <FacilityCard facility={item} cardWidth={cardWidth} />
          </View>
        )}
        contentContainerStyle={{
          paddingHorizontal: H_PADDING,
          paddingBottom: insets.bottom + 24,
        }}
        // @ts-ignore
        estimatedItemSize={cardWidth * 1.1 + 60}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={64} color="#e2e8f0" />
            <Text style={styles.emptyText}>
              Your favorites will appear here even when you're offline.
            </Text>
          </View>
        }
        ListFooterComponent={<View style={{ height: 20 }} />}
      />
    </View>
  );
};

export default Favorites;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#1e293b",
  },
  cardWrapper: {
    marginBottom: CARD_GAP,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
