// hooks/useResponsive.js
import {useWindowDimensions} from 'react-native';

export const useResponsive = () => {
  const {width} = useWindowDimensions();

  const getScaledValue = (baseValue: number) => {
    if (width >= 1200) return baseValue * 1.8;
    if (width >= 1000) return baseValue * 1.5;
    if (width >= 800) return baseValue * 1.5;
    if (width >= 600) return baseValue * 1.3;
    return baseValue * 1.2; // Default scaling for smaller screens
  };

  return {
    getScaledValue,
    isLargeScreen: width >= 1000,
    isTablet: width >= 600,
  };
};
