import { Dimensions, PixelRatio } from 'react-native';

const width = Dimensions.get('window').width;

const fontSize = (size: number | string): number => {
  // Convert string input to decimal number if it's a string
  const numericSize = typeof size === 'string' ? parseFloat(size) : size;

  // Adjust size based on screen width and calculate pixel value
  const adjustedSize = (width > 480 ? numericSize * 0.6 : numericSize) / 3.85;
  return PixelRatio.roundToNearestPixel((width * adjustedSize) / 100);
};

export { fontSize };