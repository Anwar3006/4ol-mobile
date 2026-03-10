import React, { useEffect, useState, useMemo } from "react";
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
import { MaterialIcons } from "@expo/vector-icons";
import { themeColors } from "@/src/theme/colors";
import { alphabets } from "@/src/constants/diseases";
import SearchBar from "@/src/components/screens/Home/SearchBar";
import { SymptomFilter, useSymptoms } from "@/hooks/use-symptom";
import { useConditionCategories } from "@/hooks/use-condition-category";
import useSearchStore from "@/store/use-searchStore";
import { searchAllTables } from "@/src/services/searchAllTables";

const Symptoms = () => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { setSearchData, setError: setStoreError, setLoading: setStoreLoading } =
    useSearchStore();

  const alphabetItemWidth = width > 600 ? "11%" : "18%";
  const cardWidth = width > 600 ? "31%" : "48%";

  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Category navigation stack — mirrors Diseases.tsx exactly
  const [categoryStack, setCategoryStack] = useState<any[]>([]);
  const selectedParent = categoryStack[categoryStack.length - 1] ?? null;

  const [activeFilter, setActiveFilter] = useState<SymptomFilter>({});

  // Shared disease categories (same tree as Diseases screen)
  const { data: allCategories, isLoading: loadingCats } = useConditionCategories();

  // Symptom list for current filter
  const { data: symptoms, isLoading: loadingSymptoms } = useSymptoms(activeFilter);

  // Search-bar dropdown suggestions
  const { data: suggestions } = useSymptoms(
    debouncedSearch ? { searchTerm: debouncedSearch } : {}
  );

  // Debounce search text
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchText), 500);
    return () => clearTimeout(t);
  }, [searchText]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleLetterPress = (letter: string) => {
    setCategoryStack([]);
    setActiveFilter({ letter });
    setSearchText("");
  };

  const handleCategoryPress = (cat: any) => {
    const newStack = [...categoryStack, cat];
    setCategoryStack(newStack);

    if (!cat.children || cat.children.length === 0) {
      // Leaf node → fetch symptoms for this category
      setActiveFilter({ categoryId: cat.id });
    } else {
      // Non-leaf → just drill in, clear any filter
      setActiveFilter({});
    }
    setSearchText("");
  };

  const handleGoBack = () => {
    const newStack = [...categoryStack];
    newStack.pop();
    setCategoryStack(newStack);
    setActiveFilter({});
  };

  const handleClear = () => {
    setCategoryStack([]);
    setActiveFilter({});
    setSearchText("");
  };

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

  // ── Derived state ──────────────────────────────────────────────────────────
  const isLeafNode =
    selectedParent &&
    (!selectedParent.children || selectedParent.children.length === 0);

  const showSymptomList = !!(
    activeFilter.letter ||
    activeFilter.searchTerm ||
    isLeafNode
  );

  const displayCategories = useMemo(() => {
    if (!selectedParent) return allCategories ?? [];
    return selectedParent.children ?? [];
  }, [selectedParent, allCategories]);

  const isLoading = loadingCats || loadingSymptoms;

  return (
    <View
      className={`flex-1 ${themeColors.lightGray} px-4`}
      style={{ paddingTop: insets.top + 30 }}
    >
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Description */}
        <Text className="text-lg font-bold text-slate-700 mb-4 leading-6">
          Find easy-to-understand information about symptoms — what causes them,
          when to seek help, and how they may be treated.
        </Text>

        {/* Search bar + dropdown suggestions */}
        <View className="relative z-50 mb-6">
          <SearchBar
            placeholder="Search for a symptom, e.g. Headache"
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
                        pathname: "/(app)/(auth)/(modal)/SymptomDetails",
                        params: { id: item?.id },
                      });
                    }}
                  >
                    <Text className="text-white text-base font-medium">
                      {item?.symptom_name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>

        {/* Section header + back / clear controls */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-xl font-bold text-slate-800">
            {activeFilter.letter
              ? `Results for "${activeFilter.letter}"`
              : selectedParent
                ? selectedParent.name
                : "Browse by Category"}
          </Text>

          <View className="flex-row items-center">
            {categoryStack.length > 0 && (
              <TouchableOpacity
                onPress={handleGoBack}
                className="bg-slate-200 px-3 py-1 rounded-lg mr-2"
              >
                <Text className="text-slate-700 font-bold text-xs uppercase">
                  ← Back
                </Text>
              </TouchableOpacity>
            )}
            {(activeFilter.letter || categoryStack.length > 0) && (
              <TouchableOpacity onPress={handleClear}>
                <Text className="text-emerald-600 font-bold text-xs uppercase">
                  Clear
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Alphabet grid — only shown at root with no filter */}
        {!showSymptomList && !selectedParent && (
          <>
            {/* Category cards */}
            <View className="flex-row flex-wrap justify-between mb-6">
              {loadingCats ? (
                <ActivityIndicator color={themeColors.primary} />
              ) : (
                displayCategories.map((cat: any) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={{ width: cardWidth }}
                    className="bg-white mb-4 p-4 shadow-sm border-t-4 border-emerald-500 rounded-b-xl"
                    onPress={() => handleCategoryPress(cat)}
                  >
                    <View className="flex-row items-start justify-between">
                      <Text className="text-base font-bold text-slate-800 flex-1 mr-1">
                        {cat.name}
                      </Text>
                      <MaterialIcons
                        name="arrow-forward-ios"
                        size={14}
                        color={themeColors.darkGray}
                        style={{ marginTop: 3 }}
                      />
                    </View>
                    <Text
                      className="mt-2 text-sm text-slate-500 leading-5"
                      numberOfLines={3}
                    >
                      {cat.description || "Browse symptoms in this category."}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>

            {/* Alphabet browse section */}
            <Text className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">
              Or Browse by Letter
            </Text>
            <View className="flex-row flex-wrap justify-between mb-2">
              {alphabets.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={{ width: alphabetItemWidth }}
                  className="aspect-square bg-white items-center rounded-lg justify-center mb-2 shadow-sm border border-slate-200"
                  onPress={() => handleLetterPress(item)}
                >
                  <Text className="text-xl font-semibold text-slate-700">
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Sub-category cards when drilling down */}
        {!showSymptomList && selectedParent && (
          <View className="flex-row flex-wrap justify-between mb-6">
            {displayCategories.map((cat: any) => (
              <TouchableOpacity
                key={cat.id}
                style={{ width: cardWidth }}
                className="bg-white mb-4 p-4 shadow-sm border-t-4 border-emerald-500 rounded-b-xl"
                onPress={() => handleCategoryPress(cat)}
              >
                <View className="flex-row items-start justify-between">
                  <Text className="text-base font-bold text-slate-800 flex-1 mr-1">
                    {cat.name}
                  </Text>
                  <MaterialIcons
                    name="arrow-forward-ios"
                    size={14}
                    color={themeColors.darkGray}
                    style={{ marginTop: 3 }}
                  />
                </View>
                <Text
                  className="mt-2 text-sm text-slate-500 leading-5"
                  numberOfLines={3}
                >
                  {cat.description || "Browse symptoms in this category."}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Symptom results list */}
        {isLoading && showSymptomList ? (
          <View className="py-10 items-center">
            <ActivityIndicator color={themeColors.primary} />
            <Text className="mt-2 text-slate-400">Loading…</Text>
          </View>
        ) : showSymptomList ? (
          <View className="bg-white rounded-2xl p-2 shadow-sm border border-slate-100 mb-8">
            {!symptoms || symptoms.length === 0 ? (
              <View className="p-8 items-center">
                <Text className="text-slate-400 italic">No symptoms found.</Text>
              </View>
            ) : (
              symptoms.map((item: any) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() =>
                    router.push({
                      pathname: "/(app)/(auth)/(modal)/SymptomDetails",
                      params: { id: item.id },
                    })
                  }
                  className="p-4 border-b border-slate-100 flex-row justify-between items-center"
                >
                  <View className="flex-1 pr-4">
                    <Text className="text-lg font-bold text-slate-800">
                      {item.symptom_name || item.name}
                    </Text>
                    {item.about && (
                      <Text
                        numberOfLines={1}
                        className="text-slate-500 text-sm mt-1"
                      >
                        {item.about.replace(/<[^>]*>/g, "")}
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
        ) : null}
      </ScrollView>
    </View>
  );
};

export default Symptoms;
