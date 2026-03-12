import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { themeColors } from "@/src/theme/colors";
import SearchBar from "@/src/components/screens/Home/SearchBar";
import {
  useHealthyLivingCategories,
  useHealthyLivingTopics,
} from "@/hooks/use-healthy-living";
import useSearchStore from "@/store/use-searchStore";
import { searchAllTables } from "@/src/services/searchAllTables";
import { Image } from "react-native";

// ─── Workout Banner ──────────────────────────────────────────────────────────
const WorkoutBanner = () => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push("/(app)/(auth)/(tabs)/Home/Workouts")}
      // 1. "w-full" makes it span the screen width
      // 2. "aspect-[2.5/1]" forces a consistent proportion regardless of width
      className="mb-6 w-full aspect-[2.5/1] overflow-hidden rounded-3xl border-2 border-gray-500"
    >
      <Image
        source={require("@/assets/pharmacy2.jpg")}
        // "cover" ensures the image fills the space without distortion
        style={{ width: "100%", height: "100%" }}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────
const HealthyLiving = () => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { setSearchData, setError: setStoreError, setLoading: setStoreLoading } =
    useSearchStore();

  const cardWidth = width > 600 ? "31%" : "48%";

  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: categories, isLoading: loadingCats } = useHealthyLivingCategories();

  // Topics shown when a category is selected
  const { data: categoryTopics, isLoading: loadingCatTopics } =
    useHealthyLivingTopics(
      selectedCategory ? { category: selectedCategory } : {}
    );

  // Suggestions for search dropdown
  const { data: suggestions, isLoading: loadingSuggestions } =
    useHealthyLivingTopics(debouncedSearch ? { searchTerm: debouncedSearch } : {});

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchText), 500);
    return () => clearTimeout(t);
  }, [searchText]);

  const handleSearch = () => {
    if (!searchText) return;
    setStoreLoading(true);
    searchAllTables(searchText)
      .then((data: any[]) => {
        const flat = data.flatMap((r: any) =>
          r.results.map((item: any) => ({
            ...item,
            table: r.table,
            name:
              item.name ||
              item.condition_name ||
              item.symptom_name ||
              item.topic_name ||
              item.facility_name,
          }))
        );
        setSearchData(searchText, flat);
        router.push("/(app)/(auth)/(modal)/SearchResultModal");
      })
      .catch((err: any) => {
        setStoreError(err);
        console.error(err);
      })
      .finally(() => setStoreLoading(false));
  };

  const isLoading = loadingCats || (!!selectedCategory && loadingCatTopics);

  return (
    <View
      className={`flex-1 ${themeColors.lightGray} px-4`}
      style={{ paddingTop: insets.top + 30 }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Workout Banner */}
        <WorkoutBanner />

        {/* Description */}
        <Text className="text-base font-semibold text-slate-700 mb-4 leading-6">
          Advice and tools to help you look after yourself. Includes mental wellbeing,
          eating well, contraception, immunisation and help to stop smoking.
        </Text>

        {/* Search */}
        <View className="relative z-50 mb-6">
          <SearchBar
            placeholder="Search for a health topics"
            showBtn
            value={searchText}
            onChangeText={setSearchText}
            handleSearch={handleSearch}
          />

          {suggestions && suggestions.length > 0 && searchText.length > 0 && (
            <View className="absolute top-[60] left-0 right-0 bg-slate-800 overflow-hidden shadow-xl z-50">
              <FlatList
                data={suggestions}
                keyExtractor={(item) => item?.id?.toString()}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="p-4 border-b border-slate-700"
                    onPress={() => {
                      setSearchText("");
                      router.push({
                        pathname: "/(app)/(auth)/(modal)/HealthyLivingDetails",
                        params: { id: item?.id },
                      });
                    }}
                  >
                    <Text className="text-white text-base font-medium">
                      {item?.topic_name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>

        {/* Section header */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-xl font-bold text-slate-800">
            {selectedCategory ? selectedCategory : "Healthy Living"}
          </Text>
          {selectedCategory && (
            <TouchableOpacity
              onPress={() => setSelectedCategory(null)}
              className="bg-slate-200 px-3 py-1 rounded-lg"
            >
              <Text className="text-slate-700 font-bold text-xs uppercase">← Back</Text>
            </TouchableOpacity>
          )}
        </View>

        {isLoading ? (
          <View className="py-10 items-center">
            <ActivityIndicator color={themeColors.primary} />
            <Text className="mt-2 text-slate-400">Loading…</Text>
          </View>
        ) : selectedCategory ? (
          // ── Topic list ──────────────────────────────────────────────────
          <View className="bg-white rounded-2xl p-2 shadow-sm border border-slate-100 mb-8">
            {!categoryTopics || categoryTopics.length === 0 ? (
              <View className="p-8 items-center">
                <Text className="text-slate-400 italic">No topics found.</Text>
              </View>
            ) : (
              categoryTopics.map((item: any) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() =>
                    router.push({
                      pathname: "/(app)/(auth)/(modal)/HealthyLivingDetails",
                      params: { id: item.id },
                    })
                  }
                  className="p-4 border-b border-slate-100 flex-row justify-between items-center"
                >
                  <View className="flex-1 pr-4">
                    <Text className="text-lg font-bold text-slate-800">
                      {item.topic_name}
                    </Text>
                    {item.about && (
                      <Text numberOfLines={1} className="text-slate-500 text-sm mt-1">
                        {item.about?.replace(/<[^>]*>/g, "")}
                      </Text>
                    )}
                  </View>
                  <MaterialIcons
                    name="chevron-right"
                    size={20}
                    color={themeColors.primary}
                  />
                </TouchableOpacity>
              ))
            )}
          </View>
        ) : (
          // ── Category cards ───────────────────────────────────────────────
          <View className="flex-row flex-wrap justify-between mb-10">
            {loadingCats ? null : (categories || []).map((cat: string) => (
              <TouchableOpacity
                key={cat}
                style={{ width: cardWidth }}
                className="bg-white mb-4 p-4 shadow-sm border-t-4 border-emerald-500 rounded-b-xl"
                onPress={() => setSelectedCategory(cat)}
              >
                <View className="flex-row items-start justify-between">
                  <Text className="text-base font-bold text-slate-800 flex-1 mr-1">
                    {cat}
                  </Text>
                  <MaterialIcons
                    name="arrow-forward-ios"
                    size={14}
                    color={themeColors.darkGray}
                    style={{ marginTop: 3 }}
                  />
                </View>
                <Text className="mt-2 text-sm text-slate-500 leading-5" numberOfLines={3}>
                  Browse topics in this category.
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default HealthyLiving;
