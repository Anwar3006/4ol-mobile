import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {themeColors} from '../../theme/colors';
import messaging from '@react-native-firebase/messaging';
import {SCREENS} from '../../constants/screens';
import {fonts} from '../../theme/fonts';
import {getUserProfile, login} from '../../services/auth';
import {useToast} from 'react-native-toast-notifications';
import {useDispatch} from 'react-redux';
import {isBiometricUser, setUserData} from '../../store/slices/User';
import DeviceCountry from 'react-native-device-country';
import TouchID from 'react-native-touch-id';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PhoneNumberComponent from '../../components/auth/PhoneNumberComponent';
import EmailAddressComponent from '../../components/auth/EmailAdress';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {NavigationStackParams} from '../../interfaces';
import {Dispatch, UnknownAction} from '@reduxjs/toolkit';
import {verticalScale} from '../../utils/metrics';
import {notificationListeners} from '../../utils/notificationServiceHelper';
import {size} from '../../theme/fontStyle';

const LoginScreen = () => {
  const dispatch = useDispatch<Dispatch<UnknownAction>>();
  const navigation = useNavigation<NavigationProp<NavigationStackParams>>();

  const toast = useToast();
  const phoneInput = useRef<any>(null);
  const [option, setOption] = useState('email');
  const [loading, setLoading] = useState(false);
  // const [error, setError] = useState<string | undefined>();

  const [error, setError] = useState<any>();
  const [countryCode, setCountryCode] = useState<any>();
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const value = await AsyncStorage.getItem('biometricEnabled');
        setIsBiometricEnabled(value ? JSON.parse(value) : false);
      } catch (error) {
        console.error('Failed to load settings', error);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    const fetchCountryCode = async () => {
      try {
        const result = await DeviceCountry.getCountryCode();
        setCountryCode(result?.code?.toUpperCase() || 'GH');
      } catch (e) {
        setCountryCode('GH');
        console.log('Error while getting country', e);
      }
    };

    fetchCountryCode(); // Call the async function inside useEffect
  }, []);

  const optionalConfigObject = {
    title: 'Please Authenticate', // Android
    imageColor: themeColors.primary, // Android
    imageErrorColor: '#ff0000', // Android
    sensorDescription: 'Touch the sensor', // Android
    sensorErrorDescription: 'Authentication Failed', // Android
    cancelText: 'Cancel', // Android
    fallbackLabel: 'Show Passcode', // iOS (if empty, then label is hidden)
    unifiedErrors: false, // use unified error messages (default false)
    passcodeFallback: false, // iOS - allows the device to fall back to using the passcode, if faceid/touch is not available. this does not mean that if touchid/faceid fails the first few times it will revert to passcode, rather that if the former are not enrolled, then it will use the passcode.
  };

  const handleLoginWithTouchId = async () => {
    const userId = await AsyncStorage.getItem('user_id');

    const getFcmToken = async () => {
      try {
        const token = await messaging().getToken();
        console.log('FCM Token:', token);
        return token; // Token ko return karna
      } catch (error) {
        console.log('Error retrieving FCM token:', error);
        return null; // Agar error ho toh null return karna
      }
    };

    // const authStatus = await messaging().requestPermission();
    // const enabled =
    //   authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    //   authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    //

    const fcm_token = await getFcmToken();
    console.log('~ fcm token in Login TouchId:', fcm_token);
    // notificationListeners();
    // if (fcm_token) {

    TouchID.authenticate('', optionalConfigObject)
      .then((success: any) => {
        if (userId) {
          getUserProfile(
            fcm_token,
            userId,
            () => setLoading(true),
            async (successData: any) => {
              dispatch(isBiometricUser(false));

              console.log('~ SUCCESS_DATA :', successData);
              await AsyncStorage.setItem('isLoggedIn', JSON.stringify(true));
              await AsyncStorage.setItem(
                'isAuthenticated',
                JSON.stringify(true),
              );

              dispatch(setUserData(successData));
              setLoading(false);
              navigation.navigate('BottomNavigation');
            },
            (error: any) => {
              console.log('Error while fetching user:', error);
              setLoading(false);
            },
          );
        }
      })
      .catch((error: any) => {
        setError(
          'Biometric authentication is not available or has not been set up on this device.',
        );
        console.log('errorBioMetric', error);
      });
    // }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text style={styles.title}>4 Our Life</Text>
        <Text style={styles.subTitle}>
          Healthcare Simplified, Longevity Amplified
        </Text>
        <Text style={styles.description}>Login with:</Text>
        <View style={styles.optionContainer}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              option === 'email' && styles.optionButtonSelected,
            ]}
            onPress={() => {
              setOption('email');
            }}>
            <Text
              style={[
                styles.optionButtonText,
                option === 'email' && styles.optionButtonTextSelected,
              ]}>
              Email Address
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionButton,
              option === 'phone' && styles.optionButtonSelected,
            ]}
            onPress={() => {
              setOption('phone');
            }}>
            <Text
              style={[
                styles.optionButtonText,
                option === 'phone' && styles.optionButtonTextSelected,
              ]}>
              Phone Number
            </Text>
          </TouchableOpacity>
        </View>

        {option === 'email' ? (
          <EmailAddressComponent
            option={option}
            countryCode={countryCode}
            setLoading={setLoading}
            loading={loading}
            setCountryCode={setCountryCode}
          />
        ) : (
          <PhoneNumberComponent
            countryCode={countryCode}
            setCountryCode={setCountryCode}
            setLoading={setLoading}
            phoneInput={phoneInput}
            loading={loading}
          />
        )}

        {!isBiometricEnabled && (
          <TouchableOpacity>
            <Text style={styles.termsAndConditions}>
              By proceeding, you are agreeing with our Terms and Conditions
            </Text>
          </TouchableOpacity>
        )}

        <View style={{width: '100%', margin: 20}}>
          {isBiometricEnabled && (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 10,
              }}>
              <TouchableOpacity onPress={handleLoginWithTouchId}>
                <Icon
                  disabled={loading}
                  name={'fingerprint'}
                  size={42}
                  color={themeColors.primary}
                  style={{
                    borderWidth: 1,
                    padding: 5,
                    borderRadius: 10,
                    borderColor: themeColors.darkGray,
                  }}
                />
              </TouchableOpacity>

              <Text
                style={{
                  fontSize: size.s,
                  marginTop: 10,
                  color: themeColors.darkGray,
                }}>
                Login with biometrics
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgot}>Forgot Password?</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: themeColors.white,
  },
  title: {
    fontSize: size.xxxlg,
    color: themeColors.primary,
    textAlign: 'center',
    fontFamily: fonts.QuincyCFBold,
  },
  subTitle: {
    fontSize: size.xlg,
    color: themeColors.primary,
    marginBottom: verticalScale(20),

    textAlign: 'center',
    fontFamily: fonts.QuincyCFBold,
  },
  description: {
    fontSize: size.md,
    color: themeColors.black,
    fontFamily: fonts.OpenSansRegular,
    textAlign: 'center',
    marginBottom: verticalScale(20),
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: verticalScale(40),
  },
  optionButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: themeColors.primary,
    borderRadius: 5,
  },
  optionButtonSelected: {
    backgroundColor: themeColors.primary,
  },
  optionButtonText: {
    fontSize: size.md,
    color: themeColors.primary,
  },
  optionButtonTextSelected: {
    color: themeColors.white,
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
  termsAndConditions: {
    fontSize: size.sl,
    margin: 5,
    fontFamily: fonts.OpenSansBold,
    textAlign: 'center',
    width: 270,
    textDecorationLine: 'underline',
    color: themeColors.black,
  },
  forgot: {
    fontFamily: fonts.OpenSansMedium,
    color: themeColors.red,
    fontSize: size.sl,
  },
  other: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  text: {
    color: themeColors.black,
    fontSize: size.md,
    fontFamily: fonts.OpenSansBold,
  },
  error: {
    fontSize: size.s,
    color: themeColors.red,
    textAlign: 'center',
  },
});

export default LoginScreen;
