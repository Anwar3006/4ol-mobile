import {StyleSheet} from 'react-native';
import React, {useState} from 'react';
import CustomInput from '../common/CustomInput';
import {Formik} from 'formik';
import CustomButton from '../common/CustomButton';
import {size} from '../../theme/fontStyle';
import {themeColors} from '../../theme/colors';
import {verticalScale} from '../../utils/metrics';
import {getUserProfile, login} from '../../services/auth';
import {setUserData} from '../../store/slices/User';
import {useDispatch} from 'react-redux';
import {Dispatch, UnknownAction} from '@reduxjs/toolkit';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {validationLoginSchema} from '../../validation';
import {useToast} from 'react-native-toast-notifications';
import {NavigationStackParams} from '../../interfaces';
import messaging from '@react-native-firebase/messaging';
// import ErrorIcon from 'react-native-vector-icons/MaterialIcons';

interface Props {
  option: string | undefined;
  countryCode: string | boolean | undefined;
  loading: boolean | undefined;
  setCountryCode: any;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const EmailAddressComponent = ({
  option,
  countryCode,
  loading,
  setCountryCode,
  setLoading,
}: Props) => {
  const toast = useToast();
  const navigation = useNavigation<NavigationProp<NavigationStackParams>>();
  const [isError, setError] = useState<string | undefined>('');
  const dispatch = useDispatch<Dispatch<UnknownAction>>();

  const handleSubmit = async (values: any) => {
    try {
      await login(
        values,
        () => {
          setLoading(true);
        },
        async (successData: any) => {
          setError('');
          setLoading(false);
          dispatch(setUserData(successData));

          console.log('User logged in successfully:', successData);
          toast.show('User logged in successfully', {
            type: 'success',
            placement: 'top',
            duration: 4000,
            animationType: 'slide-in',
          });

          console.log('successData.id :', successData.id);

          navigation.navigate('Home');
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
  };

  return (
    <>
      <Formik
        initialValues={{
          emailOrPhone: '',
          passcode: '',
        }}
        onSubmit={handleSubmit}
        validationSchema={validationLoginSchema}>
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
              isError={isError}
              icon="at"
              error={errors?.emailOrPhone}
              touched={touched.emailOrPhone}
              editable={true}
            />

            <CustomInput
              value={values.passcode}
              onChangeText={handleChange('passcode')}
              error={errors?.passcode}
              placeholder={'Password'}
              secureTextEntry={true}
              touched={touched.passcode}
              isError={isError}
              editable={true}
              icon="lock"
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
      </Formik>
    </>
  );
};

export default EmailAddressComponent;

const styles = StyleSheet.create({
  error: {
    fontSize: size.s,
    color: themeColors.red,
    marginTop: 5,
    textAlign: 'center',
  },
});
