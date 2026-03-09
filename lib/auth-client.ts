import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import Constants from "expo-constants";

import * as SecureStore from "expo-secure-store";
import zustandMMKVStorage from "./zustand-mmkv";

// Smart API URL detection
function getApiUrl(): string {
  const envUrl =
    Constants.expoConfig?.extra?.API_URL || process.env.EXPO_PUBLIC_API_URL;

  // If env URL is set and not localhost, use it
  if (envUrl && !envUrl.includes("localhost")) {
    return envUrl;
  }

  // Development mode detection
  if (__DEV__) {
    // iOS Simulator: localhost works fine
    // Physical Device: Need to use machine IP
    const devHostname = Constants.expoConfig?.hostUri?.split(":")[0];

    if (devHostname && devHostname !== "localhost") {
      // We're on a physical device, use the dev server IP
      return `http://${devHostname}:3000`;
    }
  }

  // Fallback to env or localhost
  return envUrl || "http://localhost:3000";
}

const API_URL = getApiUrl();

console.log("🌐 API URL:", API_URL); // Debug log

export const authClient = createAuthClient({
  baseURL: API_URL,
  fetchOptions: {
    headers: {
      Origin: API_URL, // Ensure CORS works correctly
    }
  },

  // Use SecureStore for sensitive data (tokens)
  storage: {
    getItem: async (key: string) => {
      const secureItem = await SecureStore.getItemAsync(key);
      if (secureItem) return secureItem;

      return (await zustandMMKVStorage.getItem(key)) ?? null;
    },
    setItem: async (key: string, value: string) => {
      // Logic: If it looks like a token or sensitive ID, go to hardware storage
      if (key.includes("token") || key.includes("session")) {
        await SecureStore.setItemAsync(key, value);
      } else {
        await zustandMMKVStorage.setItem(key, value);
      }
    },
    removeItem: async (key: string) => {
      await SecureStore.deleteItemAsync(key);
      await zustandMMKVStorage.removeItem(key);
    },
  },

  plugins: [
    expoClient({
      scheme: "fourourlife",
      storage: SecureStore,
    }),
  ],
});

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await authClient.getSession();
    return !!session?.data?.user;
  } catch {
    return false;
  }
}
