import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTopRatedFacilities } from "@/hooks/use-facilities";
import FacilityCard from "@/components/FacilityCard";

const CARD_GAP = 10;
const H_PADDING = 20;

const TopRatedScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // 2-column grid — same card width formula as the home carousel
  const cardWidth = Math.floor((width - H_PADDING * 2 - CARD_GAP) / 2);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useTopRatedFacilities({ limit: 20 });

  const facilities = data?.pages.flatMap((page) => page.facilities) ?? [];

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#334155" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Top Rated</Text>
        <View style={{ width: 26 }} />
      </View>

      <FlashList
        data={facilities}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item, index }) => (
          <View
            style={[
              styles.cardWrapper,
              // Right column gets left margin; left column gets right margin
              index % 2 === 0
                ? { marginRight: CARD_GAP / 2 }
                : { marginLeft: CARD_GAP / 2 },
            ]}
          >
            <FacilityCard facility={item} cardWidth={cardWidth} />
          </View>
        )}
        contentContainerStyle={{ paddingHorizontal: H_PADDING, paddingBottom: insets.bottom + 24 }}
        // @ts-ignore
        estimatedItemSize={cardWidth * 1.1 + 60}
        onEndReached={() => {
          if (hasNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Ionicons name="ribbon-outline" size={48} color="#e2e8f0" />
              <Text style={styles.emptyText}>No top rated facilities found</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator size="small" color="#10b981" style={{ paddingVertical: 16 }} />
          ) : (
            <View style={{ height: 20 }} />
          )
        }
      />
    </View>
  );
};

export default TopRatedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EBF9E6",
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
    gap: 12,
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "600",
  },
});
