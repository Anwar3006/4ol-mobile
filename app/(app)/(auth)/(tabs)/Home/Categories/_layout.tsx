import React from 'react';
import { Stack } from 'expo-router';
import { themeColors } from '@/src/theme/colors';

export default function CategoriesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: themeColors.lightGray,
        },
        animation: 'slide_from_right',
      }}
    />
  );
}
