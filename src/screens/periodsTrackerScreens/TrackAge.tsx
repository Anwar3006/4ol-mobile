// imports Libraries_____
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import WheelPicker from '@quidone/react-native-wheel-picker';
import WheelPickerFeedback from '@quidone/react-native-wheel-picker-feedback';
import {RouteProp, useNavigation} from '@react-navigation/native';

// imports components_____
import {trackUserAge} from '../../constants';
import {themeColors} from '../../theme/colors';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import {width} from '../../theme/fontStyle';
import {fonts} from '../../theme/fonts';

type HealthGoalRoutes = {
  route: {
    params: {
      your_goal: string;
    };
  };
};

const TrackAge = ({route}: HealthGoalRoutes) => {
  // values_____
  console.log('~ route :', route);
  const [userAgeValue, setUserAgeValue] = useState<number>(2);
  const navigation = useNavigation<any>();
  return (
    <>
      <View style={styles.track_length_container}>
        <SafeAreaView>
          <Text style={styles.average_length_text}>please Enter your age</Text>

          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              height: verticalScale(600),
            }}>
            <WheelPicker
              data={trackUserAge}
              contentContainerStyle={{
                width: width,
              }}
              onValueChanging={() => {
                WheelPickerFeedback.triggerSoundAndImpact();
              }}
              itemTextStyle={{color: themeColors.black}}
              itemHeight={40}
              value={userAgeValue}
              onValueChanged={({item: {value}}) => setUserAgeValue(value)}
            />
          </View>

          {/* button_ not sure_and confirm */}

          <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.actionBtnText}
              onPress={() =>
                navigation.navigate('TrackLengthCycle', {
                  //   trackLengthCycle: route.params.trackLengthCycle,
                  //   trackLengthPeriods: 5,
                  your_goal: route.params.your_goal,
                  user_age: userAgeValue,
                })
              }>
              {/* {isLoading ? (
          <ActivityIndicator size={20} color={themeColors.white} />
        ) : ( */}
              <Text style={styles.donetext}>{'Next'}</Text>
              {/* )} */}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </>
  );
};

export default TrackAge;

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
  actionBtnText: {
    color: themeColors.white,
    fontFamily: fonts.OpenSansBold,
    width: horizontalScale(330),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: themeColors.primary,
    padding: 10,
    borderRadius: 10,
  },
  donetext: {
    color: themeColors.white,
    fontSize: moderateScale(15),
    fontFamily: fonts.OpenSansBold,
  },
});
