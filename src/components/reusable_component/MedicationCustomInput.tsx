import {StyleSheet, Text, TextInput, View} from 'react-native';
import React, {useState} from 'react';
import {themeColors} from '../../theme/colors';
import {verticalScale} from '../../utils/metrics';
import {fonts} from '../../theme/fonts';

interface Props {
  value: string | undefined;
  onChangevalue: (e: string) => void;
  placeHolder: string;
  error?: string;
  touched: boolean | undefined;
  style: any;
  multiline?: any;
}

const MedicationCustomInput = ({
  onChangevalue,
  value,
  placeHolder,
  style,
  touched,
  error,
}: Props) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const handleInputFocus = () => {
    setIsFocused(true);
  };

  const handleInputBlur = (e: any) => {
    setIsFocused(false);
  };

  return (
    <>
      <TextInput
        value={value}
        placeholderTextColor={themeColors.black}
        onChangeText={onChangevalue}
        placeholder={placeHolder}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        style={style}
        multiline
      />

      {error && ((touched && !value) || (error && value) || isFocused) ? (
        <View
          style={{
            flexDirection: 'row',
            // alignItems: 'center',
            // justifyContent: 'center',
            // marginTop: verticalScale(15),
            // paddingVertical: verticalScale(6),
          }}>
          <Text
            style={{
              color: 'red',
              fontWeight: '800',
              paddingHorizontal: 4,
              fontFamily: fonts.OpenSansRegular,
            }}>
            {error}
          </Text>
        </View>
      ) : (
        <View style={{height: verticalScale(10)}} />
      )}
    </>
  );
};

export default MedicationCustomInput;

const styles = StyleSheet.create({});
