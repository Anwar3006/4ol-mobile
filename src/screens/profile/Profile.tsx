import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Dimensions,
  Platform,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {themeColors} from '../../theme/colors';
import {fonts} from '../../theme/fonts';
import {useNavigation} from '@react-navigation/native';
import RawBottomSheet from '../../components/shared-components/RawBottomSheet';
import {useDispatch, useSelector} from 'react-redux';
import {user} from '../../store/selectors';
import ImageCropPicker from 'react-native-image-crop-picker';
import {
  ensureCameraPermission,
  ensurePhotoLibraryPermission,
} from '../../utils/permissions';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import CameraIcon from 'react-native-vector-icons/FontAwesome5';
import CustomInput from '../../components/common/CustomInput';
import {Formik} from 'formik';
import {useToast} from 'react-native-toast-notifications';
import {ScrollView} from 'react-native-gesture-handler';
import {size} from '../../theme/fontStyle';
import DateTimePicker from '@react-native-community/datetimepicker';
import {validationUpdateProfile} from '../../validation';
import {Picker} from '@react-native-picker/picker';
// import {updateProfileSchema} from '../../interfaces/index';
import CustomPhoneNumber from '../../components/reusable_component/CustomPhoneInput';
import PhoneInput from 'react-native-phone-number-input';
import ProfileCustomButton from '../../components/reusable_component/ProfileCustomButton';
import {updateProfile, uploadAvatar} from '../../services/profile';
import {setUserData, setAvatarImage} from '../../store/slices/User';
import {Dispatch, UnknownAction} from '@reduxjs/toolkit';
import {SUPABASE_URL} from '@env';
import DeviceCountry from 'react-native-device-country';
import moment from 'moment';
import {logActivity} from '../../services/activityLogsService';
import {regionNames} from '../../constants/Regions';
import * as MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import dayjs from 'dayjs';
import {Dropdown} from 'react-native-element-dropdown';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Profile = () => {
  const navigation = useNavigation();
  const userData: any = useSelector(user);

  console.log('user Data~', userData);
  const refRBSheet = useRef<any>();
  const dispatch = useDispatch<Dispatch<UnknownAction>>();
  const toast = useToast();
  const {saveimageUrl} = useSelector((state: any) => state.userData);

  const [imagePath, setimagePath] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isDisabledField, setIsDisableField] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countryCode, setCountryCode] = useState<any>();
  const phoneInput = useRef<PhoneInput>(null);

  console.log('~ image-path :', imagePath);

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

  const openGallery = async () => {
    try {
      const allowed = await ensurePhotoLibraryPermission();
      if (!allowed) {
        return;
      }

      const galleryImage = await ImageCropPicker.openPicker({
        width: 300,
        height: 400,
        cropping: true,
      });
      setimagePath(galleryImage.path);
      handleimageUpload(galleryImage.path);
      refRBSheet.current.close();
    } catch (error) {
      if (error?.message === 'User cancelled image selection') {
        return;
      }
      console.log('openGallery error', error);
    }
  };

  const openCamera = async () => {
    try {
      const allowed = await ensureCameraPermission();
      if (!allowed) {
        return;
      }

      const cameraImage = await ImageCropPicker.openCamera({
        width: 300,
        height: 400,
        cropping: true,
      });
      setimagePath(cameraImage.path);
      handleimageUpload(cameraImage.path);
      refRBSheet.current.close();
    } catch (error) {
      if (error?.message === 'User cancelled image selection') {
        return;
      }
      console.log('openCamera error', error);
    }
  };

  console.log('~user', userData);
  const handleimageUpload = async path => {
    await uploadAvatar(
      path,
      userData?.id,
      () => {
        // setIsLoading(true);
      },
      (successData: any) => {
        setIsLoading(false);
        dispatch(setUserData({...userData, avatar_url: successData}));
        // setIsDisableField(false);
        toast.show('Avatar uploaded', {
          type: 'success',
          placement: 'top',
          duration: 4000,
          animationType: 'slide-in',
        });
        console.log('~ Successdata', successData);
      },
      (error: any) => {
        console.log('Error uploading Avatar:', error);
        toast.show('Something went wrong', {
          type: 'danger',
          placement: 'top',
          duration: 4000,
          animationType: 'slide-in',
        });
        // setIsLoading(false);
      },
    );
  };

  const handleSubmit = async (values: any) => {
    await updateProfile(
      values,
      {userid: userData.id},
      () => {
        setIsLoading(true);
      },
      (successData: any) => {
        setIsLoading(false);
        dispatch(setUserData(successData));
        setIsDisableField(false);
        toast.show('User profile Updated', {
          type: 'success',
          placement: 'top',
          duration: 4000,
          animationType: 'slide-in',
        });
        console.log('~ Successdata', successData);
        logActivity(
          {
            user_id: userData?.id || '',
            user_name: `${userData?.first_name || ''} ${
              userData?.last_name || ''
            }`,
            type: 'authentication',
            description: 'User updated their profile information in the app',
            reference: 'profile_update',
            reference_id: userData?.id || '',
          },
          () => {
            console.log('Logging profile update activity...');
          },
          data => {
            console.log('Profile update activity logged successfully:', data);
          },
          error => {
            console.error('Error logging profile update activity:', error);
          },
        );
      },
      (error: any) => {
        console.log('Error updating profile:', error);
        toast.show('Check Network Connnection', {
          type: 'danger',
          placement: 'top',
          duration: 4000,
          animationType: 'slide-in',
        });
        setIsLoading(false);
      },
    );
  };

  // Complete URL banaiye
  const imageUrl = `${SUPABASE_URL}/storage/v1/object/public/${saveimageUrl}`;
  console.log('image_Url====', imageUrl);

  return (
    <Formik
      initialValues={{
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        sex: userData.sex || '',
        region: userData.region || '',
        dob: moment(userData?.dob, 'YYYY-MM-DD').format('DD/MM/YYYY') || '',
        email: userData.email || '',
        emailOrPhone: userData.phone_number || '',
      }}
      onSubmit={handleSubmit}
      validationSchema={validationUpdateProfile}>
      {({
        errors,
        values,
        handleChange,
        handleSubmit,
        touched,
        setFieldValue,
        resetForm,
      }) => (
        <KeyboardAvoidingView behavior="padding">
          <ScrollView
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '100%',
            }}>
            <View style={{alignItems: 'center', paddingTop: verticalScale(10)}}>
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 200,
                }}>
                {/* <Image
                  source={{
                    uri: `${SUPABASE_URL}/storage/v1/object/public/${saveimageUrl}`,
                  }}
                  style={{
                    width: 200,
                    height: 200,
                    borderRadius: 200,
                    resizeMode: 'cover',
                    borderWidth: 3,
                    borderColor: 'grey',
                    backgroundColor: 'orange',
                  }}
                /> */}

                {imagePath ? (
                  <>
                    <Image
                      source={{uri: imagePath}}
                      style={{
                        width: 150,
                        height: 150,
                        borderRadius: 75,
                        resizeMode: 'cover',
                        borderWidth: 3,
                        borderColor: 'grey',
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => refRBSheet.current.open()}
                      activeOpacity={0.7}
                      style={{
                        width: horizontalScale(40),
                        height: verticalScale(40),
                        backgroundColor: themeColors.white,
                        borderRadius: 50,
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'absolute',
                        right: 20,
                        bottom: -8,
                      }}>
                      <CameraIcon
                        name="camera"
                        size={20}
                        color={'rgba(0,0,0,0.9)'}
                      />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Image
                      source={
                        userData?.avatar_url
                          ? {uri: userData?.avatar_url}
                          : require('../../../assets/images/avatar.jpg')
                      }
                      style={{
                        width: 150,
                        height: 150,
                        borderRadius: 75,
                        resizeMode: 'cover',
                        borderWidth: 3,
                        borderColor: 'grey',
                      }}
                    />

                    <TouchableOpacity
                      onPress={() => refRBSheet.current.open()}
                      activeOpacity={0.7}
                      style={{
                        width: horizontalScale(40),
                        height: verticalScale(40),
                        backgroundColor: themeColors.white,
                        borderRadius: 50,
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'absolute',
                        right: 20,
                        bottom: -8,
                      }}>
                      <CameraIcon
                        name="camera"
                        size={20}
                        color={'rgba(0,0,0,0.9)'}
                      />
                    </TouchableOpacity>
                  </>
                )}
              </View>

              {/* RBsheet */}

              <RawBottomSheet
                refRB={refRBSheet}
                openGallery={openGallery}
                openCamera={openCamera}
              />
            </View>

            <View style={{paddingTop: verticalScale(40)}}>
              <CustomInput
                placeholder={'First Name'}
                value={values.first_name}
                onChangeText={handleChange('first_name')}
                secureTextEntry={false}
                //  isError={isError}
                error={errors?.first_name as string}
                touched={touched.first_name as boolean}
                editable={isDisabledField}
                // icon=''
                // isError=''
                // focus={isDisabledField}
              />

              <CustomInput
                placeholder={'Last Name'}
                value={values.last_name}
                onChangeText={handleChange('last_name')}
                secureTextEntry={false}
                // isError={isError}
                error={errors?.last_name as string}
                touched={touched.last_name as boolean}
                editable={isDisabledField}

                // focus={isDisabledField}
              />

              <View style={styles.row}>
                <View style={{flex: 1, marginRight: horizontalScale(5)}}>
                  <View
                    style={[
                      styles.pickerContainer,
                      {
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: isDisabledField
                          ? themeColors.white
                          : '#FFFFFF',
                      },
                    ]}>
                    <MaterialCommunityIcons
                      name="gender-male-female"
                      size={24}
                      color={'gray'}
                      style={{paddingHorizontal: 10}}
                    />
                    <Dropdown
                      data={[
                        {label: 'Male', value: 'Male'},
                        {label: 'Female', value: 'Female'},
                      ]}
                      disable={!isDisabledField}
                      labelField="label"
                      valueField="value"
                      placeholder={isDisabledField ? 'Select sex' : ''}
                      value={isDisabledField ? values.sex : userData.sex}
                      onChange={item => {
                        if (item.value !== 'Sex') {
                          handleChange('sex')(item.value);
                        }
                      }}
                      style={[
                        styles.dropdown,
                        {
                          backgroundColor: isDisabledField
                            ? themeColors.white
                            : '#FFFFFF',
                        },
                      ]}
                      placeholderStyle={{color: themeColors.black}}
                      selectedTextStyle={{color: themeColors.black}}
                      containerStyle={{borderRadius: 20, overflow: 'hidden'}}
                    />
                  </View>

                  {errors.sex && <Text style={styles.error}>{errors.sex}</Text>}
                </View>

                <View style={{flex: 1, marginLeft: horizontalScale(5)}}>
                  <View style={styles.datePickerContainer}>
                    <TouchableOpacity
                      disabled={!isDisabledField}
                      onPress={() => {
                        setShowDatePicker(true);
                      }}
                      style={[
                        styles.datePickerButton,
                        {
                          backgroundColor: isDisabledField
                            ? themeColors.white
                            : '#FFFFFF',
                        },
                      ]}>
                      <Text style={styles.datePickerText}>
                        {values.dob || 'Date of birth'}
                      </Text>
                    </TouchableOpacity>

                    {showDatePicker &&
                      (console.log('~ Inside ShowdatePicker :', new Date()),
                      (
                        <DateTimePicker
                          value={new Date()}
                          mode="date"
                          display="default"
                          onChange={(event: any, date?: Date) => {
                            console.log('Dob-values', values);
                            setShowDatePicker(false);
                            // setShowDatePicker(false);
                            if (date) {
                              // Pass the date object instead of a string
                              setFieldValue(
                                'dob',
                                dayjs(date).format('DD/MM/YYYY'),
                              );
                            }
                          }}
                        />
                      ))}
                  </View>

                  {touched.dob && typeof errors.dob === 'string' && (
                    <Text style={styles.error}>{errors.dob}</Text>
                  )}
                </View>
              </View>

              <View
                style={{
                  width: horizontalScale(330),
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderRadius: 50,
                  padding: 3,
                  ...Platform.select({
                    ios: {
                      shadowColor: '#000',
                      shadowOffset: {width: 0, height: 2},
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                    },
                    android: {
                      elevation: 2,
                    },
                  }),
                  backgroundColor: !isDisabledField
                    ? '#FFFFFF'
                    : themeColors.white,
                  borderWidth: 1,
                  borderColor: '#C4C4C4',
                  marginBottom: 20,
                  overflow: 'hidden',
                  alignSelf: 'center',
                }}>
                <MaterialIcons.default
                  name="location-on"
                  size={20}
                  color={'gray'}
                  style={{paddingHorizontal: 10}}
                />
                <Dropdown
                  data={regionNames.map(item => ({label: item, value: item}))}
                  disable={!isDisabledField}
                  labelField="label"
                  valueField="value"
                  placeholder={isDisabledField ? 'Select region' : ''}
                  value={values.region}
                  onChange={item => {
                    handleChange('region')(item.value);
                  }}
                  iconStyle={{marginRight: 15}}
                  style={[
                    styles.regionDropdown,
                    {
                      backgroundColor: !isDisabledField
                        ? '#FFFFFF'
                        : themeColors.white,
                    },
                  ]}
                  placeholderStyle={{color: themeColors.black}}
                  selectedTextStyle={{color: themeColors.black}}
                  containerStyle={{
                    overflow: 'hidden',
                    borderRadius: 20,
                  }}
                />
              </View>

              <CustomInput
                placeholder={'Email'}
                value={values.email}
                onChangeText={handleChange('email')}
                secureTextEntry={false}
                icon="at"
                error={errors?.email}
                touched={touched.email}
                editable={false}
              />

              {/* <CustomPhoneNumber
                value={values.emailOrPhone}
                onchangeState={handleChange('emailOrPhone')}
                setCountryCode={setCountryCode}
                phoneInput={phoneInput}
                countrycode={countryCode}
                error={errors?.emailOrPhone}
                touched={touched.emailOrPhone}
                editable={false}
                placeHolder={'phone number'}
              /> */}

              <CustomInput
                placeholder={'Phone Number'}
                value={values.emailOrPhone}
                onChangeText={handleChange('emailOrPhone')}
                secureTextEntry={false}
                //  isError={isError}
                error={errors?.emailOrPhone}
                touched={touched.emailOrPhone}
                editable={false}
                icon="phone"
                // isError=''
                // focus={isDisabledField}
              />

              {/* // stateError={isError} */}

              {/*
              <CustomInput
                placeholder={'Password'}
                value={values.password}
                onChangeText={handleChange('password')}
                secureTextEntry={false}
                icon="at"
                error={errors?.password}
                touched={touched.password}
              />

              <CustomInput
                placeholder={'Confirm Password'}
                value={values.confirm_password}
                onChangeText={handleChange('confirm_password')}
                secureTextEntry={false}
                icon="at"
                error={errors?.confirm_password}
                touched={touched.confirm_password}
              /> */}

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  paddingBottom: verticalScale(30),
                }}>
                {isDisabledField && (
                  <ProfileCustomButton
                    value={'Cancel'}
                    onPress={() => {
                      setIsDisableField(false);
                      resetForm();
                    }}
                    extraStyle={{
                      // backgroundColor: 'orange',
                      borderWidth: 1,
                      borderRadius: 100,
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingHorizontal: horizontalScale(20),
                      width: horizontalScale(100),
                      paddingVertical: verticalScale(10),
                    }}
                  />
                )}

                <ProfileCustomButton
                  value={isDisabledField ? 'Update' : 'Edit'}
                  isLoading={isLoading}
                  extraStyle={{
                    backgroundColor: themeColors.primary,
                    borderRadius: 100,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: horizontalScale(20),
                    width: isDisabledField
                      ? horizontalScale(130)
                      : horizontalScale(330),
                    paddingVertical: verticalScale(18),
                  }}
                  onPress={() => {
                    setIsDisableField(true);
                    if (isDisabledField) handleSubmit();
                  }}
                />
              </View>

              {/* <CustomButton
                text={'Sign Up'}
                onPress={handleSubmit}
                loading={loading}
                extraStyle={{
                  width: horizontalScale(330),
                  marginTop: 30,
                  // backgroundColor: 'red',
                }}
              /> */}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        // <View style={styles.container}>
      )}
    </Formik>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    backgroundColor: themeColors.white,
  },
  title: {
    fontSize: size.xxlg,
    color: themeColors.black,
    fontFamily: fonts.QuincyCFBold,
  },
  subTitle: {
    fontSize: size.md,
    marginBottom: 30,
    color: themeColors.black,
    fontFamily: fonts.OpenSansRegular,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(20),
    width: horizontalScale(330),
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#C4C4C4',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
    borderRadius: moderateScale(12),
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
    alignSelf: 'center',
    // color: 'red',
  },
  datePickerContainer: {
    // width: '100%',
  },
  datePickerButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
    borderRadius: moderateScale(12),
    borderColor: '#C4C4C4',
    borderWidth: 1,
    paddingHorizontal: horizontalScale(10),
  },
  datePickerText: {
    fontSize: size.md,
    color: themeColors.black,
  },
  error: {
    color: 'red',
    fontWeight: 'bold',
    // paddingHorizontal: 4,
    marginTop: verticalScale(5),
    fontFamily: fonts.OpenSansRegular,
    textAlign: 'center',
  },
  profileContainer: {
    flex: 1,
    backgroundColor: themeColors.lightGray,
  },
  backText: {
    color: themeColors.black,
    fontFamily: fonts.OpenSansRegular,
    paddingHorizontal: 15,
    fontSize: 18,
  },
  // Add to the existing styles
  dropdown: {
    height: 50,
    width: '100%',
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  regionDropdown: {
    flex: 1,
    height: 45,
    paddingLeft: 5,
    borderRadius: 50,
  },
});
