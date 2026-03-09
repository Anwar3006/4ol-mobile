import { View, Text } from "react-native";
import React from "react";
import z from "zod";
import { useRouter } from "expo-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { CustomInput } from "./CustomInput";

export const searchInputSchema = z.object({
  search: z.string().min(2, "Search is too short"),
});
export type SearchFormValues = z.infer<typeof searchInputSchema>;

const Search = () => {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SearchFormValues>({
    resolver: zodResolver(searchInputSchema),
    defaultValues: { search: "" },
  });

  const onSubmit = (data: SearchFormValues) => {
    // This is called by handleSubmit
    router.push({
      pathname: "/(app)/(auth)/(modal)/SearchResult",
      params: { search: data.search.trim() },
    });
    reset();
  };

  return (
    <View className="w-full">
      <Controller
        control={control}
        name="search"
        render={({ field: { onChange, onBlur, value } }) => (
          <CustomInput
            placeholder="Find pharmacies, hospitals..."
            icon="search"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={errors.search?.message}
            // Professional Search Settings
            returnKeyType="search" // Changes "Done" to "Search" on keyboard
            onSubmitEditing={handleSubmit(onSubmit)} // Triggers on Enter/Return
            submitBehavior="blurAndSubmit" // Hides keyboard after search
            // UI Tweaks for search bar feel
            containerClassName="shadow-none"
            className="bg-white border-gray-300 h-14 rounded-2xl"
          />
        )}
      />
    </View>
  );
};

export default Search;
