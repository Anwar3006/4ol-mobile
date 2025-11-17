import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import {fonts} from '../../theme/fonts';
import {themeColors} from '../../theme/colors';
import {Agenda, Calendar} from 'react-native-calendars';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useDispatch, useSelector} from 'react-redux';
import {supabase} from '../../utils/supabaseClient';
import {user} from '../../store/selectors';
import {ActivityIndicator} from 'react-native-paper';
import moment from 'moment';
import {height, size, width} from '../../theme/fontStyle';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BellIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import PencilIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import InfoIcon from 'react-native-vector-icons/Feather';
import OvulationStatusModal from '../../components/shared-components/OvulationStatusModal';
import {handleUpdateTrackerLogsAlerts} from '../../services/notificationService';
import {setUserData} from '../../store/slices/User';
import {formatDateToDDMMYYYY} from '../../utils/helpers';
import Timeline from '../../components/TimeLine';

interface FlowColorsType {
  light: string;
  medium: string;
  heavy: string;
  'super heavy': string;
}

interface FlowTypeDates {
  route: {
    params: {
      selectedDate: any;
    };
  };
}

type FertilityStatus = {
  message: string | null;
  ovulationDateCome: boolean;
};

const DashboardPeriods = ({route}: FlowTypeDates) => {
  console.log('route.params.selectedDate :', route?.params?.selectedDate);

  // navigation_____

  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [periodTrackerData, setPeriodTrackerData] = useState<any>([]);
  const [timeLineData, setTimeLineData] = useState<any>();
  const [dates, setDates] = useState<any>();
  const [selectedDate, setSelectedDate] = useState(
    moment().format('YYYY-MM-DD'),
  );
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [isOvulationModalVisible, setIsOvulationModalVisible] = useState(false);
  const [confirmOvulationDate, setConfirmOvulationDate] = useState(false);
  const [confirmPeriodDate, setConfirmPeriodDate] = useState(false);
  const [markedDates, setMarkedDates] = useState<any>({});

  const fertile_window_dates = periodTrackerData[0]?.fertile_window_dates;
  const period_length = periodTrackerData[0]?.period_length;
  const ovalution_date = periodTrackerData[0]?.ovulation_date;
  const period_start_date = periodTrackerData[0]?.period_start_date;
  const flow_types = periodTrackerData[0]?.flow_types;
  console.log('flow_types-flow_types', flow_types);

  const dispatch = useDispatch();
  const userData: any = useSelector(user);

  const getPeriodData = async () => {
    setIsLoading(true);
    try {
      const {data, error} = await supabase
        .from('tracker_logs')
        .select('*')
        .eq('user_id', userData?.id);
      if (error) {
        console.error('Error fetching tracker logs:', error.message);
      } else {
        setPeriodTrackerData(data);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getPeriodData();
  }, []);

  const markCycleDates = (periodTrackerData: any = []) => {
    const markedDates: any = {};
    if (!Array.isArray(periodTrackerData)) {
      console.error('Invalid data format. Expected an array.');
      return markedDates;
    }

    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);

    periodTrackerData.forEach((log: any = {}) => {
      const {
        period_start_date,
        period_length,
        flow_types = [],
        cycle_length,
      } = log;

      if (!period_start_date || !flow_types?.length) {
        console.warn('Skipping log due to missing data:', log);
        return;
      }

      const lastFlowDate = new Date(
        flow_types[flow_types.length - 1]?.date || period_start_date,
      );

      console.log('lstFlowDate :', lastFlowDate);
      if (isNaN(lastFlowDate.getTime())) {
        return;
      }

      for (let cycle = 0; cycle < 24; cycle++) {
        const cycleStartDate = new Date(lastFlowDate.getTime());
        cycleStartDate.setDate(
          lastFlowDate.getDate() + cycle * (cycle_length + period_length),
        );
        if (
          isNaN(cycleStartDate.getTime()) ||
          cycleStartDate > threeMonthsFromNow
        ) {
          break;
        }

        flow_types?.forEach((flow: any = {}) => {
          console.log('flowww', flow);
          const flowDate = new Date(flow.date || today);

          console.log('flowDate :', flowDate);
          if (isNaN(flowDate.getTime())) {
            console.warn('Skipping invalid flowDate:', flowDate);
            return;
          }

          const daysFromStart = Math.floor(
            (flowDate.getTime() - lastFlowDate.getTime()) /
              (1000 * 60 * 60 * 24),
          );

          const adjustedDate = new Date(cycleStartDate.getTime());
          adjustedDate.setDate(cycleStartDate.getDate() + daysFromStart);

          if (
            isNaN(adjustedDate.getTime()) ||
            adjustedDate > threeMonthsFromNow
          ) {
            console.warn(
              'Skipping invalid or out-of-bound adjustedDate:',
              adjustedDate,
            );
            return;
          }

          const formattedDate = adjustedDate.toISOString().split('T')[0];
          console.log('formatted-date:', formattedDate);

          const flowColors: any = {
            light: '#FFCCCC',
            medium: '#FF6666',
            heavy: '#FF3333',
            'super heavy': '#CC0000',
          };

          const selectedFlow = flow.selectedFlow || '';
          const color = flowColors[selectedFlow] || '#a8e6cf';

          markedDates[formattedDate] = {
            customStyles: {
              container: {backgroundColor: color},
              text: {color: 'black'},
            },
          };
        });
      }
    });
    console.log('markDatesarr :', markedDates);
    return markedDates;
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

  const extractFirstOvulationAndFertileDates = (periodTrackerData: any) => {
    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);

    let firstOvulationDate: any = null;
    let firstFertileWindowStartDate: any = null;
    let firstPeriodStartDate: any = null;

    periodTrackerData?.forEach((log: any) => {
      const {period_start_date, period_length, cycle_length} = log;

      if (period_start_date) {
        // Save first period start date
        if (!firstPeriodStartDate) {
          firstPeriodStartDate = new Date(period_start_date)
            .toISOString()
            .split('T')[0];
        }

        let startDate = new Date(period_start_date);

        for (let cycle = 1; cycle <= 24; cycle++) {
          const cycleStartDate = new Date(startDate.getTime());
          cycleStartDate.setDate(
            startDate.getDate() + cycle * (cycle_length + period_length),
          );

          const result = calculateOvulationAndFertileWindow(
            cycleStartDate.toISOString().split('T')[0],
            cycle_length,
          );

          if (cycleStartDate > threeMonthsFromNow) break;

          if (!firstFertileWindowStartDate) {
            firstFertileWindowStartDate = result?.fertile_window_dates?.[0];
          }

          // Find first ovulation date
          if (!firstOvulationDate) {
            firstOvulationDate = result?.ovulation_date;
          }

          // Break early if all dates are found
          if (
            firstOvulationDate &&
            firstFertileWindowStartDate &&
            firstPeriodStartDate
          )
            break;
        }
      }
    });

    return {
      firstPeriodStartDate,
      firstOvulationDate,
      firstFertileWindowStartDate,
    };
  };

  const {
    firstOvulationDate,
    firstFertileWindowStartDate,
    firstPeriodStartDate,
  } = extractFirstOvulationAndFertileDates(periodTrackerData);

  const addContinuousCycleDates = (
    markedDates: any,
    periodTrackerData: any,
  ) => {
    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);

    let nextOvulationMessage = '';
    let nextOvulationDays = Infinity;
    let nextOvulationDate: Date | null = null; // To store the next ovulation date

    periodTrackerData?.forEach((log: any) => {
      const {period_start_date, period_length, cycle_length} = log;

      if (period_start_date) {
        let startDate = new Date(period_start_date);

        for (let cycle = 1; cycle <= 24; cycle++) {
          const cycleStartDate = new Date(startDate.getTime());
          cycleStartDate.setDate(
            startDate.getDate() + cycle * (cycle_length + period_length),
          );

          if (cycleStartDate > threeMonthsFromNow) break;

          // Use calculateOvulationAndFertileWindow
          const result = calculateOvulationAndFertileWindow(
            cycleStartDate.toISOString().split('T')[0],
            cycle_length,
          );

          console.log('result :', JSON.stringify(periodTrackerData, null, 2));

          const ovulationDate =
            result?.ovulation_date && new Date(result?.ovulation_date);

          if (ovulationDate && ovulationDate > today) {
            const daysUntilOvulation = Math.ceil(
              (ovulationDate.getTime() - today.getTime()) /
                (1000 * 60 * 60 * 24),
            );

            if (daysUntilOvulation < nextOvulationDays) {
              nextOvulationDays = daysUntilOvulation;
              nextOvulationMessage = `${nextOvulationDays}`;
              nextOvulationDate = ovulationDate; // Store the next ovulation date
            }
          }

          // Mark fertile window dates
          result?.fertile_window_dates?.forEach(fertileDate => {
            if (!markedDates[fertileDate]) {
              markedDates[fertileDate] = {
                marked: true,
                customStyles: {
                  container: {
                    backgroundColor:
                      fertileDate === result?.ovulation_date
                        ? '#800080'
                        : '#D8BFD8',
                  },
                  text: {color: 'black'},
                },
              };
            }
          });

          // Mark period dates
          for (let day = 0; day < period_length; day++) {
            const currentDay = new Date(cycleStartDate.getTime());
            currentDay.setDate(cycleStartDate.getDate() + day);

            if (currentDay > threeMonthsFromNow) break;

            const formattedDate = currentDay.toISOString().split('T')[0];

            if (!markedDates[formattedDate]) {
              markedDates[formattedDate] = {
                marked: true,
                customStyles: {
                  container: {backgroundColor: '#a8e6cf'},
                  text: {color: 'black'},
                },
              };
            }
          }
        }
      }
    });

    // If no ovulation message, set a default message
    if (!nextOvulationMessage) {
      nextOvulationMessage =
        'No upcoming ovulation found in the next 3 months.';
      nextOvulationDate = null; // No ovulation date found
    }

    // Return both markedDates, nextOvulationMessage, and nextOvulationDate
    return {markedDates, nextOvulationMessage, nextOvulationDate};
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Call the function and extract the next ovulation date
  const {nextOvulationMessage, nextOvulationDate} = addContinuousCycleDates(
    {},
    periodTrackerData,
  );

  const getMarkedDates = (periodTrackerData: any) => {
    let markedDates = markCycleDates(periodTrackerData);
    markedDates = addContinuousCycleDates(markedDates, periodTrackerData);
    return markedDates;
  };

  const getCurrentPeriodInfo = (periodTrackerData: any) => {
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];

    let periodDays = 0;
    let nextPeriodDate = '';
    let gapCount = 0;
    let currentPeriodGap = 0;
    let message = '';

    for (let log of periodTrackerData) {
      const {
        flow_types = [],
        period_start_date,
        cycle_length,
        period_length,
      } = log;

      if (!period_start_date || !flow_types.length) continue;

      const startDate = new Date(period_start_date);
      const cycleStartDate = new Date(startDate);

      for (let cycle = 0; cycle < 24; cycle++) {
        cycleStartDate.setDate(
          startDate.getDate() + cycle * (cycle_length + period_length),
        );

        if (cycleStartDate.toISOString().split('T')[0] === formattedToday) {
          periodDays = cycle + 1;
          currentPeriodGap = periodDays;
          message = `Period day: ${currentPeriodGap}`;
          return {
            gapCount: currentPeriodGap,
            nextPeriodDate: formattedToday,
            message: message,
          };
        }

        for (let day = 0; day < period_length; day++) {
          const currentDay = new Date(cycleStartDate);
          currentDay.setDate(cycleStartDate.getDate() + day);

          if (currentDay.toISOString().split('T')[0] === formattedToday) {
            periodDays = day + 1; // Current period day
            currentPeriodGap = periodDays; // Gap as per current period day
            message = `Period day: ${currentPeriodGap}`; // Message for period day
            return {
              gapCount: currentPeriodGap, // Return the gap for the current period day
              nextPeriodDate: formattedToday, // Current day is the period day
              message: message, // Return message for current period day
            };
          }

          if (currentDay > today && !nextPeriodDate) {
            nextPeriodDate = currentDay.toISOString().split('T')[0];
          }
        }
      }
    }

    if (nextPeriodDate) {
      const nextPeriod = new Date(nextPeriodDate);
      gapCount = Math.floor(
        (nextPeriod.getTime() - today.getTime()) / (1000 * 3600 * 24),
      );
      message = `Periods start in: ${gapCount}`;

      return {
        gapCount: gapCount,
        nextPeriodDate: formatDate(nextPeriod),
        message: message,
      };
    }

    return {gapCount: 0, nextPeriodDate: '', message: ''};
  };

  const result = getCurrentPeriodInfo(periodTrackerData);

  if (result.nextPeriodDate) {
    console.log(`Next Period Date: ${result.nextPeriodDate}`); // It will log in the format YYYY-MM-DD
  } else {
    console.log('No upcoming period or current period data available.');
  }

  const markCycleDatesFromToday = (periodTrackerData: any = []) => {
    const markedDates: any = {};
    if (!Array.isArray(periodTrackerData)) {
      console.error('Invalid data format. Expected an array.');
      return markedDates;
    }

    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);

    periodTrackerData.forEach((log: any = {}) => {
      const {
        period_start_date,
        period_length,
        flow_types = [],
        cycle_length,
      } = log;

      if (!period_start_date || !flow_types.length) {
        console.warn('Skipping log due to missing data:', log);
        return;
      }

      const lastFlowDate = new Date(
        flow_types[flow_types.length - 1]?.date || period_start_date,
      );

      console.log('lstFlowDate :', lastFlowDate);
      if (isNaN(lastFlowDate.getTime())) {
        return;
      }

      for (let cycle = 0; cycle < 24; cycle++) {
        const cycleStartDate = new Date(lastFlowDate.getTime());
        cycleStartDate.setDate(
          lastFlowDate.getDate() + cycle * (cycle_length + period_length),
        );
        if (
          isNaN(cycleStartDate.getTime()) ||
          cycleStartDate > threeMonthsFromNow
        ) {
          break;
        }

        flow_types.forEach((flow: any = {}) => {
          const flowDate = new Date(today);

          // Ensure flow.date is valid and after today
          if (flow.date) {
            const nextFlowDate = new Date(flow.date);
            if (!isNaN(nextFlowDate.getTime()) && nextFlowDate > today) {
              flowDate.setTime(nextFlowDate.getTime());
            }
          }

          const daysFromStart = Math.floor(
            (flowDate.getTime() - lastFlowDate.getTime()) /
              (1000 * 60 * 60 * 24),
          );

          const adjustedDate = new Date(cycleStartDate.getTime());
          adjustedDate.setDate(cycleStartDate.getDate() + daysFromStart);

          if (
            isNaN(adjustedDate.getTime()) ||
            adjustedDate > threeMonthsFromNow
          ) {
            console.warn(
              'Skipping invalid or out-of-bound adjustedDate:',
              adjustedDate,
            );
            return;
          }

          const formattedDate = adjustedDate.toISOString().split('T')[0];
          console.log('formatted-date:', formattedDate);

          const flowColors: any = {
            light: '#FFCCCC',
            medium: '#FF6666',
            heavy: '#FF3333',
            'super heavy': '#CC0000',
          };

          const selectedFlow = flow.selectedFlow || '';
          const color = flowColors[selectedFlow] || '#a8e6cf';

          markedDates[formattedDate] = {
            marked: true,
            customStyles: {
              container: {backgroundColor: color},
              text: {color: 'black'},
            },
          };
        });
      }
    });

    return markedDates;
  };

  const getDates = (date: any) => {
    const dates = [];
    if (!date) {
      for (let i = -3; i <= 3; i++) {
        dates.push(moment().add(i, 'days').format('YYYY-MM-DD'));
      }
    } else {
      for (let i = -3; i <= 3; i++) {
        dates.push(moment(date).add(i, 'days').format('YYYY-MM-DD'));
      }
    }
    setDates(dates);
  };

  const handleDateSelect = (date: any, isPicker: any) => {
    setSelectedDate(date);
    setCalendarVisible(false);
    if (isPicker) {
      getDates(date);
    }
  };

  useEffect(() => {
    getDates(false);
  }, []);

  useEffect(() => {
    const calculatedMarkedDates = markCycleDatesFromToday(periodTrackerData);
    setMarkedDates(calculatedMarkedDates);

    const firstMarkedDate = Object.keys(calculatedMarkedDates)?.[0];

    if (firstMarkedDate) {
      setSelectedDate(firstMarkedDate);
      getDates(firstMarkedDate);
    }
  }, [periodTrackerData]);

  function addPeriodCount(data: any, periodLength: any) {
    let count = 1;
    const updatedData: any = {};
    Object.keys(data).forEach((date, index) => {
      updatedData[date] = {
        ...data[date],
        periodCount: count,
      };
      count = (count % periodLength) + 1;
    });
    return updatedData;
  }

  const getFertilityStatus = (
    ovulationDate: string,
    fertileDates: string[],
  ): FertilityStatus => {
    const today = new Date().toISOString().split('T')[0];
    let message: string | null = null;
    let ovulationDateCome = false;
    if (ovulationDate === today) {
      message =
        'Today marks your ovulation date. Please plan accordingly and take care!';
      ovulationDateCome = true;
    } else if (fertileDates?.includes(today)) {
      ovulationDateCome = false;
      message =
        'You are currently in your fertile window. This is a key time for planning.';
    }

    console.log('ovulationDateCome:', ovulationDateCome);
    console.log('Message-fertilty-status:', message);

    return {
      message,
      ovulationDateCome,
    };
  };

  const {message, ovulationDateCome} = getFertilityStatus(
    ovalution_date,
    fertile_window_dates,
  );

  const showPeriodData = getMarkedDates(periodTrackerData);
  const addperiod = addPeriodCount(showPeriodData, period_length);

  const getPeriodDayStatus = (periodStartDate: string) => {
    const today = new Date().toISOString().split('T')[0];
    if (periodStartDate === today) {
      setConfirmPeriodDate(true);
    }
  };

  useEffect(() => {
    if (periodTrackerData[0]?.flow_types[0]['date'])
      getPeriodDayStatus(periodTrackerData[0]?.flow_types[0]['date']);
  }, [periodTrackerData]);

  React.useEffect(() => {
    if (ovulationDateCome) {
      setConfirmOvulationDate(true);
    }
  }, [ovulationDateCome]);

  const handleAlerts = (userId: any, isEnabled: any) => {
    handleUpdateTrackerLogsAlerts(
      userId,
      isEnabled,
      () => {},
      (successData: any) => {
        ToastAndroid.show(
          `Tracker notification alerts ${
            successData?.is_tracker_notifications_enabled
              ? 'enabled'
              : 'disabled'
          }`,
          ToastAndroid.LONG,
        );
        dispatch(setUserData(successData));
      },
      () => {},
    );
  };

  const formatDateOvulation = (dateString: any) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {month: 'long', day: 'numeric'});
  };

  const nextPeriodDate =
    result.nextPeriodDate && formatDateToDDMMYYYY(result.nextPeriodDate);

  console.log('messagesds:::::', message);
  console.log('dates:::::', dates);

  return (
    // container______
    <View style={styles.date_of_period_container}>
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size={'large'} color={themeColors.primary} />
        </View>
      ) : (
        <>
          <View style={styles.headerMain}>
            <View style={styles.header}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Icon
                  onPress={() => {
                    navigation.navigate('DashboardCalenderView', {
                      setSelectedDate: setSelectedDate,
                      setDates: setDates,
                      selectedDate,
                    });
                  }}
                  name="calendar-month"
                  size={30}
                  color={themeColors.black}
                />

                <Pressable
                  style={{paddingVertical: 10}}
                  onPress={() => {
                    navigation.navigate('DashboardCalenderView', {
                      setSelectedDate: setSelectedDate,
                      setDates: setDates,
                      selectedDate,
                    });
                  }}>
                  <Text style={styles.dateText}>
                    {moment(selectedDate).format('dddd, DD MMMM')}
                  </Text>
                </Pressable>
              </View>

              <TouchableOpacity style={styles.calendarButton}>
                <TouchableOpacity
                  onPress={() => {
                    handleAlerts(
                      userData?.id,
                      !userData?.is_tracker_notifications_enabled,
                    );
                  }}
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    borderRadius: 100,
                    width: 40,
                    height: 40,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <BellIcon
                    name={
                      userData?.is_tracker_notifications_enabled
                        ? 'bell'
                        : 'bell-off'
                    }
                    size={20}
                    color={'rgba(0,0,0,0.5)'}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            </View>

            <View style={styles.dateScroll}>
              {dates?.map((date: any) => (
                <TouchableOpacity
                  key={date}
                  onPress={() => handleDateSelect(date, false)}
                  style={[
                    styles.dateItem,
                    date === selectedDate && styles.selectedDateItem,
                    markedDates[date]
                      ? markedDates[date].customStyles?.container
                      : {backgroundColor: themeColors.lightGray},
                  ]}>
                  <Text
                    style={[
                      styles.dateTextSmall,
                      date === selectedDate && styles.selectedDateText,
                      markedDates[date] && markedDates[date].customStyles?.text,
                    ]}>
                    {moment(date).format('DD')}
                  </Text>
                  <Text
                    style={[
                      styles.dayText,
                      date === selectedDate && styles.selectedDayText,
                    ]}>
                    {moment(date).format('ddd')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <ScrollView
            contentContainerStyle={{gap: 10, padding: 10, paddingTop: 0}}>
            {message !== null && (
              <View
                style={{
                  height: verticalScale(80),
                  backgroundColor: themeColors.primaryLight,
                  width: horizontalScale(330),
                  alignSelf: 'center',
                  borderRadius: 10,
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  marginBottom: verticalScale(18),
                  flexDirection: 'row',
                }}>
                <InfoIcon name="info" size={20} color={'#007BFF'} />
                <Text
                  style={{
                    color: themeColors.black,
                    lineHeight: 20,
                    width: horizontalScale(260),
                    fontSize: moderateScale(13),
                    fontStyle: 'italic',
                    fontWeight: 'bold',
                    paddingHorizontal: horizontalScale(2),
                  }}>
                  {message}
                </Text>
              </View>
            )}

            {confirmOvulationDate && (
              <View
                style={{
                  backgroundColor: '#FFDAB9',
                  width: horizontalScale(330),
                  alignSelf: 'center',
                  borderRadius: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: verticalScale(18),
                  paddingVertical: verticalScale(6),
                }}>
                <Text
                  style={{
                    color: themeColors.black,
                    fontWeight: 'bold',
                    lineHeight: 20,
                    width: horizontalScale(260),
                    fontSize: moderateScale(13),
                    fontStyle: 'italic',
                    textAlign: 'center',
                    paddingTop: verticalScale(12),
                    // paddingHorizontal: horizontalScale(24
                  }}>
                  We have detected that today is your ovulation date. Please
                  confirm if this is accurate ?
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: verticalScale(8),
                    paddingTop: verticalScale(22),
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      width: horizontalScale(250),
                      justifyContent: 'space-between',
                    }}>
                    <TouchableOpacity
                      onPress={() => {
                        setIsOvulationModalVisible(true);
                      }}
                      style={{
                        backgroundColor: '#E8E8E8',
                        justifyContent: 'center',
                        alignItems: 'center',
                        // paddingHorizontal: horizontalScale(32),
                        width: horizontalScale(100),
                        height: verticalScale(45),
                        borderRadius: 8,
                      }}>
                      <Text
                        style={{
                          color: themeColors.black,
                          fontWeight: 'bold',
                          fontSize: moderateScale(13),
                        }}>
                        No
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setConfirmOvulationDate(false);
                      }}
                      style={{
                        backgroundColor: themeColors.primaryLight,
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: horizontalScale(100),
                        height: verticalScale(45),
                        borderRadius: 8,
                      }}>
                      <Text
                        style={{
                          color: themeColors.black,
                          fontWeight: 'bold',
                          fontSize: moderateScale(13),
                        }}>
                        Yes
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {confirmPeriodDate && (
              <View
                style={{
                  backgroundColor: '#FFC1C1',
                  width: horizontalScale(330),
                  alignSelf: 'center',
                  borderRadius: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: verticalScale(18),
                  paddingVertical: verticalScale(6),
                }}>
                <Text
                  style={{
                    color: themeColors.black,
                    fontWeight: 'bold',
                    lineHeight: 20,
                    width: horizontalScale(260),
                    fontSize: moderateScale(13),
                    fontStyle: 'italic',
                    textAlign: 'center',
                    paddingTop: verticalScale(12),
                    // paddingHorizontal: horizontalScale(24
                  }}>
                  We have detected that today might be your period day. Could
                  you please confirm if this is accurate?
                </Text>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: verticalScale(8),
                    paddingTop: verticalScale(22),
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      width: horizontalScale(250),
                      justifyContent: 'space-between',
                    }}>
                    <TouchableOpacity
                      onPress={() => {
                        setIsOvulationModalVisible(true);
                      }}
                      style={{
                        backgroundColor: '#E8E8E8',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: horizontalScale(100),
                        height: verticalScale(45),
                        borderRadius: 8,
                      }}>
                      <Text
                        style={{
                          color: themeColors.black,
                          fontWeight: 'bold',
                          fontSize: moderateScale(13),
                        }}>
                        No
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setConfirmPeriodDate(false);
                      }}
                      style={{
                        backgroundColor: themeColors.primaryLight,
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: horizontalScale(100),
                        height: verticalScale(45),
                        borderRadius: 8,
                      }}>
                      <Text
                        style={{
                          color: themeColors.black,
                          fontWeight: 'bold',
                          fontSize: moderateScale(13),
                        }}>
                        Yes
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            <LinearGradient
              colors={['#800080', '#FFC0CB']}
              start={{x: 0.1, y: 0}}
              end={{x: 1, y: 0.2}}
              style={{
                width: '100%',
                //paddingVertical: verticalScale(4),
                borderRadius: 24,
              }}>
              {/* Top Section */}
              <View
                style={{
                  flexDirection: 'row',
                  paddingHorizontal: horizontalScale(20),
                  marginTop: verticalScale(10),
                  //width: horizontalScale(310),
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                {/* Left Content */}

                <View style={{flex: 1}}>
                  <View style={{alignItems: 'flex-start'}}>
                    <Text
                      style={{
                        color: themeColors.white,
                        fontSize: moderateScale(16),
                      }}>
                      {getCurrentPeriodInfo(
                        periodTrackerData,
                      ).message.startsWith('Period day:')
                        ? 'Period'
                        : getCurrentPeriodInfo(periodTrackerData).message.split(
                            ':',
                          )[0]}
                    </Text>

                    {/* day or Days */}

                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        //marginTop: 4,
                      }}>
                      {getCurrentPeriodInfo(
                        periodTrackerData,
                      ).message.startsWith('Period day:') ? (
                        <>
                          <Text
                            style={{
                              fontSize: moderateScale(30),
                              fontWeight: 'bold',
                              color: themeColors.white,
                              // marginLeft: horizontalScale(9),
                            }}>
                            {getCurrentPeriodInfo(
                              periodTrackerData,
                            ).message.startsWith('Period day:')
                              ? 'Day'
                              : 'days'}
                          </Text>

                          <Text
                            style={{
                              fontSize: moderateScale(30),
                              fontWeight: 'bold',
                              color: themeColors.white,
                            }}>
                            {
                              getCurrentPeriodInfo(
                                periodTrackerData,
                              ).message.split(':')[1]
                            }
                          </Text>
                        </>
                      ) : (
                        <>
                          <Text
                            style={{
                              fontSize: moderateScale(24),
                              fontWeight: 'bold',
                              color: themeColors.white,
                            }}>
                            {
                              getCurrentPeriodInfo(
                                periodTrackerData,
                              ).message.split(':')[1]
                            }
                          </Text>

                          <Text
                            style={{
                              fontSize: moderateScale(24),
                              fontWeight: 'bold',
                              color: themeColors.white,
                              marginLeft: horizontalScale(9),
                            }}>
                            {getCurrentPeriodInfo(
                              periodTrackerData,
                            ).message.startsWith('Period day:')
                              ? 'Day'
                              : 'days'}
                          </Text>
                        </>
                      )}
                    </View>

                    {/* Date */}
                    {/* <Text
                      style={{
                        fontSize: moderateScale(14),
                        color: themeColors.white,
                        marginTop: 4,
                        marginLeft: horizontalScale(9),
                      }}>
                      {nextPeriodDate || 'Invalid Date'}
                    </Text> */}
                  </View>
                </View>

                {/* Edit Button */}

                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('TrackLengthCycle', {
                      periodTrackerData: periodTrackerData,
                      trackLengthCycle: periodTrackerData[0]?.cycle_length,
                      trackLengthPeriods: periodTrackerData[0]?.period_length,
                      flowTypes: periodTrackerData[0]?.flow_types,
                    });
                  }}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    borderRadius: 100,
                    width: 40,
                    height: 40,
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'absolute',
                    top: 0,
                    right: 10,
                  }}>
                  <PencilIcon
                    name="pencil"
                    size={24}
                    color={'rgba(0,0,0,0.5)'}
                  />
                </TouchableOpacity>
              </View>

              {/* Bottom Section */}

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: verticalScale(18),
                  paddingHorizontal: horizontalScale(20),
                }}>
                {/* Ovulation Info */}
                <View>
                  <Text
                    style={{
                      fontSize: moderateScale(14),
                      color: themeColors.white,
                    }}>
                    Next ovulation
                  </Text>
                  <Text
                    style={{
                      fontSize: moderateScale(13),
                      color: themeColors.white,
                    }}>
                    in {nextOvulationMessage} days
                  </Text>
                  {/* <Text
                    style={{
                      fontSize: moderateScale(13),
                      color: themeColors.white,
                    }}>
                    {formatDateToDDMMYYYY(nextOvulationDate)}
                  </Text> */}
                </View>

                {/* Image */}
                <Image
                  style={{
                    height: 60,
                    width: 60,
                    resizeMode: 'contain',
                    alignSelf: 'center',
                  }}
                  source={require('../../../assets/images/bloodIcon.png')}
                />
              </View>
            </LinearGradient>

            {/* <View
              style={{
                width: horizontalScale(330),
                alignSelf: 'center',
                marginTop: verticalScale(20),
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                padding: 20,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
              }}>
              <Text
                style={{
                  fontSize: moderateScale(20),
                  color: themeColors.darkGray,
                  letterSpacing: 1,
                }}>
                Timeline
              </Text>



              <View
                style={{
                  width: horizontalScale(290),
                  backgroundColor: themeColors.white,
                  borderBottomColor: '#ccc',
                  alignSelf: 'center',
                  justifyContent: 'center',
                  paddingVertical: verticalScale(8),
                  marginVertical: verticalScale(6),
                  borderRadius: 20,
                  shadowOffset: {width: 0, height: 2},
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 3,
                }}>
                <View style={{flexDirection: 'row'}}>


                  <View
                    style={{
                      width: horizontalScale(100),
                      alignItems: 'center',
                      borderRightWidth: 2,
                      borderRightColor: '#FFCCCC',
                      paddingVertical: verticalScale(6),
                    }}>
                    <Text
                      style={{
                        fontSize: moderateScale(17),
                        color: 'black',
                      }}
                      numberOfLines={1}>
                      {moment(firstPeriodStartDate).format('DD')}
                    </Text>
                    <Text
                      style={{
                        fontSize: moderateScale(13),
                        color: '#888',
                        marginTop: verticalScale(4),
                      }}
                      numberOfLines={1}>
                      {moment(firstPeriodStartDate).format('MMM').toUpperCase()}
                    </Text>
                    <Text
                      style={{
                        fontSize: moderateScale(13),
                        color: '#888',
                        marginTop: verticalScale(4),
                      }}
                      numberOfLines={1}>
                      {moment(firstPeriodStartDate).format('YYYY')}
                    </Text>
                  </View>

                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      paddingLeft: horizontalScale(10),
                    }}>
                    <Image
                      style={{
                        width: 30,
                        height: 30,
                        resizeMode: 'contain',
                        marginRight: horizontalScale(10),
                      }}
                      source={require('../../../assets/images/periodIcon.png')}
                    />
                    <View>
                      <Text
                        style={{
                          fontSize: moderateScale(15),
                          color: themeColors.black,
                          marginBottom: verticalScale(4),
                        }}
                        numberOfLines={1}>
                        Periods
                      </Text>
                      <Text
                        style={{
                          fontSize: moderateScale(14),
                          color: '#888',
                        }}
                        numberOfLines={1}>
                        {`${period_length} days`}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View
                style={{
                  width: horizontalScale(290),
                  backgroundColor: themeColors.white,
                  borderBottomColor: '#ccc',
                  alignSelf: 'center',
                  justifyContent: 'center',
                  paddingVertical: verticalScale(8),
                  marginVertical: verticalScale(6),
                  borderRadius: 20,
                  shadowOffset: {width: 0, height: 2},
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 3,
                }}>
                <View style={{flexDirection: 'row'}}>

                  <View
                    style={{
                      width: horizontalScale(100),
                      alignItems: 'center',
                      borderRightWidth: 2,
                      borderRightColor: '#FFCCCC',
                      paddingVertical: verticalScale(6),
                    }}>
                    <Text
                      style={{
                        fontSize: moderateScale(17),
                        color: 'black',
                      }}
                      numberOfLines={1}>
                      {moment(firstFertileWindowStartDate).format('DD')}
                    </Text>
                    <Text
                      style={{
                        fontSize: moderateScale(13),
                        color: '#888',
                        marginTop: verticalScale(4),
                      }}
                      numberOfLines={1}>
                      {moment(firstFertileWindowStartDate)
                        .format('MMM')
                        .toUpperCase()}
                    </Text>
                    <Text
                      style={{
                        fontSize: moderateScale(13),
                        color: '#888',
                        marginTop: verticalScale(4),
                      }}
                      numberOfLines={1}>
                      {moment(firstFertileWindowStartDate).format('YYYY')}
                    </Text>
                  </View>

                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      paddingLeft: horizontalScale(10),
                    }}>
                    <Image
                      style={{
                        width: 30,
                        height: 30,
                        resizeMode: 'contain',
                        marginRight: horizontalScale(10),
                      }}
                      source={require('../../../assets/images/ovulation-icon.jpg')}
                    />
                    <View style={{flex: 1}}>
                      <Text
                        style={{
                          fontSize: moderateScale(15),
                          color: themeColors.black,
                          marginBottom: verticalScale(4),
                          flexShrink: 1,
                        }}
                        numberOfLines={1}>
                        Fertility window
                      </Text>
                      <Text
                        style={{
                          fontSize: moderateScale(14),
                          color: '#888',
                          flexShrink: 1,
                          flexWrap: 'wrap',
                          paddingHorizontal: horizontalScale(2),
                        }}
                        numberOfLines={2}>
                        {`Ovulation: ${formatDateOvulation(
                          firstOvulationDate,
                        )}`}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View
                style={{
                  width: horizontalScale(290),
                  backgroundColor: themeColors.white,
                  borderBottomColor: '#ccc',
                  alignSelf: 'center',
                  justifyContent: 'center',
                  paddingVertical: verticalScale(8),
                  marginVertical: verticalScale(6),
                  borderRadius: 20,
                  shadowOffset: {width: 0, height: 2},
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 3,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                  }}>
                  <View
                    style={{
                      width: horizontalScale(100),
                      alignItems: 'center',
                      borderRightWidth: 2,
                      borderRightColor: '#FFCCCC',
                    }}>
                    <Text
                      style={{
                        fontSize: moderateScale(17),
                        color: 'black',
                        paddingHorizontal: 12,
                        paddingTop: 4,
                      }}>
                      {moment(period_start_date).format('DD')}
                    </Text>
                    <Text
                      style={{
                        fontSize: moderateScale(13),
                        color: '#888',
                        paddingHorizontal: 12,
                        paddingTop: 8,
                      }}>
                      {moment(period_start_date).format('MMM').toUpperCase()}
                    </Text>
                    <Text
                      style={{
                        fontSize: moderateScale(13),
                        color: '#888',
                        paddingHorizontal: 12,
                        paddingTop: 6,
                      }}>
                      {moment(period_start_date).format('YYYY')}
                    </Text>
                  </View>

                  <View>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Image
                        style={{
                          width: 30,
                          height: 30,
                          resizeMode: 'center',
                          marginLeft: horizontalScale(10),
                        }}
                        source={require('../../../assets/images/pms.png')}
                        // tintColor={color}
                      />
                      <View>
                        <Text
                          style={{
                            fontSize: moderateScale(15),
                            color: themeColors.black,
                            paddingHorizontal: 12,
                            paddingTop: 6,
                          }}>
                          PMS
                        </Text>

                        <Text
                          style={{
                            fontSize: moderateScale(14),
                            color: '#888',
                            paddingHorizontal: horizontalScale(12),
                            // paddingTop: verticalScale(12),
                          }}>
                          january 11
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              <View
                style={{
                  width: horizontalScale(290),
                  backgroundColor: themeColors.white,
                  borderBottomColor: '#ccc',
                  alignSelf: 'center',
                  justifyContent: 'center',
                  paddingVertical: verticalScale(8),
                  marginVertical: verticalScale(6),
                  borderRadius: 20,
                  shadowOffset: {width: 0, height: 2},
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 3,
                }}>
                <View style={{flexDirection: 'row'}}>

                  <View
                    style={{
                      width: horizontalScale(100),
                      alignItems: 'center',
                      borderRightWidth: 2,
                      borderRightColor: '#FFCCCC',
                      paddingVertical: verticalScale(6),
                    }}>
                    <Text
                      style={{
                        fontSize: moderateScale(17),
                        color: 'black',
                      }}
                      numberOfLines={1}>
                      {moment(firstFertileWindowStartDate).format('DD')}
                    </Text>
                    <Text
                      style={{
                        fontSize: moderateScale(13),
                        color: '#888',
                        marginTop: verticalScale(4),
                      }}
                      numberOfLines={1}>
                      {moment(firstFertileWindowStartDate)
                        .format('MMM')
                        .toUpperCase()}
                    </Text>
                    <Text
                      style={{
                        fontSize: moderateScale(13),
                        color: '#888',
                        marginTop: verticalScale(4),
                      }}
                      numberOfLines={1}>
                      {moment(firstFertileWindowStartDate).format('YYYY')}
                    </Text>
                  </View>

                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      paddingLeft: horizontalScale(10),
                    }}>
                    <Image
                      style={{
                        width: 30,
                        height: 30,
                        resizeMode: 'contain',
                        marginRight: horizontalScale(10),
                      }}
                      source={require('../../../assets/images/ovulation-icon.jpg')}
                    />
                    <View style={{flex: 1}}>
                      <Text
                        style={{
                          fontSize: moderateScale(15),
                          color: themeColors.black,
                          marginBottom: verticalScale(4),
                          flexShrink: 1,
                        }}
                        numberOfLines={1}>
                        Fertility window
                      </Text>
                      <Text
                        style={{
                          fontSize: moderateScale(14),
                          color: '#888',
                          flexShrink: 1,
                          flexWrap: 'wrap',
                          paddingHorizontal: horizontalScale(2),
                        }}
                        numberOfLines={2}>
                        {`Ovulation: ${formatDateOvulation(
                          firstOvulationDate,
                        )}`}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View> */}

            <Timeline periodTrackerData={periodTrackerData} />

            <OvulationStatusModal
              stateModal={isOvulationModalVisible}
              closeModal={() => setIsOvulationModalVisible(false)}
              periodTrackerData={periodTrackerData}
            />
          </ScrollView>
        </>
      )}
    </View>
  );
};

export default DashboardPeriods;

const styles = StyleSheet.create({
  date_of_period_container: {
    flex: 1,
    backgroundColor: themeColors.white,
  },
  selectdate_of_period: {
    fontSize: moderateScale(18),
    fontFamily: fonts.OpenSansBold,
    color: themeColors.black,
    paddingHorizontal: horizontalScale(22),
    paddingTop: verticalScale(22),
  },
  calendar: {
    width: horizontalScale(340),
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: verticalScale(40),
  },
  buttons_trackCycle: {
    backgroundColor: themeColors.primary,
    borderRadius: 10,
    width: horizontalScale(330),
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
  loaderContainer: {
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerMain: {
    backgroundColor: themeColors.white,
    padding: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateText: {
    fontSize: moderateScale(16),
    color: themeColors.black,
  },
  dateScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateItem: {
    borderRadius: 100,
    alignItems: 'center',
    width: horizontalScale(40),
    paddingVertical: verticalScale(14),
  },
  selectedDateItem: {
    backgroundColor: themeColors.primary,
  },
  dayText: {
    fontSize: moderateScale(12),
    color: themeColors.darkGray,
  },
  selectedDayText: {
    color: themeColors.white,
  },
  dateTextSmall: {
    fontSize: moderateScale(12),
    color: themeColors.black,
    marginBottom: verticalScale(4),
  },
  selectedDateText: {
    color: themeColors.white,
  },
  calendarButton: {},
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});
