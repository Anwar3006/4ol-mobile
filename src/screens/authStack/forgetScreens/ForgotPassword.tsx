import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {themeColors} from '../../../theme/colors';
import {size} from '../../../theme/fontStyle';
import {fonts} from '../../../theme/fonts';
import PhoneInput from 'react-native-phone-number-input';
import CustomInput from '../../../components/common/CustomInput';
import CustomButton from '../../../components/common/CustomButton';
import {SCREENS} from '../../../constants/screens';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {validateEmail} from '../../../utils/helpers';
import {sendOtpToEmail, signInWithPhoneNumber} from '../../../services/auth';
import {useToast} from 'react-native-toast-notifications';
import DeviceCountry from 'react-native-device-country';
import ForgetEmailAddress from '../../../components/auth/forget/ForgetEmailAddress';
import ForgetPhoneNumber from '../../../components/auth/forget/ForgetPhoneNumber';

type ForgotPasswordScreenProps = {
  navigation: NativeStackNavigationProp<any>; // Replace `any` with your specific stack params type if available
  // setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  navigation,
}) => {
  const toast = useToast();
  const [option, setOption] = useState('email');

  const [countryCode, setCountryCode] = useState<any>();

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

  // const handleSetNewPin = () => {
  //   // Logic to set new PIN code
  // };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Icon
        name="email-send-outline"
        size={50}
        color={themeColors.primary}
        style={styles.icon}
      />
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.description}>Send 6 digits code to:</Text>
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
        <ForgetEmailAddress
          option={option}
          countryCode={countryCode}
          setCountryCode={setCountryCode}
          // setLoading={setLoading}
        />
      ) : (
        <ForgetPhoneNumber
          countryCode={countryCode}
          // loading={loading}
          option={option}
          setCountryCode={setCountryCode}
          // setLoading={setLoading}
        />

        // <CustomInput
        //   placeholder="Email Address"
        //   value={email}
        //   onChangeText={setEmail}
        //   secureTextEntry={false}
        //   icon="at"
        //   error={error}
        // />

        // <View style={{margin: 20, marginTop: 0, width: '100%'}}>
        //   {!countryCode ? (
        //     <Text
        //       style={{
        //         textAlign: 'center',
        //         margin: 0,
        //         padding: 0,
        //         fontFamily: fonts.OpenSansRegular,
        //       }}>
        //       Fetching your country code... Please wait!
        //     </Text>
        //   ) : (
        //     <>
        //       <PhoneInput
        //         value={phoneNumber}
        //         defaultCode={countryCode}
        //         onChangeFormattedText={text => setPhoneNumber(text)}
        //         containerStyle={styles.phoneInputContainer}
        //         textContainerStyle={styles.textContainer}
        //         textInputStyle={styles.textInput}
        //         codeTextStyle={styles.codeText}
        //         flagButtonStyle={styles.flagButton}
        //       />
        //       {error && <Text style={styles.error}>{error}</Text>}
        //     </>
        //   )}
        // </View>
      )}

      <View style={{width: '100%', margin: 20}}>
        {/* <CustomButton
          text="Send Code"
          onPress={handleSendCode}
          loading={loading}
        /> */}
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
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
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
    // margin: 20,
    // marginBottom: 40,
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
  error: {
    fontSize: size.s,
    color: themeColors.red,
    marginTop: 5,
    textAlign: 'center',
  },
});

export default ForgotPasswordScreen;
