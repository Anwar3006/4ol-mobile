import React, { useState } from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push({
        pathname: "/(app)/(auth)/(modal)/SearchResult",
        params: { search: searchQuery.trim() },
      });
    }
  };

  return (
    <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
      <Ionicons name="search" size={20} color="#9ca3af" />
      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search facilities..."
        placeholderTextColor="#9ca3af"
        className="flex-1 ml-3 text-base text-gray-900"
        returnKeyType="search"
        onSubmitEditing={handleSearch}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={() => setSearchQuery("")}>
          <Ionicons name="close-circle" size={20} color="#9ca3af" />
        </TouchableOpacity>
      )}
    </View>
  );
}
