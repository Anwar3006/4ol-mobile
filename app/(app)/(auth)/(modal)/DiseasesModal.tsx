import { ConditionFilter, useConditions } from "@/hooks/use-condition";
import { useConditionCategories } from "@/hooks/use-condition-category";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";

const DiseasesModal = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<ConditionFilter>({});

  const router = useRouter();
  const { width } = useWindowDimensions();

  // 1. Grid Constants
  const numColumns = 5;
  const horizontalPadding = 48;
  const gap = 12;
  const availableWidth = Math.min(width, 800) - horizontalPadding;
  const cardSize = (availableWidth - gap * (numColumns - 1)) / numColumns;

  // 2. Data Hooks - Navigation Stack for nested categories
  const [categoryStack, setCategoryStack] = useState<any[]>([]);
  const selectedParent = categoryStack[categoryStack.length - 1] || null;

  const {
    data: allCategories,
    isLoading: loadingCats,
    error: catError,
    refetch: refetchCats,
  } = useConditionCategories();

  const { data: conditions, isLoading } = useConditions(activeFilter);

  // When a letter is pressed:
  const handleLetterPress = (letter: string) => {
    setCategoryStack([]); // Clear category view
    setActiveFilter({ letter });
  };

  // When a leaf category is pressed:
  const handleCategoryPress = (cat: any) => {
    setCategoryStack([...categoryStack, cat]);
    if (!cat.children || cat.children.length === 0) {
      setActiveFilter({ categoryId: cat.id });
    } else {
      setActiveFilter({});
    }
  };

  const handleGoBackCategory = () => {
    if (categoryStack.length > 0) {
      const newStack = [...categoryStack];
      newStack.pop();
      setCategoryStack(newStack);
      setActiveFilter({});
    }
  };

  // When searching:
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.length > 2) {
      setActiveFilter({ searchTerm: text });
    } else if (text.length === 0) {
      setActiveFilter({}); // Reset to default view
    }
  };

  const handleConditionPress = (condition: any) => {
    router.push({
        pathname: "/(app)/(auth)/(modal)/DiseaseDetails",
        params: { id: condition.id }
    });
  };

  // Only fetch conditions if we are at a leaf node (no children)
  const isLeafNode =
    selectedParent &&
    (!selectedParent.children || selectedParent.children.length === 0);

  const displayCategories = useMemo(() => {
    if (!selectedParent) return allCategories || [];
    return selectedParent.children || [];
  }, [selectedParent, allCategories]);

  // Determine if we should show the "Conditions List" vs "Category Grid"
  const showConditionList = !!(
    activeFilter.letter ||
    activeFilter.searchTerm ||
    isLeafNode
  );

  // Determine if we are currently "filtered" (Search or Alphabet)
  const isFiltered = !!(activeFilter.letter || activeFilter.searchTerm);

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXY".split("");

  // 3. UI Helper Components
  const ErrorState = ({
    message,
    onRetry,
  }: {
    message: string;
    onRetry: () => void;
  }) => (
    <View className="py-10 items-center">
      <Ionicons name="alert-circle" size={48} color="#ef4444" />
      <Text className="text-slate-600 mt-2 text-center font-medium">
        {message}
      </Text>
      <TouchableOpacity
        onPress={onRetry}
        className="mt-4 bg-slate-100 px-6 py-2 rounded-full"
      >
        <Text className="text-slate-900 font-bold">Retry</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Static Header */}
      <View className="px-6 pt-6 pb-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-black text-slate-900">
            Disease Library
          </Text>
          <TouchableOpacity 
            onPress={() => router.back()}
            className="p-2 bg-red-50 rounded-full"
          >
            <Ionicons name="close" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-6 mb-4">
        <View className="flex-row items-center bg-slate-100/80 px-4 py-3 rounded-2xl border border-slate-200">
          <Ionicons name="search" size={20} color="#64748b" />
          <TextInput
            placeholder="Search conditions..."
            className="flex-1 ml-3 text-slate-900 font-medium"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6">
        {/* Error Handling */}
        {catError && (
          <ErrorState
            message="Failed to load categories"
            onRetry={refetchCats}
          />
        )}

        {searchQuery.length > 0 ? (
          <View className="py-4">
            <Text className="font-bold text-slate-400 uppercase">SEARCH RESULTS</Text>
          </View>
        ) : (
          <>
            {!isFiltered && !selectedParent && (
              <>
                <Text className="text-slate-400 text-xs font-bold my-4 uppercase tracking-widest">
                  Browse by Alphabet
                </Text>
                <View className="flex-row flex-wrap justify-between">
                  <AlphabetGrid
                    cardSize={cardSize}
                    gap={gap}
                    alphabet={alphabet}
                    onLetterPress={handleLetterPress}
                  />
                  {/* Don't forget to wire up your Z button! */}
                  <TouchableOpacity
                    onPress={() => handleLetterPress("Z")}
                    className="w-full bg-slate-900 rounded-3xl h-14 items-center justify-center mb-8"
                  >
                    <Text className="text-white text-xl font-bold">Z</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* 2. Content Section */}
            <View className="mt-2">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                  {activeFilter.letter
                    ? `Results for "${activeFilter.letter}"`
                    : selectedParent
                      ? `Under ${selectedParent.name}`
                      : "Categories"}
                </Text>

                <View className="flex flex-col items-center gap-2">
                {/* Back button logic */}
                {categoryStack.length > 0 && !isFiltered && (
                  <TouchableOpacity onPress={handleGoBackCategory} className="bg-gray-100 px-4 py-1 rounded-xl">
                    <Text className="text-zinc-900 font-bold text-xs">
                      ← {categoryStack.length > 1 ? "Back" : "Categories"}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Clear all logic */}
                {(isFiltered || (categoryStack.length > 0 && isLeafNode)) && (
                  <TouchableOpacity
                    onPress={() => {
                      setCategoryStack([]);
                      setActiveFilter({});
                      setSearchQuery("");
                    }}
                  >
                    <Text className="text-red-600 font-bold">
                      Clear Filters
                    </Text>
                  </TouchableOpacity>
                )}
                </View>
              </View>

              {isLoading || loadingCats ? (
                <View className="py-10 items-center">
                  <ActivityIndicator color="#059669" />
                  <Text className="mt-2 text-slate-400">Loading...</Text>
                </View>
              ) : showConditionList ? (
                /* SHOW CONDITIONS LIST */
                <View className="pb-20">
                  {conditions?.length === 0 ? (
                    <Text className="text-slate-400 italic">
                      No conditions found.
                    </Text>
                  ) : (
                    conditions?.map((item: any) => (
                      <TouchableOpacity
                        onPress={() => handleConditionPress(item)}
                        key={item.id}
                        activeOpacity={0.7}
                        className="py-4 border-b border-slate-200 flex-row justify-between items-center bg-white"
                      >
                        <View className="flex-1 pr-4">
                          <Text className="text-lg font-bold text-slate-800">
                            {item.name}
                          </Text>
                          {item.description && (
                            <Text numberOfLines={2} className="text-slate-500 text-sm mt-1">
                              {item.description}
                            </Text>
                          )}
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              ) : (
                /* SHOW CATEGORY GRID */
                <View className="flex-row flex-wrap justify-between pb-20">
                  {displayCategories.map((cat: any) => (
                    <DiseaseCategoryCard
                      key={cat.id}
                      name={cat.name}
                      description={cat.description || ""}
                      onPress={() => handleCategoryPress(cat)}
                    />
                  ))}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default DiseasesModal;

const AlphabetGrid = ({
  cardSize,
  gap,
  alphabet,
  onLetterPress,
}: {
  cardSize: number;
  gap: number;
  alphabet: string[];
  onLetterPress: (letter: string) => void;
}) => {
  return (
    <>
      {alphabet.map((letter) => (
        <TouchableOpacity
          key={letter}
          onPress={() => onLetterPress(letter)}
          style={{
            width: cardSize,
            height: cardSize - 10,
            marginBottom: gap,
          }}
          className="bg-slate-50 border border-slate-100 rounded-3xl items-center justify-center shadow-sm active:bg-emerald-50 active:scale-95"
        >
          <Text className="text-xl font-bold text-slate-700">{letter}</Text>
        </TouchableOpacity>
      ))}
    </>
  );
};

const DiseaseCategoryCard = ({
  name,
  description,
  onPress,
}: {
  name: string;
  description: string;
  onPress: () => void;
}) => {
  const { width } = useWindowDimensions();
  const cardWidth = (Math.min(width, 800) - 60) / 2;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{ width: cardWidth }}
      className="w-[48%] min-h-32 bg-green-200 border border-slate-100 rounded-3xl p-4 mb-4 items-center justify-center shadow-sm relative"
    >
      <View className="flex-1 pr-[1.3rem]">
        <Text className="text-lg font-bold text-slate-800 mb-1">{name}</Text>
        <Text numberOfLines={2} className="text-slate-500 text-sm leading-5">
          {description && description.length > 20
            ? description.substring(0, 20) + "..."
            : description || ""}
        </Text>
      </View>
      <View className="bg-emerald-50 p-1 rounded-2xl absolute top-2 right-2">
        <Ionicons name="arrow-forward" size={20} color="#059669" />
      </View>
    </TouchableOpacity>
  );
};
