// imports Libraries_____
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import WheelPicker from '@quidone/react-native-wheel-picker';
import WheelPickerFeedback from '@quidone/react-native-wheel-picker-feedback';

// imports components_____
import { trackLengthCycle, trackLengthPeriods } from '../../constants';
import { themeColors } from '../../theme/colors';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import { width } from '../../theme/fontStyle';
import { fonts } from '../../theme/fonts';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { PeriodTrackerData } from '../../interfaces';

type PeriodsTrackerStackParamList = {
  TrackLengthPeriods: {
    trackLengthCycle: number;
    your_goal: number;
    user_age: number;
    periodTrackerData: PeriodTrackerData[];
    flowTypes: any
  };
};

type TrackLengthPeriodsRouteProp = RouteProp<
  PeriodsTrackerStackParamList,
  'TrackLengthPeriods'
>;

interface TrackLengthPeriodsProps {
  route: TrackLengthPeriodsRouteProp;
}

const TrackLengthPeriods = ({ route }: TrackLengthPeriodsProps) => {
  console.log('route.params-track-length', route);
  const { periodTrackerData, trackLengthCycle, flowTypes } = route.params;
  // const period_length = periodTrackerData
  //   ? periodTrackerData[0]?.period_length
  //   : 2;

  // values_____

  const [value, setValue] = useState<number>(2);
  console.log("flowTypes::ada", flowTypes);

  useEffect(() => {
    if (periodTrackerData && periodTrackerData.length > 0) {
      setValue(periodTrackerData[0]?.period_length || value);
    }
  }, [periodTrackerData]);

  console.log('periodslengthInLENGTHPERIODS', value);
  console.log('trackLengthCycle22', trackLengthCycle);
  // navigation_____

  const navigation = useNavigation<any>();

  return (
    <>
      <View style={styles.track_length_container}>
        <SafeAreaView>
          <Text style={styles.average_length_text}>
            Enter the average length of your periods.
          </Text>

          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              height: verticalScale(600),
            }}>
            <WheelPicker
              data={trackLengthPeriods}
              contentContainerStyle={{
                width: width,
              }}
              onValueChanging={() => {
                WheelPickerFeedback.triggerSoundAndImpact();
              }}
              itemTextStyle={{ color: themeColors.black }}
              itemHeight={40}
              value={value}
              onValueChanged={({ item: { value } }) => setValue(value)}
            />
          </View>

          {/* button_ not sure_and confirm */}

          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('TrackYourCyclePatterns', {
                  trackLengthCycle: 28,
                  trackLengthPeriods: 5,
                  periodTrackerData: periodTrackerData,
                  your_goal: route.params.your_goal,
                  user_age: route.params.user_age,
                  flowTypes: flowTypes
                })
              }
              activeOpacity={0.7}
              style={[styles.buttons_trackCycle]}>
              <Text style={styles.button_text}>Not Sure</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate('TrackYourCyclePatterns', {
                  trackLengthCycle: route.params.trackLengthCycle,
                  trackLengthPeriods: value,
                  periodTrackerData: periodTrackerData,
                  your_goal: route.params.your_goal,
                  user_age: route.params.user_age,
                  flowTypes: flowTypes
                })
              }
              activeOpacity={0.7}
              style={[styles.buttons_trackCycle]}>
              <Text style={styles.button_text}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </>
  );
};

export default TrackLengthPeriods;

const styles = StyleSheet.create({
  track_length_container: {
    flex: 1,
  },
  picker: {
    width: horizontalScale(105),
    color: themeColors.black,
    borderWidth: 2,
    borderColor: themeColors.black,
  },
  average_length_text: {
    fontSize: moderateScale(16),
    color: themeColors.black,
    textAlign: 'center',
    fontFamily: fonts.OpenSansMedium,
    marginTop: verticalScale(30),
  },
  buttons_trackCycle: {
    backgroundColor: themeColors.primary,
    borderRadius: 10,
    width: horizontalScale(150),
    alignSelf: 'center',
    paddingVertical: verticalScale(14),
  },
  button_text: {
    textAlign: 'center',
    fontSize: moderateScale(14),
    color: themeColors.white,
    alignSelf: 'center',
    fontFamily: fonts.OpenSansMedium,
  },
});
