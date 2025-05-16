import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {TouchableOpacity} from 'react-native';
import {horizontalScale, verticalScale} from '../../utils/metrics';
import {themeColors} from '../../theme/colors';
import {fonts} from '../../theme/fonts';

interface Props {
  value: string | undefined;
  extraStyle: any;
  onPress: () => void;
  isLoading?: boolean | undefined;
}

const ProfileCustomButton = ({
  value,
  extraStyle,
  onPress,
  isLoading,
}: Props) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[extraStyle]}
      activeOpacity={0.5}>
      {isLoading ? (
        <ActivityIndicator size="small" color={themeColors.white} />
      ) : (
        <Text
          style={{
            color: value == "Cancel" ?  themeColors.black :  themeColors.white,
            fontFamily: fonts.OpenSansBold,
          }}>
          {value}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default ProfileCustomButton;

const styles = StyleSheet.create({});
