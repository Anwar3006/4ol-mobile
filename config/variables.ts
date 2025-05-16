import {
  SUPABASE_URL as envSupabaseUrl,
  SUPABASE_KEY as envSupabaseKey,
  ENCRYPT_KEY as envEncryptKey,
  API_KEY as envApiKey,
} from '@env';

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
export const API_KEY: string = envApiKey;
export const limit: number = 10;
