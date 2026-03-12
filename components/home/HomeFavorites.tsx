import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import useFavoritesStore from "@/store/use-favorites-store";
import FacilityCard from "@/components/FacilityCard";

// ─────────────────────────────────────────────────────────────────────────────
// Layout constants — mirrors TopRated.tsx intentionally
// ─────────────────────────────────────────────────────────────────────────────
const CARD_GAP = 12;
const TABLET_BREAKPOINT = 600;

const HomeFavorites = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { favorites } = useFavoritesStore();

  // FlatList viewport = screenWidth - 40 (HomeScreen paddingHorizontal: 20 * 2)
  const slideWidth = width - 40;
  const columns = width >= TABLET_BREAKPOINT ? 2 : 1;
  const cardWidth =
    columns === 2
      ? Math.floor((slideWidth - CARD_GAP) / 2)
      : slideWidth;

  // Group favorites into chunks of `columns` — each chunk is one carousel slide
  const slides = useMemo(() => {
    const chunks: (typeof favorites)[] = [];
    for (let i = 0; i < favorites.length; i += columns) {
      chunks.push(favorites.slice(i, i + columns));
    }
    return chunks;
  }, [favorites, columns]);

  // Clamp activeIndex if favorites shrink (e.g. after unfavoriting)
  useEffect(() => {
    if (slides.length > 0 && activeIndex >= slides.length) {
      const clamped = slides.length - 1;
      setActiveIndex(clamped);
      flatListRef.current?.scrollToIndex({ index: clamped, animated: false });
    }
  }, [slides.length]);

  // Auto-rotate every 8.5 s
  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % slides.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 8500);
    return () => clearInterval(t);
  }, [slides.length]);

  const renderSlide = useCallback(
    ({ item: pair }: { item: (typeof favorites) }) => (
      <View
        style={{
          width: slideWidth,
          flexDirection: "row",
          gap: columns === 2 ? CARD_GAP : 0,
        }}
      >
        {pair.map((facility) => (
          <FacilityCard
            key={facility.id}
            facility={facility}
            cardWidth={cardWidth}
          />
        ))}
        {columns === 2 && pair.length === 1 && (
          <View style={{ width: cardWidth }} />
        )}
      </View>
    ),
    [cardWidth, slideWidth, columns],
  );

  if (favorites.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text className="text-xl font-medium text-slate-900">Your Favorites</Text>
        <TouchableOpacity
          onPress={() =>
            router.push("/(app)/(auth)/(tabs)/My Account/Favorites" as any)
          }
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.seeAllBtn}
        >
          <Text style={styles.seeAllText}>See All</Text>
          <Ionicons name="chevron-forward" size={13} color="#16a34a" />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(_, i) => `fav-slide-${i}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={slideWidth}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        getItemLayout={(_, index) => ({
          length: slideWidth,
          offset: slideWidth * index,
          index,
        })}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / slideWidth);
          setActiveIndex(idx);
        }}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        removeClippedSubviews={false}
      />

      {slides.length > 1 && (
        <View style={styles.dotsRow}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default HomeFavorites;

const styles = StyleSheet.create({
  container: { marginTop: 24, marginBottom: 10 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: { fontSize: 20, fontWeight: "500", color: "#0f172a" },
  seeAllBtn: { flexDirection: "row", alignItems: "center", gap: 2 },
  seeAllText: { fontSize: 13, fontWeight: "700", color: "#16a34a" },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  dot: { height: 5, borderRadius: 3 },
  dotActive: { width: 18, backgroundColor: "#10b981" },
  dotInactive: { width: 5, backgroundColor: "#e2e8f0" },
});
