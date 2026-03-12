import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import { TFacilityProfileOutput } from "@/schemas/facility-profile.schema";
import useFavoritesStore from "@/store/use-favorites-store";
import { useToggleFavorite } from "@/hooks/use-facilities";
import useUserStore from "@/store/use-userstore";
import { formatTextToTitleCase, getLiveStatus } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveImageUrl(path: string | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
  const bucket = process.env.EXPO_PUBLIC_SUPABASE_BUCKET_NAME || "facility-media";
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface FacilityCardProps {
  facility: TFacilityProfileOutput;
  /** Fixed width for carousel/grid layouts. Omit to fill flex container. */
  cardWidth?: number;
  /** Override default navigation (push to Facility/[id]) */
  onPress?: () => void;
  /** Hide the heart button — e.g. on the full-screen Favorites list */
  showFavoriteButton?: boolean;
}

// ---------------------------------------------------------------------------
// FacilityCard — the single standard card used everywhere in the app
// ---------------------------------------------------------------------------

const FacilityCard = React.memo(
  ({
    facility,
    cardWidth,
    onPress,
    showFavoriteButton = true,
  }: FacilityCardProps) => {
    const router = useRouter();
    const { user } = useUserStore();
    const toggleFavoriteMutation = useToggleFavorite();

    // Subscribe to favorites slice so the heart re-renders on change
    const isFav = useFavoritesStore((s) =>
      s.favorites.some((f) => f.id === facility.id),
    );

    const imageUrl =
      resolveImageUrl(facility.featured_image_url) ??
      resolveImageUrl(facility.media_urls?.[0]) ??
      null;

    const { isOpen, label } = getLiveStatus(facility.business_hours ?? []);

    const facilityTypeLabel = formatTextToTitleCase(
      (facility.facility_type ?? "").replace(/_/g, " "),
      " ",
    );

    const handlePress = () => {
      if (onPress) {
        onPress();
      } else {
        router.push(`/(app)/(auth)/Facility/${facility.id}` as any);
      }
    };

    const handleToggleFavorite = () => {
      if (!user) return;
      // ⚠️ Snapshot isFav BEFORE calling mutate — onMutate will flip the store,
      // so reading it inside mutationFn after onMutate runs gives the wrong value.
      // Passing it as a variable ensures mutationFn always sees the pre-toggle state.
      toggleFavoriteMutation.mutate({
        userId: user.user_id,
        facility,
        wasAlreadyFavorite: isFav,
      });
    };

    // Derive image height from card width for a consistent portrait aspect ratio.
    // When cardWidth is not provided (list mode), the image height is fixed.
    const imageHeight = cardWidth ? Math.round(cardWidth * 0.7) : 160;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handlePress}
        style={[
          styles.card,
          cardWidth ? { width: cardWidth } : { width: "100%" },
        ]}
      >
        {/* ── Image ── */}
        <View style={{ height: imageHeight, backgroundColor: "#f1f5f9" }}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={StyleSheet.absoluteFillObject}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={styles.imageFallback}>
              <Ionicons name="business-outline" size={32} color="#94a3b8" />
            </View>
          )}

          {/* Open / Closed pill */}
          <View
            style={[
              styles.statusPill,
              { backgroundColor: isOpen ? "#10b981" : "#475569" },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isOpen ? "#fff" : "#94a3b8" },
              ]}
            />
            <Text style={styles.statusText}>{label}</Text>
          </View>

          {/* Rating badge */}
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={10} color="#f59e0b" />
            <Text style={styles.ratingText}>
              {facility.avg_rating ? facility.avg_rating.toFixed(1) : "5.0"}
            </Text>
          </View>
        </View>

        {/* ── Info ── */}
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={styles.name}>
                {facility.facility_name}
              </Text>
              <Text numberOfLines={1} style={styles.type}>
                {facilityTypeLabel}
              </Text>
            </View>

            {showFavoriteButton && (
              <TouchableOpacity
                onPress={handleToggleFavorite}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.heartBtn}
              >
                <Ionicons
                  name={isFav ? "heart" : "heart-outline"}
                  size={18}
                  color={isFav ? "#ef4444" : "#94a3b8"}
                />
              </TouchableOpacity>
            )}
          </View>

          {facility.area ? (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={10} color="#94a3b8" />
              <Text numberOfLines={1} style={styles.location}>
                {facility.area}
              </Text>
            </View>
          ) : null}

          {facility.accepts_nhis && (
            <View style={styles.nhisBadge}>
              <Text style={styles.nhisText}>NHIS</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  },
);

export default FacilityCard;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    marginBottom: 10,
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    // Android shadow
    elevation: 3,
  },
  imageFallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  statusPill: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
    gap: 4,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  statusText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  ratingBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0f172a",
  },
  infoContainer: {
    paddingHorizontal: 10,
    paddingTop: 9,
    paddingBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 22,
  },
  type: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  heartBtn: {
    backgroundColor: "#f8fafc",
    borderRadius: 20,
    padding: 5,
    marginTop: 1,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    gap: 3,
  },
  location: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
    flex: 1,
  },
  nhisBadge: {
    marginTop: 6,
    alignSelf: "flex-start",
    backgroundColor: "#f3e8ff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  nhisText: {
    fontSize: 8,
    fontWeight: "900",
    color: "#7e22ce",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
