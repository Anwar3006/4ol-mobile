import React from 'react';
import {
  View,
  Text,
  useWindowDimensions,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import LoginForm from '@/components/auth/LoginForm';

const LoginScreen = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const router = useRouter();

  // Logic for Responsiveness/Foldables
  const isLargeScreen = width > 600;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: 'white' }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: insets.top + 40,
            paddingBottom: insets.bottom + 20,
            paddingHorizontal: isLargeScreen ? width * 0.2 : 24,
            justifyContent: 'center',
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
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
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;