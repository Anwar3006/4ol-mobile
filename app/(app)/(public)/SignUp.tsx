import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { FontAwesome5 as Icon, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Dropdown } from 'react-native-element-dropdown';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import moment from 'moment';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useToast } from 'react-native-toast-notifications';
import useUserStore from '@/store/use-userstore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Assets/Theme/Utils (assuming paths are correct)
import { themeColors } from '../../../src/theme/colors';
import { size } from '../../../src/theme/fontStyle';
import { fonts } from '../../../src/theme/fonts';
import CustomInput from '../../../src/components/common/CustomInput';
import CustomButton from '../../../src/components/common/CustomButton';
import { signup } from '../../../src/services/auth';
import { horizontalScale, moderateScale, verticalScale } from '../../../src/utils/metrics';
import { regionNames } from '../../../src/constants/Regions';

// --- ZOD SCHEMA DEFINITION ---
const signupSchema = z.object({
  first_name: z.string().min(2, 'First name is required'),
  last_name: z.string().min(2, 'Last name is required'),
  sex: z.string().min(1, 'Please select your sex'),
  dob: z.date({ error: 'Date of birth is required' }),
  region: z.string().min(1, 'Please select a region'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm_password: z.string()
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

type SignupFormData = z.infer<typeof signupSchema>;

const SignupScreen = () => {
  const toast = useToast();
  const { setUser } = useUserStore();
  const router = useRouter();
  const { phone } = useLocalSearchParams();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const paddingBottom = useSafeAreaInsets().bottom || 20;

  // --- REACT HOOK FORM SETUP ---
  const { control, handleSubmit, formState: { errors } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      sex: '',
      region: '',
      email: '',
      password: '',
      confirm_password: '',
    }
  });

  const onSubmit = async (data: SignupFormData) => {
    const user = { ...data, phone_number: phone };
    await signup(
      user,
      () => setLoading(true),
      (successData: any) => {
        setLoading(false);
        setUser(successData);
      },
      (error: any) => {
        setLoading(false);
        toast.show(error.message, { type: 'danger', placement: 'top' });
      },
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: paddingBottom, paddingBottom: paddingBottom }]}
      >
        <View style={styles.logoView}>
          <Image source={require('../../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
        </View>
        
        <Text style={styles.title}>Create New Account</Text>
        <Text style={styles.subTitle}>Enter Your details to create account</Text>

        <Controller
          control={control}
          name="first_name"
          render={({ field: { onChange, value } }) => (
            <CustomInput
              placeholder="First Name"
              value={value}
              onChangeText={onChange}
              error={errors.first_name?.message}
              touched={!!errors.first_name}
            />
          )}
        />

        <Controller
          control={control}
          name="last_name"
          render={({ field: { onChange, value } }) => (
            <CustomInput
              placeholder="Last Name"
              value={value}
              onChangeText={onChange}
              error={errors.last_name?.message}
              touched={!!errors.last_name}
            />
          )}
        />

        <View style={styles.row}>
          {/* Sex Selection */}
          <View style={{ width: '49%' }}>
            <View style={styles.pickerContainer}>
              <Icon name="transgender" size={20} color={'gray'} style={{ paddingHorizontal: 10 }} />
              <Controller
                control={control}
                name="sex"
                render={({ field: { onChange, value } }) => (
                  <Dropdown
                    data={[{ label: 'Male', value: 'Male' }, { label: 'Female', value: 'Female' }]}
                    labelField="label"
                    valueField="value"
                    placeholder="Sex"
                    value={value}
                    onChange={(item) => onChange(item.value)}
                    style={styles.dropdown}
                  />
                )}
              />
            </View>
            {errors.sex && <Text style={styles.error}>{errors.sex.message}</Text>}
          </View>

          {/* DOB Selection */}
          <View style={{ width: '49%' }}>
            <Controller
              control={control}
              name="dob"
              render={({ field: { onChange, value } }) => (
                <>
                  <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
                    <Text style={styles.datePickerText}>
                      {value ? moment(value).format('DD/MM/YYYY') : 'Date of birth'}
                    </Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={value instanceof Date ? value : new Date()}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, date) => {
                        setShowDatePicker(false);
                        if (date) onChange(date);
                      }}
                    />
                  )}
                </>
              )}
            />
            {errors.dob && <Text style={styles.error}>{errors.dob.message}</Text>}
          </View>
        </View>

        {/* Region Selection */}
        <View style={styles.regionContainer}>
          <MaterialIcons name="location-on" size={20} color={'gray'} style={{ paddingHorizontal: 10 }} />
          <Controller
            control={control}
            name="region"
            render={({ field: { onChange, value } }) => (
              <Dropdown
                data={regionNames.map((item) => ({ label: item, value: item }))}
                labelField="label"
                valueField="value"
                placeholder="Select region"
                value={value}
                onChange={(item) => onChange(item.value)}
                style={styles.regionDropdown}
              />
            )}
          />
        </View>
        {errors.region && <Text style={styles.error}>{errors.region.message}</Text>}

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <CustomInput
              placeholder="Email Address"
              value={value}
              onChangeText={onChange}
              icon="at"
              error={errors.email?.message}
              touched={!!errors.email}
              autoCapitalize="none"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <CustomInput
              placeholder="Password"
              value={value}
              onChangeText={onChange}
              secureTextEntry
              icon="key"
              error={errors.password?.message}
              touched={!!errors.password}
              autoCapitalize="none"
            />
          )}
        />

        <Controller
          control={control}
          name="confirm_password"
          render={({ field: { onChange, value } }) => (
            <CustomInput
              placeholder="Confirm Password"
              value={value}
              onChangeText={onChange}
              secureTextEntry
              icon="key"
              error={errors.confirm_password?.message}
              touched={!!errors.confirm_password}
              autoCapitalize="none"
            />
          )}
        />

        <CustomButton
          text={'Sign Up'}
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          extraStyle={{ width: horizontalScale(330), marginTop: 30 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
  },

  logoView: {
    height: verticalScale(100),
    width: horizontalScale(100),
    marginBottom: moderateScale(15),
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: size.xxlg,
    color: themeColors.black,
    fontFamily: fonts.QuincyCFBold,
  },
  subTitle: {
    fontSize: size.md,
    color: themeColors.black,
    marginBottom: 30,
    fontFamily: fonts.OpenSansRegular,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: horizontalScale(330),
    marginBottom: 20,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderRadius: 50,
    backgroundColor: themeColors.white,
    borderWidth: 2,
    borderColor: themeColors.gray,
    padding: 3,
  },
  dropdown: {
    flex:1,
    height: 41,
  },
  datePickerButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderRadius: 50,
    backgroundColor: themeColors.white,
    borderWidth: 2,
    borderColor: themeColors.gray,
  },
  datePickerText: {
    fontSize: size.md,
    color: themeColors.black,
  },
  error: {
    color: 'red',
    fontWeight: 'bold',
    marginTop: verticalScale(5),
    fontFamily: fonts.OpenSansRegular,
    textAlign: 'center',
  },
  regionContainer: {
    width: horizontalScale(330),
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 50,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    backgroundColor: themeColors.white,
    borderWidth: 2,
    borderColor: themeColors.gray,
    marginBottom: 20,
  },
  regionDropdown: {
    flex: 1,
    height: 45,
  },
});

export default SignupScreen;
