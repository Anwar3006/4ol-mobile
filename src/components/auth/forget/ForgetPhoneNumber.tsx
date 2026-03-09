import { StyleSheet } from 'react-native';
import React, { useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'expo-router';
import { useToast } from 'react-native-toast-notifications';

// UI Components
import CustomButton from '../../common/CustomButton';
import CustomPhoneNumber from '../../reusable_component/CustomPhoneInput';

// Theme & Utils
import { size } from '../../../theme/fontStyle';
import { themeColors } from '../../../theme/colors';
import { verticalScale } from '../../../utils/metrics';
import { signInWithPhoneNumber } from '../../../services/auth';

// 1. Define the Zod Schema
const forgetPasswordSchema = z.object({
  emailOrPhone: z.string().min(1, 'Phone number is required'),
});

type ForgetPasswordFormData = z.infer<typeof forgetPasswordSchema>;

interface Props {
  option: string | undefined;
  countryCode: string | boolean | undefined;
  setCountryCode: any;
}

const ForgetPhoneNumber = ({ countryCode, setCountryCode }: Props) => {
  const phoneInput = useRef<any>(null);
  const toast = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  // 2. Initialize React Hook Form
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgetPasswordFormData>({
    resolver: zodResolver(forgetPasswordSchema),
    defaultValues: {
      emailOrPhone: '',
    },
  });

  const onFormSubmit = async (data: ForgetPasswordFormData) => {
    // Check validity using the Ref (specific to your Phone Input)
    const checkValid = phoneInput.current?.isValidNumber(data.emailOrPhone);
    if (!checkValid) {
      return setError('emailOrPhone', { message: 'Invalid Phone Number' });
    }

    setLoading(true);
    await signInWithPhoneNumber(
      data.emailOrPhone,
      true,
      () => setLoading(true),
      () => {
        setLoading(false);
        toast.show('OTP sent successfully', {
          type: 'success',
          placement: 'top',
        });
        router.push({
          pathname: '/(app)/(public)/OtpVerification',
          params: { phone: data.emailOrPhone, forgot: 'true' },
        });
      },
      (error: any) => {
        setLoading(false);
        toast.show(error.message, { type: 'danger', placement: 'top' });
      }
    );
  };

  return (
    <>
      {/* 3. Use Controller for custom/third-party inputs */}
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
            error={errors.emailOrPhone?.message}
            touched={!!errors.emailOrPhone}
            editable={true}
            placeHolder="Phone Number"
          />
        )}
      />

      <CustomButton
        text="Send Code"
        onPress={handleSubmit(onFormSubmit)}
        loading={loading}
        extraStyle={{
          marginTop: verticalScale(30),
        }}
      />
    </>
  );
};

export default ForgetPhoneNumber;

const styles = StyleSheet.create({
  error: {
    fontSize: size.s,
    color: themeColors.red,
    marginTop: 5,
    textAlign: 'center',
  },
});