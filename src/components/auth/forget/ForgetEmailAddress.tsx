import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from 'react-native-toast-notifications';

// Common Components
import CustomInput from '../../common/CustomInput';
import CustomButton from '../../common/CustomButton';

// Utilities & Services
import { verticalScale } from '../../../utils/metrics';
import { size } from '../../../theme/fontStyle';
import { themeColors } from '../../../theme/colors';
import { sendOtpToEmail } from '../../../services/auth';

/**
 * 1. Define the Zod Schema
 * This replaces your validationForgetEmailSchema (Formik/Yup style)
 */
const schema = z.object({
  emailOrPhone: z
    .string()
    .min(1, 'Email or Phone is required')
    .email('Invalid email address'), // Customize this if you allow phone numbers too
});

type FormData = z.infer<typeof schema>;

interface Props {
  option?: string;
  countryCode?: string | boolean;
  setCountryCode?: any;
}

const ForgetEmailAddress = ({ option, countryCode, setCountryCode }: Props) => {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * 2. Initialize React Hook Form
   */
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      emailOrPhone: '',
    },
  });

  /**
   * 3. Handle Submit
   */
  const onSubmit = async (values: FormData) => {
    setLoading(true);
    
    await sendOtpToEmail(
      values.emailOrPhone,
      () => setLoading(true),
      () => {
        setLoading(false);
        toast.show('OTP sent successfully', {
          type: 'success',
          placement: 'top',
          duration: 4000,
        });
        router.push({
          pathname: '/(app)/(public)/OtpVerification',
          params: {
            email: values.emailOrPhone,
            forgot: 'true',
          },
        });
      },
      (error: any) => {
        setLoading(false);
        toast.show(error.message || 'Something went wrong', {
          type: 'danger',
          placement: 'top',
          duration: 4000,
        });
      }
    );
  };

  return (
    <>
      {/* 4. Use the Controller component 
          This wraps your CustomInput to bridge it with React Hook Form
      */}
      <Controller
        control={control}
        name="emailOrPhone"
        render={({ field: { onChange, onBlur, value } }) => (
          <CustomInput
            placeholder="Email Address"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            secureTextEntry={false}
            icon="at"
            editable={!loading}
            error={errors.emailOrPhone?.message} // Pass the Zod error message
            touched={!!errors.emailOrPhone}      // If there is an error, consider it touched
          />
        )}
      />

      <CustomButton
        text="Send Code"
        onPress={handleSubmit(onSubmit)}
        loading={loading}
        extraStyle={{
          marginTop: verticalScale(30),
        }}
      />
    </>
  );
};

export default ForgetEmailAddress;

const styles = StyleSheet.create({
  error: {
    fontSize: size.s,
    color: themeColors.red,
    marginTop: 5,
    textAlign: 'center',
  },
});