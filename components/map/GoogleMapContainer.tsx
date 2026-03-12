import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  useWindowDimensions,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useGetFacilitiesMapData } from "@/hooks/use-facilities";
import { Ionicons } from "@expo/vector-icons";
import { mapOptions } from "@/constants/mapOptions";
import Animated, {
  FadeIn,
  FadeOut,
  FadeInDown,
  FadeOutDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import { CustomInput } from "../CustomInput";
import { MapFilters, getCategoryMeta, CategoryIcon, CATEGORIES } from "./MapFilters";
import { useRouter } from "expo-router";
import * as Location from "expo-location";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const NEAR_ME_RADIUS_DEG = 0.027; // ≈ 3 km bounding box half-side

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function calcZoom(longitudeDelta: number) {
  return Math.round(Math.log2(360 / longitudeDelta));
}

/** Open Google Maps directions (falls back to browser) */
function openInMaps(lat: number, lng: number, label: string) {
  const encoded = encodeURIComponent(label);
  const googleUrl = `comgooglemaps://?daddr=${lat},${lng}&directionsmode=driving`;
  const browserUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  Linking.canOpenURL(googleUrl).then((supported) => {
    Linking.openURL(supported ? googleUrl : browserUrl);
  });
}

// ---------------------------------------------------------------------------
// Toast Component
// ---------------------------------------------------------------------------
interface ToastProps {
  message: string;
  visible: boolean;
}

const MapToast = ({ message, visible }: ToastProps) => {
  if (!visible) return null;
  return (
    <Animated.View
      entering={FadeInDown.duration(250).springify()}
      exiting={FadeOut.duration(300)}
      style={{
        position: "absolute",
        top: 0,
        alignSelf: "center",
        backgroundColor: "rgba(15,23,42,0.88)",
        paddingHorizontal: 18,
        paddingVertical: 9,
        borderRadius: 20,
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
        zIndex: 200,
      }}
    >
      <Ionicons name="checkmark-circle" size={15} color="#10b981" />
      <Text style={{ color: "white", fontWeight: "700", fontSize: 13 }}>{message}</Text>
    </Animated.View>
  );
};

// ---------------------------------------------------------------------------
// Popup Card Component
// ---------------------------------------------------------------------------
// FacilityPopup has been removed and merged into Marker Callout

// ---------------------------------------------------------------------------
// Main Map Container
// ---------------------------------------------------------------------------
const CustomMarker = React.memo(({ feature, meta, onPress }: any) => {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  // Turn off tracking after a short delay to allow the vector icon to render
  // This is required for custom markers on Android
  useEffect(() => {
    const timer = setTimeout(() => {
      setTracksViewChanges(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Marker
      coordinate={{
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
      }}
      tracksViewChanges={tracksViewChanges}
      flat={false}
      onPress={(e) => {
        // Prevent default native callout behavior
        e.stopPropagation();
        onPress(feature);
      }}
    >
      <View style={{ alignItems: "center", width: 45, height: 50 }}>
        <View style={[styles.markerContainer, { backgroundColor: meta.color }]}>
          <CategoryIcon icon={meta.icon} library={(meta as any).library ?? "MaterialIcons"} size={17} color="white" />
        </View>
        <View style={[styles.markerStem, { borderTopColor: meta.color }]} />
      </View>
    </Marker>
  );
});
const MapContainer = () => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const router = useRouter();

  // Ref to suppress the MapView onPress that fires immediately after a Marker press
  const markerJustTapped = useRef(false);

  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isNearMeActive, setIsNearMeActive] = useState(false);

  // Toast state
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(message);
    setToastVisible(true);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 2800);
  }, []);

  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  // Map region / viewport
  const [region, setRegion] = useState({
    latitude: 5.6037,
    longitude: -0.187,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  });

  const [nearMeBounds, setNearMeBounds] = useState<{
    minLng: number; minLat: number; maxLng: number; maxLat: number; zoom: number;
  } | null>(null);

  const viewportBounds = useMemo(
    () => ({
      // Fetch a slightly larger area (1.2x) than visible to improve stability at edges
      minLng: region.longitude - region.longitudeDelta * 0.6,
      minLat: region.latitude - region.latitudeDelta * 0.6,
      maxLng: region.longitude + region.longitudeDelta * 0.6,
      maxLat: region.latitude + region.latitudeDelta * 0.6,
      zoom: calcZoom(region.longitudeDelta),
    }),
    [region.latitude, region.longitude, region.latitudeDelta, region.longitudeDelta],
  );

  const activeBounds = isNearMeActive && nearMeBounds ? nearMeBounds : viewportBounds;

  // Debounce the bounds updates to prevent flickering and excessive network requests
  const [debouncedBounds, setDebouncedBounds] = useState(activeBounds);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedBounds(activeBounds);
    }, 400); 
    return () => clearTimeout(handler);
  }, [activeBounds]);

  const { data: geojson, isFetching } = useGetFacilitiesMapData({
    ...debouncedBounds,
    enabled: true,
    filters: {
      facilityName: searchQuery || undefined,
      facilityType: selectedCategory !== "all" && selectedCategory !== "near_me" ? selectedCategory : undefined,
    },
  });

// 1. Directions Handler
  const handleDirections = (feature: any) => {
    const { coordinates } = feature.geometry;
    const name = feature.properties?.name || "Facility";
    openInMaps(coordinates[1], coordinates[0], name);
  };

  const handleMarkerPress = (feature: any) => {
    setSelectedFacility(feature);
    // Animate map to center on the pin slightly offset for the bottom card
    mapRef.current?.animateToRegion({
      latitude: feature.geometry.coordinates[1] - 0.005, // Offset so the card doesn't cover the pin
      longitude: feature.geometry.coordinates[0],
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    }, 600);
  };

  // ---------------------------------------------------------------------------
  // "Near Me" handler
  // ---------------------------------------------------------------------------
  const handleNearMePress = useCallback(async () => {
    if (isNearMeActive) {
      setIsNearMeActive(false);
      setNearMeBounds(null);
      setSelectedCategory("all");
      return;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const { latitude, longitude } = loc.coords;

    const newBounds = {
      minLng: longitude - NEAR_ME_RADIUS_DEG,
      minLat: latitude - NEAR_ME_RADIUS_DEG,
      maxLng: longitude + NEAR_ME_RADIUS_DEG,
      maxLat: latitude + NEAR_ME_RADIUS_DEG,
      zoom: 14,
    };

    setNearMeBounds(newBounds);
    setIsNearMeActive(true);
    setSelectedCategory("near_me");

    mapRef.current?.animateToRegion(
      {
        latitude,
        longitude,
        latitudeDelta: NEAR_ME_RADIUS_DEG * 2,
        longitudeDelta: NEAR_ME_RADIUS_DEG * 2,
      },
      800,
    );
  }, [isNearMeActive]);

  // ---------------------------------------------------------------------------
  // Category selection
  // ---------------------------------------------------------------------------
  const handleSelectCategory = useCallback((id: string) => {
    if (id !== "near_me") {
      setIsNearMeActive(false);
      setNearMeBounds(null);
    }
    setSelectedCategory(id);
  }, []);

  // ---------------------------------------------------------------------------
  // Filtered features
  // ---------------------------------------------------------------------------
  const filteredFeatures = useMemo(() => {
    if (!geojson?.features) return [];
    return geojson.features.filter((feature: any) => {
      const name: string = feature.properties?.name ?? "";
      const type: string = feature.properties?.facility_type ?? "";
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" ||
        selectedCategory === "near_me" ||
        type.toLowerCase().includes(selectedCategory.toLowerCase());
      return matchesSearch && matchesCategory;
    });
  }, [geojson?.features, searchQuery, selectedCategory]);

  // Show toast when category or search changes
  useEffect(() => {
    if (!geojson?.features) return;
    if (selectedCategory === "all") return; // skip "All" — no need to toast

    const catLabel =
      CATEGORIES.find((c) => c.id === selectedCategory)?.name ?? "Facilities";
    const count = filteredFeatures.length;
    const noun = selectedCategory === "near_me" ? "Nearby Facilities" : catLabel;
    showToast(count === 0 ? `0 ${noun} Found` : `${count} ${noun === "Near Me" ? "Facilities" : noun} Found`);
  // Only fire when filteredFeatures length or selectedCategory changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredFeatures.length, selectedCategory]);

  // ---------------------------------------------------------------------------
  // Markers — always visible regardless of zoom
  // ---------------------------------------------------------------------------
  const renderedMarkers = useMemo(() => {
    return filteredFeatures.map((feature: any) => {
      const facilityType: string = feature.properties?.facility_type ?? "";
      const meta = getCategoryMeta(facilityType);
      const id: string = feature.properties?.id ?? "";

      return (
        <CustomMarker
          key={id || `${feature.geometry.coordinates[0]}-${feature.geometry.coordinates[1]}`}
          feature={feature}
          meta={meta}
          onPress={handleMarkerPress}
        />
      );
    });
  }, [filteredFeatures]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    // flex:1 fills only the space the parent (Map.tsx) allocates — i.e. the
    // area between the status bar and the tab bar. The previous fixed `height`
    // from useWindowDimensions() extended behind the tab bar, so the floating
    // card at bottom:40 was clipped under it.
    <View style={{ flex: 1, width }} className="bg-slate-100">
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        rotateEnabled={false}
        pitchEnabled={false}
        customMapStyle={mapOptions.styles}
        onPress={() => setSelectedFacility(null)}
      >
        {renderedMarkers}
      </MapView>

      {/* Header UI */}
      <View className="absolute top-3 left-0 right-0">
        {/* Updating Map indicator — above search */}
        <View style={{ alignItems: "center", marginBottom: 6, minHeight: 32 }}>
          {isFetching && (
            <Animated.View
              entering={FadeIn.duration(300)}
              exiting={FadeOut.duration(300)}
              style={{
                backgroundColor: "rgba(255,255,255,0.95)",
                paddingHorizontal: 16,
                paddingVertical: 7,
                borderRadius: 20,
                flexDirection: "row",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.12,
                shadowRadius: 6,
                elevation: 4,
                borderWidth: 1,
                borderColor: "#d1fae5",
              }}
            >
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#10b981", marginRight: 8 }} />
              <Text style={{ fontSize: 10, fontWeight: "800", color: "#065f46", textTransform: "uppercase", letterSpacing: 1 }}>
                Updating Map...
              </Text>
            </Animated.View>
          )}
        </View>

        {/* Search */}
        <View className="px-6 mb-2">
          <CustomInput
            placeholder="Find pharmacies, hospitals..."
            icon="search"
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerClassName="shadow-lg"
            className="bg-white border-gray-200 h-14 rounded-2xl"
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>

        {/* Filter Chips */}
        <MapFilters
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          onNearMePress={handleNearMePress}
        />

        {/* Toast — below filters */}
        <View style={{ alignItems: "center", marginTop: 8 }}>
          <MapToast message={toastMessage} visible={toastVisible} />
        </View>
      </View>

      {/* FLOATING DETAIL CARD
           zIndex: 100 + elevation: 20 ensures this renders above the absolute
           header overlay (top-3) on both iOS and Android. */}
      {selectedFacility && (
        <Animated.View
          entering={FadeInDown.springify()}
          exiting={FadeOutDown.duration(200)}
          style={styles.floatingCard}
        >
          <View style={styles.cardContent}>
            {/* Close button */}
            <TouchableOpacity
              onPress={() => setSelectedFacility(null)}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={18} color="#64748b" />
            </TouchableOpacity>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Image
                source={
                  selectedFacility.properties?.featured_image_url
                    ? { uri: selectedFacility.properties.featured_image_url }
                    : require("@/assets/images/logo.png")
                }
                style={styles.cardImage}
                resizeMode="cover"
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardName} numberOfLines={1}>
                  {selectedFacility.properties.name}
                </Text>
                <Text style={styles.cardType}>
                  {selectedFacility.properties.facility_type?.replace(/_/g, " ") ?? ""}
                </Text>
                {(selectedFacility.properties?.district || selectedFacility.properties?.post_code) && (
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
                    <Ionicons name="location-outline" size={11} color="#94a3b8" />
                    <Text style={styles.cardAddress}>
                      {[selectedFacility.properties?.district, selectedFacility.properties?.post_code]
                        .filter(Boolean)
                        .join(" · ")}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
              <TouchableOpacity
                onPress={() => router.push(`/Facility/${selectedFacility.properties.id}` as any)}
                style={[styles.actionBtn, { backgroundColor: "#10b981" }]}
              >
                <Ionicons name="eye-outline" size={18} color="white" />
                <Text style={styles.actionBtnText}>Details</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDirections(selectedFacility)}
                style={[styles.actionBtn, { backgroundColor: "#3b82f6" }]}
              >
                <Ionicons name="navigate-outline" size={18} color="white" />
                <Text style={styles.actionBtnText}>Directions</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

export default React.memo(MapContainer);


const styles = StyleSheet.create({
  markerContainer: {
    width: 38, height: 38, borderRadius: 19,
    justifyContent: "center", alignItems: "center",
    borderWidth: 2.5, borderColor: "white", elevation: 5,
  },
  markerStem: {
    width: 0, height: 0,
    borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 7,
    borderLeftColor: "transparent", borderRightColor: "transparent",
    marginTop: -1,
  },
  floatingCard: {
    position: 'absolute',
    bottom: 20,  // relative to the container bottom edge, which is now the tab bar top
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    // elevation must be paired with zIndex on Android — elevation alone does
    // not guarantee the view renders above other absolute-positioned siblings
    // that appear earlier in the JSX tree (e.g. the top header overlay).
    elevation: 20,
    zIndex: 100,
  },
  cardContent: {
    padding: 16, // This was the missing property
  },
  cardImage: { 
    width: 65, 
    height: 65, 
    borderRadius: 14,
    backgroundColor: '#f8fafc' // Placeholder color while loading
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  cardName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
  },
  cardType: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'capitalize',
  },
  cardAddress: {
    fontSize: 11,
    color: '#94a3b8',
    marginLeft: 3,
  },
  actionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  actionBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  }
});