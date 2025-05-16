import React, {
  ChangeEvent,
  MutableRefObject,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
} from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {themeColors} from '../../theme/colors';
import CustomButton from '../../components/common/CustomButton';
import {size} from '../../theme/fontStyle';
import {fonts} from '../../theme/fonts';
import {Formik} from 'formik';
import {EmailAddressSchema} from '../../interfaces';
import CustomPhoneNumber from '../../components/reusable_component/CustomPhoneInput';
import {
  validationLoginSchemaPhoneNumber,
  validationPhoneNumber,
} from '../../validation/index';
import CustomInput from '../../components/common/CustomInput'; // Correct path
import {verticalScale} from '../../utils/metrics';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {getUserProfile, login} from '../../services/auth';
import {setUserData} from '../../store/slices/User';
import {useDispatch} from 'react-redux';
import {Dispatch, UnknownAction} from '@reduxjs/toolkit';
import {SCREENS} from '../../constants/screens';
import {ToastType, useToast} from 'react-native-toast-notifications';
import messaging from '@react-native-firebase/messaging';

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
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<Dispatch<UnknownAction>>();
  const toast: ToastType = useToast();

  const handleSubmit = async (values: any) => {
    const checkValid = phoneInput.current?.isValidNumber(values.emailOrPhone);
    if (!checkValid) return setError('Invalid Phone Number');

    try {
      // const getFcmToken = async () => {
      //   try {
      //     const token = await messaging().getToken();
      //     console.log('FCM Token:', token);
      //     return token; // Token ko return karna
      //   } catch (error) {
      //     console.log('Error retrieving FCM token:', error);
      //     return null; // Agar error ho toh null return karna
      //   }
      // };

      // const authStatus = await messaging().requestPermission();
      // const enabled =
      //   authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      //   authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      // let token = null;
      // if (enabled) {
      //   token = await getFcmToken();
      // }

      await login(
        values,
        () => {
          setLoading(true);
        },
        async (successData: any) => {
          // setError('');
          setLoading(false);
          dispatch(setUserData(successData));

          console.log('User logged in successfully:', successData);
          toast.show('User logged in successfully', {
            type: 'success',
            placement: 'top',
            duration: 4000,
            animationType: 'slide-in',
          });

          // if (token) {
          //   await getUserProfile(
          //     token,
          //     successData.id, // Assuming userId is part of successData
          //     () => {
          //       setLoading(true);
          //     },
          //     (userProfileData: any) => {
          //       // Yahan aap user profile data ka handle kar sakte hain
          //       console.log('User profile data:', userProfileData);
          //     },
          //     (error: any) => {
          //       console.log('Error while fetching user profile:', error);
          //     },
          //   );
          // }

          navigation?.replace(SCREENS.BOTTOMNAVIGATION);
        },
        (error: any) => {
          setLoading(false);
          toast.show(error.message, {
            type: 'danger',
            placement: 'top',
            duration: 4000,
            animationType: 'slide-in',
          });
          console.log('Error while logging in user:', error.message);
        },
      );
    } catch (error) {
      console.log('Error retrieving user ID from AsyncStorage:', error);
    }

    await login(
      values,
      () => {
        setLoading(true);
      },
      (successData: any) => {
        // setError('');
        setLoading(false);
        dispatch(setUserData(successData));

        console.log('User logged in successfully:', successData);
        toast.show('User logged in successfully', {
          type: 'success',
          placement: 'top',
          duration: 4000,
          animationType: 'slide-in',
        });
        navigation?.replace(SCREENS.BOTTOMNAVIGATION);
      },
      (error: any) => {
        // setError(error.message);
        toast.show(error.message, {
          type: 'danger',
          placement: 'top',
          duration: 4000,
          animationType: 'slide-in',
        });
        // setError('');
        setLoading(false);
        console.log('Error while log in user:', error);
      },
    );
  };

  return (
    <Formik
      initialValues={{
        emailOrPhone: '',
        passcode: '',
      }}
      onSubmit={handleSubmit}
      validationSchema={validationLoginSchemaPhoneNumber}>
      {({
        errors,
        values,
        handleChange,
        handleSubmit,
        touched,
        isSubmitting,
      }) => (
        <>
          {/* <KeyboardAvoidingView behavior="padding"> */}
          <View style={styles.container}>
            <StatusBar hidden />

            <View>
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
                    value={values.emailOrPhone}
                    onchangeState={handleChange('emailOrPhone')}
                    setCountryCode={setCountryCode}
                    phoneInput={phoneInput}
                    countrycode={countryCode}
                    error={errors?.emailOrPhone}
                    touched={touched.emailOrPhone}
                    editable={true}
                    stateError={isError}
                    placeHolder={'Phone Number'}
                  />

                  <CustomInput
                    value={values.passcode}
                    onChangeText={handleChange('passcode')}
                    error={errors?.passcode}
                    placeholder={'Password'}
                    secureTextEntry={true}
                    icon="lock"
                    editable={true}
                    touched={touched.passcode}
                  />

                  <CustomButton
                    text={'Login'}
                    onPress={handleSubmit}
                    loading={loading}
                    extraStyle={{
                      marginTop: verticalScale(20),
                    }}
                  />
                </>
              )}
            </View>
          </View>
          {/* </KeyboardAvoidingView> */}
        </>
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.white,
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

export default PhoneNumberComponent;
