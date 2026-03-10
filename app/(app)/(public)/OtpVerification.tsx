import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import {themeColors} from '../../../src/theme/colors';
import {size} from '../../../src/theme/fontStyle';
import {fonts} from '../../../src/theme/fonts';
import CustomButton from '../../../src/components/common/CustomButton';
import {
  sendOtpToEmail,
  signInWithPhoneNumber,
  verifyOtpSentToEmail,
} from '../../../src/services/auth';
import {useToast} from 'react-native-toast-notifications';
import {verifyOtp} from '../../../src/services/otpService';
import {useLocalSearchParams, useRouter} from 'expo-router';

const OTPVerificationScreen = () => {
  const toast = useToast();
  const router = useRouter();
  const params = useLocalSearchParams();
  const phone = params.phone as string | undefined;
  const email = params.email as string | undefined;
  const forgot = params.forgot === 'true';

  const otpLength = 6;
  const [otp, setOtp] = useState<string[]>(Array(otpLength).fill(''));
  const inputRefs = useRef<TextInput[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>();

  const handleChangeText = (text: string, index: number) => {
    let newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text.length && index < otp.length - 1) {
      inputRefs.current[index + 1].focus();
    }
    if (text.length === 0 && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResendOTP = () => {
    if (phone?.trim()) {
      signInWithPhoneNumber(
        phone?.trim(),
        forgot,
        () => {},
        (successData: any) => {
          toast.show('OTP sent successfully', { type: 'success', placement: 'top'});
        },
        (error: any) => {
          toast.show(error.message, { type: 'danger', placement: 'top'});
        },
      );
    }
    if (email?.trim()) {
      sendOtpToEmail(
        email?.trim(),
        () => {},
        (successData: any) => {
          toast.show('OTP sent successfully', { type: 'success', placement: 'top'});
        },
        (error: any) => {
          toast.show(error.message, { type: 'danger', placement: 'top'});
        },
      );
    }
  };

  const handleVerify = async () => {
    setError('');
    if (otp.join('').length < otpLength) return;

    Keyboard.dismiss();

    if (phone?.trim()) {
      await verifyOtp(
        phone?.trim(),
        otp.join(''),
        () => setLoading(true),
        (successData: any) => {
          setError('');
          setLoading(false);
          setOtp(Array(otpLength).fill(''));
          toast.show('OTP verified successfully', { type: 'success', placement: 'top'});
          
          if (forgot) {
            router.push({ pathname: '/(app)/(public)/ResetPassword', params: { phoneOrEmail: phone?.trim() } });
          } else {
            router.push({ pathname: '/(app)/(public)/SignUp', params: { phone: phone?.trim() } });
          }
        },
        (error: any) => {
          setLoading(false);
          setError(error.message);
          toast.show(error.message, { type: 'danger', placement: 'top'});
        },
      );
    }

    if (email?.trim()) {
      verifyOtpSentToEmail(
        email?.trim(),
        otp.join(''),
        () => setLoading(true),
        (successData: any) => {
          setError('');
          setLoading(false);
          setOtp(Array(otpLength).fill(''));
          toast.show('OTP verified successfully', { type: 'success', placement: 'top'});
          if (forgot) {
            router.push({ pathname: '/(app)/(public)/ResetPassword', params: { phoneOrEmail: email?.trim() } });
          }
        },
        (error: any) => {
          setLoading(false);
          toast.show(error.message, { type: 'danger', placement: 'top'});
        },
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled">
            <View style={styles.container}>
              <Icon
                name="email"
                size={70}
                color={themeColors.primary}
                style={styles.icon}
              />
              <Text style={styles.title}>OTP Verification</Text>
              <Text style={styles.description}>
                Enter OTP sent to {phone || email}
              </Text>
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    value={digit}
                    onChangeText={text => handleChangeText(text, index)}
                    style={styles.otpInput}
                    keyboardType="numeric"
                    maxLength={1}
                    ref={ref => (inputRefs.current[index] = ref as TextInput)}
                  />
                ))}
              </View>
              <View style={styles.resendSection}>
                <TouchableOpacity
                  onPress={handleResendOTP}
                  style={styles.resendContainer}>
                  <Text style={styles.resendText}>
                    Don't receive the OTP?{' '}
                    <Text style={styles.resendButton}>Resend OTP</Text>
                  </Text>
                </TouchableOpacity>
                {error && <Text style={styles.error}>{error}</Text>}
              </View>
              <CustomButton
                text={'Verify'}
                onPress={handleVerify}
                loading={loading}
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: size.xlg,
    color: themeColors.primary,
    fontFamily: fonts.QuincyCFBold,
    marginBottom: 10,
  },
  description: {
    fontSize: size.md,
    color: 'black',
    fontFamily: fonts.OpenSansRegular,
    textAlign: 'center',
    marginBottom: 30,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 30,
  },
  otpInput: {
    borderBottomWidth: 2,
    borderBottomColor: 'gray',
    fontSize: size.lg,
    textAlign: 'center',
    marginHorizontal: 5,
    color: themeColors.black,
    width: 40,
  },
  resendSection: {
    marginBottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  resendContainer: {
    padding: 10,
  },
  resendText: {
    fontSize: size.md,
    color: themeColors.black,
    fontFamily: fonts.OpenSansRegular,
  },
  resendButton: {
    color: themeColors.primary,
    fontWeight: 'bold',
  },
  error: {
    fontSize: size.s,
    color: themeColors.red,
    marginTop: 5,
    textAlign: 'center',
  },
});

export default OTPVerificationScreen;
