import React, {useEffect, useRef, useState} from 'react';
import {View, Text, StyleSheet, StatusBar, ScrollView} from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {themeColors} from '../../theme/colors';
import CustomButton from '../../components/common/CustomButton';
import {size} from '../../theme/fontStyle';
import {fonts} from '../../theme/fonts';
import {SCREENS} from '../../constants/screens';
import {signInWithPhoneNumber} from '../../services/auth';
import {useToast} from 'react-native-toast-notifications';
import {getCountry} from '../../utils/helpers';
import DeviceCountry from 'react-native-device-country';
import {KeyboardAvoidingView} from 'react-native';
import {Formik, FormikConfig} from 'formik';
import {NavigationStackParams, PhoneNumberSchema} from '../../interfaces';
import CustomPhoneNumber from '../../components/reusable_component/CustomPhoneInput';
import {validationPhoneNumber} from '../../validation';
import {NavigationProp, useNavigation} from '@react-navigation/native';

type OtpAuthVerification = {
  OtpVerification: {
    phone: string | undefined;
  };
};

const PhoneNumberVerification = () => {
  const toast = useToast();
  const phoneInput = useRef<any>(null);
  const navigation = useNavigation<NavigationProp<OtpAuthVerification>>();
  // const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>();
  const [countryCode, setCountryCode] = useState<any>();

  useEffect(() => {
    DeviceCountry.getCountryCode()
      .then(result => {
        setCountryCode(result?.code?.toUpperCase() || 'GH');
      })
      .catch(e => {
        setCountryCode('GH');
        console.log('Error while getting country', e);
      });
  }, []);

  const handleSubmit = async (values: PhoneNumberSchema) => {
    const checkValid = phoneInput.current?.isValidNumber(values.phoneNumber);
    if (!checkValid) return setError('Invalid phone number');

    await signInWithPhoneNumber(
      values.phoneNumber,
      false,
      () => {
        setLoading(true);
        console.log('🚀 ~ handleSubmit ~ values:', values);
      },

      (successData: any) => {
        setError('');
        setLoading(false);

        toast.show('OTP sent successfully', {
          type: 'success',
          placement: 'top',
          duration: 4000,
          animationType: 'slide-in',
        });
        navigation.navigate('OtpVerification', {phone: values.phoneNumber});
      },

      (error: any) => {
        setError(error.message);
        toast.show(error.message, {
          type: 'danger',
          placement: 'top',
          duration: 4000,
          animationType: 'slide-in',
        });
        setLoading(false);
        console.log('Error sending OTP:', error);
      },
    );
  };

  return (
    <Formik
      initialValues={{
        phoneNumber: '',
      }}
      onSubmit={handleSubmit}
      validationSchema={validationPhoneNumber}>
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
        console.log('🚀 ~ errors:', errors),
        (
          <>
            <View style={styles.container}>
              <StatusBar hidden />
              <KeyboardAvoidingView behavior="padding">
                <ScrollView contentContainerStyle={styles.contentContainer}>
                  <MaterialCommunityIcons
                    name="email-send-outline"
                    size={70}
                    color={themeColors.primary}
                    style={styles.icon}
                  />

                  <Text style={styles.title}>Verify Your Phone Number</Text>
                  <Text style={styles.description}>
                    We will send you an{' '}
                    <Text style={styles.boldText}>One Time Password</Text> on
                    this phone number
                  </Text>

                  <View style={{margin: 20, marginBottom: 40, width: '100%'}}>
                    {!countryCode ? (
                      <Text
                        style={{
                          textAlign: 'center',
                          margin: 0,
                          padding: 0,
                          fontFamily: fonts.OpenSansRegular,
                          color: themeColors.black,
                        }}>
                        Fetching your country code... Please wait!
                      </Text>
                    ) : (
                      <>
                        <CustomPhoneNumber
                          value={values.phoneNumber}
                          onchangeState={handleChange('phoneNumber')}
                          setCountryCode={setCountryCode}
                          phoneInput={phoneInput}
                          countrycode={countryCode}
                          error={errors?.phoneNumber}
                          stateError={error}
                          editable={true}
                          touched={touched.phoneNumber}
                        />
                      </>
                    )}
                  </View>

                  <CustomButton
                    text={'Send OTP'}
                    onPress={handleSubmit}
                    loading={loading}
                  />
                </ScrollView>
              </KeyboardAvoidingView>
            </View>
          </>
        )
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.white,
    padding: 20,
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
  phoneInputContainer: {
    width: '99%',
    // margin: 20,
    // marginBottom: 40,
    backgroundColor: themeColors.white,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 2,
    borderColor: themeColors.gray,
  },
  textContainer: {
    backgroundColor: themeColors.white,
    borderRadius: 50,
  },
  textInput: {
    fontSize: size.md,
    padding: 0,
  },
  codeText: {
    fontSize: size.md,
  },
  flagButton: {
    borderRadius: 5,
  },
  error: {
    fontSize: size.s,
    color: themeColors.red,
    marginTop: 5,
    textAlign: 'center',
  },
});

export default PhoneNumberVerification;
