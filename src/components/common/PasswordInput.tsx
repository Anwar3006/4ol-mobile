import React, {useState} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  TextInputProps,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {horizontalScale, verticalScale} from '../../utils/metrics';
import {themeColors} from '../../theme/colors';
import {size} from '../../theme/fontStyle';
import {fonts} from '../../theme/fonts';

interface CustomInputProps {
  value: string | undefined;
  onChangeText: any;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  icon?: string;
  error?: string;
  touched?: boolean | undefined;
  isError?: string | undefined;
  editable?: boolean | undefined;
  autoCapitalize?: TextInputProps['autoCapitalize'];
}

const PasswordInput: React.FC<CustomInputProps> = ({
  value,
  onChangeText,
  placeholder = 'Enter Password',
  editable,
  error,
  touched,
  icon,
}) => {
  const [isSecure, setIsSecure] = useState(true);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const handleInputFocus = () => {
    setIsFocused(true);
    editable;
  };

  const handleInputBlur = (e: any) => {
    setIsFocused(false);
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: editable ? themeColors.white : 'lightgrey',
            paddingVertical: verticalScale(15),
          },
        ]}>
        <Icon
          name={icon || 'lock'}
          size={20}
          color={'gray'}
          style={styles.startIcon}
        />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={themeColors.black}
          secureTextEntry={isSecure}
          onBlur={handleInputBlur}
          onFocus={handleInputFocus}
          autoCapitalize="none"
          textContentType="password"
          editable={editable}
        />
        <TouchableOpacity
          style={styles.icon}
          onPress={() => setIsSecure(prev => !prev)}>
          <Icon name={isSecure ? 'eye-slash' : 'eye'} size={17} color="gray" />
        </TouchableOpacity>
      </View>
      {error && ((touched && !value) || (error && value) || isFocused) ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            // marginTop: verticalScale(15),
            paddingVertical: verticalScale(6),
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
        <View style={{height: verticalScale(20)}} />
      )}
    </View>
  );
};

export default PasswordInput;

const styles = StyleSheet.create({
  container: {
    width: horizontalScale(330),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor:  '#D3D3D3',
    borderRadius: 50,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 2,
    borderColor: themeColors.gray,
  },
  input: {
    flex: 1,
    fontSize: size.md,
    color: themeColors.black,
    fontFamily: fonts.OpenSansRegular,
    paddingLeft: 10,
    paddingRight: 10,
    textAlign: 'center',
  },
  icon: {
    paddingHorizontal: 5,
  },
  startIcon: {
    paddingLeft: 10,
  },
});
