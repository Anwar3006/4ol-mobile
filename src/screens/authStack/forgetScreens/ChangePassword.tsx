import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {themeColors} from '../../../theme/colors';
import {size} from '../../../theme/fontStyle';
import {fonts} from '../../../theme/fonts';
import CustomInput from '../../../components/common/CustomInput';
import CustomButton from '../../../components/common/CustomButton';
import {SCREENS} from '../../../constants/screens';
import {changePassword} from '../../../services/auth';
import {useToast} from 'react-native-toast-notifications';
import {useDispatch, useSelector} from 'react-redux';
import {user} from '../../../store/selectors';
import {setUserData} from '../../../store/slices/User';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {NavigationStackParams} from '../../../interfaces';
import {Formik} from 'formik';
import {Dispatch, UnknownAction} from '@reduxjs/toolkit';
import {validationChangePassword} from '../../../validation';
import {verticalScale} from '../../../utils/metrics';
import {logActivity} from '../../../services/activityLogsService';

// type ChangepasswordProps = {

// };

const ChangePasswordScreen = () => {
  const navigation = useNavigation<NavigationProp<NavigationStackParams>>();
  const dispatch = useDispatch<Dispatch<UnknownAction>>();
  const {height, width} = Dimensions.get('window');
  const userData: any = useSelector(user);
  const toast = useToast();
  // const [oldPassword, setOldPassword] = useState<string>('');
  // const [newPassword, setNewPassword] = useState<string>('');
  // const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState(false);
  // const [error, setError] = useState<any>();
  // const [errors, setErrors] = useState({
  //   oldPassword: '',
  //   newPassword: '',
  //   confirmPassword: '',
  // });

  // const handleChangePassword = () => {
  //   setErrors({
  //     oldPassword: '',
  //     newPassword: '',
  //     confirmPassword: '',
  //   });

  //   // Validate old password
  //   if (oldPassword?.trim()?.length == 0) {
  //     setErrors(prev => ({
  //       ...prev,
  //       oldPassword: 'Old Password is required',
  //     }));
  //   }

  //   // Validate new password
  //   if (newPassword?.trim()?.length == 0) {
  //     setErrors(prev => ({
  //       ...prev,
  //       newPassword: 'New Password is required',
  //     }));
  //   }
  //   if (newPassword?.trim() && newPassword?.trim()?.length < 8) {
  //     setErrors(prev => ({
  //       ...prev,
  //       newPassword: 'Password must be at least 8 characters long',
  //     }));
  //   }

  //   // Validate confirm password
  //   if (confirmPassword.trim()?.length == 0) {
  //     setErrors(prev => ({
  //       ...prev,
  //       confirmPassword: 'Confirm Password is required',
  //     }));
  //   }
  //   if (
  //     newPassword?.trim() &&
  //     confirmPassword?.trim() &&
  //     newPassword?.trim() != confirmPassword?.trim()
  //   ) {
  //     setErrors(prev => ({
  //       ...prev,
  //       confirmPassword: 'Passwords do not match',
  //     }));
  //   }

  //   // Validation check
  //   if (
  //     oldPassword?.trim()?.length == 0 ||
  //     newPassword?.trim()?.length == 0 ||
  //     confirmPassword?.trim()?.length == 0 ||
  //     (newPassword?.trim() &&
  //       confirmPassword?.trim() &&
  //       newPassword?.trim() != confirmPassword?.trim()) ||
  //     (newPassword?.trim() && newPassword?.trim()?.length < 8)
  //   ) {
  //     return;
  //   }

  //   // Call change password function
  //   changePassword(
  //     oldPassword?.trim(),
  //     newPassword?.trim(),
  //     userData?.email, // @ts-ignore
  //     () => {
  //       setLoading(true);
  //     },
  //     (successData: any) => {
  //       dispatch(setUserData(successData));
  //       setError('');
  //       setLoading(false);
  //       toast.show('Password changed successfully', {
  //         type: 'success',
  //         placement: 'top',
  //         duration: 4000,
  //         animationType: 'slide-in',
  //       });
  //       navigation.navigate('Home');
  //     },
  //     (error: any) => {
  //       setLoading(false);
  //       console.log('Error while changing password:', error);
  //       // setError(error.message);
  //       toast.show(error.message, {
  //         type: 'danger',
  //         placement: 'top',
  //         duration: 4000,
  //         animationType: 'slide-in',
  //       });
  //     },
  //   );
  // };

  // {
  //   oldPassword: '',
  //   newPassword: '',
  //   confirmPassword: '',
  // }

  const handleSubmit = async (values: any) => {
    changePassword(
      {...values, email: userData?.email},
      () => {
        setLoading(true);
      },
      (successData: any) => {
        dispatch(setUserData(successData));
        //  setError('');
        setLoading(false);
        toast.show('Password changed successfully', {
          type: 'success',
          placement: 'top',
          duration: 4000,
          animationType: 'slide-in',
        });
        logActivity(
          {
            user_id: userData?.id || '',
            user_name: `${userData?.first_name || ''} ${
              userData?.last_name || ''
            }`,
            type: 'authentication',
            description: 'User changed their password for the app',
            reference: 'password_change',
            reference_id: userData?.id || '',
          },
          () => {
            console.log('Logging password change activity...');
          },
          data => {
            console.log('Password change activity logged successfully:', data);
          },
          error => {
            console.error('Error logging password change activity:', error);
          },
        );
        // Route component will automatically switch to AppNavigation
        // which shows BottomNavigation with Home tab as default
      },
      (error: any) => {
        setLoading(false);
        console.log('Error while changing password:', error);
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
    <>
      <Formik
        initialValues={{
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        }}
        onSubmit={handleSubmit}
        validationSchema={validationChangePassword}>
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
            <View style={styles.container}>
              {/* <KeyboardAvoidingView behavior="padding"> */}
              <ScrollView
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '100%',
                }}>
                <StatusBar hidden />

                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Icon
                    name="lock-reset"
                    size={70}
                    color={themeColors.primary}
                    style={styles.icon}
                  />
                  <Text style={styles.title}>Change Password</Text>
                  <Text style={styles.description}>
                    Your New Password must be different from previously used
                    password
                  </Text>
                </View>

                <CustomInput
                  placeholder="Old Password"
                  value={values.oldPassword}
                  onChangeText={handleChange('oldPassword')}
                  secureTextEntry={true}
                  // isError={isError}
                  icon="lock"
                  error={errors?.oldPassword}
                  touched={touched.oldPassword}
                  editable={true}
                />

                <CustomInput
                  placeholder="New Password"
                  value={values.newPassword}
                  onChangeText={handleChange('newPassword')}
                  secureTextEntry={true}
                  // isError={isError}
                  icon="lock"
                  error={errors?.newPassword}
                  touched={touched.newPassword}
                  editable={true}
                />

                <CustomInput
                  placeholder="Confirm Password"
                  value={values.confirmPassword}
                  onChangeText={handleChange('confirmPassword')}
                  secureTextEntry={true}
                  // isError={isError}
                  icon="lock"
                  error={errors?.confirmPassword}
                  touched={touched.confirmPassword}
                  editable={true}
                />

                <CustomButton
                  text={'Change Password'}
                  onPress={handleSubmit}
                  loading={loading}
                  extraStyle={{
                    marginTop: 20,
                  }}
                />
              </ScrollView>
              {/* </KeyboardAvoidingView> */}
            </View>
          </>
        )}
      </Formik>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.white,
    padding: 20,
    // justifyContent: 'center',
    // alignItems: 'center',
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

export default ChangePasswordScreen;
