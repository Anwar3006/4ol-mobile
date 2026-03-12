import React from 'react';
import {
  View,
  Text,
  useWindowDimensions,
  ScrollView,
  Platform,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import LoginForm from '@/components/auth/LoginForm';

const LoginScreen = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const router = useRouter();

  const isLargeScreen = width > 600;

  return (
    /**
     * KEYBOARD AVOIDANCE STRATEGY
     *
     * app.config.ts sets android.softwareKeyboardLayoutMode = 'pan', which maps to
     * android:windowSoftInputMode="adjustPan" in the Android manifest.
     *
     * adjustPan: the OS pans the entire window upward to keep the focused input
     * visible. The Activity dimensions do NOT change.
     *
     * KeyboardAvoidingView with behavior='height' ALSO listens to the keyboard
     * event and reduces its own height by the keyboard size. On Android these
     * two mechanisms stack:
     *   • Window pans up ~300px (OS)
     *   • KAV shrinks ~300px (React Native)
     *   → content sits ~600px above its resting position → entirely off-screen
     *   → blank white screen, user cannot interact
     *
     * Fix: on Android, render no KAV at all (the OS pan already handles it).
     *      On iOS, use behavior='padding' which works correctly alongside iOS's
     *      default adjustPan/scroll behaviour.
     */
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: 'white' }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 40,
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: isLargeScreen ? width * 0.2 : 24,
          justifyContent: 'center',
        }}
        showsVerticalScrollIndicator={false}
        // keyboardShouldPersistTaps='handled' ensures that tapping the Sign In
        // button while the keyboard is up fires the onPress instead of just
        // dismissing the keyboard, preventing a "tap was swallowed" bug.
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.push('/(app)/(public)/GetStarted')}
          className="absolute top-12 left-6 h-12 w-12 rounded-full bg-gray-100 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={24} color="#10b981" />
        </TouchableOpacity>

        {/* Branding Header */}
        <View className="mb-10 items-center">
          <View className="w-24 h-24 rounded-3xl items-center justify-center mb-6 shadow-sm overflow-hidden">
            <Image
              source={require('@/assets/images/logo.png')}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          </View>
          <Text className="text-4xl font-black text-black tracking-tighter text-center">
            Welcome Back<Text className="text-emerald-500">.</Text>
          </Text>
          <Text className="text-gray-400 mt-2 text-lg text-center">
            Sign in to continue to your health dashboard.
          </Text>
        </View>

        {/* Form Card */}
        <View className="bg-white p-6 rounded-[40px] shadow-2xl border border-gray-50">
          <LoginForm />
        </View>

        {/* Footer Navigation */}
        <TouchableOpacity
          onPress={() => router.push('/ForgotPassword')}
          className="mt-8 items-center"
        >
          <Text className="text-emerald-600 font-bold">Forgot Password?</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
