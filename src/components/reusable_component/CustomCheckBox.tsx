import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import BouncyCheckBox from 'react-native-bouncy-checkbox';

interface CheckBoxProps {
  size: number;
  fillColor: string;
  style: object;
  innerIconStyle: object;
  textStyle: object;
  onPress: (isChecked: boolean) => void;
  text: string;
  value: boolean;
}

const CustomCheckBox = ({
  size,
  fillColor,
  style,
  innerIconStyle,
  textStyle,
  onPress,
  text,
  value,
}: CheckBoxProps) => {
  return (
    <BouncyCheckBox
      isChecked={value}
      size={size}
      fillColor={fillColor}
      // unFillColor={themeColors.darkGray}
      text={text}
      //   disabled
      style={style}
      innerIconStyle={innerIconStyle}
      textStyle={textStyle}
      onPress={onPress}
    />
  );
};

export default CustomCheckBox;

const styles = StyleSheet.create({});
