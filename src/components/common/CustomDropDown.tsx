import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {themeColors} from '../../theme/colors';
import {fonts} from '../../theme/fonts';
import {
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../utils/metrics';

interface DropdownItem {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  label?: string;
  data: DropdownItem[];
  value: string;
  placeholder: string;
  onChange: (item: DropdownItem) => void;
  error?: string;
  touched?: boolean;
  icon?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  data,
  value,
  placeholder,
  onChange,
  error,
  touched,
  icon,
}) => {
  const [isFocus, setIsFocus] = useState(false);

  const getBorderColor = () => {
    if (error && touched) return 'red';
    if (isFocus) return themeColors.primary;
    return '#E0E0E0';
  };

  // Custom renderer for the list items
  const renderItem = (item: DropdownItem) => {
    const isSelected = item.value === value;
    return (
      <View
        style={[
          styles.item,
          isSelected && {backgroundColor: '#E8F5E9'}, // Light green hue (Green 50)
        ]}>
        <Text style={[styles.textItem, isSelected && {color: '#2E7D32'}]}>
          {item.label}
        </Text>
        {isSelected && <Icon name="check" color="#2E7D32" size={20} />}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <Dropdown
        style={[
          styles.dropdown,
          {
            borderColor: getBorderColor(),
            backgroundColor: '#FFFFFF',
          },
        ]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        // Container for the list
        containerStyle={styles.listContainer}
        data={data}
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={item => {
          onChange(item);
          setIsFocus(false);
        }}
        renderItem={renderItem} // Injects our custom row logic
        renderLeftIcon={() =>
          icon ? (
            <Icon
              style={styles.leftIcon}
              color={isFocus ? themeColors.primary : '#9E9E9E'}
              name={icon}
              size={20}
            />
          ) : null
        }
      />

      {error && touched ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <View style={styles.errorSpacer} />
      )}
    </View>
  );
};

export default CustomDropdown;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: verticalScale(5),
  },
  label: {
    fontFamily: fonts.OpenSansBold,
    fontSize: 14,
    color: themeColors.darkGray,
    marginBottom: verticalScale(6),
    marginLeft: horizontalScale(4),
  },
  dropdown: {
    height: verticalScale(55),
    borderWidth: 1.5,
    borderRadius: moderateScale(10),
    paddingHorizontal: horizontalScale(12),
  },
  listContainer: {
    borderRadius: moderateScale(10),
    marginTop: 5,
    overflow: 'hidden',
  },
  item: {
    padding: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textItem: {
    flex: 1,
    fontSize: 16,
    fontFamily: fonts.OpenSansRegular,
    color: '#333',
  },
  leftIcon: {
    marginRight: horizontalScale(10),
  },
  placeholderStyle: {
    fontSize: 16,
    fontFamily: fonts.OpenSansRegular,
    color: '#BDBDBD',
  },
  selectedTextStyle: {
    fontSize: 16,
    fontFamily: fonts.OpenSansRegular,
    color: '#333',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
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
