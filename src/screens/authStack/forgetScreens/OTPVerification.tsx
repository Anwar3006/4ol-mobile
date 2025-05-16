import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {themeColors} from '../../../theme/colors';
import {size} from '../../../theme/fontStyle';
import {fonts} from '../../../theme/fonts';
import CustomButton from '../../../components/common/CustomButton';
import {SCREENS} from '../../../constants/screens';
import {
  sendOtpToEmail,
  signInWithPhoneNumber,
  verifyOtp,
  verifyOtpSentToEmail,
} from '../../../services/auth';
import {useToast} from 'react-native-toast-notifications';

type OTPVerificationScreenProps = {
  navigation?: NativeStackNavigationProp<any>; // Replace `any` with your specific stack params type if available
  route?: {
    params: {
      phone?: string;
      email?: string;
      forgot?: boolean;
    };
  };
};

const OTPVerificationScreen: React.FC<OTPVerificationScreenProps> = ({
  navigation,
  route,
}) => {
  const toast = useToast();
  const {phone, email, forgot} = route?.params || {};
  const otpLength = 6;
  const [otp, setOtp] = useState<string[]>(Array(otpLength).fill(''));
  const inputRefs = useRef<TextInput[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>();

  const handleChangeText = (text: string, index: number) => {
    let newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Move to next input if current input is filled and not the last one
    if (text.length && index < otp.length - 1) {
      inputRefs.current[index + 1].focus();
    }
    // Move to previous input if current input is empty and not the first one
    if (text.length === 0 && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResendOTP = () => {
    if (phone?.trim()) {
      signInWithPhoneNumber(
        phone?.trim(),
        //@ts-ignore
        forgot,
        () => {},
        (successData: any) => {
          toast.show('OTP sent successfully', {
            type: 'success',
            placement: 'top',
            duration: 4000,
            animationType: 'slide-in',
          });
        },
        (error: any) => {
          console.log('Error sending OTP:', error);
          toast.show(error.message, {
            type: 'danger',
            placement: 'top',
            duration: 4000,
            animationType: 'slide-in',
          });
        },
      );
    }

    if (email?.trim()) {
      sendOtpToEmail(
        email?.trim(),
        () => {},
        (successData: any) => {
          toast.show('OTP sent successfully', {
            type: 'success',
            placement: 'top',
            duration: 4000,
            animationType: 'slide-in',
          });
        },
        (error: any) => {
          console.log('Error sending OTP:', error);
          toast.show(error.message, {
            type: 'danger',
            placement: 'top',
            duration: 4000,
            animationType: 'slide-in',
          });
        },
      );
    }
  };

  const handleVerify = () => {
    setError('');
    if (otp.join('').length < otpLength) {
      return;
    }
    if (phone?.trim()) {
      verifyOtp(
        phone?.trim(),
        otp.join(''),
        () => {
          setLoading(true);
        },
        (successData: any) => {
          setError('');
          setLoading(false);
          setOtp(Array(otpLength).fill(''));
          toast.show('OTP verified successfully', {
            type: 'success',
            placement: 'top',
            duration: 4000,
            animationType: 'slide-in',
          });
          if (forgot) {
            return navigation?.navigate(SCREENS.RESETPASSWORD, {
              phoneOrEmail: phone?.trim(),
            });
          }
          return navigation?.navigate(SCREENS.SIGNUP, {phone: phone?.trim()});
        },
        (error: any) => {
          setLoading(false);
          console.log('Error verifying OTP:', error);
          setError(error.message);
        },
      );
    }
    if (email?.trim()) {
      verifyOtpSentToEmail(
        email?.trim(),
        otp.join(''),
        () => {
          setLoading(true);
        },
        (successData: any) => {
          setError('');
          setLoading(false);
          setOtp(Array(otpLength).fill(''));
          toast.show('OTP verified successfully', {
            type: 'success',
            placement: 'top',
            duration: 4000,
            animationType: 'slide-in',
          });
          if (forgot) {
            return navigation?.navigate(SCREENS.RESETPASSWORD, {
              phoneOrEmail: email?.trim(),
            });
          }
        },
        (error: any) => {
          setLoading(false);
          toast.show(error.message, {
            type: 'danger',
            placement: 'top',
            duration: 4000,
            animationType: 'slide-in',
          });
          console.log('Error verifying OTP:', error);
          // setError(error.message);
        },
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* <StatusBar hidden /> */}
      <Icon
        name="email-receive-outline"
        size={70}
        color={themeColors.primary}
        style={styles.icon}
      />
      <Text style={styles.title}>OTP Verification</Text>
      <Text style={styles.description}>Enter OTP sent to {phone || email}</Text>
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
      <View style={{marginBottom: 40}}>
        <TouchableOpacity
          onPress={handleResendOTP}
          style={styles.resendContainer}>
          <Text style={styles.resendText}>
            Don’t receive the OTP?{' '}
            <Text style={styles.resendButton}>Resend OTP</Text>
          </Text>
        </TouchableOpacity>
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
      <CustomButton text={'Verify'} onPress={handleVerify} loading={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
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
  },
  resendContainer: {},
  resendText: {
    fontSize: size.md,
    color: themeColors.black,
    fontFamily: fonts.OpenSansRegular,
  },
  resendButton: {
    color: themeColors.primary,
    fontWeight: 'bold',
  },
  verifyButton: {
    width: '100%',
    backgroundColor: themeColors.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: 'white',
    fontSize: size.md,
    fontFamily: fonts.QuincyCFBold,
  },
  error: {
    fontSize: size.s,
    color: themeColors.red,
    marginTop: 5,
    textAlign: 'center',
  },
});

export default OTPVerificationScreen;
