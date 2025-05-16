import React, {
  ChangeEvent,
  Dispatch,
  MutableRefObject,
  useRef,
  useState,
} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
// import {
//   responsiveFontSize,
//   responsiveWidth,
//   responsiveHeight,
// } from 'react-native-responsive-dimensions';
// import { FourthColor, TextinputColor } from '../screens/Styles/Style';
import {
  verticalScale,
  moderateScale,
  horizontalScale,
} from '../../utils/metrics';
import {themeColors} from '../../theme/colors';
import ErrorIcon from 'react-native-vector-icons/MaterialIcons';
import {fonts} from '../../theme/fonts';

interface Props {
  value: string | undefined;
  onchangeState: (e: string | ChangeEvent<any>) => void;
  setCountryCode: Dispatch<any>;
  phoneInput: MutableRefObject<any>;
  countrycode: any;
  error: string | undefined;
  stateError?: string | undefined;
  touched: boolean | undefined;
  editable?: boolean | undefined;
  placeHolder: string | undefined;
}

const CustomPhoneNumber = ({
  value,
  onchangeState,
  setCountryCode,
  countrycode,
  phoneInput,
  error,
  stateError,
  touched,
  editable,
  placeHolder,
}: Props) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // const [countryCode, setCountryCode] = useState<any>();
  // const handleInputFocus = () => {
  //   setIsFocused(true);
  // };

  // const handleInputBlur = (e: any) => {
  //   setIsFocused(false);
  // };

  return (
    <>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: verticalScale(5),
        }}>
        <PhoneInput
          ref={phoneInput}
          defaultValue={value}
          //   onChangeText={number => onchangeState(number)}
          onChangeFormattedText={val => onchangeState(val)}
          value={value}
          withShadow
          defaultCode={countrycode}
          layout="first"
          placeholder={placeHolder}
          containerStyle={[
            styles.phoneContainer,
            {backgroundColor: !editable ? 'lightgrey' : themeColors.white},
          ]}
          textContainerStyle={styles.phoneTextContainer}
          // textInputProps={{
          //   onFocus: handleInputFocus,
          //   onBlur: handleInputBlur,
          // }}

          textInputStyle={styles.phoneTextInput}
          onChangeCountry={val => {
            setCountryCode(val?.cca2);
          }}
          textInputProps={{
            placeholderTextColor: themeColors.black,
            editable: editable,
          }}
          //   textStyle={{ color: '#000' }}
        />
      </View>
      {(error && ((touched && !value) || (error && value) || isFocused)) ||
      (!error && stateError) ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: verticalScale(6),
          }}>
          <Text
            style={{
              color: 'red',
              fontWeight: 'bold',
              paddingHorizontal: 4,
              fontFamily: fonts.OpenSansRegular,
            }}>
            {error ? error : stateError}
          </Text>
        </View>
      ) : (
        <View style={{height: verticalScale(20)}} />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  phoneInput: {
    width: verticalScale(80),
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  phoneTextInput: {
    paddingVertical: 0,
    fontSize: moderateScale(12),
    color: themeColors.black,
  },
  phoneTextContainer: {
    backgroundColor: 'transparent',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 50,
    width: horizontalScale(330),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 2,
    borderColor: themeColors.gray,
    fontSize: moderateScale(30),
  },
});

export default CustomPhoneNumber;
