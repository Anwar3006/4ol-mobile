import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView, KeyboardAvoidingView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { themeColors } from '../../../src/theme/colors';
import CustomButton from '../../../src/components/common/CustomButton';
import { size } from '../../../src/theme/fontStyle';
import { fonts } from '../../../src/theme/fonts';
import { useToast } from 'react-native-toast-notifications';
import CustomPhoneNumber from '../../../src/components/reusable_component/CustomPhoneInput';
import { useRouter } from 'expo-router';
import { sendOtp } from '../../../src/services/otpService';

// 1. Define Zod Schema
const phoneSchema = z.object({
  phoneNumber: z.string().min(1, 'Phone number is required'),
});

type PhoneFormData = z.infer<typeof phoneSchema>;

const VerifyPhoneNumber = () => {
  const toast = useToast();
  const phoneInput = useRef<any>(null);
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState<string>('GH');

  // 2. Initialize React Hook Form
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phoneNumber: '',
    },
  });

  const onFormSubmit = async (values: PhoneFormData) => {
    // Keep your manual ref check for the phone library's validation
    const checkValid = phoneInput.current?.isValidNumber(values.phoneNumber);
    if (!checkValid) {
      setError('Invalid phone number');
      return;
    }

    setLoading(true);
    setError(null);

    await sendOtp(
      values.phoneNumber,
      () => {}, // Initial loading handled by state
      (successData: any) => {
        setLoading(false);
        toast.show('OTP sent successfully', { type: 'success', placement: 'top' });
        router.push({
          pathname: '/(app)/(public)/OtpVerification',
          params: { phone: values.phoneNumber },
        });
      },
      (err: any) => {
        setLoading(false);
        setError(err.message);
        toast.show(err.message, { type: 'danger', placement: 'top' });
      },
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1, width: '100%' }}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <MaterialCommunityIcons
            name="email-check-outline"
            size={70}
            color={themeColors.primary}
            style={styles.icon}
          />

          <Text style={styles.title}>Verify Your Phone Number</Text>
          <Text style={styles.description}>
            We will send you an{' '}
            <Text style={styles.boldText}>One Time Password</Text> on this phone number
          </Text>

          <View style={{ margin: 20, marginBottom: 20, width: '100%' }}>
            {!countryCode ? (
              <Text style={styles.fetchingText}>Fetching your country code...</Text>
            ) : (
              <Controller
                control={control}
                name="phoneNumber"
                render={({ field: { onChange, value } }) => (
                  <CustomPhoneNumber
                    placeHolder="Enter phone"
                    value={value}
                    onchangeState={onChange} // Pass the RHF onChange directly
                    setCountryCode={setCountryCode}
                    // phoneInput={phoneInput}
                    countrycode={countryCode}
                    // error={errors.phoneNumber?.message || error}
                    editable={!loading}
                    touched={!!errors.phoneNumber}
                  />
                )}
              />
            )}
          </View>

          <CustomButton
            text={'Send OTP'}
            onPress={handleSubmit(onFormSubmit)}
            loading={loading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.white,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: size.xlg,
    color: themeColors.primary,
    marginBottom: 10,
    fontFamily: fonts.QuincyCFBold,
  },
  description: {
    fontSize: size.md,
    color: themeColors.black,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: fonts.OpenSansRegular,
  },
  boldText: {
    fontFamily: fonts.OpenSansBold,
  },
  fetchingText: {
    textAlign: 'center',
    fontFamily: fonts.OpenSansRegular,
    color: themeColors.black,
  },
});

export default VerifyPhoneNumber;
