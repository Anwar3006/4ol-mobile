import {
  Alert,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import { themeColors } from '../../theme/colors';
import { CalendarList } from 'react-native-calendars';
import { fonts } from '../../theme/fonts';
import PeriodFlowtype from '../../components/reusable_component/periodFlowmodule/PeriodFlowtype';
import { size } from '../../theme/fontStyle';
import {
  store_periodTracker_Details,
  update_periodTracker_Details,
} from '../../services/tracker_logs';
import { user } from '../../store/selectors';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { setPeriodTracker } from '../../store/slices/periodTracker';
import { Dispatch, UnknownAction } from '@reduxjs/toolkit';
import { PeriodTrackerData } from '../../interfaces';
import { ScrollView } from 'react-native-gesture-handler';

interface TrackPeriodProps {
  route: {
    params: {
      datesArray: DateInfo[];
      period_consistent_text: string;
      trackLengthCycle: number;
      trackLengthPeriods: number;
      your_goal: number;
      periodTrackerData: PeriodTrackerData[];
    };
  };
}

type DateInfo = {
  color: string;
  date: string;
  icon: string;
  selectedFlow: any;
  title: string;
};

const TrackPeriod = ({ route }: TrackPeriodProps) => {
  const {
    datesArray,
    period_consistent_text,
    trackLengthCycle,
    trackLengthPeriods,
    your_goal,
    periodTrackerData,
  } = route.params;

  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigation = useNavigation<any>();
  const userData: any = useSelector(user);
  const dispatch = useDispatch<Dispatch<UnknownAction>>();
  // const period_start_date = periodTrackerData[0]?.period_start_date;
  const starting_period_date = datesArray[0].date;
  const utcPeriodDate = new Date(starting_period_date).toLocaleDateString(
    'en-CA',
  );

  const lastDateString = datesArray[datesArray.length - 1].date;
  const lastDate = new Date(lastDateString);
  lastDate.setDate(lastDate.getDate() + trackLengthCycle + 1);
  const next_reminder = lastDate.toLocaleDateString('en-CA');
  const next_reminder_utc = next_reminder;

  const dateMap = useMemo(() => {
    return datesArray.reduce((acc: any, item: any) => {
      acc[item.date] = item;
      return acc;
    }, {});
  }, [datesArray]);

  const CustomDay = React.memo(({ date, state, onPress }: any) => {
    const selectedDate = datesArray.find(item => item.date === date.dateString);

    return (
      <TouchableOpacity
        onPress={() => onPress(date)}
        style={[
          styles.dayContainer,
          state === 'disabled' && styles.disabledDay,
        ]}>
        <Text style={styles.dayText}>{date.day}</Text>
        {selectedDate ? (
          <>
            <Image
              style={{
                width: horizontalScale(17),
                height: verticalScale(17),
                resizeMode: 'center',
                position: 'absolute',
                top: 0,
                left: 0,
                tintColor:
                  selectedDate.selectedFlow === 'select flow'
                    ? themeColors.primary
                    : getTintColorForFlow(selectedDate.selectedFlow),
              }}
              source={require('../../../assets/images/periodIcon.png')}
            />
          </>
        ) : (
          <Image
            style={{
              width: horizontalScale(17),
              height: verticalScale(17),
              resizeMode: 'center',
              position: 'absolute',
              top: 0,
              left: 0,
              tintColor: 'grey',
            }}
            source={require('../../../assets/images/periodIcon.png')}
          />
        )}
      </TouchableOpacity>
    );
  });

  const updates_flow_types = useMemo(() => {
    return datesArray.map((item: any) => {
      const updatedItem = { ...item };
      updatedItem.selectedFlow =
        updatedItem.selectedFlow === 'select flow'
          ? ''
          : updatedItem.selectedFlow;
      delete updatedItem.color;
      delete updatedItem.title;
      delete updatedItem.icon;
      return updatedItem;
    });
  }, [datesArray]);

  const handleDayPress = (date: any) => {
    const selectedDateActivity = dateMap[date.dateString];
    setSelectedActivity(selectedDateActivity || null);
  };

  const getTintColorForFlow = (flowType: string): string => {
    switch (flowType) {
      case 'light':
        return '#FFCCCC';
      case 'medium':
        return '#FF6666';
      case 'heavy':
        return '#FF3333';
      case 'super heavy':
        return '#CC0000';
      default:
        return 'grey';
    }
  };

  function calculateOvulationAndFertileWindow(
    periodStartDate: any,
    cycleLength: any,
  ) {
    // if (cycleLength < 22 || cycleLength > 82) {
    //   throw new Error('Cycle length must be between 22 and 82 days.');
    // }

    const startDate = new Date(periodStartDate);
    const ovulationDay = -14;
    const ovulationDateLocal = new Date(startDate);
    ovulationDateLocal.setDate(startDate.getDate() + ovulationDay);
    const fertileStartDateLocal = new Date(ovulationDateLocal);
    fertileStartDateLocal.setDate(ovulationDateLocal.getDate() - 2);
    const fertileEndDateLocal = new Date(ovulationDateLocal);
    fertileEndDateLocal.setDate(ovulationDateLocal.getDate() + 2);
    const fertileWindowDates = [];
    const fertileWindowDatesUTC = [];
    const currentDateLocal = new Date(fertileStartDateLocal);

    while (currentDateLocal <= fertileEndDateLocal) {
      fertileWindowDates.push(currentDateLocal.toISOString().split('T')[0]);
      fertileWindowDatesUTC.push(
        new Date(currentDateLocal.toISOString()).toISOString().split('T')[0],
      );
      currentDateLocal.setDate(currentDateLocal.getDate() + 1);
    }

    return {
      ovulation_date: ovulationDateLocal.toISOString().split('T')[0],
      ovulation_date_utc: new Date(ovulationDateLocal.toISOString())
        .toISOString()
        .split('T')[0],
      fertile_window_dates: fertileWindowDates,
      fertile_window_dates_utc: fertileWindowDatesUTC,
    };
  }

  const result = calculateOvulationAndFertileWindow(
    next_reminder,
    trackLengthCycle,
  );

  const period_Tracker_Data = {
    user_id: userData.id,
    goal: your_goal,
    cycle_length: trackLengthCycle,
    period_length: trackLengthPeriods,
    is_consistent: period_consistent_text,
    period_start_date: starting_period_date,
    flow_types: updates_flow_types,
    created_at: moment(new Date()).valueOf(),
    updated_at: moment(new Date()).valueOf(),
    next_reminder: next_reminder,
    next_reminder_utc: next_reminder_utc,
    period_start_date_utc: utcPeriodDate,
    created_by: userData.id,
    updated_by: userData.id,
    is_created_by_admin_panel: false,
    ovulation_date: result.ovulation_date,
    ovulation_date_utc: result.ovulation_date_utc,
    fertile_window_dates: result.fertile_window_dates,
    fertile_window_dates_utc: result.fertile_window_dates_utc,
  };

  const update_period_Tracker_Data = {
    user_id: userData.id,
    cycle_length: trackLengthCycle,
    period_length: trackLengthPeriods,
    is_consistent: period_consistent_text,
    period_start_date: starting_period_date,
    flow_types: updates_flow_types,
    created_at: moment(new Date()).valueOf(),
    updated_at: moment(new Date()).valueOf(),
    next_reminder: next_reminder,
    next_reminder_utc: next_reminder_utc,
    period_start_date_utc: utcPeriodDate,
    created_by: userData.id,
    updated_by: userData.id,
    ovulation_date: result.ovulation_date,
    ovulation_date_utc: result.ovulation_date_utc,
    fertile_window_dates: result.fertile_window_dates,
    fertile_window_dates_utc: result.fertile_window_dates_utc,
  };

  const call_period_tracker = async () => {
    setIsLoading(true);
    try {
      const trackerDataWithUserId = {
        ...(periodTrackerData
          ? update_period_Tracker_Data
          : period_Tracker_Data),
        user_id: userData?.id,
      };

      if (periodTrackerData) {
        const res = await update_periodTracker_Details(
          trackerDataWithUserId,
          () => {
            setIsLoading(true);
          },
          (successData: any) => {
            setIsLoading(false);
            console.log('res', res);
            dispatch(setPeriodTracker(successData as any[]));
            ToastAndroid.show(
              'Update Period Details Successfully',
              ToastAndroid.LONG,
            );
            navigation.reset({
              index: 0,
              routes: [{ name: 'DashboardPeriods' }],
            });
          },
          (error: any) => {
            setIsLoading(false);
            ToastAndroid.show(error, ToastAndroid.LONG);
            Alert.alert('Error', 'Error while updating Period Tracker Details');
          },
        );
      } else {
        await store_periodTracker_Details(
          trackerDataWithUserId,
          () => {
            setIsLoading(true);
          },
          (successData: any) => {
            setIsLoading(false);
            dispatch(setPeriodTracker(successData as any[]));
            ToastAndroid.show(
              'Store Period Details Successfully',
              ToastAndroid.LONG,
            );
            navigation.reset({
              index: 0,
              routes: [{ name: 'DashboardPeriods' }],
            });
          },
          (error: any) => {
            setIsLoading(false);
            ToastAndroid.show(error, ToastAndroid.LONG);
            Alert.alert('Error', 'Error while storing Period Tracker Details');
          },
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const calendarListRef = useRef<any>(CalendarList);

  useEffect(() => {
    if (calendarListRef?.current) {
      calendarListRef?.current?.scrollToDay(
        datesArray[0].date,
        0,
        true,
      );
    }
  }, [datesArray[0].date]);



  return (
    <>
      <SafeAreaView style={styles.track_period_container}>
        <View style={{ height: verticalScale(450) }}>


          <CalendarList
            ref={calendarListRef}
            onDayPress={handleDayPress}
            showScrollIndicator
            pastScrollRange={5}
            futureScrollRange={4}
            pagingEnabled={true}
            scrollEnabled={true}
            animateScroll={true}
            dayComponent={({ date, state, onPress, theme, style }: any) => (
              <CustomDay date={date} state={state} onPress={onPress} />
            )}
          />


        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: themeColors.white,
          }}>
          <View
            style={{
              paddingHorizontal: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
              backgroundColor: themeColors.white,
              marginTop: verticalScale(10),
            }}>
            <Text
              style={{
                color: themeColors.black,
                fontSize: moderateScale(14),

                fontFamily: fonts.OpenSansMedium,
              }}>
              Your Period Flow Activity
            </Text>

            <Text
              style={{
                color: themeColors.black,
                fontSize: moderateScale(13),

                fontFamily: fonts.OpenSansLight,
              }}>
              {selectedActivity ? selectedActivity.date : 'No activity'}
            </Text>
          </View>

          {selectedActivity ? (
            <>
              <PeriodFlowtype
                style={{
                  borderWidth: 3,
                  borderColor:
                    selectedActivity.selectedFlow === 'select flow'
                      ? themeColors.primary
                      : themeColors.red,
                  borderRadius: 10,
                  height: verticalScale(120),
                  width: horizontalScale(120),
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'center',
                  marginTop: verticalScale(20),
                }}
                periodFlowType={selectedActivity.selectedFlow}
                getTintColorForFlow={getTintColorForFlow}
                imagesrc={require('../../../assets/images/periodIcon.png')}
              />

              <Text
                style={{
                  color: themeColors.black,
                  textAlign: 'center',
                  fontSize: moderateScale(15),
                  fontFamily: fonts.OpenSansMedium,
                }}>
                {selectedActivity.selectedFlow === 'select flow'
                  ? 'Please go back and select your flow type'
                  : selectedActivity.selectedFlow}
              </Text>
            </>
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{ color: themeColors.black, fontSize: moderateScale(17) }}>
                No periods activity
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          disabled={isLoading ? true : false}
          style={styles.actionBtnText}
          onPress={call_period_tracker}>
          {!isLoading ? (
            <Text style={styles.donetext}>{'Save all'}</Text>
          ) : (
            <ActivityIndicator size="small" color={themeColors.white} />
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </>
  );
};

export default TrackPeriod;

const styles = StyleSheet.create({
  track_period_container: {
    flex: 1,
  },
  dayContainer: {
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeColors.gray,
    width: horizontalScale(45),
    height: verticalScale(56),
  },
  dayText: {
    fontSize: moderateScale(13),
    color: '#000',
    position: 'absolute',
    right: 4,
    bottom: 2,
  },
  disabledDay: {
    backgroundColor: '#f0f0f0',
  },
  icon: {
    width: 16,
    height: 16,
    marginTop: 4,
  },
  donetext: {
    color: themeColors.white,
    fontSize: size.md,
    fontFamily: fonts.OpenSansBold,
  },
  actionBtnText: {
    color: themeColors.white,
    // fontSize: size.md,
    fontFamily: fonts.OpenSansBold,
    width: horizontalScale(330),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: themeColors.primary,
    padding: 10,
    borderRadius: 10,
    marginBottom: verticalScale(30),
  },
});