import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Image,
  Platform,
  useWindowDimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {Formik} from 'formik';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Theme & Components
import {themeColors} from '../../theme/colors';
import {size} from '../../theme/fontStyle';
import {fonts} from '../../theme/fonts';
import CustomInput from '../../components/common/CustomInput';
import CustomButton from '../../components/common/CustomButton';
import {verticalScale, moderateScale} from '../../utils/metrics';
import {validationBusinessSignUpSchema} from '../../validation';
import CheckboxItem from '../../components/reusable_component/CheckboxItem';
import {BusinessSignUpSchema, NavigationStackParams} from '../../interfaces';
import useGhanaPostGPS from '../../hooks/useGhanaPostGPS';
import {useToast} from 'react-native-toast-notifications';
import {supabase} from '../../../lib/supabase';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {encryptPassword, splitFullName} from '../../utils/helpers';
import moment from 'moment';
import fetchSupabase from '../../utils/fetchSupabase';
import CustomDropdown from '../../components/common/CustomDropDown';
import {
  BusinessTypeOptions,
  BusinessTypesData,
} from '../../constants/business_types';

const BusinessSignUpScreen = () => {
  const {width} = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [fetchingGPSLocation, setFetchingGPSLocation] = useState(false);
  const toast = useToast();
  const navigation = useNavigation<NavigationProp<NavigationStackParams>>();

  const {fetchLocationByGPSAddress} = useGhanaPostGPS();

  const handleGPSLookup = async (gpsCode: string, setFieldValue: any) => {
    if (!gpsCode) {
      toast.show('Please enter a GPS address first', {type: 'warning'});
      return;
    }
    // Logic to call Ghana Post GPS API based on the code entered
    console.log('Fetching details for:', gpsCode);
    setFetchingGPSLocation(true);
    try {
      const data = await fetchLocationByGPSAddress(gpsCode);

      // Validating API response structure based on Ghana Post GPS standards
      if (data?.data?.Table && data.data.Table.length > 0) {
        const location = data.data.Table[0];
        setFieldValue('street', location.Street || 'N/A');
        setFieldValue('post_code', location.PostCode || 'N/A');
        setFieldValue('region', location.Region || '');
        setFieldValue('district', location.District || '');
        setFieldValue('area', location.Area || '');
        toast.show('Location found!', {type: 'success'});
      } else {
        toast.show('Invalid GPS Address. Please check and try again.', {
          type: 'danger',
        });
      }
    } catch (error) {
      console.error('GPS Lookup Error:', error);
      toast.show('Network error while fetching location.', {type: 'danger'});
    } finally {
      setFetchingGPSLocation(false);
    }
  };

  const handleFormSubmit = async (values: BusinessSignUpSchema) => {
    setLoading(true);

    console.log('IBP: ', values);

    try {
      // 1. Sign up the user in Supabase Auth
      const {data: authData, error: authError} = await supabase.auth.signUp({
        email: values.email as string,
        password: values.password as string,
      });

      if (authError) {
        console.error('Auth Error Details:', authError);
        // console.log("Error encountered. Deleting user from Supabase Auth.");
        // await supabase.auth.admin.deleteUser(authData.user?.id as string);
        throw authError;
      }

      if (authData.user) {
        //2. Sign up the user in user_profiles table
        const {first_name, last_name} = splitFullName(
          values.full_name as string,
        );
        const encryptedPassword = encryptPassword(values.password as string);
        const userId = authData.user?.id;
        const userProfileData = {
          id: userId,
          first_name,
          last_name,
          sex: null,
          dob: null,
          phone_number: values.phone_number,
          email: values.email as string,
          password: encryptedPassword,
          created_by: userId,
          updated_by: userId,
          is_created_by_admin_panel: false,
          user_type: 'business_provider',
          is_facility_owner: true,
          role: 'User',
        };
        console.log('User Profile data: ', userProfileData);
        const responseUserProfile = await fetchSupabase(
          'user_profiles',
          userProfileData,
        );
        const dataUserProfile = await responseUserProfile.json();

        if (!responseUserProfile.ok) {
          console.log('REST ERROR:', dataUserProfile);
          // await supabase.auth.admin.deleteUser(authData.user.id);
          throw new Error(dataUserProfile?.message || 'Insert failed');
        }

        // 3. Sign up the user in IBP table
        // const specs = values.item
        //   ? values.item.split(',').map(s => s.trim())
        //   : [];

        const toBeInserted = {
          id: authData.user.id, // Link Auth ID to IBP Table ID
          full_name: values.full_name,
          business_name: values.business_name,
          business_type: values.business_category,
          phone_number: values.phone_number,
          whatsapp_number: values.whatsapp_number || null,
          email_address: values.email,
          gps_address: values.gps_address,
          street: values.street || null,
          region: values.region || null,
          district: values.district || null,
          area: values.area || null,
          post_code: null, // Not in form
          country: 'Ghana', // Default
          item: values.specific_category,
          has_agreed_to_tc: values.has_agreed_to_tc,
          has_agreed_to_pa: values.has_agreed_to_pa,
          password_hash: null, // Managed by Supabase Auth
        };

        // 3.1 Insert the professional details into your 'ibp' table
        const response = await fetchSupabase('ibp', toBeInserted);
        const data = await response.json();
        if (!response.ok) {
          console.log('REST ERROR:', data);
          await supabase.auth.admin.deleteUser(authData.user.id);
          throw new Error(data?.message || 'Insert failed');
        }
        // const {data, error} = await supabase
        //   .from('ibp')
        //   .insert([toBeInserted]) // Ensure the brackets are here!
        //   .select(); // This is equivalent to 'return=representation'

        // if (error) {
        //   console.log('SDK Error Message:', error.message);
        //   throw error;
        // }

        toast.show('Account created! Please verify your email.', {
          type: 'success',
        });
        navigation.navigate('Login');
      }
    } catch (error: any) {
      toast.show(error.message || 'An error occurred during sign up', {
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {paddingTop: insets.top + 5, paddingBottom: insets.bottom + 40},
          ]}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Create IBP Account</Text>

          <Formik
            initialValues={{
              full_name: '',
              business_name: '',
              phone_number: '',
              whatsapp_number: '', // Added WhatsApp field
              email: '',
              password: '',
              confirm_password: '',
              gps_address: '', // Manual Entry
              street: '', // Auto-populated
              region: '', // Auto-populated
              district: '', // Auto-populated
              area: '', // Auto-populated
              business_category: '',
              specific_category: '', //changed to item
              item_description: '', //changed to item_description
              has_agreed_to_tc: false,
              has_agreed_to_pa: false,
            }}
            validationSchema={validationBusinessSignUpSchema}
            onSubmit={handleFormSubmit}>
            {({
              handleChange,
              handleSubmit,
              values,
              errors,
              touched,
              setFieldValue,
            }) => {
              const subCategoryOptions = values.business_category
                ? BusinessTypesData[
                    values.business_category as keyof typeof BusinessTypesData
                  ] || []
                : [];

              return (
                <View style={{width: width * 0.9}}>
                  <SectionTitle title="Personal Info" />
                  <CustomInput
                    placeholder="Full Name"
                    value={values.full_name}
                    onChangeText={handleChange('full_name')}
                    error={errors.full_name}
                    touched={touched.full_name}
                  />
                  <View style={styles.row}>
                    <View style={{flex: 1, marginRight: 10}}>
                      <CustomInput
                        placeholder="Phone"
                        value={values.phone_number}
                        onChangeText={handleChange('phone_number')}
                        keyboardType="phone-pad"
                      />
                    </View>
                    <View style={{flex: 1}}>
                      <CustomInput
                        placeholder="WhatsApp"
                        value={values.whatsapp_number}
                        onChangeText={handleChange('whatsapp_number')}
                        keyboardType="phone-pad"
                      />
                    </View>
                  </View>

                  <SectionTitle title="Business Info" />
                  <CustomInput
                    placeholder="Business Name (Can be your full name)"
                    value={values.business_name}
                    onChangeText={handleChange('business_name')}
                    error={errors.business_name}
                    touched={touched.business_name}
                  />
                  {/* <SectionTitle title="Expertise" /> */}
                  {/* Chenage this to a dropdown to select either one product or service or both */}
                  <CustomDropdown
                    label="Business Category"
                    placeholder="Select Business Category"
                    data={BusinessTypeOptions}
                    value={values.business_category}
                    onChange={item => {
                      setFieldValue('business_category', item.value);
                      setFieldValue('specific_category', ''); // Reset the specific service/product
                    }}
                    icon="layers-outline"
                    error={errors.business_category}
                    touched={touched.business_category}
                  />
                  <CustomDropdown
                    label="Specific Service/Product"
                    placeholder={
                      values.specific_category
                        ? 'Select Specific Type'
                        : 'Choose category first'
                    }
                    data={subCategoryOptions} // Now uses the derived list above
                    value={values.specific_category}
                    onChange={item => setFieldValue('item', item.value)}
                    icon="store-marker-outline"
                    error={errors.specific_category}
                    touched={touched.specific_category}
                    // editable={!!values.business_type}
                  />

                  <SectionTitle title="Location (Ghana Post GPS)" />
                  <View style={styles.gpsActionRow}>
                    <View style={{flex: 1}}>
                      <CustomInput
                        placeholder="GPS Address (e.g. GA-123-4567)"
                        value={values.gps_address}
                        onChangeText={handleChange('gps_address')}
                      />
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.refreshButton,
                        fetchingGPSLocation && {
                          backgroundColor: themeColors.gray,
                        },
                      ]}
                      disabled={fetchingGPSLocation}
                      onPress={() =>
                        handleGPSLookup(values.gps_address, setFieldValue)
                      }>
                      {fetchingGPSLocation ? (
                        <ActivityIndicator
                          color={themeColors.white}
                          size="small"
                        />
                      ) : (
                        <Icon
                          name="map-marker-radius"
                          size={24}
                          color={themeColors.white}
                        />
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Auto-populated fields based on Image Reference */}
                  <View style={styles.row}>
                    <View style={{flex: 1, marginRight: 10}}>
                      <CustomInput
                        placeholder="Street"
                        value={values.street}
                        editable={false}
                        onChangeText={() => {}}
                      />
                    </View>
                    <View style={{flex: 1}}>
                      <CustomInput
                        placeholder="Region"
                        value={values.region}
                        editable={false}
                        onChangeText={() => {}}
                      />
                    </View>
                  </View>

                  <SectionTitle title="Account Security" />
                  <CustomInput
                    placeholder="Email Address"
                    value={values.email}
                    onChangeText={handleChange('email')}
                    icon="at"
                    autoCapitalize="none"
                  />
                  <CustomInput
                    placeholder="Password"
                    value={values.password}
                    onChangeText={handleChange('password')}
                    secureTextEntry
                    icon="key"
                  />
                  <CustomInput
                    placeholder="Retype Password"
                    value={values.confirm_password}
                    onChangeText={handleChange('confirm_password')}
                    secureTextEntry
                    icon="key"
                  />

                  <CheckboxItem
                    label={
                      <Text>
                        I agree to the{' '}
                        <Text style={{color: themeColors.primary}}>
                          Terms and Conditions
                        </Text>{' '}
                        and{' '}
                        <Text style={{color: themeColors.primary}}>
                          Privacy Policy
                        </Text>
                      </Text>
                    }
                    value={values.has_agreed_to_tc}
                    onValueChange={(val: boolean) =>
                      setFieldValue('has_agreed_to_tc', val)
                    }
                    error={touched.has_agreed_to_tc && errors.has_agreed_to_tc}
                  />

                  <CheckboxItem
                    label="I confirm that all products and/or services I advertise are medically approved, legally compliant, and that I am duly qualified and authorized to provide or prescribe them."
                    value={values.has_agreed_to_pa}
                    onValueChange={(val: boolean) =>
                      setFieldValue('has_agreed_to_pa', val)
                    }
                    error={touched.has_agreed_to_pa && errors.has_agreed_to_pa}
                  />

                  <CustomButton
                    text={'Create Account'}
                    onPress={() => {
                      if (Object.keys(errors).length > 0) {
                        // Show the first error found to the user
                        const firstError = Object.values(errors)[0];
                        toast.show(`Please fix: ${firstError}`, {
                          type: 'danger',
                        });
                      }
                      handleSubmit();
                    }}
                    loading={loading}
                    extraStyle={{marginTop: 30}}
                  />
                </View>
              );
            }}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const SectionTitle = ({title}: {title: string}) => (
  <Text style={styles.sectionText}>{title}</Text>
);

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: themeColors.white,
  },
  scrollContent: {
    alignItems: 'center',
  },
  logo: {
    height: verticalScale(80),
    width: moderateScale(150),
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: size.xlg,
    fontFamily: fonts.QuincyCFBold,
    color: themeColors.darkGray,
    marginBottom: 20,
  },
  sectionText: {
    fontFamily: fonts.OpenSansBold,
    fontSize: size.md,
    color: themeColors.primary,
    marginTop: 20,
    marginBottom: 10,
    alignSelf: 'flex-start',
    paddingLeft: '5%',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
  },
  gpsActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  refreshButton: {
    backgroundColor: themeColors.primary,
    height: 50,
    width: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginBottom: 15, // Aligns with CustomInput margin
  },
});

export default BusinessSignUpScreen;
