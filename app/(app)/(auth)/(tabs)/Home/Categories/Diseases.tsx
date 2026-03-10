import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
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
  const { setSearchData, setError, setLoading } = useSearchStore();

  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryStack, setCategoryStack] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<ConditionFilter>({});

  const { data: allCategories, isLoading: loadingCats } = useConditionCategories();
  const { data: conditions, isLoading: loadingConditions } = useConditions(activeFilter);
  const { data: suggestions } = useConditions({ searchTerm: debouncedSearch });

  const selectedParent = categoryStack[categoryStack.length - 1] || null;
  const isLeafNode = selectedParent && (!selectedParent.children || selectedParent.children.length === 0);
  const showConditionList = !!(activeFilter.letter || activeFilter.searchTerm || isLeafNode);


  const dynamicTitle = useMemo(() => {
  let rawTitle = "Categories";
  if (activeFilter.letter) {
    rawTitle = `Starts with "${activeFilter.letter}"`;
  } else if (selectedParent?.name) {
    rawTitle = selectedParent.name;
  }

  // Calculate limit: roughly 1 character per 10-12 pixels of available space
  // Subtracting ~120px for the buttons and padding
  const charLimit = Math.floor((width - 140) / 10); 
  
  return rawTitle.length > charLimit 
    ? rawTitle.slice(0, charLimit).trim() + "..." 
    : rawTitle;
}, [activeFilter.letter, selectedParent, width]);

  // Layout Constants
  const alphabetItemWidth = width > 600 ? "11%" : "18%";
  const commonDiseaseWidth = width > 600 ? "41%" : "48%";

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText), 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const handleConditionPress = (condition: any) => {
    // We explicitly call router here in the main context
    router.push({
      pathname: "/(app)/(auth)/(modal)/DiseaseDetails",
      params: { id: condition.id },
    });
  };

  const handleLetterPress = (letter: string) => {
    setCategoryStack([]); 
    setActiveFilter({ letter });
    setSearchText("");
  };

  const handleGoBackCategory = () => {
    const newStack = [...categoryStack];
    newStack.pop();
    setCategoryStack(newStack);
    setActiveFilter({});
  };

  const handleSearchAction = () => {
    if (!searchText) return;
    setLoading(true);
    searchAllTables(searchText)
      .then((data: any[]) => {
        const flattened = data.flatMap(r => r.results.map((i: any) => ({ ...i, table: r.table })));
        setSearchData(searchText, flattened);
        router.push("/(app)/(auth)/(modal)/SearchResultModal");
      })
      .catch(setError)
      .finally(() => setLoading(false));
  };

  return (
    <View 
      className={`flex-1 bg-white px-4`}
      style={{ paddingTop: insets.top + 20 }}
    >
      {/* Header Section */}
      <View className="flex-row items-center mb-4">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-slate-800 ml-2">Disease Library</Text>
      </View>

      {/* Search Input - Kept outside scroll to avoid native layer issues */}
      <View className="z-50 mb-4">
        <SearchBar
          placeholder="Search for a condition..."
          showBtn
          value={searchText}
          onChangeText={setSearchText}
          handleSearch={handleSearchAction}
        />
        
        {/* Render suggestions directly in the main view tree */}
        {searchText.length > 1 && suggestions && suggestions.length > 0 && (
          <View className="absolute top-[60] left-0 right-0 bg-slate-900 rounded-2xl shadow-2xl z-[60] overflow-hidden border border-slate-700">
            {suggestions.slice(0, 5).map((item) => (
              <TouchableOpacity
                key={item.id}
                className="p-4 border-b border-slate-800 flex-row justify-between items-center"
                onPress={() => handleConditionPress(item)}
              >
                <Text className="text-white font-bold text-base">{item.name || item.condition_name}</Text>
                <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="always" // Essential for click handling with search open
      >
 {!activeFilter.letter && !selectedParent && (
    <>
      <Text className="text-sm font-medium text-slate-500 mb-6 leading-5">
         Find easy-to-understand Information (Symptoms, causes and treatments) for specific health conditions.
      </Text>

      <View className="mt-4 mb-8">
        <Text className="text-base font-semibold text-slate-800 uppercase tracking-widest mb-4">
          Browse by Alphabet
        </Text>
        <View className="flex-row flex-wrap justify-between">
          {alphabets.map((item) => (
            <TouchableOpacity
              key={item}
              style={{ width: alphabetItemWidth }}
              className="aspect-square bg-white items-center rounded-md justify-center mb-3 shadow-sm border border-slate-100"
              onPress={() => handleLetterPress(item)}
            >
              <Text className="text-lg font-medium text-slate-700">{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </>
  )}

        {/* Dynamic Title and Controls */}
{/* Dynamic Title and Controls */}
<View className={`flex-row items-center justify-between mb-4 gap-2 ${!activeFilter.letter && !selectedParent ? "-mt-20" : ""}`}>
  <View className="flex-1">
    <Text 
      numberOfLines={1} 
      className="text-lg font-black text-slate-800"
    >
      {dynamicTitle}
    </Text>
  </View>

  <View className="flex-row items-center flex-shrink-0">
    {categoryStack.length > 0 && (
      <TouchableOpacity 
        onPress={handleGoBackCategory} 
        className="bg-slate-100 px-3 py-1.5 rounded-full mr-2 border border-slate-200"
      >
        <Text className="text-slate-600 font-bold text-[10px] uppercase">Back</Text>
      </TouchableOpacity>
    )}
    {(activeFilter.letter || categoryStack.length > 0) && (
      <TouchableOpacity 
        onPress={() => { setCategoryStack([]); setActiveFilter({}); }}
        className="py-1.5 px-1"
      >
        <Text className="text-emerald-600 font-black text-[10px] uppercase tracking-tighter">Reset</Text>
      </TouchableOpacity>
    )}
  </View>
</View>

        {/* Main Content Areas */}
        {loadingCats || loadingConditions ? (
          <View className="py-20 items-center">
            <ActivityIndicator color={themeColors.primary} size="large" />
          </View>
        ) : showConditionList ? (
          <ConditionList conditions={conditions} onSelect={handleConditionPress} />
        ) : (
          <CategoryGrid 
            data={selectedParent ? (selectedParent.children || []) : (allCategories || [])}
            onSelect={(cat: any) => {
              setCategoryStack([...categoryStack, cat]);
              if (!cat.children?.length) setActiveFilter({ categoryId: cat.id });
            }}
            itemWidth={commonDiseaseWidth}
            isNested={!!selectedParent}
          />
        )}

        
      </ScrollView>
    </View>
  );
};

/* --- Sub-Components to keep the tree clean and logic separate --- */

const ConditionList = ({ conditions, onSelect }: any) => (
  <View className="bg-slate-50 rounded-[32px] p-2 border border-slate-100">
    {conditions?.length === 0 ? (
      <Text className="p-10 text-center text-slate-400 font-bold italic">No results found.</Text>
    ) : (
      conditions.map((item: any) => (
        <TouchableOpacity 
          key={item.id} 
          onPress={() => onSelect(item)}
          className="bg-white p-5 rounded-3xl mb-2 flex-row justify-between items-center shadow-sm border border-slate-100"
        >
          <View className="flex-1 pr-4">
            <Text className="text-lg font-black text-slate-800 leading-tight">{item.name || item.condition_name}</Text>
            <Text numberOfLines={2} className="text-slate-500 text-xs mt-1 font-bold">{item.description}</Text>
          </View>
          <View className="bg-emerald-50 p-2 rounded-full">
            <MaterialIcons name="chevron-right" size={20} color={themeColors.primary} />
          </View>
        </TouchableOpacity>
      ))
    )}
  </View>
);

const CategoryGrid = ({ data, onSelect, itemWidth, isNested }: any) => (
  <View className="flex-row flex-wrap justify-between">
    {data.map((item: any) => (
      <TouchableOpacity
        key={item.id}
        style={{ width: itemWidth }}
        className={`bg-white mb-4 p-5 shadow-sm border-t-4 ${isNested ? 'border-blue-400' : 'border-emerald-500'}`}
        onPress={() => onSelect(item)}
      >
        <Text className="text-base font-black text-slate-800 mb-1">{item.name}</Text>
        <Text className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter" numberOfLines={2}>
          {item.description || "View conditions"}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

export default Diseases;