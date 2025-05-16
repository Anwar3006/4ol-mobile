// imports libraries__________
import {useNavigation} from '@react-navigation/native';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
// imports Componenets__________
import {themeColors} from '../../theme/colors';
import {fonts} from '../../theme/fonts';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';

const SetYourHealthGoal = () => {
  // navigation_____
  const navigation = useNavigation<any>();

  return (
    <View style={styles.setYour_goal_container}>
      <SafeAreaView>
        {/*____your goaltext_content_____ */}
        <Text style={styles.your_goal_text}>What is Your Goal?</Text>
        <Text style={styles.select_goal_text}>
          select your goal to help us customize your experience. All the options
          will be available to you anyway, you can toggle between the options
          and feature anytime.
        </Text>

        {/* track_your_health */}

        <TouchableOpacity
          onPress={() =>
            navigation.navigate('TrackAge', {
              your_goal: 'track my cycle',
            })
          }
          activeOpacity={0.5}
          style={styles.healthCard}>
          <Text style={styles.track_health}>Track My Cycle</Text>
          <Text style={styles.track_text}>
            Track your period and get insights about your symptoms with future
            cycles predictions.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.5} style={styles.healthCard}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text style={styles.track_health}>Trying to Conceive</Text>
            <Text style={{color: themeColors.black}}>(Coming soon)</Text>
          </View>

          <Text style={styles.track_text}>
            Track your ovulution to understand your fertility window to increase
            your chances of getting pregnent.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.5} style={styles.healthCard}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text style={styles.track_health}>Track My Pregnancy</Text>
            <Text style={{color: themeColors.black}}>(Coming soon)</Text>
          </View>

          <Text style={styles.track_text}>
            Monitor records of the growth of your baby and your health during
            your pregnancy.
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

export default SetYourHealthGoal;

const styles = StyleSheet.create({
  setYour_goal_container: {
    flex: 1,
  },
  your_goal_text: {
    fontFamily: fonts.OpenSansBold,
    fontSize: moderateScale(18),
    color: themeColors.black,
    textAlign: 'center',
    paddingTop: verticalScale(24),
  },
  select_goal_text: {
    fontFamily: fonts.OpenSansRegular,
    fontSize: moderateScale(14),
    color: themeColors.black,
    textAlign: 'left',
    paddingHorizontal: horizontalScale(25),
    paddingTop: moderateScale(16),
    alignSelf: 'center',
    width: horizontalScale(350),
    fontWeight: 'bold',
  },
  healthCard: {
    width: horizontalScale(330),
    paddingVertical: verticalScale(6),
    alignSelf: 'center',
    marginTop: verticalScale(20),
    borderRadius: 10,
    shadowColor: themeColors.black,
    borderWidth: 1,
    borderColor: themeColors.darkGray,
    paddingHorizontal: horizontalScale(10),
  },
  track_health: {
    textAlign: 'left',
    fontSize: moderateScale(15),
    color: themeColors.black,
    fontFamily: fonts.OpenSansMedium,
    paddingVertical: verticalScale(10),
    fontWeight: 'bold',
  },
  track_text: {
    textAlign: 'left',
    fontSize: moderateScale(12),
    color: themeColors.black,
    fontFamily: fonts.OpenSansRegular,
    fontWeight: 'bold',
  },
});
