export default {
  expo: {
    name: '4 Our Life',
    slug: '4ourlife',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/logo.png',
    scheme: 'fourourlife',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.4thpayapps.4ourlife.v2',
      icon: {
        dark: './assets/icons/ios-dark.png',
        light: './assets/icons/ios-light.png',
        tinted: './assets/icons/ios-tinted.png',
      },
      infoPlist: {
        NSFaceIDUsageDescription:
          'This app uses Face ID to secure your account and streamline your login experience.',
        NSLocationWhenInUseUsageDescription:
          'This app needs access to location to show nearby facilities.',
        NSUserTrackingUsageDescription:
          'This identifier will be used to ensure your healthcare data remains secure and to provide a personalized experience.',
        ITSAppUsesNonExemptEncryption: false,
        LSApplicationQueriesSchemes: ['comgooglemaps', 'googlemaps'],
      },
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
    android: {
      package: 'com.fourthpayapps.fourourlife.v2',
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/icons/adaptive-icon.png',
        backgroundImage: './assets/icons/adaptive-icon.png',
        monochromeImage: './assets/icons/adaptive-icon.png',
      },
      predictiveBackGestureEnabled: false,
      configChanges: [
        'keyboard',
        'keyboardHidden',
        'orientation',
        'screenSize',
        'smallestScreenSize',
        'screenLayout',
      ],
      softwareKeyboardLayoutMode: 'pan',
      googleServicesFile: './google-services.json',
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
      bundler: 'metro',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/icons/splash-icon-dark.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            image: './assets/icons/splash-icon-light.png',
            backgroundColor: '#000000',
          },
        },
      ],
      [
        'expo-build-properties',
        {
          ios: {
      // Change 'static' to 'dynamic' if you don't have a specific reason for static
      // This often resolves the modular header issue instantly
      useFrameworks: 'dynamic', 
      deploymentTarget: '15.1', // Ensure a modern target
      otherSwiftFlags: [
        '-Xfrontend',
        '-enable-experimental-feature',
        '-Xfrontend',
        'AccessLevelOnImport',
      ],
    },
    android: {
      enableProguardInReleaseBuilds: true,
      enableShrinkResourcesInReleaseBuilds: true,
    }
        },
      ],
      [
        '@sentry/react-native/expo',
        {
          url: 'https://sentry.io/',
          project: '4ol-mobile',
          organization: '4-our-life',
        },
      ],
      'expo-video',
      'expo-asset',
      'expo-localization',
      'expo-secure-store',
      'expo-notifications',
      'expo-web-browser',
      'react-native-permissions',
      'react-native-navigation-mode',
      '@react-native-community/datetimepicker',
      './plugins/withNonModularHeaders.js',
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      API_URL: process.env.API_URL,
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY,
      SUPABASE_BUCKET_NAME: process.env.SUPABASE_BUCKET_NAME,
      GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
      ENCRYPT_KEY: process.env.ENCRYPT_KEY,
      eas: {
        projectId: '80101bfa-71d7-4483-96ae-76f6e8ccb6f5',
      },
    },
    owner: 'anwar3006',
    updates: {
      enabled: true,
      fallbackToCacheTimeout: 0,
    },
    runtimeVersion: '1.0.0',
  },
};
