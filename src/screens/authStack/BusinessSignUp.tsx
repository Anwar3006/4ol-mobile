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
import {supabase} from '../../utils/supabaseClient';
import {NavigationProp, useNavigation} from '@react-navigation/native';

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

    try {
      // 1. Sign up the user in Supabase Auth
      const {data: authData, error: authError} = await supabase.auth.signUp({
        email: values.email as string,
        password: values.password as string,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Insert the professional details into your 'ibp' table
        const {error: dbError} = await supabase.from('ibp').insert([
          {
            id: authData.user.id, // Linking Auth ID to Table ID
            full_name: values.full_name,
            business_name: values.business_name,
            phone_number: values.phone_number,
            whatsapp_number: values.whatsapp_number,
            email_address: values.email,
            gps_address: values.gps_address,
            street: values.street,
            region: values.region,
            district: values.district,
            area: values.area,
            specialization: JSON.stringify([values.specializations]), // Storing as JSONB
            professional_qualifications: JSON.stringify([
              values.qualifications,
            ]),
            has_agreed_to_tc: values.has_agreed_to_tc,
            has_provided_accurate_info: values.has_agreed_to_pa,
          },
        ]);

        if (dbError) throw dbError;

        toast.show('Account created successfully! Please verify your email.', {
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
              business_type: '',
              specializations: '',
              qualifications: '',
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
            }) => (
              <View style={{width: width * 0.9}}>
                <SectionTitle title="Personal & Business Info" />
                <CustomInput
                  placeholder="Full Name"
                  value={values.full_name}
                  onChangeText={handleChange('full_name')}
                  error={errors.full_name}
                  touched={touched.full_name}
                />
                <CustomInput
                  placeholder="Business Name (Can be your full name)"
                  value={values.business_name}
                  onChangeText={handleChange('business_name')}
                  error={errors.business_name}
                  touched={touched.business_name}
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

                <SectionTitle title="Expertise" />
                <CustomInput
                  placeholder="Specialization/Services Offered"
                  value={values.specializations}
                  onChangeText={handleChange('specializations')}
                  multiline
                  numberOfLines={3}
                />
                <CustomInput
                  placeholder="Professional Qualifications"
                  value={values.specializations}
                  onChangeText={handleChange('qualifications')}
                  multiline
                  numberOfLines={3}
                />

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
                    setFieldValue('has_provided_accurate_info', val)
                  }
                  error={touched.has_agreed_to_pa && errors.has_agreed_to_pa}
                />

                <CustomButton
                  text={'Create Account'}
                  onPress={handleSubmit}
                  loading={loading}
                  extraStyle={{marginTop: 30}}
                />
              </View>
            )}
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
    color: themeColors.black,
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
