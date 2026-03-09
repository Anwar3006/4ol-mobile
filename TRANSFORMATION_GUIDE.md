# Transformation Guide: Migrating to Expo & Modern Architecture

This guide outlines the steps to transform the `4-Our-Life-App` (Bare React Native) to look and function like the `4OL_full/apps/mobile` project, utilizing Expo-managed workflow, Expo Router, and NativeWind v4.

## Prerequisites

- Node.js >= 18
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)

---

## Phase 1: Expo Setup & Base Dependencies

### 1. Install Expo Core
Add Expo to your project and update React/React Native versions to match the reference.

```bash
npx expo install expo react@19.1.0 react-native@0.81.5
```

### 2. Install Expo Router & Navigation
Replace `react-navigation` with `expo-router`.

```bash
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar
```

### 3. Setup Dev Client & EAS
```bash
npx expo install expo-dev-client
```

---

## Phase 2: NativeWind v4 Styling Setup

The new architecture uses NativeWind v4 (Tailwind CSS for React Native).

### 1. Install NativeWind Dependencies
```bash
npm install nativewind@^4.2.1 tailwindcss@^3.4.19 react-native-reanimated
```

### 2. Configure `tailwind.config.js`
Update or create `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        light: ["Nunito_300Light"],
        normal: ["Nunito_400Regular"],
        medium: ["Nunito_500Medium"],
        bold: ["Nunito_700Bold"],
        black: ["Nunito_900Black"],
      },
    },
  },
  plugins: [],
};
```

---

## Phase 3: Structural Refactoring

Expo Router uses file-based routing. You must move your screens to the `app` directory.

### 1. Create the `app/` Directory
Move your high-level navigation logic from `src/navigation` to `app/`.

- **Root Layout**: `app/_layout.tsx` (Handles global providers: QueryClient, Supabase, Auth)
- **App Group**: `app/(app)/_layout.tsx` (Protected routes)
- **Auth Group**: `app/(auth)/` (Sign in, Sign up)
- **Public Group**: `app/(public)/` (Splash, Onboarding)

### 2. Directory Mapping Suggestion
| Old Path | New Path (Expo Router) |
| :--- | :--- |
| `src/screens/authStack/` | `app/(auth)/` |
| `src/screens/home/` | `app/(app)/(tabs)/home.tsx` |
| `src/components/` | `components/` (Root level) |

---

## Phase 4: Configuration Files

### 1. `app.config.ts` (Managed Config)
Replace `app.json` with a dynamic `app.config.ts`. Ensure you include modern flags used in the reference project:

```typescript
export default {
  expo: {
    // ... other config
    newArchEnabled: true,
    experiments: {
      typedRoutes: true,
      reactCanary: true,
    },
    // ...
  }
}
```

### 2. `metro.config.js`
Update to support NativeWind and Monorepo resolution (if applicable):

```javascript
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
```

### 3. `babel.config.js`
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
```

---

## Phase 5: Key Libraries Integration

### 1. Authentication (Better Auth)
Reference setup in `4OL_full/apps/mobile/lib/auth.ts`.
```bash
npm install @better-auth/expo better-auth
```

### 2. Data Fetching (TanStack Query)
```bash
npm install @tanstack/react-query
```

### 3. Biometrics & Secure Storage
```bash
npx expo install expo-local-authentication expo-secure-store
```

### 4. Maps
```bash
npx expo install react-native-maps
```

---

## Phase 6: Migration Checklist

1. [ ] **Clean node_modules**: `rm -rf node_modules package-lock.json && npm install`
2. [ ] **Update Imports**: Update all `import { ... } from 'react-navigation'` to `import { useRouter, Stack } from 'expo-router'`.
3. [ ] **Update Styles**: Convert `StyleSheet.create` to Tailwind classes where applicable.
4. [ ] **Test with Dev Client**: Run `npx expo run:ios` or `npx expo run:android`.

> [!TIP]
> Use the reference project `4OL_full/apps/mobile` as a template for folder structure and configuration values.
