import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import {themeColors} from '../../../src/theme/colors';
import {size} from '../../../src/theme/fontStyle';
import {fonts} from '../../../src/theme/fonts';
import * as Localization from 'expo-localization';

import ForgetEmailAddress from '../../../src/components/auth/forget/ForgetEmailAddress';
import ForgetPhoneNumber from '../../../src/components/auth/forget/ForgetPhoneNumber';

const ForgotPasswordScreen = () => {
  const [option, setOption] = useState('email');
  const [countryCode, setCountryCode] = useState<string>('GH');

  useEffect(() => {
    try {
      // 2. Use getLocales() to get the device region/country
      // getLocales() returns an array; the first item is the primary preference
      const locales = Localization.getLocales();
      if (locales && locales.length > 0) {
        const code = locales[0].regionCode; // Returns e.g., "US", "GH", "GB"
        setCountryCode(code || 'GH');
      }
    } catch (e) {
      setCountryCode('GH');
      console.log('Error while getting country', e);
    }
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Icon
        name="email"
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
          onPress={() => setOption('email')}>
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
          onPress={() => setOption('phone')}>
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
        />
        
      ) : (
        <ForgetPhoneNumber
          countryCode={countryCode}
          option={option}
          setCountryCode={setCountryCode}
        />
      )}
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
});

export default ForgotPasswordScreen;
