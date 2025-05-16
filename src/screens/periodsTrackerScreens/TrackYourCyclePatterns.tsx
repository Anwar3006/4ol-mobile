import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import { themeColors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { PeriodTrackerData } from '../../interfaces';

type PeriodsTrackerStackParamList = {
  TrackYourCyclePatterns: {
    trackLengthCycle: number;
    trackLengthPeriods: number;
    your_goal: number;
    user_age: number;
    periodTrackerData: PeriodTrackerData[];
    flowTypes: any;
  };
};

type TrackYourCyclePatternsRouteProp = RouteProp<
  PeriodsTrackerStackParamList,
  'TrackYourCyclePatterns'
>;

interface TrackYourCyclePatternsProps {
  route: TrackYourCyclePatternsRouteProp;
}

const TrackYourCyclePatterns = ({ route }: TrackYourCyclePatternsProps) => {
  const navigation = useNavigation<any>();
  const { periodTrackerData, flowTypes } = route.params;

  console.log(
    'route.params.trackLengthCyclecyclepattern',
    route.params.trackLengthCycle,
  );
  console.log(
    'route.params.trackLengthperiodscyclepattern',
    route.params.trackLengthPeriods,
  );

  return (
    <View style={styles.trackCyclePattern_container}>
      <SafeAreaView>
        <Text style={styles.periods_consistent_text1}>
          Are Your periods consistent?
        </Text>
        <Text style={styles.periods_consistent_text2}>
          Let us know if your periods occur around the same number of days each
          month.
        </Text>

        {/* options_for_users */}

        <TouchableOpacity
          onPress={() =>
            navigation.navigate('SelectDateOfPeriod', {
              trackLengthCycle: route.params.trackLengthCycle,
              trackLengthPeriods: route.params.trackLengthPeriods,
              period_consistent_text: 'yes',
              periodTrackerData: periodTrackerData,
              your_goal: route.params.your_goal,
              user_age: route.params.user_age,
              flowTypes: flowTypes
            })
          }
          activeOpacity={0.5}
          style={[styles.option_card, { marginTop: verticalScale(22) }]}>
          <Text style={styles.option_text}>Yes</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
          onPress={() =>
            navigation.navigate('SelectDateOfPeriod', {
              trackLengthCycle: 1,
              trackLengthPeriods: 1,
              period_consistent_text: 'no',
              your_goal: route.params.your_goal,
            })
          }
          activeOpacity={0.5}
          style={styles.option_card}>
          <Text style={styles.option_text}>No</Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('SelectDateOfPeriod', {
              trackLengthCycle: 28,
              trackLengthPeriods: 5,
              periodTrackerData: periodTrackerData,
              period_consistent_text: 'i dont know',
              your_goal: route.params.your_goal,
              user_age: route.params.user_age,
              flowTypes: flowTypes
            })
          }
          activeOpacity={0.5}
          style={styles.option_card}>
          <Text style={styles.option_text}>I don't know</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

export default TrackYourCyclePatterns;

const styles = StyleSheet.create({
  trackCyclePattern_container: {
    flex: 1,
  },
  periods_consistent_text1: {
    fontSize: moderateScale(20),
    color: themeColors.black,
    fontFamily: fonts.OpenSansBold,
    textAlign: 'center',
    marginTop: moderateScale(24),
  },
  periods_consistent_text2: {
    fontSize: moderateScale(16),
    color: themeColors.black,
    fontFamily: fonts.OpenSansRegular,
    textAlign: 'center',
    marginTop: moderateScale(14),
    paddingHorizontal: horizontalScale(20),
  },
  option_card: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    width: horizontalScale(330),
    paddingVertical: verticalScale(20),
    alignSelf: 'center',
    marginTop: verticalScale(10),
    borderRadius: 8,
    shadowColor: themeColors.black,
    borderColor: themeColors.darkGray,
    paddingHorizontal: horizontalScale(20),
  },
  option_text: {
    fontSize: moderateScale(15),
    color: themeColors.black,
    fontFamily: fonts.OpenSansMedium,
  },
});
