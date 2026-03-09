import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  TextInputProps,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import {themeColors} from '../../theme/colors';
import {fonts} from '../../theme/fonts';
import {
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../utils/metrics';

interface CustomInputProps extends TextInputProps {
  label?: string;
  icon?: string;
  error?: string;
  touched?: boolean;
}

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  touched,
  icon,
  editable = true,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isError = error && touched;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: isError
              ? 'red'
              : isFocused
              ? themeColors.primary
              : '#C4C4C4',
            backgroundColor: editable ? '#FFFFFF' : '#F8F9FA',
            opacity: editable ? 1 : 0.8,
          },
        ]}>
        {icon && (
          <Icon
            name={icon}
            size={20}
            color={isFocused ? themeColors.primary : '#9E9E9E'}
            style={styles.iconStyle}
          />
        )}

        <TextInput
          style={styles.input}
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#BDBDBD"
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={editable}
          autoCapitalize="none"
          {...props}
        />

        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color="#9E9E9E"
            />
          </TouchableOpacity>
        )}
      </View>

      {isError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: horizontalScale(330), // Fix the width here
    marginBottom: verticalScale(12),
    alignSelf: 'center',
  },
  label: {
    fontFamily: fonts.OpenSansBold,
    fontSize: 14,
    color: themeColors.gray,
    marginBottom: verticalScale(6),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: moderateScale(12),
    borderWidth: 1,
    paddingHorizontal: horizontalScale(15),
    height: verticalScale(55),
    // Standard Cross-Platform Shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontFamily: fonts.OpenSansRegular,
    height: '100%',
  },
  iconStyle: {
    marginRight: horizontalScale(10),
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default CustomInput;
