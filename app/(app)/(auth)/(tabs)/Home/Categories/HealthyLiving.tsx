import { View, Text } from 'react-native'
import React from 'react'
import { themeColors } from '@/src/theme/colors';

const HealthyLiving = () => {
  return (
    <View className={`flex-1 ${themeColors.lightGray} items-center justify-center`}>
      <Text className="text-xl font-bold text-slate-400">Healthy Living Page Coming Soon</Text>
    </View>
  )
}

export default HealthyLiving;
