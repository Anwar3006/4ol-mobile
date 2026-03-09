// import { View, Text, TouchableOpacity } from "react-native";
// import React from "react";
// import { useCategoryData } from "@/hooks/use-categoryData";
// import { CategoryLarge } from "@/components/home/CategoryComponents";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { FlashList } from "@shopify/flash-list";
// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";

// const Categories = () => {
//   const insets = useSafeAreaInsets();
//   const { categories, width } = useCategoryData();
//   const isLargeScreen = width > 600;
//   const router = useRouter();

//   return (
//     <View className="flex-1 bg-[#EBF9E6]">
//       <FlashList
//         data={categories}
//         keyExtractor={(item) => item.id}
//         numColumns={isLargeScreen ? 2 : 1}
//         ListHeaderComponent={
//           <View className="flex flex-row justify-between items-center">
//             <TouchableOpacity
//               className="px-4 flex-row items-center gap-2"
//               onPress={() => router.back()}
//             >
//               <Ionicons name="arrow-back" size={24} color="black" />
//               <Text className="text-md">Back</Text>
//             </TouchableOpacity>

//             <View className="px-4 mt-6 mb-8 items-end">
//               <Text className="text-3xl font-black text-slate-900">
//                 All Categories
//               </Text>
//               <Text className="text-gray-500 font-medium">
//                 Select a category to find specialized care
//               </Text>
//             </View>
//           </View>
//         }
//         renderItem={({ item }) => (
//           <View className={isLargeScreen ? "p-2" : "px-4 mb-4"}>
//             <CategoryLarge
//               title={item.title}
//               value={item.value}
//               icon={item.icon}
//               screen={item.screen}
//               isLargeScreen={isLargeScreen}
//             />
//           </View>
//         )}
//         contentContainerStyle={{
//           paddingTop: insets.top + 30,
//           paddingBottom: insets.bottom + 20,
//         }}
//         showsVerticalScrollIndicator={false}
//       />
//     </View>
//   );
// };

// export default Categories;
