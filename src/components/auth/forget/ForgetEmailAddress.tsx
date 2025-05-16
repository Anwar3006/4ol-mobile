import {KeyboardAvoidingView, StyleSheet, Text, View} from 'react-native';
import React, {useRef, useState} from 'react';
import CustomInput from '../../common/CustomInput';
import {Formik} from 'formik';
import CustomButton from '../../common/CustomButton';
import {size} from '../../../theme/fontStyle';
import {themeColors} from '../../../theme/colors';
import {verticalScale} from '../../../utils/metrics';
import {login, sendOtpToEmail} from '../../../services/auth';
import PhoneInput from 'react-native-phone-number-input';
import {setUserData} from '../../../store/slices/User';
import {useDispatch} from 'react-redux';
import {Dispatch, UnknownAction} from '@reduxjs/toolkit';
import {useNavigation} from '@react-navigation/native';
import {SCREENS} from '../../../constants/screens';
import {
  validationForgetEmailSchema,
  validationLoginSchema,
} from '../../../validation';
import {ForgetEmailAddressSchema} from '../../../interfaces';
import {ToastType, useToast} from 'react-native-toast-notifications';
// import ErrorIcon from 'react-native-vector-icons/MaterialIcons';

interface Props {
  option: string | undefined;
  countryCode: string | boolean | undefined;
  setCountryCode: any;
}

const handleSendCode = async (values: any) => {
  console.log('handlesendCode', values);
};

const ForgetEmailAddress = ({option, countryCode, setCountryCode}: Props) => {
  const phoneInput = useRef<PhoneInput>(null);
  const navigation = useNavigation<any>();
  const [isError, setError] = useState<string | undefined>('');
  const dispatch = useDispatch<Dispatch<UnknownAction>>();
  const [loading, setLoading] = useState<boolean>(false);
  const toast: ToastType = useToast();

  const handleSubmit = async (values: ForgetEmailAddressSchema) => {
    console.log('~email adrees values :', values);

    await sendOtpToEmail(
      values.emailOrPhone,
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
          email: values.emailOrPhone,
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
        // setError(error.message);
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
        validationSchema={validationForgetEmailSchema}>
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
            <CustomInput
              placeholder="Email Address"
              value={values.emailOrPhone}
              onChangeText={handleChange('emailOrPhone')}
              secureTextEntry={false}
              // isError={isError}
              icon="at"
              editable={true}
              error={errors?.emailOrPhone}
              touched={touched.emailOrPhone}
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

export default ForgetEmailAddress;

const styles = StyleSheet.create({
  error: {
    fontSize: size.s,
    color: themeColors.red,
    marginTop: 5,
    textAlign: 'center',
  },
});
