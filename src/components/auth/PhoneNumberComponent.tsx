import React, { MutableRefObject, useState } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { themeColors } from '../../theme/colors';
import CustomButton from '../../components/common/CustomButton';
import { size } from '../../theme/fontStyle';
import { fonts } from '../../theme/fonts';
import CustomPhoneNumber from '../../components/reusable_component/CustomPhoneInput';
import CustomInput from '../../components/common/CustomInput';
import { verticalScale } from '../../utils/metrics';
import { useRouter } from 'expo-router';
import { login } from '../../services/auth';
import { setUserData } from '../../store/slices/User';
import { useDispatch } from 'react-redux';
import { Dispatch, UnknownAction } from '@reduxjs/toolkit';
import { ToastType, useToast } from 'react-native-toast-notifications';

// React Hook Form & Zod Imports
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Define the Validation Schema with Zod
const loginSchema = z.object({
  emailOrPhone: z.string().min(1, 'Phone number is required'),
  passcode: z.string().min(4, 'Password must be at least 4 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface Props {
  countryCode: string | undefined;
  setCountryCode: React.Dispatch<any>;
  phoneInput: MutableRefObject<any>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const PhoneNumberComponent = ({
  countryCode,
  phoneInput,
  setCountryCode,
  loading,
  setLoading,
}: Props) => {
  const [isError, setError] = useState<string>('');
  const router = useRouter();
  const dispatch = useDispatch<Dispatch<UnknownAction>>();
  const toast: ToastType = useToast();

  // Initialize React Hook Form
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrPhone: '',
      passcode: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    const checkValid = phoneInput.current?.isValidNumber(values.emailOrPhone);
    if (!checkValid) {
      setError('Invalid Phone Number');
      return;
    }

    setLoading(true);
    try {
      await login(
        values,
        () => {}, // Initial loading handled by setLoading(true) above
        async (successData: any) => {
          setLoading(false);
          dispatch(setUserData(successData));

          toast.show('User logged in successfully', {
            type: 'success',
            placement: 'top',
            duration: 4000,
          });

          router.replace('/(app)/(auth)/(tabs)/Home');
        },
        (error: any) => {
          setLoading(false);
          toast.show(error.message || 'Login failed', {
            type: 'danger',
            placement: 'top',
            duration: 4000,
          });
        }
      );
    } catch (error) {
      setLoading(false);
      console.log('Login Exception:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <View>
        {!countryCode ? (
          <Text style={styles.loadingText}>
            Fetching your country code... Please wait!
          </Text>
        ) : (
          <>
            {/* Phone Number Field */}
            <Controller
              control={control}
              name="emailOrPhone"
              render={({ field: { onChange, value } }) => (
                <CustomPhoneNumber
                  value={value}
                  onchangeState={onChange}
                  setCountryCode={setCountryCode}
                  phoneInput={phoneInput}
                  countrycode={countryCode}
                  error={errors.emailOrPhone?.message || isError}
                  touched={!!errors.emailOrPhone}
                  editable={true}
                  placeHolder={'Phone Number'}
                />
              )}
            />

            {/* Password Field */}
            <Controller
              control={control}
              name="passcode"
              render={({ field: { onChange, value } }) => (
                <CustomInput
                  value={value}
                  onChangeText={onChange}
                  error={errors.passcode?.message}
                  placeholder={'Password'}
                  secureTextEntry={true}
                  icon="lock"
                  editable={true}
                  touched={!!errors.passcode}
                />
              )}
            />

            <CustomButton
              text={'Login'}
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              extraStyle={{
                marginTop: verticalScale(20),
              }}
            />
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: themeColors.white,
  },
  loadingText: {
    textAlign: 'center',
    margin: 0,
    padding: 0,
    fontFamily: fonts.OpenSansRegular,
    color: themeColors.black,
  },
  // ... rest of your styles kept as is
});

export default PhoneNumberComponent;
