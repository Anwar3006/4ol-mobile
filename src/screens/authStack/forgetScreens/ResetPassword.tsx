import React, {useState} from 'react';
import {View, Text, StyleSheet, StatusBar} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {themeColors} from '../../../theme/colors';
import {size} from '../../../theme/fontStyle';
import {fonts} from '../../../theme/fonts';
import CustomInput from '../../../components/common/CustomInput';
import CustomButton from '../../../components/common/CustomButton';
import {SCREENS} from '../../../constants/screens';
import {resetPassword} from '../../../services/auth';
import {useToast} from 'react-native-toast-notifications';
import {useNavigation} from '@react-navigation/native';
import {NavigationStackParams} from '../../../interfaces/index';

type ResetPasswordScreenProps = {
  route?: {
    params: {
      phoneOrEmail: string;
    };
  };
};

const ResetPasswordScreen = ({route}: ResetPasswordScreenProps) => {
  const {phoneOrEmail} = route?.params || {};
  const navigation =
    useNavigation<NativeStackNavigationProp<NavigationStackParams>>();

  const toast = useToast();
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>();
  const [errors, setErrors] = useState({
    newPin: '',
    confirmPin: '',
  });

  const handleResetPassword = () => {
    setErrors({
      newPin: '',
      confirmPin: '',
    });
    if (newPin?.trim()?.length == 0) {
      setErrors((prev: any) => {
        return {
          ...prev,
          newPin: 'Password is required',
        };
      });
    }
    if (newPin?.trim() && newPin?.trim()?.length < 8) {
      setErrors((prev: any) => {
        return {
          ...prev,
          newPin: 'Password must be at least 8 characters long',
        };
      });
    }
    if (confirmPin.trim()?.length == 0) {
      setErrors((prev: any) => {
        return {
          ...prev,
          confirmPin: 'Confirm Password is required',
        };
      });
    }
    if (
      newPin?.trim() &&
      confirmPin?.trim() &&
      newPin?.trim() != confirmPin?.trim()
    ) {
      setErrors((prev: any) => {
        return {
          ...prev,
          confirmPin: 'Passwords do not match',
        };
      });
    }
    if (
      newPin.trim()?.length == 0 ||
      confirmPin?.trim()?.length == 0 ||
      (newPin.trim() &&
        confirmPin?.trim() &&
        newPin.trim() != confirmPin?.trim()) ||
      (newPin?.trim() && newPin?.trim()?.length < 8)
    ) {
      return;
    }

    resetPassword(
      newPin?.trim(),
      //@ts-ignore
      phoneOrEmail,
      () => {
        setLoading(true);
      },
      (successData: any) => {
        setError('');
        setLoading(false);
        toast.show('Password reset successfully', {
          type: 'success',
          placement: 'top',
          duration: 4000,
          animationType: 'slide-in',
        });
        navigation.replace('GetStarted');
      },
      (error: any) => {
        setLoading(false);
        console.log('Error while reset password:', error);
        // setError(error.message);
        toast.show(error.message, {
          type: 'danger',
          placement: 'top',
          duration: 4000,
          animationType: 'slide-in',
        });
      },
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Icon
        name="lock-reset"
        size={70}
        color={themeColors.primary}
        style={styles.icon}
      />
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.description}>Enter your new password</Text>
      <CustomInput
        editable={true}
        placeholder={'Password'}
        value={newPin}
        onChangeText={(text: any) => setNewPin(text)}
        secureTextEntry={true}
        icon="lock"
        error={errors?.newPin}
      />
      <CustomInput
        editable={true}
        placeholder={'Confirm Pass Code'}
        value={confirmPin}
        onChangeText={(text: any) => setConfirmPin(text)}
        secureTextEntry={true}
        icon="lock"
        error={errors?.confirmPin}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <View style={{width: '100%', marginTop: 20}}>
        <CustomButton
          text={'Reset Password'}
          onPress={handleResetPassword}
          loading={loading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.white,
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
    color: themeColors.black,
    fontFamily: fonts.OpenSansRegular,
    textAlign: 'center',
    marginBottom: 20,
  },
  error: {
    fontSize: size.s,
    color: themeColors.red,
    textAlign: 'center',
  },
});

export default ResetPasswordScreen;
