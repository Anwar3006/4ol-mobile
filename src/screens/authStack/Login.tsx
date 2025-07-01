import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
  Touchable,
  Image,
  KeyboardAvoidingView,
  Platform,
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
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
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
  const [showTerms, setShowTerms] = useState(false);

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
            //@ts-ignore
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

  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const ReusableModal = ({visible, onClose, title, children}: any) => {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={onClose}>
                <Icon name="times" size={20} color={themeColors.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.termsScrollView}>{children}</ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      <View style={styles.container}>
        <ScrollView
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {/* <Text style={styles.title}>4 Our Life</Text>
        <Text style={styles.subTitle}>
          Healthcare Simplified, Longevity Amplified
        </Text> */}
          <View style={styles.logoView}>
            <Image
              source={require('../../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            {/* <Text style={styles.title}>4 OUR LIFE</Text> */}
          </View>
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
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
                paddingHorizontal: 20,
                width: '100%',
              }}>
              <Text
                style={{
                  fontSize: 14,
                  color: '#000',
                  fontFamily: 'OpenSans-Regular',
                }}>
                By proceeding, you are agreeing with our{' '}
              </Text>
              <TouchableOpacity onPress={() => setShowTerms(true)}>
                <Text
                  style={{
                    fontSize: 14,
                    color: '#000',
                    fontFamily: 'OpenSans-Bold',
                    textDecorationLine: 'underline',
                  }}>
                  Terms & Conditions
                </Text>
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: 14,
                  color: '#000',
                  fontFamily: 'OpenSans-Regular',
                }}>
                {' and '}
              </Text>
              <TouchableOpacity onPress={() => setShowPrivacyPolicy(true)}>
                <Text
                  style={{
                    fontSize: 14,
                    color: '#000',
                    fontFamily: 'OpenSans-Bold',
                    textDecorationLine: 'underline',
                  }}>
                  Privacy Policy
                </Text>
              </TouchableOpacity>
            </View>
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

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgot}>Forgot Password?</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Terms and Conditions Modal */}
        <ReusableModal
          visible={showTerms}
          onClose={() => setShowTerms(false)}
          title="Terms of Service">
          <Text style={styles.termsTitle}>4 Our Life - Terms of Service</Text>
          <Text style={styles.termsDate}>Last Updated: 26th May 2025</Text>

          <Text style={styles.termsSectionTitle}>1. Introduction</Text>
          <Text style={styles.termsText}>
            Welcome to 4 Our Life ("the App"), a healthcare application operated
            by 4th Pay Ltd. ("we," "us," or "our"), a company registered in
            Ghana. These Terms of Service ("Terms") govern your access to and
            use of our mobile application, website, and services.
          </Text>
          <Text style={styles.termsText}>
            By downloading, accessing, or using our App, you agree to be bound
            by these Terms. If you do not agree to these Terms, please do not
            use our App.
          </Text>

          <Text style={styles.termsSectionTitle}>
            2. Compliance with Regulations
          </Text>
          <Text style={styles.termsText}>
            4 Our Life operates in compliance with:
          </Text>
          <Text style={styles.termsBullet}>
            • The Data Protection Act, 2012 (Act 843)
          </Text>
          <Text style={styles.termsBullet}>
            • The Electronic Transactions Act, 2008 (Act 772)
          </Text>
          <Text style={styles.termsBullet}>
            • The Health Professions Regulatory Bodies Act, 2013 (Act 857)
          </Text>
          <Text style={styles.termsBullet}>
            • The Ghana Health Service and Teaching Hospitals Act, 2016 (Act
            919)
          </Text>
          <Text style={styles.termsBullet}>
            • The Mental Health Act, 2012 (Act 846)
          </Text>
          <Text style={styles.termsBullet}>
            • The Traditional Medicine Practice Act, 2000 (Act 575)
          </Text>
          <Text style={styles.termsBullet}>
            • The Food and Drugs Authority Act, 1992 (P.N.D.C.L. 305B)
          </Text>
          <Text style={styles.termsBullet}>
            • All applicable Ghana Health Service Guidelines and Notices
          </Text>

          <Text style={styles.termsSectionTitle}>3. Eligibility</Text>
          <Text style={styles.termsText}>To use 4 Our Life, you must:</Text>
          <Text style={styles.termsBullet}>
            • Be at least 18 years old, or have parental/guardian consent if you
            are between 13 - 17 years old
          </Text>
          <Text style={styles.termsBullet}>
            • Be a resident of Ghana or have valid identification recognized by
            Ghanaian authorities
          </Text>
          <Text style={styles.termsBullet}>
            • Possess a valid mobile phone number or email address
          </Text>
          <Text style={styles.termsBullet}>
            • Provide accurate and complete information during registration
          </Text>
          <Text style={styles.termsBullet}>
            • Not be restricted from using healthcare services under Ghanaian
            law
          </Text>

          <Text style={styles.termsSectionTitle}>
            4. Account Registration and Security
          </Text>
          <Text style={styles.termsSubSectionTitle}>4.1 Registration</Text>
          <Text style={styles.termsText}>
            To use our App, you may register for an account by providing:
          </Text>
          <Text style={styles.termsBullet}>• Your full name</Text>
          <Text style={styles.termsBullet}>
            • Valid mobile phone number or email address
          </Text>
          <Text style={styles.termsBullet}>• Password</Text>
          <Text style={styles.termsBullet}>
            • Basic health information (optional)
          </Text>
          <Text style={styles.termsBullet}>
            • Additional information as required for specific features
          </Text>

          <Text style={styles.termsSubSectionTitle}>4.2 Account Security</Text>
          <Text style={styles.termsText}>You are responsible for:</Text>
          <Text style={styles.termsBullet}>
            • Maintaining the confidentiality of your account credentials
          </Text>
          <Text style={styles.termsBullet}>
            • All activities that occur under your account
          </Text>
          <Text style={styles.termsBullet}>
            • Setting strong passwords and updating them regularly
          </Text>
          <Text style={styles.termsBullet}>
            • Enabling additional security features when available
          </Text>
          <Text style={styles.termsBullet}>
            • Notifying us immediately of any unauthorized use of your account
          </Text>

          <Text style={styles.termsSectionTitle}>5. Service Description</Text>
          <Text style={styles.termsText}>
            4 Our Life provides the following services:
          </Text>
          <Text style={styles.termsBullet}>• Healthcare facility locator</Text>
          <Text style={styles.termsBullet}>
            • Health tips and educational content
          </Text>
          <Text style={styles.termsBullet}>
            • Period and ovulation tracking
          </Text>
          <Text style={styles.termsBullet}>• Medication reminders</Text>
          <Text style={styles.termsBullet}>
            • Disease and symptom information
          </Text>
          <Text style={styles.termsBullet}>
            • Healthy living recommendations
          </Text>

          <Text style={styles.termsSectionTitle}>6. Medical Disclaimer</Text>
          <Text style={styles.termsSubSectionTitle}>
            6.1 Not a Substitute for Professional Medical Advice
          </Text>
          <Text style={styles.termsText}>
            The App is designed to provide general health information and is not
            intended to:
          </Text>
          <Text style={styles.termsBullet}>
            • Replace professional medical advice, diagnosis, or treatment
          </Text>
          <Text style={styles.termsBullet}>
            • Serve as a substitute for consulting with qualified healthcare
            professionals
          </Text>
          <Text style={styles.termsBullet}>
            • Provide emergency medical services
          </Text>

          <Text style={styles.termsSubSectionTitle}>
            6.2 Emergency Situations
          </Text>
          <Text style={styles.termsText}>
            In case of a medical emergency, you should:
          </Text>
          <Text style={styles.termsBullet}>
            • Call the Ghana Ambulance Service at 193
          </Text>
          <Text style={styles.termsBullet}>
            • Contact your local emergency services
          </Text>
          <Text style={styles.termsBullet}>
            • Go to the nearest hospital emergency department
          </Text>

          <Text style={styles.termsSubSectionTitle}>
            6.3 Consult Healthcare Professionals
          </Text>
          <Text style={styles.termsText}>
            Always consult qualified healthcare professionals regarding:
          </Text>
          <Text style={styles.termsBullet}>• Specific medical conditions</Text>
          <Text style={styles.termsBullet}>• Treatment options</Text>
          <Text style={styles.termsBullet}>• Medication decisions</Text>
          <Text style={styles.termsBullet}>
            • Any health concerns or questions
          </Text>

          <Text style={styles.termsSectionTitle}>7. User Content</Text>
          <Text style={styles.termsSubSectionTitle}>
            7.1 User-Generated Content
          </Text>
          <Text style={styles.termsText}>
            You may have the opportunity to submit content to the App,
            including:
          </Text>
          <Text style={styles.termsBullet}>• Health information</Text>
          <Text style={styles.termsBullet}>• Comments</Text>
          <Text style={styles.termsBullet}>• Feedback</Text>
          <Text style={styles.termsBullet}>
            • Reviews of healthcare facilities
          </Text>
          <Text style={styles.termsBullet}>• Forum posts</Text>

          <Text style={styles.termsSubSectionTitle}>
            7.2 Content Restrictions
          </Text>
          <Text style={styles.termsText}>
            You agree not to submit content that:
          </Text>
          <Text style={styles.termsBullet}>
            • Is false, misleading, or inaccurate
          </Text>
          <Text style={styles.termsBullet}>
            • Infringes on intellectual property rights
          </Text>
          <Text style={styles.termsBullet}>
            • Violates any law or regulation
          </Text>
          <Text style={styles.termsBullet}>
            • Is defamatory, abusive, or harmful
          </Text>
          <Text style={styles.termsBullet}>
            • Contains personal information of others without consent
          </Text>
          <Text style={styles.termsBullet}>
            • Promotes discrimination or violence
          </Text>
          <Text style={styles.termsBullet}>
            • Contains malware or harmful code
          </Text>

          <Text style={styles.termsSubSectionTitle}>
            7.3 Our Rights Regarding User Content
          </Text>
          <Text style={styles.termsText}>We reserve the right to:</Text>
          <Text style={styles.termsBullet}>
            • Review, monitor, and remove any user content
          </Text>
          <Text style={styles.termsBullet}>
            • Take appropriate action against users who violate these Terms
          </Text>
          <Text style={styles.termsBullet}>
            • Use user content as described in our Privacy Policy
          </Text>

          <Text style={styles.termsSectionTitle}>8. Intellectual Property</Text>
          <Text style={styles.termsSubSectionTitle}>
            8.1 Our Intellectual Property
          </Text>
          <Text style={styles.termsText}>
            All content, features, and functionality of the App, including but
            not limited to text, graphics, logos, icons, images, audio clips,
            digital downloads, and software, are the exclusive property of 4 Our
            Life (4th Pay Ltd.) or its licensors and are protected by Ghanaian
            and international copyright, trademark, and other intellectual
            property laws.
          </Text>

          <Text style={styles.termsSubSectionTitle}>8.2 Limited License</Text>
          <Text style={styles.termsText}>
            We grant you a limited, non-exclusive, non-transferable, revocable
            license to use the App for personal, non-commercial purposes in
            accordance with these Terms.
          </Text>

          <Text style={styles.termsSubSectionTitle}>8.3 Restrictions</Text>
          <Text style={styles.termsText}>You may not:</Text>
          <Text style={styles.termsBullet}>
            • Modify, copy, distribute, transmit, display, perform, reproduce,
            publish, license, create derivative works from, transfer, or sell
            any information obtained from the App
          </Text>
          <Text style={styles.termsBullet}>
            • Decompile, reverse engineer, disassemble, or otherwise attempt to
            derive source code from the App
          </Text>
          <Text style={styles.termsBullet}>
            • Remove any copyright, trademark, or other proprietary notices from
            the App
          </Text>
          <Text style={styles.termsBullet}>
            • Use the App for any commercial purpose without our prior written
            consent
          </Text>

          <Text style={styles.termsSectionTitle}>
            9. Health Data and Privacy
          </Text>
          <Text style={styles.termsSubSectionTitle}>
            9.1 Collection and Use of Health Data
          </Text>
          <Text style={styles.termsText}>
            We collect and process health-related data in accordance with our
            Privacy Policy and the Data Protection Act, 2012 (Act 843). By using
            our App, you consent to such processing.
          </Text>

          <Text style={styles.termsSubSectionTitle}>
            9.2 Sensitive Health Information
          </Text>
          <Text style={styles.termsText}>
            We implement additional safeguards for sensitive health information,
            including:
          </Text>
          <Text style={styles.termsBullet}>• Enhanced security measures</Text>
          <Text style={styles.termsBullet}>• Restricted access controls</Text>
          <Text style={styles.termsBullet}>
            • De-identification where appropriate
          </Text>
          <Text style={styles.termsBullet}>
            • Compliance with health data regulations
          </Text>

          <Text style={styles.termsSubSectionTitle}>9.3 Data Sharing</Text>
          <Text style={styles.termsText}>
            We may share your health information:
          </Text>
          <Text style={styles.termsBullet}>
            • With healthcare providers you designate
          </Text>
          <Text style={styles.termsBullet}>
            • With third-party service providers who assist in providing the App
          </Text>
          <Text style={styles.termsBullet}>
            • With regulatory authorities as required by law
          </Text>
          <Text style={styles.termsBullet}>
            • In anonymized or aggregated form for research and improvement
            purposes
          </Text>

          <Text style={styles.termsSectionTitle}>
            10. User Responsibilities
          </Text>
          <Text style={styles.termsText}>You agree to:</Text>
          <Text style={styles.termsBullet}>
            • Provide accurate and complete information
          </Text>
          <Text style={styles.termsBullet}>
            • Use the App for lawful purposes only
          </Text>
          <Text style={styles.termsBullet}>
            • Not engage in fraudulent activities
          </Text>
          <Text style={styles.termsBullet}>
            • Not attempt to circumvent any security measures
          </Text>
          <Text style={styles.termsBullet}>
            • Not use the App in any way that could damage, disable, or impair
            the App
          </Text>
          <Text style={styles.termsBullet}>
            • Keep your health information up to date
          </Text>
          <Text style={styles.termsBullet}>
            • Use the App's features responsibly
          </Text>

          <Text style={styles.termsSectionTitle}>
            11. Third-Party Links and Services
          </Text>
          <Text style={styles.termsSubSectionTitle}>
            11.1 Third-Party Links
          </Text>
          <Text style={styles.termsText}>
            The App may contain links to third-party websites or services. We
            are not responsible for:
          </Text>
          <Text style={styles.termsBullet}>
            • The content or practices of third-party websites
          </Text>
          <Text style={styles.termsBullet}>
            • The accuracy of third-party information
          </Text>
          <Text style={styles.termsBullet}>
            • Any damages resulting from your use of third-party websites
          </Text>

          <Text style={styles.termsSubSectionTitle}>
            11.2 Third-Party Services
          </Text>
          <Text style={styles.termsText}>
            The App may integrate with third-party services, including:
          </Text>
          <Text style={styles.termsBullet}>
            • Healthcare facility databases
          </Text>
          <Text style={styles.termsBullet}>
            • Medical information resources
          </Text>
          <Text style={styles.termsBullet}>• Map and location services</Text>
          <Text style={styles.termsBullet}>
            • Payment processors (if applicable)
          </Text>
          <Text style={styles.termsText}>
            Your use of such third-party services is subject to their respective
            terms and privacy policies.
          </Text>

          <Text style={styles.termsSectionTitle}>
            12. Limitation of Liability
          </Text>
          <Text style={styles.termsSubSectionTitle}>
            12.1 Disclaimer of Warranties
          </Text>
          <Text style={styles.termsText}>
            To the maximum extent permitted by law, the App is provided "as is"
            and "as available" without warranties of any kind, either express or
            implied, including but not limited to warranties of merchantability,
            fitness for a particular purpose, or non-infringement.
          </Text>

          <Text style={styles.termsSubSectionTitle}>
            12.2 Limitation of Liability
          </Text>
          <Text style={styles.termsText}>
            To the maximum extent permitted by law, 4 Our Life shall not be
            liable for:
          </Text>
          <Text style={styles.termsBullet}>
            • Any indirect, incidental, special, consequential, or punitive
            damages
          </Text>
          <Text style={styles.termsBullet}>
            • Any loss of profits, revenue, data, or business opportunities
          </Text>
          <Text style={styles.termsBullet}>
            • Any damages resulting from unauthorized access to your account
          </Text>
          <Text style={styles.termsBullet}>
            • Any damages resulting from your reliance on information provided
            through the App
          </Text>
          <Text style={styles.termsBullet}>
            • Any damages resulting from events beyond our reasonable control
          </Text>
          <Text style={styles.termsText}>
            Our total liability to you for any claim arising from or related to
            these Terms or the App shall not exceed the amount of fees you paid
            to us during the three (3) months preceding the claim, or GH₵500 if
            you have not paid any fees.
          </Text>

          <Text style={styles.termsSectionTitle}>13. Indemnification</Text>
          <Text style={styles.termsText}>
            You agree to indemnify, defend, and hold harmless 4 Our Life and its
            officers, directors, employees, agents, and affiliates from and
            against any claims, liabilities, damages, losses, costs, expenses,
            or fees (including reasonable attorneys' fees) arising from:
          </Text>
          <Text style={styles.termsBullet}>
            • Your violation of these Terms
          </Text>
          <Text style={styles.termsBullet}>
            • Your violation of any law or regulation
          </Text>
          <Text style={styles.termsBullet}>
            • Your violation of any rights of a third party
          </Text>
          <Text style={styles.termsBullet}>• Your user content</Text>
          <Text style={styles.termsBullet}>• Your use of the App</Text>

          <Text style={styles.termsSectionTitle}>14. Dispute Resolution</Text>
          <Text style={styles.termsSubSectionTitle}>14.1 Customer Support</Text>
          <Text style={styles.termsText}>
            If you have any concerns or disputes regarding the App, please
            contact our customer support at life@4ourlife.com or call our
            number: 0303 955 648.
          </Text>

          <Text style={styles.termsSubSectionTitle}>
            14.2 Formal Dispute Resolution
          </Text>
          <Text style={styles.termsText}>
            Any dispute arising out of or in connection with these Terms shall
            be resolved through:
          </Text>
          <Text style={styles.termsBullet}>
            • Negotiation: We will attempt to resolve any disputes amicably.
          </Text>
          <Text style={styles.termsBullet}>
            • Mediation: If negotiation fails, disputes may be submitted to
            mediation under the rules of the Ghana ADR Hub.
          </Text>
          <Text style={styles.termsBullet}>
            • Arbitration: If mediation fails, disputes shall be finally
            resolved by arbitration in accordance with the Alternative Dispute
            Resolution Act, 2010 (Act 798).
          </Text>

          <Text style={styles.termsSectionTitle}>15. Termination</Text>
          <Text style={styles.termsSubSectionTitle}>
            15.1 Termination by You
          </Text>
          <Text style={styles.termsText}>
            You may terminate your account at any time by following the
            instructions in the App or by contacting customer support.
          </Text>

          <Text style={styles.termsSubSectionTitle}>
            15.2 Termination by Us
          </Text>
          <Text style={styles.termsText}>
            We may terminate or suspend your account immediately, without prior
            notice or liability, for any reason, including if:
          </Text>
          <Text style={styles.termsBullet}>• You breach these Terms</Text>
          <Text style={styles.termsBullet}>
            • You provide inaccurate, outdated, or incomplete information
          </Text>
          <Text style={styles.termsBullet}>
            • We suspect fraudulent activity
          </Text>
          <Text style={styles.termsBullet}>
            • We are required to do so by law or regulatory authority
          </Text>
          <Text style={styles.termsBullet}>
            • We cease operations in your jurisdiction
          </Text>

          <Text style={styles.termsSubSectionTitle}>
            15.3 Effects of Termination
          </Text>
          <Text style={styles.termsText}>Upon termination:</Text>
          <Text style={styles.termsBullet}>
            • You will no longer have access to your account
          </Text>
          <Text style={styles.termsBullet}>
            • Your user content may remain on the App unless you specifically
            request its removal
          </Text>
          <Text style={styles.termsBullet}>
            • You remain liable for all obligations related to your account
            prior to termination
          </Text>
          <Text style={styles.termsText}>
            Sections of these Terms that, by their nature, should survive
            termination shall survive termination
          </Text>

          <Text style={styles.termsSectionTitle}>16. Changes to Terms</Text>
          <Text style={styles.termsText}>
            We may modify these Terms at any time. If we make material changes,
            we will provide notice through the App or by other means. Your
            continued use of the App after such notice constitutes your
            acceptance of the modified Terms.
          </Text>

          <Text style={styles.termsSectionTitle}>17. Governing Law</Text>
          <Text style={styles.termsText}>
            These Terms shall be governed by and construed in accordance with
            the laws of Ghana, without regard to its conflict of law provisions.
          </Text>

          <Text style={styles.termsSectionTitle}>18. Severability</Text>
          <Text style={styles.termsText}>
            If any provision of these Terms is found to be unenforceable or
            invalid, that provision will be limited or eliminated to the minimum
            extent necessary so that these Terms will otherwise remain in full
            force and effect.
          </Text>

          <Text style={styles.termsSectionTitle}>19. Entire Agreement</Text>
          <Text style={styles.termsText}>
            These Terms, together with our Privacy Policy and any other
            agreements expressly incorporated by reference herein, constitute
            the entire agreement between you and 4 Our Life concerning the App.
          </Text>

          <Text style={styles.termsSectionTitle}>20. Contact Information</Text>
          <Text style={styles.termsText}>
            If you have any questions about these Terms, please contact us at:
          </Text>
          <Text style={styles.termsText}>4th Pay Ltd.</Text>
          <Text style={styles.termsText}>Kwashieman Ofankor Rd.,</Text>
          <Text style={styles.termsText}>Sowutuom - Accra, Ghana</Text>
          <Text style={styles.termsText}>Email: life@4ourlife.com</Text>
          <Text style={styles.termsText}>Phone: +233 303 955 648</Text>

          <View style={{height: 30}} />
        </ReusableModal>

        <ReusableModal
          visible={showPrivacyPolicy}
          onClose={() => setShowPrivacyPolicy(false)}
          title="Privacy Policy">
          <Text style={styles.termsTitle}>4 Our Life - Privacy Policy</Text>
          <Text style={styles.termsDate}>Last Updated: 26th May 2025</Text>

          <Text style={styles.termsSectionTitle}>1. Introduction</Text>
          <Text style={styles.termsText}>
            This Privacy Policy explains how we collect, use, and protect your
            information when you use our App.
          </Text>

          <Text style={styles.termsSectionTitle}>
            2. Information We Collect
          </Text>
          <Text style={styles.termsText}>
            We may collect and process the following types of information:
          </Text>
          <Text style={styles.termsBullet}>
            • Personal identification information (name, email, phone number)
          </Text>
          <Text style={styles.termsBullet}>
            • Demographic information (age, gender, location)
          </Text>
          <Text style={styles.termsBullet}>
            • Health information (medical history, symptoms, medications)
          </Text>
          <Text style={styles.termsBullet}>
            • Usage data (app usage patterns, features used, time spent)
          </Text>
          <Text style={styles.termsBullet}>
            • Device information (device type, operating system, unique device
            identifiers)
          </Text>

          <Text style={styles.termsSectionTitle}>
            3. How We Use Your Information
          </Text>
          <Text style={styles.termsText}>
            We use the information we collect for various purposes, including:
          </Text>
          <Text style={styles.termsBullet}>
            • Providing and maintaining our App
          </Text>
          <Text style={styles.termsBullet}>
            • Improving, personalizing, and expanding our App
          </Text>
          <Text style={styles.termsBullet}>
            • Understanding and analyzing how you use our App
          </Text>
          <Text style={styles.termsBullet}>
            • Communicating with you, either directly or through one of our
            partners, including for customer service, to provide you with
            updates and other information relating to the App, and for marketing
            and promotional purposes
          </Text>
          <Text style={styles.termsBullet}>
            • Processing your transactions and managing your orders
          </Text>
          <Text style={styles.termsBullet}>
            • Sending you emails and notifications
          </Text>
          <Text style={styles.termsBullet}>• Finding and preventing fraud</Text>
          <Text style={styles.termsBullet}>
            • Complying with legal obligations
          </Text>

          <Text style={styles.termsSectionTitle}>
            4. How We Protect Your Information
          </Text>
          <Text style={styles.termsText}>
            We take the security of your information seriously and use
            reasonable measures to protect it, including:
          </Text>
          <Text style={styles.termsBullet}>• Encryption of sensitive data</Text>
          <Text style={styles.termsBullet}>• Secure storage solutions</Text>
          <Text style={styles.termsBullet}>
            • Access controls and authentication measures
          </Text>
          <Text style={styles.termsBullet}>
            • Regular security assessments and audits
          </Text>
          <Text style={styles.termsBullet}>
            • Employee training on data protection and security
          </Text>

          <Text style={styles.termsSectionTitle}>5. Your Rights</Text>
          <Text style={styles.termsText}>You have the right to:</Text>
          <Text style={styles.termsBullet}>
            • Access, update, or delete your personal information
          </Text>
          <Text style={styles.termsBullet}>
            • Withdraw your consent for data processing
          </Text>
          <Text style={styles.termsBullet}>
            • Object to the processing of your data
          </Text>
          <Text style={styles.termsBullet}>
            • Request the restriction of processing your data
          </Text>
          <Text style={styles.termsBullet}>• Data portability</Text>
          <Text style={styles.termsBullet}>
            • Lodge a complaint with a supervisory authority
          </Text>

          <Text style={styles.termsSectionTitle}>
            6. Changes to This Privacy Policy
          </Text>
          <Text style={styles.termsText}>
            We may update our Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page.
          </Text>

          <Text style={styles.termsSectionTitle}>7. Contact Us</Text>
          <Text style={styles.termsText}>
            If you have any questions about this Privacy Policy, please contact
            us:
          </Text>
          <Text style={styles.termsText}>4th Pay Ltd.</Text>
          <Text style={styles.termsText}>Kwashieman Ofankor Rd.,</Text>
          <Text style={styles.termsText}>Sowutuom - Accra, Ghana</Text>
          <Text style={styles.termsText}>Email: life@4ourlife.com</Text>
          <Text style={styles.termsText}>Phone: +233 303 955 648</Text>

          <View style={{height: 30}} />
        </ReusableModal>
      </View>
    </KeyboardAvoidingView>
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
    color: themeColors.white,
    textAlign: 'center',
    fontFamily: fonts.OpenSansLight,
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
    marginBottom: verticalScale(35),
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

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: themeColors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: size.lg,
    fontFamily: fonts.QuincyCFBold,
    color: themeColors.primary,
  },
  termsScrollView: {
    flex: 1,
  },
  termsTitle: {
    fontSize: size.lg,
    fontFamily: fonts.QuincyCFBold,
    color: themeColors.primary,
    marginBottom: 10,
  },
  termsDate: {
    opacity: 0.6,
    fontStyle: 'italic',
    fontSize: size.s,
    fontWeight: 'bold',
    color: themeColors.darkGray,
  },
  termsSectionTitle: {
    fontSize: size.md,
    fontFamily: fonts.QuincyCFBold,
    color: themeColors.primary,
    marginTop: 15,
  },
  termsSubSectionTitle: {
    fontSize: size.md,
    fontFamily: fonts.QuincyCFBold,
    color: themeColors.primary,
    marginTop: 10,
  },
  termsText: {
    fontSize: size.s,
    color: themeColors.black,
    fontFamily: fonts.OpenSansRegular,
    marginBottom: 10,
  },
  termsBullet: {
    fontSize: size.s,
    color: themeColors.black,
    fontFamily: fonts.OpenSansRegular,
    marginLeft: 10,
    marginBottom: 5,
    lineHeight: 20,
  },
  logoView: {
    height: verticalScale(200),
    width: horizontalScale(270),
    // backgroundColor: themeColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
    marginBottom: moderateScale(7),
    marginTop: verticalScale(15),
  },
  logo: {
    width: '80%',
    height: '80%',
  },
});

export default LoginScreen;
