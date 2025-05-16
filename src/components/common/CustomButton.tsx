import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {themeColors} from '../../theme/colors';
import {size} from '../../theme/fontStyle';
import {fonts} from '../../theme/fonts';

interface CustomButtonProps {
  text: string;
  onPress: () => void;
  isTransparent?: boolean;
  loading?: boolean;
  extraStyle?: any;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  text,
  onPress,
  isTransparent,
  loading = false,
  extraStyle,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.5}
      style={[
        styles.container,
        isTransparent ? styles.transparentContainer : styles.defaultContainer,
        extraStyle,
      ]}
      onPress={onPress}
      disabled={loading} // Disable button when loading
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isTransparent ? themeColors.primary : themeColors.white}
        />
      ) : (
        <Text
          style={[
            styles.btn,
            isTransparent ? styles.transparentText : styles.defaultText,
          ]}>
          {text}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  container: {
    width: '99%',
    borderRadius: 50, // Increased borderRadius for more rounded corners
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: themeColors.gray,
  },
  defaultContainer: {
    backgroundColor: themeColors.primary,
    borderWidth: 0,
  },
  transparentContainer: {
    backgroundColor: themeColors.white,
  },
  btn: {
    textAlign: 'center',
    fontSize: size.lg,
    fontFamily: fonts.QuincyCFBold,
  },
  defaultText: {
    color: themeColors.white,
  },
  transparentText: {
    color: themeColors.primary,
  },
});
