import React from 'react';
import { Alert, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { useToast } from 'react-native-toast-notifications';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import * as Sentry from '@sentry/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

import { authClient } from '../../../lib/auth-client';
import { supabase } from '../../../lib/supabase';
import { setUserData } from '../../store/slices/User';
import CustomInput from '../common/CustomInput';
import CustomButton from '../common/CustomButton';
import { verticalScale } from '../../utils/metrics';

// ─── Validation schema ────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  loading: boolean | undefined;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  /** Optional — passed through from the Login screen but not used here */
  option?: string;
  countryCode?: string;
  setCountryCode?: (code: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
const EmailAddressComponent = ({ loading, setLoading }: Props) => {
  const toast = useToast();
  const dispatch = useDispatch();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // ─── After better-auth confirms sign-in, load the full Supabase profile ──
  const hydrateUserProfile = async (userId: string) => {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      throw new Error(error?.message ?? 'User profile not found in database.');
    }

    // Persist user id for the rest of the app (AsyncStorage-based auth guard)
    await AsyncStorage.setItem('user_id', userId);
    await AsyncStorage.setItem('isLoggedIn', JSON.stringify(true));

    // Push full profile into Redux — also flips isAuthenticated to true
    dispatch(setUserData(profile));
  };

  // ─── Form submit ──────────────────────────────────────────────────────────
  const onFormSubmit = async (values: LoginFormValues) => {
    setLoading(true);

    try {
      await authClient.signIn.email(
        {
          email: values.email,
          password: values.password,
        },
        {
        
          // fetchOptions mirrors the pattern used in the 4OL_full reference codebase
          
            onError: (ctx: any) => {
              const message = ctx.error?.message ?? 'Login failed. Please try again.';
              toast.show(message, { type: 'danger', placement: 'top', duration: 4000 });
              Sentry.captureException(ctx.error, {
                tags: { section: 'auth', action: 'login_email' },
                extra: { email: values.email },
              });
            },
            onSuccess: async (ctx: any) => {
              try {
                // ctx.data.user is the better-auth user record (id, email, name…)
                const userId: string = ctx.data?.user?.id;
                if (!userId) throw new Error('No user ID returned from better-auth.');

                await hydrateUserProfile(userId);
                router.replace('/(app)/(auth)/(tabs)/Home');

                toast.show('Logged in successfully', {
                  type: 'success',
                  placement: 'top',
                  duration: 3000,
                });
              } catch (profileErr: any) {
                // Sign-in succeeded but profile fetch failed — surface the error
                toast.show(profileErr.message ?? 'Could not load your profile.', {
                  type: 'danger',
                  placement: 'top',
                  duration: 4000,
                });
                Sentry.captureException(profileErr, {
                  tags: { section: 'auth', action: 'login_hydrate_profile' },
                  extra: { email: values.email },
                });
              }
            
          },
        },
      );
    } catch (err: any) {
      // Network-level / unexpected errors
      Alert.alert('Login Failed', err.message ?? 'An unexpected error occurred.');
      Sentry.captureException(err, {
        tags: { section: 'auth', action: 'login_email_catch' },
        extra: { email: values.email },
      });
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <CustomInput
            placeholder="Email Address"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            icon="at"
            error={errors.email?.message}
            touched={!!errors.email}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <CustomInput
            placeholder="Password"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            secureTextEntry
            icon="lock"
            error={errors.password?.message}
            touched={!!errors.password}
          />
        )}
      />

      <CustomButton
        text="Login"
        onPress={handleSubmit(onFormSubmit)}
        loading={loading}
        extraStyle={styles.buttonSpacing}
      />
    </>
  );
};

const styles = StyleSheet.create({
  buttonSpacing: {
    marginTop: verticalScale(20),
    marginBottom: verticalScale(20),
  },
});

export default EmailAddressComponent;
