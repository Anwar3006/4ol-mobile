import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authClient } from '@/lib/auth-client';
import { CustomInput } from '@/components/CustomInput';
import { BiometricLoginButton } from '@/components/auth/BiometricLoginButton';
import * as Sentry from '@sentry/react-native';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const result = await authClient.signIn.email({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });

      if (result.error) {
        Alert.alert(
          'Sign In Failed',
          result.error.message ?? 'Invalid email or password.',
        );
        Sentry.captureMessage('Login failed', {
          level: 'warning',
          extra: { error: result.error.message, email: data.email },
        });
      }
      // On success the AuthProvider's navigation guard will automatically
      // redirect to the correct screen — no manual router.push needed here.
    } catch (err: any) {
      Sentry.captureException(err, {
        tags: { section: 'auth', action: 'sign_in' },
      });
      Alert.alert(
        'Connection Error',
        'Unable to reach the server. Check your internet connection and try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Called by BiometricLoginButton after successful biometric auth
  const handleBiometricSuccess = async (credentials: {
    email: string;
    password: string;
  }) => {
    setValue('email', credentials.email);
    setValue('password', credentials.password);
    await onSubmit(credentials);
  };

  return (
    <View className="gap-y-4">
      {/* Email */}
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <CustomInput
            label="Email Address"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={errors.email?.message}
            icon="mail-outline"
          />
        )}
      />

      {/* Password */}
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <CustomInput
            label="Password"
            placeholder="••••••••"
            secureTextEntry
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={errors.password?.message}
            icon="lock-closed-outline"
          />
        )}
      />

      {/* Submit */}
      <TouchableOpacity
        onPress={handleSubmit(onSubmit)}
        disabled={isLoading}
        activeOpacity={0.8}
        className="mt-2 h-16 w-full items-center justify-center rounded-2xl bg-emerald-600 shadow-sm"
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-lg font-bold text-white">Sign In</Text>
        )}
      </TouchableOpacity>

      {/* Biometric login — renders nothing if not available/enabled */}
      <BiometricLoginButton onSuccess={handleBiometricSuccess} />
    </View>
  );
}
