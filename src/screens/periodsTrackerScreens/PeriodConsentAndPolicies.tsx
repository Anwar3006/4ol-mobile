// import libraries_____
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import CustomCheckBox from '../../components/reusable_component/CustomCheckBox';
// interfaces
import {CheckBoxes} from '../../interfaces';
// import components_____
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import {themeColors} from '../../theme/colors';
import {fonts} from '../../theme/fonts';
import {APP_LOGO} from '../../constants';
import {useNavigation} from '@react-navigation/native';

const PeriodConsentAndPolicies = () => {
  // navigation_____
  const navigation = useNavigation<any>();
  // states_____

  const [isChecked, setIsChecked] = useState<CheckBoxes>({
    isChecked: false,
    isChecked2: false,
  });

  // handle_accept-all_____

  const handleAcceptAll = () => {
    setIsChecked(() => {
      return {
        isChecked: true,
        isChecked2: true,
      };
    });
  };

  // if next button_enabled_____
  const isNextEnabled = isChecked.isChecked && isChecked.isChecked2;

  return (
    // start_content
    <View style={styles.periodConsendPolicy_Container}>
      <SafeAreaView>
        {/* <Text style={styles.app_logo}>THERE WILL BE a LOGO HERE</Text> */}

        <Image
          source={APP_LOGO}
          style={styles.app_logo} // Keep image dimensions fixed
        />

        {/* Terms-and-condition__________ */}
        <Text style={styles.privacy_data_matters}>
          Your Privacy Data Matters
        </Text>
        <Text style={styles.never_share_your_info}>
          4 our Life (plasence) will never share your health data with any
          company, you have the right to withdraw or delete your data at any
          time.
        </Text>
        {/* <View style={styles.agree_terms_container}> */}

        {/* custom_checkboxes__________ */}
        <CustomCheckBox
          value={isChecked.isChecked}
          size={20}
          fillColor={themeColors.darkGray}
          text="I agree the Privacy Policy and Terms of Use."
          style={{
            paddingHorizontal: horizontalScale(20),
            paddingTop: verticalScale(40),
          }}
          innerIconStyle={{borderWidth: 2}}
          textStyle={{
            fontFamily: themeColors.black,
            fontSize: moderateScale(14),
            textDecorationLine: 'none',
          }}
          onPress={(isChecked: boolean) => {
            setIsChecked(prev => ({
              ...prev,
              isChecked: isChecked,
            }));
            console.log('ischecked_____', isChecked);
          }}
        />

        <CustomCheckBox
          value={isChecked.isChecked2}
          size={20}
          fillColor={themeColors.darkGray}
          text="I agree to the processing  of the health information I share with plasense is processed by the 4 Our Life App and it's affiliates for the purpose of providing me with Plasense services."
          style={{
            paddingHorizontal: horizontalScale(20),
            paddingTop: verticalScale(20),
          }}
          innerIconStyle={{borderWidth: 2}}
          textStyle={{
            fontFamily: themeColors.black,
            fontSize: moderateScale(14),
            textDecorationLine: 'none',
          }}
          onPress={(isChecked: boolean) => {
            setIsChecked(prev => ({
              ...prev,
              isChecked2: isChecked,
            }));
          }}
        />

        {/* buttons_____ */}

        <TouchableOpacity
          onPress={handleAcceptAll}
          activeOpacity={0.7}
          style={styles.accept_all_container}>
          <Text style={styles.accept_all_text}>Accept all</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('SetYourHealthGoal')}
          activeOpacity={0.7}
          style={[
            styles.next_button,
            {opacity: isNextEnabled ? 1 : 0.5}, // Adjust opacity based on enable state
          ]}
          disabled={!isNextEnabled} // Disable button if not enabled
        >
          <Text style={styles.next_button_text}>Next</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

export default PeriodConsentAndPolicies;

const styles = StyleSheet.create({
  periodConsendPolicy_Container: {
    flex: 1,
  },
  app_logo: {
    width: horizontalScale(150),
    height: verticalScale(150),
    resizeMode: 'center',
    tintColor: themeColors.primary,
    alignSelf: 'center',
    marginTop: verticalScale(14),
  },
  privacy_data_matters: {
    textAlign: 'center',
    fontSize: moderateScale(18),
    color: themeColors.black,
    alignSelf: 'center',
    fontFamily: fonts.OpenSansBold,
    paddingTop: verticalScale(60),
  },
  never_share_your_info: {
    fontFamily: fonts.OpenSansRegular,
    fontSize: moderateScale(14),
    color: themeColors.black,
    textAlign: 'left',
    paddingHorizontal: horizontalScale(20),
    paddingTop: moderateScale(16),
    alignSelf: 'center',
    width: horizontalScale(350),
  },
  agree_terms_container: {
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(40),
  },
  accept_all_container: {
    paddingVertical: verticalScale(14),
    width: horizontalScale(130),
    alignSelf: 'center',
    marginTop: verticalScale(50),
  },
  accept_all_text: {
    textAlign: 'center',
    fontSize: moderateScale(15),
    color: themeColors.primary,
    alignSelf: 'center',
    fontFamily: fonts.OpenSansMedium,
  },
  next_button_text: {
    textAlign: 'center',
    fontSize: moderateScale(14),
    color: themeColors.white,
    alignSelf: 'center',
    fontFamily: fonts.OpenSansMedium,
    paddingVertical: verticalScale(12),
    // paddingTop: verticalScale(14),
  },
  next_button: {
    // paddingTop: verticalScale(14),
    backgroundColor: themeColors.primary,
    borderRadius: 50,
    width: horizontalScale(130),
    alignSelf: 'center',
  },
});
