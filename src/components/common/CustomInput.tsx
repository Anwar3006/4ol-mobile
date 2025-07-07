import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  TextInputProps,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {themeColors} from '../../theme/colors';
import {size} from '../../theme/fontStyle';
import {fonts} from '../../theme/fonts';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import ErrorIcon from 'react-native-vector-icons/MaterialIcons';
import {horizontalScale, verticalScale} from '../../utils/metrics';

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

const CustomInput: React.FC<CustomInputProps> = ({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  touched,
  isError,
  keyboardType = 'default',
  icon = 'user',
  editable,
  autoCapitalize = 'words',
}) => {
  const [show, setShow] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const handleInputFocus = () => {
    setIsFocused(true);
    editable;
  };

  const handleInputBlur = (e: any) => {
    setIsFocused(false);
  };

  return (
    <>
      <View style={styles.container}>
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: editable ? themeColors.white : 'lightgrey',
              paddingVertical: verticalScale(15),
            },
          ]}>
          <Icon name={icon} size={20} color={'gray'} style={styles.startIcon} />
          <TextInput
            style={styles.input}
            value={value}
            placeholder={placeholder}
            onChangeText={onChangeText}
            placeholderTextColor={Colors.black}
            secureTextEntry={secureTextEntry && !show}
            keyboardType={keyboardType}
            onBlur={handleInputBlur}
            onFocus={handleInputFocus}
            editable={editable}
            autoCapitalize={autoCapitalize}
          />

          {secureTextEntry && (
            <TouchableOpacity
              style={styles.icon}
              onPress={() => setShow(!show)}>
              <Icon
                name={!show ? 'eye' : 'eye-slash'}
                size={20}
                color={'gray'}
              />
            </TouchableOpacity>
          )}
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
    </>
  );
};

export default CustomInput;

const styles = StyleSheet.create({
  container: {
    width: horizontalScale(330),
    // paddingVertical: verticalScale(10),
    // marginBottom: 20,
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
  startIcon: {
    paddingLeft: 10,
  },
  icon: {
    paddingRight: 10,
  },
  error: {
    color: 'red',
    fontWeight: '500',
    paddingHorizontal: 4,
    fontFamily: fonts.OpenSansRegular,
  },
});
