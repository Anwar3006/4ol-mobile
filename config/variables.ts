import { Platform } from 'react-native';

// Only EXPO_PUBLIC_* vars are inlined by Expo's bundler and available at runtime.
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY || '';
export const ENCRYPT_KEY = process.env.EXPO_PUBLIC_ENCRYPT_KEY || '';

export const limit = 10;

const iosKey = 'AIzaSyCweARjI2twXB4AxBOPI6vHJTer649bwJA';
const androidKey = 'AIzaSyAVBr8MkTtwvQn_LH2hc77jJ1Y4bNumcZM';

export const THIS_IS_MAP_KEY: string = Platform.OS === 'ios' ? iosKey : androidKey;
