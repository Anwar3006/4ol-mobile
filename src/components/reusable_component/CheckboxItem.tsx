import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Text} from 'react-native-elements';
import {Icon} from 'react-native-elements/dist/icons/Icon';
import {themeColors} from '../../theme/colors';

const CheckboxItem = ({label, value, onValueChange, error}: any) => (
  <View style={styles.checkboxWrapper}>
    <TouchableOpacity
      style={styles.checkboxWrapper}
      activeOpacity={0.7}
      onPress={() => onValueChange(!value)}>
      <View style={[styles.checkbox, value && styles.checkboxSelected]}>
        {value && <Icon name="check" size={14} color="#FFF" />}
      </View>

      <View style={{flex: 1}}>
        <Text style={styles.checkboxLabel}>{label}</Text>
        {error && <Text style={styles.errorSmall}>{error}</Text>}
      </View>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  checkboxWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 8,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#D1D5DB', // light gray
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },

  checkboxSelected: {
    backgroundColor: themeColors.primary, // primary blue
    borderColor: themeColors.primary,
  },

  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#111827', // near-black
    lineHeight: 20,
  },

  errorSmall: {
    fontSize: 12,
    color: '#DC2626', // red
    marginTop: 4,
  },
});

export default CheckboxItem;
