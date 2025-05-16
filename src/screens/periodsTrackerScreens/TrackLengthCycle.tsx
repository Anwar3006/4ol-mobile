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
import { trackLengthCycle } from '../../constants';
import { themeColors } from '../../theme/colors';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import { width } from '../../theme/fontStyle';
import { fonts } from '../../theme/fonts';
import { useNavigation } from '@react-navigation/native';
import { PeriodTrackerData } from '../../interfaces';

interface TrackLengthProps {
  route: {
    params: {
      your_goal: string;
      user_age: number;
      periodTrackerData: PeriodTrackerData[];
      flowTypes: any
    };
  };
}

const TrackLengthCycle = ({ route }: TrackLengthProps) => {
  const { periodTrackerData, flowTypes } = route?.params;
  console.log("trackLengthCyclepage", flowTypes)
  const [value, setValue] = useState<number>(22);

  useEffect(() => {
    if (periodTrackerData && periodTrackerData.length > 0) {
      setValue(periodTrackerData[0]?.cycle_length || value);
    }
  }, [periodTrackerData]);

  // navigations-----

  console.log('cycle_length :', value);
  const navigation = useNavigation<any>();

  return (
    <>
      <View style={styles.track_length_container}>
        <SafeAreaView>
          <Text style={styles.average_length_text}>
            Enter the average length of your cycle.
          </Text>

          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              height: verticalScale(600),
            }}>
            <WheelPicker
              data={trackLengthCycle}
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
                navigation.navigate('TrackLengthPeriods', {
                  trackLengthCycle: 28,
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
                navigation.navigate('TrackLengthPeriods', {
                  trackLengthCycle: value,
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

export default TrackLengthCycle;

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
