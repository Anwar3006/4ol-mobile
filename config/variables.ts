import {
  SUPABASE_URL as envSupabaseUrl,
  SUPABASE_KEY as envSupabaseKey,
  ENCRYPT_KEY as envEncryptKey,
} from '@env';
import {Platform} from 'react-native';

// console.log(SUPABASE_KEY);

// export const SUPABASE_URL: string = envSupabaseUrl;
// export const SUPABASE_KEY: string = envSupabaseKey;
// export const ENCRYPT_KEY: string = envEncryptKey;
// export const API_KEY: string = envApiKey;
// export const limit: number = 10;

// console.log(SUPABASE_KEY), console.log(SUPABASE_URL);

export const SUPABASE_URL: string = 'https://bqdohqgwdqrpmzffmsva.supabase.co';
export const SUPABASE_KEY: string =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxZG9ocWd3ZHFycG16ZmZtc3ZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI2MTQ0OTAsImV4cCI6MjAzODE5MDQ5MH0.oS-GvWNzPgRuQWrlPwaReAe5Mo1UD3W5-VCZpRTRWTo';
export const ENCRYPT_KEY: string = envEncryptKey;

export const limit: number = 10;

// Google Maps API Key - Platform specific
// iOS uses different key, Android uses original key
const iosKey = 'AIzaSyCweARjI2twXB4AxBOPI6vHJTer649bwJA';
const androidKey = 'AIzaSyAVBr8MkTtwvQn_LH2hc77jJ1Y4bNumcZM';

export const THIS_IS_MAP_KEY: string =
  Platform.OS === 'ios' ? iosKey : androidKey;

// Console log which key is being used
console.log(
  `🗺️ [${Platform.OS.toUpperCase()}] Google Maps API Key being used: ${THIS_IS_MAP_KEY}`,
);
