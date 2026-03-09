import React from 'react';
import { View, Text } from 'react-native';
import { themeColors } from '@/src/theme/colors';

const Wellness = () => {
  return (
    <View className={`flex-1 ${themeColors.lightGray} items-center justify-center`}>
      <Text className="text-xl font-bold text-slate-400">Wellness Page Coming Soon</Text>
    </View>
  );
};

export default Wellness;
