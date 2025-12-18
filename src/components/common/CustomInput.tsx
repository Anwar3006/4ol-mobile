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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {themeColors} from '../../theme/colors';
import {fonts} from '../../theme/fonts';
import {
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../utils/metrics';

interface CustomInputProps extends TextInputProps {
  label?: string; // Optional label for better UX
  icon?: string;
  error?: string;
  touched?: boolean;
  editable?: boolean;
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
  multiline = false,
  numberOfLines = 1,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Determine border color based on state
  const getBorderColor = () => {
    if (error && touched) return 'red';
    if (isFocused) return themeColors.primary;
    return '#E0E0E0'; // Elegant light gray
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: getBorderColor(),
            backgroundColor: editable ? '#FFFFFF' : '#F5F5F5',
            // Increase height and align items to top for multiline
            minHeight: multiline ? verticalScale(100) : verticalScale(55),
            alignItems: multiline ? 'flex-start' : 'center',
            paddingTop: multiline ? verticalScale(12) : 0,
          },
        ]}>
        {icon && (
          <Icon
            name={icon}
            size={20}
            color={isFocused ? themeColors.primary : '#9E9E9E'}
            style={[
              styles.iconStyle,
              multiline && {marginTop: verticalScale(2)},
            ]}
          />
        )}

        <TextInput
          style={[
            styles.input,
            {textAlignVertical: multiline ? 'top' : 'center'},
          ]}
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#BDBDBD"
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          autoCorrect={false}
          {...props}
        />

        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}>
            <Icon
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color="#9E9E9E"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Elegant Error Message */}
      {error && touched ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <View style={styles.errorSpacer} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  inputWrapper: {
    flexDirection: 'row',
    borderRadius: moderateScale(10), // Elegant subtle rounding instead of pill
    borderWidth: 1.5,
    paddingHorizontal: horizontalScale(12),
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontFamily: fonts.OpenSansRegular,
    paddingVertical:
      Platform.OS === 'ios' ? verticalScale(12) : verticalScale(8),
  },
  iconStyle: {
    marginRight: horizontalScale(10),
  },
  eyeIcon: {
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

export default CustomInput;
