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
const MapContainer = () => {
  const { width, height } = useWindowDimensions();
  const mapRef = useRef<MapView>(null);
  const router = useRouter();

  // Ref to suppress the MapView onPress that fires immediately after a Marker press
  const markerJustTapped = useRef(false);

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
        <Marker
          key={id || `${feature.geometry.coordinates[0]}-${feature.geometry.coordinates[1]}`}
          coordinate={{
            latitude: feature.geometry.coordinates[1],
            longitude: feature.geometry.coordinates[0],
          }}
          tracksViewChanges={false}
          flat={false}
          onPress={(e) => {
             // markerJustTapped is still used to suppress general MapView.onPress
             markerJustTapped.current = true;
          }}
        >
          {/* Callout renders the rich popup bubble directly above the marker */}
          <Callout 
            tooltip 
            onPress={() => id && router.push(`/Facility/${id}` as any)}
          >
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 16,
                padding: 12,
                width: 240,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 10,
                elevation: 8,
                borderWidth: 1,
                borderColor: "#f1f5f9",
              }}
            >
              {/* Image Preview or Icon */}
              {feature.properties?.featured_image_url ? (
                <Image
                  source={{ uri: feature.properties.featured_image_url }}
                  style={{ width: "100%", height: 80, borderRadius: 10, marginBottom: 8 }}
                  resizeMode="cover"
                />
              ) : (
                <View 
                  style={{ 
                    width: "100%", 
                    height: 40, 
                    backgroundColor: meta.color + "1a", 
                    borderRadius: 8, 
                    justifyContent: "center", 
                    alignItems: "center",
                    marginBottom: 8
                  }}
                >
                  <CategoryIcon icon={meta.icon} library={(meta as any).library ?? "MaterialIcons"} size={20} color={meta.color} />
                </View>
              )}

              {/* Type badge */}
              <View
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: meta.color + "1a",
                  borderRadius: 6,
                  paddingHorizontal: 7,
                  paddingVertical: 2,
                  marginBottom: 5,
                }}
              >
                <Text style={{ fontSize: 9, fontWeight: "700", color: meta.color, textTransform: "capitalize" }}>
                  {feature.properties?.facility_type?.replace(/_/g, " ") ?? ""}
                </Text>
              </View>

              {/* Name */}
              <Text 
                style={{ fontSize: 14, fontWeight: "800", color: "#0f172a", marginBottom: 3 }} 
                numberOfLines={1}
              >
                {feature.properties?.name ?? "Unknown"}
              </Text>

              {/* Address */}
              {(feature.properties?.district || feature.properties?.post_code) && (
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                  <Ionicons name="location-outline" size={11} color="#94a3b8" />
                  <Text style={{ fontSize: 11, color: "#64748b", marginLeft: 3 }}>
                    {[feature.properties?.district, feature.properties?.post_code].filter(Boolean).join(" · ")}
                  </Text>
                </View>
              )}

              {/* Tap hint */}
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 8 }}>
                 <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                   <Ionicons name="eye-outline" size={12} color="#10b981" />
                   <Text style={{ fontSize: 11, color: "#10b981", fontWeight: "700" }}>Details</Text>
                 </View>
                 <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                   <Ionicons name="navigate-outline" size={12} color="#3b82f6" />
                   <Text style={{ fontSize: 11, color: "#3b82f6", fontWeight: "700" }}>Directions</Text>
                 </View>
              </View>
            </View>

            {/* Callout arrow */}
            <View
              style={{
                alignSelf: "center",
                width: 0,
                height: 0,
                borderLeftWidth: 10,
                borderRightWidth: 10,
                borderTopWidth: 12,
                borderLeftColor: "transparent",
                borderRightColor: "transparent",
                borderTopColor: "white",
                marginTop: -1,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
              }}
            />
          </Callout>
          <View style={{ alignItems: "center" }}>
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: meta.color,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 2.5,
                borderColor: "white",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
              }}
            >
              <CategoryIcon icon={meta.icon} library={(meta as any).library ?? "MaterialIcons"} size={17} color="white" />
            </View>
            {/* Pin stem */}
            <View
              style={{
                width: 0,
                height: 0,
                borderLeftWidth: 5,
                borderRightWidth: 5,
                borderTopWidth: 7,
                borderLeftColor: "transparent",
                borderRightColor: "transparent",
                borderTopColor: meta.color,
                marginTop: -1,
              }}
            />
          </View>
        </Marker>
      );
    });
  }, [filteredFeatures]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <View style={{ width, height }} className="bg-slate-100">
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
        onPress={() => {
          // Only dismiss the callout if the tap was NOT on a marker
          if (markerJustTapped.current) {
            markerJustTapped.current = false;
            return;
          }
        }}
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

      {/* Facility Popup removed */}
    </View>
  );
};

export default React.memo(MapContainer);
