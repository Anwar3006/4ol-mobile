import {KeyboardAvoidingView, StyleSheet, Text, View} from 'react-native';
import React, {useRef, useState} from 'react';
import CustomInput from '../../common/CustomInput';
import {Formik} from 'formik';
import CustomButton from '../../common/CustomButton';
import {size} from '../../../theme/fontStyle';
import {themeColors} from '../../../theme/colors';
import {verticalScale} from '../../../utils/metrics';
import {
  login,
  sendOtpToEmail,
  signInWithPhoneNumber,
} from '../../../services/auth';
import PhoneInput from 'react-native-phone-number-input';
import {setUserData} from '../../../store/slices/User';
import {useDispatch} from 'react-redux';
import {Dispatch, UnknownAction} from '@reduxjs/toolkit';
import {useNavigation} from '@react-navigation/native';
import {SCREENS} from '../../../constants/screens';
import {
  validationForgetPhoneNumber,
  validationLoginSchema,
} from '../../../validation';
import {fonts} from '../../../theme/fonts';
import {
  ForgetEmailAddressSchema,
  ForgetPhoneNumberSchema,
} from '../../../interfaces';
import CustomPhoneNumber from '../../reusable_component/CustomPhoneInput';
import {useToast} from 'react-native-toast-notifications';
// import ErrorIcon from 'react-native-vector-icons/MaterialIcons';

interface Props {
  option: string | undefined;
  countryCode: string | boolean | undefined;
  // loading: boolean | undefined;
  setCountryCode: any;
}

const handleSendCode = async (values: any) => {
  console.log('handlesendCode', values);
};

const ForgetPhoneNumber = ({
  countryCode,
  // loading,
  setCountryCode,
}: Props) => {
  const phoneInput = useRef<PhoneInput>(null);
  const toast = useToast();
  const navigation = useNavigation<any>();
  const [isError, setError] = useState<string | undefined>('');
  const dispatch = useDispatch<Dispatch<UnknownAction>>();
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (values: ForgetPhoneNumberSchema) => {
    const checkValid = phoneInput.current?.isValidNumber(values.emailOrPhone);
    if (!checkValid) return setError('Invalid Phone Number');

    await signInWithPhoneNumber(
      values.emailOrPhone,
      true,
      () => {
        setLoading(true);
      },
      () => {
        setLoading(false);
        toast.show('OTP sent successfully', {
          type: 'success',
          placement: 'top',
          duration: 4000,
          animationType: 'slide-in',
        });
        navigation.navigate('OtpVerification', {
          phone: values.emailOrPhone,
          forgot: true,
        });
      },
      (error: any) => {
        setLoading(false);
        toast.show(error.message, {
          type: 'danger',
          placement: 'top',
          duration: 4000,
          animationType: 'slide-in',
        });
        console.log('Error while sending OTP:', error);
        setError(error.message);
      },
    );
  };

  return (
    <>
      <Formik
        initialValues={{
          emailOrPhone: '',
        }}
        onSubmit={handleSubmit}
        validationSchema={validationForgetPhoneNumber}>
        {({
          errors,
          values,
          handleChange,
          handleReset,
          handleSubmit,
          resetForm,
          touched,
          setSubmitting,
          isSubmitting,
        }) => (
          <>
            <CustomPhoneNumber
              value={values.emailOrPhone}
              onchangeState={handleChange('emailOrPhone')}
              setCountryCode={setCountryCode}
              phoneInput={phoneInput}
              countrycode={countryCode}
              error={errors?.emailOrPhone}
              touched={touched.emailOrPhone}
              editable={true}
              stateError={isError}
              placeHolder="phone Number"
            />

            <CustomButton
              text="Send Code"
              onPress={handleSubmit}
              loading={loading}
              extraStyle={{
                marginTop: verticalScale(30),
              }}
            />
          </>
        )}
      </Formik>
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
