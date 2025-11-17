import React, {useEffect} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {themeColors} from '../../../theme/colors';
import {size} from '../../../theme/fontStyle';
import {fonts} from '../../../theme/fonts';
import {searchAllTables} from '../../../services/searchAllTables';
// import {useResponsive} from '../../../hooks/useIconResposive';
import {useWindowDimensions} from 'react-native';
import {fontSize} from '../../../responsive';
type SearchBarProps = {
  showBtn?: boolean;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  handleSearch?: () => void;
  onBlur?: () => void;
  onFocus?: () => void;
};

const SearchBar: React.FC<SearchBarProps> = ({
  showBtn,
  placeholder,
  value,
  onChangeText,
  handleSearch,
  onBlur,
  onFocus,
}) => {
  const {width, height} = useWindowDimensions();
  const isTablet = width >= 600; // Typical tablet breakpoint
  const searchHeight = isTablet ? 48 : 43; // Adjust height for tablets
  return (
    <View style={[styles.container]}>
      <View style={[styles.inputWrapper, {height: searchHeight}]}>
        <Icon
          name="search"
          size={isTablet ? 25 : 15} // Adjust icon size for tablets
          color={themeColors.black}
          style={styles.icon}
        />

        <TextInput
          onBlur={onBlur}
          onFocus={onFocus}
          style={[
            styles.input,
            {paddingLeft: isTablet ? 55 : 30, fontSize: isTablet ? 25 : 15},
          ]}
          placeholderTextColor={themeColors.black}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
        />
      </View>
      {showBtn && (
        <TouchableOpacity onPress={handleSearch} style={styles.searchBtn}>
          <Text
            style={[
              {
                // height: searchHeight,
                fontSize: isTablet ? 25 : 17,
                color: themeColors.white,
                fontFamily: fonts.QuincyCFBold,
              },
            ]}>
            Search
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    // height: 42, // Fixed height for the search bar
  },
  inputWrapper: {
    position: 'relative',
    flex: 1,
    backgroundColor: themeColors.white,
    borderRadius: 10,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    // height: 88,
  },
  icon: {
    position: 'absolute',
    // top: 16,
    left: 10,
    // zIndex: 1,
  },
  input: {
    width: '100%',
    padding: 10,
    // paddingLeft: 55,
    // paddingVertical: 12, // Adjusted vertical padding
    // paddingLeft: 40, // Increased from 35 to account for icon spacing
    color: themeColors.black,
    // fontSize: 30,
    fontFamily: fonts.OpenSansRegular,
    // height: '100%', // Make input fill container
  },
  searchBtn: {
    backgroundColor: themeColors.primary,
    paddingVertical: 12, // Match input padding
    paddingHorizontal: 16,
    borderRadius: 10,
    color: themeColors.white,
    fontFamily: fonts.QuincyCFBold,
    marginLeft: 10,
    textAlign: 'center',
    textAlignVertical: 'center',
    height: 43,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
});
