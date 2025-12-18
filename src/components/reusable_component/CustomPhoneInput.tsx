import React, {useState} from 'react';
import {View, Text, StyleSheet, Platform} from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import {
  verticalScale,
  moderateScale,
  horizontalScale,
} from '../../utils/metrics';
import {themeColors} from '../../theme/colors';
import {fonts} from '../../theme/fonts';

interface Props {
  value: string | undefined;
  onchangeState: (val: string) => void;
  setCountryCode: (code: any) => void;
  phoneInput: React.MutableRefObject<any>;
  countrycode: any;
  error?: string;
  touched?: boolean;
  editable?: boolean;
  placeHolder?: string;
  label?: string; // Consistent with CustomInput
}

const CustomPhoneNumber = ({
  value,
  onchangeState,
  setCountryCode,
  countrycode,
  phoneInput,
  error,
  touched,
  editable = true,
  placeHolder,
  label,
}: Props) => {
  const [isFocused, setIsFocused] = useState(false);

  // Determine border color based on state to match CustomInput
  const getBorderColor = () => {
    if (error && touched) return 'red';
    if (isFocused) return themeColors.primary;
    return '#E0E0E0';
  };

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
          ref={phoneInput}
          defaultValue={value}
          onChangeFormattedText={onchangeState}
          defaultCode={countrycode}
          layout="first"
          placeholder={placeHolder}
          disableArrowIcon={!editable}
          // Disable internal shadows/borders to use our wrapper
          withShadow={false}
          withDarkTheme={false}
          autoFocus={false}
          containerStyle={styles.phoneContainer}
          textContainerStyle={styles.textContainer}
          codeTextStyle={styles.codeText}
          textInputStyle={styles.textInput}
          onChangeCountry={val => setCountryCode(val.cca2)}
          textInputProps={{
            onFocus: () => setIsFocused(true),
            onBlur: () => setIsFocused(false),
            editable: editable,
            placeholderTextColor: '#BDBDBD',
          }}
        />
      </View>

      {/* Consistent Error Message Placement */}
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
    width: '100%', // Responsive width
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
    borderRadius: moderateScale(10), // Matching CustomInput geometry
    overflow: 'hidden',
    height: verticalScale(55),
    justifyContent: 'center',
  },
  phoneContainer: {
    width: horizontalScale(300),
    backgroundColor: 'transparent', // Uses wrapper background
    height: '100%',
  },
  textContainer: {
    backgroundColor: 'transparent',
    paddingVertical: 0,
    paddingHorizontal: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#E0E0E0', // Subtle separator between code and number
  },
  codeText: {
    fontSize: 16,
    fontFamily: fonts.OpenSansRegular,
    color: themeColors.black,
  },
  textInput: {
    fontSize: 16,
    fontFamily: fonts.OpenSansRegular,
    color: themeColors.black,
    height: '100%',
    paddingLeft: horizontalScale(10),
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
