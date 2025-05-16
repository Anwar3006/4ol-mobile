import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {TouchableOpacity} from 'react-native';
import {themeColors} from '../../theme/colors';
import {fonts} from '../../theme/fonts';

interface Props {
  label: string;
  extraStyle: any;
  onPress?: () => void;
}
const CustomDynamicText = ({label, extraStyle, onPress}: Props) => {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <Text style={extraStyle}>{label}</Text>
    </TouchableOpacity>
  );
};

export default CustomDynamicText;

const styles = StyleSheet.create({
  label: {
    color: themeColors.black,
    fontSize: 14,
    fontFamily: fonts.OpenSansRegular,
  },
});
