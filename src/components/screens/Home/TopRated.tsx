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
import { useTopRatedFacilities } from "@/hooks/use-facilities";
import { TFacilityProfileOutput } from "@/schemas/facility-profile.schema";
import FacilityCard from "@/components/FacilityCard";
import { size } from "@/src/theme/fontStyle";
import { themeColors } from "@/src/theme/colors";
import { fonts } from "@/src/theme/fonts";

// ─────────────────────────────────────────────────────────────────────────────
// Layout constants
// ─────────────────────────────────────────────────────────────────────────────
//
// This component is rendered inside HomeScreen's container which already has
// paddingHorizontal: 20. That means the FlatList's scrollable viewport is
// exactly (screenWidth - 40) wide.
//
// We must NOT add extra horizontal padding in contentContainerStyle — that
// would push slides beyond the viewport and cause cards to bleed off-screen.
// The parent's padding already provides the visual gap from screen edges.
//
const CARD_GAP = 12;            // gap between the two cards in 2-column mode
const TABLET_BREAKPOINT = 600;  // px — wider devices get 2 cards per row

const TopRated = () => {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // The FlatList viewport = screenWidth - 40 (HomeScreen paddingHorizontal: 20 * 2)
  const slideWidth = width - 40;

  // 1 column on phones, 2 on tablets / landscape
  const columns = width >= TABLET_BREAKPOINT ? 2 : 1;

  // Each card fills the slide — in 2-column mode they split it minus the gap
  const cardWidth =
    columns === 2
      ? Math.floor((slideWidth - CARD_GAP) / 2)
      : slideWidth;

  const { data, isLoading, isError } = useTopRatedFacilities({ limit: 20 });
  const facilities: TFacilityProfileOutput[] =
    data?.pages.flatMap((p) => p.facilities ?? []) ?? [];

  // Group facilities into chunks of `columns` — each chunk is one carousel slide
  const slides = useMemo(() => {
    const chunks: TFacilityProfileOutput[][] = [];
    for (let i = 0; i < facilities.length; i += columns) {
      chunks.push(facilities.slice(i, i + columns));
    }
    return chunks;
  }, [facilities, columns]);

  // Auto-rotate every 6 s
  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % slides.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 6000);
    return () => clearInterval(t);
  }, [slides.length]);

  // ── Slide renderer ─────────────────────────────────────────────────────────
  const renderSlide = useCallback(
    ({ item: pair }: { item: TFacilityProfileOutput[] }) => (
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
        {/* Trailing spacer so the last odd card doesn't stretch */}
        {columns === 2 && pair.length === 1 && (
          <View style={{ width: cardWidth }} />
        )}
      </View>
    ),
    [cardWidth, slideWidth, columns],
  );

  // ── Loading skeleton ───────────────────────────────────────────────────────
  const renderSkeleton = () => (
    <View
      style={{
        width: slideWidth,
        flexDirection: "row",
        gap: columns === 2 ? CARD_GAP : 0,
      }}
    >
      {Array.from({ length: columns }).map((_, i) => (
        <View key={i} style={[styles.skeleton, { width: cardWidth }]}>
          <View
            style={[
              styles.skeletonImage,
              { height: Math.round(cardWidth * 0.7) },
            ]}
          />
          <View style={styles.skeletonBody}>
            <View style={styles.skeletonLine} />
            <View style={[styles.skeletonLine, { width: "60%" }]} />
            <View style={[styles.skeletonLine, { width: "40%", marginTop: 4 }]} />
          </View>
        </View>
      ))}
    </View>
  );

  if (!isLoading && (isError || facilities.length === 0)) return null;

  return (
    <View style={styles.container}>
      {/* Header — no extra paddingHorizontal; parent container provides the 20px gap */}
      <View style={styles.header}>
        <Text className="text-xl font-medium text-slate-200">Top Rated</Text>
        <TouchableOpacity
          onPress={() =>
            router.push("/(app)/(auth)/(tabs)/Home/top-rated" as any)
          }
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.seeAllBtn}
        >
          <Text style={styles.seeAllText}>See All</Text>
          <Ionicons name="chevron-forward" size={13} color="#16a34a" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        renderSkeleton()
      ) : (
        <FlatList
          ref={flatListRef}
          data={slides}
          renderItem={renderSlide}
          keyExtractor={(_, i) => `tr-slide-${i}`}
          horizontal
          // ⚠️ No contentContainerStyle paddingHorizontal.
          // The parent (HomeScreen) already has paddingHorizontal: 20 which
          // constrains this FlatList's viewport to (screenWidth - 40).
          // Adding padding here would make slides wider than the viewport,
          // causing the right edge of each card to bleed off-screen.
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
            const idx = Math.round(
              e.nativeEvent.contentOffset.x / slideWidth,
            );
            setActiveIndex(idx);
          }}
          initialNumToRender={2}
          maxToRenderPerBatch={2}
          removeClippedSubviews={false}
        />
      )}

      {/* Page dots */}
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

export default TopRated;

const styles = StyleSheet.create({
  container: { marginTop: 14 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
    headingLabel: {
    fontSize: size.md,
    color: themeColors.darkGray,
    fontFamily: fonts.OpenSansBold,
    textTransform: 'uppercase',
    marginBottom: 8,
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
  skeleton: {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  skeletonImage: { backgroundColor: "#f1f5f9" },
  skeletonBody: { padding: 10, gap: 6 },
  skeletonLine: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#f1f5f9",
    width: "80%",
  },
});
