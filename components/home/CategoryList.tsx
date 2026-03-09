import { View, Text } from "react-native";
import React from "react";
import { useCategoryData } from "@/hooks/use-categoryData";
import { CategorySmall } from "./CategoryComponents";

import { useRouter } from "expo-router";

const CategoryList = () => {
  const { categories, width } = useCategoryData();
  const router = useRouter();

  // Logic: Show top 4 categories in a single row
  const displayedCategories = categories.slice(0, 4);

  return (
    <View className="w-full mt-6">
      <View className="flex-row justify-between items-center mb-4 px-1">
        <Text className="text-xl font-medium text-slate-900">Categories</Text>
      </View>

      {/* Grid Layout - Single Row with 4 Columns */}
      <View className="flex-row justify-between">
        {displayedCategories.map((item) => (
          <CategorySmall
            key={item.id}
            title={item.title}
            value={item.value}
            icon={item.icon}
            screen={item.screen}
            // 23% width allows for 4 items with space in between
            containerClassName="w-[23%]"
          />
        ))}
      </View>
    </View>
  );
};

export default CategoryList;
