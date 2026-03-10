import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PhoneInput, { ITheme } from 'react-native-international-phone-number';
import {
  verticalScale,
  moderateScale,
  horizontalScale,
} from '../../utils/metrics';
import { themeColors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

interface Props {
  value: string;
  onchangeState: (val: string) => void;
  setCountryCode: (code: string) => void;
  countrycode: string; 
  error?: string;
  touched?: boolean;
  editable?: boolean;
  placeHolder?: string;
  label?: string;
}

const CustomPhoneNumber = ({
  value,
  onchangeState,
  setCountryCode,
  countrycode,
  error,
  touched,
  editable = true,
  placeHolder,
  label,
}: Props) => {
  const [isFocused, setIsFocused] = useState(false);
  
  // FIX: Provide the required ref
  const phoneInputRef = useRef(null);

  const getBorderColor = () => {
    if (error && touched) return 'red';
    if (isFocused) return themeColors.primary;
    return '#E0E0E0';
  };

  // Ensure theme matches ITheme exactly
  const theme = {
    primaryColor: themeColors.primary,
    secondaryColor: '#FFFFFF',
    tertiaryColor: '#F5F5F5',
    textColor: themeColors.black,
    backgroundColor: 'transparent',
    outlineColor: 'transparent',
  } as unknown as ITheme;

  return (
    <View style={styles.outerContainer}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.borderWrapper,
          {
            borderColor: getBorderColor(),
            backgroundColor: editable ? '#FFFFFF' : '#F5F5F5',
          },
        ]}>
        <PhoneInput
          // Mandatory ref to satisfy PhoneInputPropsWithRef
          ref={phoneInputRef}
          value={value}
          onChangeText={onchangeState}
          selectedCountry={countrycode as any}
          onChangeSelectedCountry={(country) => setCountryCode(country.cca2)}
          placeholder={placeHolder}
          disabled={!editable}
          theme={theme}
          // The component expects a function for customCaret
          customCaret={() => <View />} 
          modalStyles={{
            container: { backgroundColor: '#FFFFFF' },
            searchInput: { fontFamily: fonts.OpenSansRegular },
            countryItem: { backgroundColor: '#FFFFFF' }
          }}
          phoneInputStyles={{
            container: styles.phoneContainer,
            flagContainer: styles.flagContainer,
            input: styles.textInput,
            caret: { display: 'none' } 
          }}
          // Handle focus states for the border animation
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>

      {error && touched ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <View style={styles.errorSpacer} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    marginBottom: verticalScale(5),
  },
  label: {
    fontFamily: fonts.OpenSansBold,
    fontSize: 14,
    color: themeColors.darkGray,
    marginBottom: verticalScale(6),
    marginLeft: horizontalScale(4),
  },
  borderWrapper: {
    borderWidth: 1.5,
    borderRadius: moderateScale(10),
    overflow: 'hidden',
    height: verticalScale(55),
    justifyContent: 'center',
  },
  phoneContainer: {
    borderWidth: 0, 
    backgroundColor: 'transparent',
    height: '100%',
  },
  flagContainer: {
    borderWidth: 0,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    width: horizontalScale(50),
  },
  textInput: {
    fontSize: 16,
    fontFamily: fonts.OpenSansRegular,
    color: themeColors.black,
    paddingLeft: horizontalScale(10),
    height: '100%',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    fontFamily: fonts.OpenSansRegular,
    marginTop: verticalScale(4),
    marginLeft: horizontalScale(4),
  },
  errorSpacer: {
    height: verticalScale(18),
  },
});

export default CustomPhoneNumber;