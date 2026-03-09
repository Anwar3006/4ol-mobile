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
import { ConditionFilter, useConditions } from "@/hooks/use-condition";
import { useConditionCategories } from "@/hooks/use-condition-category";
import useUserStore from "@/store/use-userstore";
import useSearchStore from "@/store/use-searchStore";
import { searchAllTables } from "@/src/services/searchAllTables";

const Diseases = () => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { user: userData } = useUserStore();
  const { setSearchData, setError: setStoreError, setLoading: setStoreLoading } = useSearchStore();

  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // 1. Navigation Stack for nested categories
  const [categoryStack, setCategoryStack] = useState<any[]>([]);
  const selectedParent = categoryStack[categoryStack.length - 1] || null;

  // 2. Active Filters for useConditions hook
  const [activeFilter, setActiveFilter] = useState<ConditionFilter>({});

  const { data: allCategories, isLoading: loadingCats } = useConditionCategories();
  const { data: conditions, isLoading: loadingConditions } = useConditions(activeFilter);
  
  // 3. Suggestions for the search dropdown
  const { data: suggestions } = useConditions({ searchTerm: debouncedSearch });

  // Responsive logic
  const alphabetItemWidth = width > 600 ? "11%" : "18%";
  const commonDiseaseWidth = width > 600 ? "31%" : "48%";

  // Debounce search text for suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const handleLetterPress = (letter: string) => {
    setCategoryStack([]); 
    setActiveFilter({ letter });
    setSearchText("");
  };

  const handleCategoryPress = (cat: any) => {
    setCategoryStack([...categoryStack, cat]);
    if (!cat.children || cat.children.length === 0) {
      setActiveFilter({ categoryId: cat.id });
    } else {
      setActiveFilter({});
    }
    setSearchText("");
  };

  const handleGoBackCategory = () => {
    if (categoryStack.length > 0) {
      const newStack = [...categoryStack];
      newStack.pop();
      setCategoryStack(newStack);
      setActiveFilter({});
    }
  };

  const handleSearch = () => {
    if (!searchText) return;
    
    setStoreLoading(true);
    searchAllTables(searchText)
      .then((data: any[]) => {
        // Flatten results as expected by SearchResultModal
        const flattenedResults = data.flatMap((r: any) => 
          r.results.map((item: any) => ({ 
            ...item, 
            table: r.table,
            // Ensure consistent name field for rendering
            name: item.name || item.condition_name || item.symptom_name || item.topic_name || item.facility_name 
          }))
        );
        setSearchData(searchText, flattenedResults);
        router.push("/(app)/(auth)/(modal)/SearchResultModal");
      })
      .catch((error: any) => {
        setStoreError(error);
        console.error(error);
      })
      .finally(() => setStoreLoading(false));
  };

  const isLeafNode = selectedParent && (!selectedParent.children || selectedParent.children.length === 0);
  const showConditionList = !!(activeFilter.letter || activeFilter.searchTerm || isLeafNode);

  const displayCategories = useMemo(() => {
    if (!selectedParent) return allCategories || [];
    return selectedParent.children || [];
  }, [selectedParent, allCategories]);

  const isLoading = loadingCats || loadingConditions;

  return (
    <View 
      className={`flex-1 ${themeColors.lightGray} px-4`}
      style={{ paddingTop: insets.top + 30 }} // Use safeAreaInsets for top padding
    >
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        <Text className="text-lg font-bold text-slate-700 mb-4 leading-6">
          Find easy-to-understand Information (Symptoms, causes and treatments) for specific health conditions and illnesses.
        </Text>

        <View className="relative z-50 mb-6">
          <SearchBar
            placeholder={"Search for a condition, e.g. Diabetes"}
            showBtn
            value={searchText}
            onChangeText={setSearchText}
            handleSearch={handleSearch}
          />

          {suggestions && suggestions.length > 0 && (
            <View className="absolute top-[60] left-0 right-0 bg-slate-800 overflow-hidden shadow-xl z-50">
              <FlatList
                data={suggestions}
                keyExtractor={(item) => item?.id?.toString()}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="p-4 border-b border-slate-700"
                    onPress={() => {
                      router.push({
                        pathname: "/(app)/(auth)/(modal)/DiseaseDetails",
                        params: { id: item?.id },
                      });
                    }}
                  >
                    <Text className="text-white text-base font-medium">
                      {item?.condition_name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>

        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-slate-800">
              {activeFilter.letter
                ? `Results for "${activeFilter.letter}"`
                : selectedParent
                ? `${selectedParent.name}`
                : "Browse by Alphabet"}
            </Text>

            <View className="flex-row items-center">
              {categoryStack.length > 0 && (
                <TouchableOpacity onPress={handleGoBackCategory} className="bg-slate-200 px-3 py-1 rounded-lg mr-2">
                  <Text className="text-slate-700 font-bold text-xs uppercase">
                    ← Back
                  </Text>
                </TouchableOpacity>
              )}
              {(activeFilter.letter || categoryStack.length > 0) && (
                <TouchableOpacity
                  onPress={() => {
                    setCategoryStack([]);
                    setActiveFilter({});
                    setSearchText("");
                  }}
                >
                  <Text className="text-emerald-600 font-bold text-xs uppercase">
                    Clear
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {!showConditionList && !selectedParent && (
            <View className="flex-row flex-wrap justify-between mb-2">
              {alphabets.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={{ width: alphabetItemWidth }}
                  className="aspect-square bg-white items-center rounded-lg justify-center mb-2 shadow-sm border border-slate-200"
                  onPress={() => handleLetterPress(item)}
                >
                  <Text className="text-xl font-semibold text-slate-700">{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {isLoading ? (
            <View className="py-10 items-center">
              <ActivityIndicator color={themeColors.primary} />
              <Text className="mt-2 text-slate-400">Loading...</Text>
            </View>
          ) : showConditionList ? (
            <View className="bg-white rounded-2xl p-2 shadow-sm border border-slate-100 mb-8">
              {conditions?.length === 0 ? (
                <View className="p-8 items-center">
                  <Text className="text-slate-400 italic">No conditions found.</Text>
                </View>
              ) : (
                conditions?.map((item: any) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => {
                       router.push({
                        pathname: "/(app)/(auth)/(modal)/DiseaseDetails",
                        params: { id: item?.id },
                      });
                    }}
                    className="p-4 border-b border-slate-100 flex-row justify-between items-center"
                  >
                    <View className="flex-1 pr-4">
                      <Text className="text-lg font-bold text-slate-800">{item.name}</Text>
                      {item.description && (
                        <Text numberOfLines={1} className="text-slate-500 text-sm mt-1">{item.description}</Text>
                      )}
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color={themeColors.primary} />
                  </TouchableOpacity>
                ))
              )}
            </View>
          ) : (
            <>
              {selectedParent && (
                 <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">
                    Categories
                 </Text>
              )}
              <View className="flex-row flex-wrap justify-between mb-10">
                {displayCategories.map((item: any) => (
                  <TouchableOpacity
                    key={item.id}
                    style={{ width: commonDiseaseWidth }}
                    className="bg-white mb-4 p-4 shadow-sm border-t-4 border-emerald-500 rounded-b-xl"
                    onPress={() => handleCategoryPress(item)}
                  >
                    <View className="flex-row items-start justify-between">
                      <Text className="text-lg font-bold text-slate-800 flex-1 mr-1">
                        {item.name}
                      </Text>
                      <MaterialIcons
                        name="arrow-forward-ios"
                        size={14}
                        color={themeColors.darkGray}
                        style={{ marginTop: 4 }}
                      />
                    </View>
                    <Text className="mt-2 text-sm text-slate-500 leading-5" numberOfLines={3}>
                      {item.description || "Browse conditions in this category."}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default Diseases;