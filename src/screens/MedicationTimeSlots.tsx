import React, {useEffect, useReducer, useRef, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Switch,
  Image,
  Button,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {themeColors} from '../theme/colors';
import Icon from 'react-native-vector-icons/FontAwesome5';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import FontisoIcon from 'react-native-vector-icons/Fontisto';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {size} from '../theme/fontStyle';
import {fonts} from '../theme/fonts';
import {Picker} from '@react-native-picker/picker';
import moment, {Moment} from 'moment';
import {Calendar} from 'react-native-calendars';
import {horizontalScale, moderateScale, verticalScale} from '../utils/metrics';
import EveryDayModal from '../components/shared-components/EveryDayModal';
import ScheduleSection from '../components/medication/ScheduleSection';
import IntervalIntakeSection from '../components/medication/IntervalIntakeSection';
import {ToastType, useToast} from 'react-native-toast-notifications';
import {storeMedicationDetails} from '../services/medication';
import {setUserData} from '../store/slices/User';
import {useSelector} from 'react-redux';
import {user} from '../store/selectors';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {hours, minutes} from '../constants';
import {notification_firebase_api} from '../services/notificationService';
import {supabase} from '../utils/supabaseClient';
import {ScheduleObject, SelectedDay} from '../interfaces';
import {scheduleMedicationNotifications} from '../services/medicationReminderService';
// import {notification_firebase_Api} from '../services/notificationService';
import notifee, {TriggerType, TimestampTrigger} from '@notifee/react-native';

type MedicationTimeSlotsProps = {
  route?: {
    params: {
      medication: {
        name?: string;
        condition?: string;
        type?: string;
        color?: string;
        image?: string;
      };
    };
  };
};

const MedicationTimeSlots = ({route}: MedicationTimeSlotsProps) => {
  const {name, condition, type, color, image} = route?.params.medication || {};
  const [periodicityModalVisible, setPeriodicityModalVisible] = useState(false);
  const [intakePlanModalVisible, setIntakePlanModalVisible] = useState(false);
  const [startDateModalVisible, setStartDateModalVisible] = useState(false);
  const [endDateModalVisible, setEndDateModalVisible] = useState(false);
  const [isIntervalModal, setIsIntervalModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toggleRegularNotification, setToggleRegularNotification] =
    useState<boolean>(false);
  const [
    intervalBetweenIntakesModalVisible,
    setIntervalBetweenIntakesModalVisible,
  ] = useState(false);
  const [quantityModalVisible, setQuantityModalVisible] = useState(false);
  // selected_hour
  const [selectedHour, setSelectedHour] = useState<number>(4);
  // 1 real and 1 temporary state
  const [isTextSelected, setIsTextSelected] = useState('Only one day');
  const [isTextTempSelected, setIsTextTempSelected] = useState('Only one day');

  // selectday_____
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedStartDate, setSelectedStartDate] = useState(
    moment().format('YYYY-MM-DD'),
  );

  // end_date_____
  const [selectedEndDate, setSelectedEndDate] = useState(
    moment().add(1, 'days').format('YYYY-MM-DD'),
  );
  console.log('selectedStartDate_____', selectedStartDate);
  // selected_schedule_count
  const [selectedTempScheduleCount, setSelectedTempScheduleCount] = useState(1);
  const [selectedScheduleCount, setSelectedScheduleCount] = useState(1);
  const [isScheduleOrIntervalIntake, setIsScheduleOrIntervalIntake] =
    useState('schedule');
  const userData: any = useSelector(user);
  const navigation = useNavigation<NavigationProp<any>>();

  // interval intake states
  const [selectedTempScheduleCountIntake, setSelectedTempScheduleCountIntake] =
    useState(1);
  const [selectedScheduleCountIntake, setSelectedScheduleCountIntake] =
    useState(1);
  const [isIntervalModalIntake, setIsIntervalModalIntake] =
    useState<boolean>(false);

  const initialvalues: StateType = {
    changeSchedule: 'schedule',
    selectedCount: '1',
  };

  const firebase_api_notifications = async () => {
    try {
      const responseData = await notification_firebase_api();
      console.log('response_data:', responseData);
      return responseData;
    } catch (error) {
      console.log('ERROR FROM NOTIFICATIONS', error);
    }
  };

  const reducer = (state: StateType, action: any) => {
    switch (action.type) {
      case 'updatedSchedule':
        return {
          ...state,
          changeSchedule: action.payload,
        };

      default:
        return state;
    }
  };
  // usereducer_____
  const [state, dispatch] = useReducer(reducer, initialvalues);

  // days_____
  const [days, setDays] = useState([
    {day: 'Mon', isChecked: false},
    {day: 'Tue', isChecked: false},
    {day: 'Wed', isChecked: false},
    {day: 'Thu', isChecked: false},
    {day: 'Fri', isChecked: false},
    {day: 'Sat', isChecked: false},
    {day: 'Sun', isChecked: false},
  ]);

  const [PermDays, setPermDays] = useState([
    {day: 'Mon', isChecked: false},
    {day: 'Tue', isChecked: false},
    {day: 'Wed', isChecked: false},
    {day: 'Thu', isChecked: false},
    {day: 'Fri', isChecked: false},
    {day: 'Sat', isChecked: false},
    {day: 'Sun', isChecked: false},
  ]);

  const toast: ToastType = useToast();
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [doseData, setDoseData] = useState({dose: 1, mgPerDose: 0});
  // ts interface usereducer
  interface StateType {
    changeSchedule: string;
    selectedCount: string;
  }

  // render_icons_____
  const renderIcon = () => {
    switch (type) {
      case 'Tablet':
        return <Icon name="tablets" size={40} color={themeColors.darkGray} />;
      case 'Capsule':
        return <Icon name="capsules" size={40} color={themeColors.darkGray} />;
      case 'Injection':
        return (
          <FontisoIcon
            name="injection-syringe"
            size={40}
            color={themeColors.darkGray}
          />
        );

      case 'Spray':
        return (
          <MaterialCommunityIcon
            name="spray"
            size={40}
            color={themeColors.darkGray}
          />
        );

      case 'Drops':
        return (
          <EntypoIcon name="drop" size={40} color={themeColors.darkGray} />
        );

      case 'Solution':
        return (
          <FontAwesome6
            name="glass-water"
            size={40}
            color={themeColors.darkGray}
          />
        );

      case 'Herbs':
        return (
          <Image
            source={require('../../assets/images/herbalIcon3.png')}
            style={{width: 40, height: 40}}
          />
        );
      default:
        return null;
    }
  };

  const [temp_times, setTempTimes] = useState([
    '09:00',
    '14:00',
    '18:00',
    '22:00',
  ]);

  console.log('temptimes,', temp_times);
  const [timesIntake, setTimesIntake] = useState(['09:00']);
  const scheduleTempTimesToShow = temp_times.slice(
    0,
    selectedTempScheduleCount,
  );

  const scheduleTempTimesToShowIntake = timesIntake.slice(
    0,
    selectedTempScheduleCountIntake,
  );

  console.log(
    '~ scheduleTempTimeTOShowINtake :',
    scheduleTempTimesToShowIntake,
  );
  console.log('scheduleCountIntake :', selectedTempScheduleCountIntake);
  // update intakes for schedule section_____

  const updateTimesSchedule = (
    startHour: number,
    startMinutes: number,
    count: number,
  ) => {
    const newTimes: string[] = [];

    let currentTime = moment(selectedStartDate)
      .hour(startHour) // Set hour to startHour
      .minute(startMinutes) // Set minutes to startMinutes
      .second(0); // Reset seconds to 0

    for (let i = 0; i < count; i++) {
      // Calculate the time for each iteration with 30 minutes interval
      let time = moment(currentTime).add(i * 30, 'minutes'); // Progress by 30 minutes for each entry

      // Determine the display date based on selectedStartDate
      const displayTime = time.format('hh:mm A');

      // Push time with the correct date to the array
      newTimes.push(`${displayTime}`);
    }

    return newTimes;
  };

  useEffect(() => {
    // Use current time without adding 1 hour
    const currentTime = moment();

    const currentHour = currentTime.hour();
    const currentMinutes = currentTime.minute();

    const updatedTimes = updateTimesSchedule(
      currentHour,
      currentMinutes,
      selectedTempScheduleCount, // Number of times to generate
    );
    setTempTimes(updatedTimes);
  }, [selectedTempScheduleCount, selectedStartDate]);

  const updateTimesIntake = (
    startHour: number,
    startMinutes: number,
    interval: number,
    count: number,
  ) => {
    const newTimes: string[] = [];

    let currentTime = moment(selectedStartDate)
      .hour(startHour) // Set hour to startHour
      .minute(startMinutes) // Set minutes to startMinutes
      .second(0); // Reset seconds to 0

    for (let i = 0; i < count; i++) {
      // Calculate the time for each iteration
      let time = moment(currentTime).add(i * interval, 'hours'); // Progress by interval in hours

      // Determine the display date based on selectedStartDate
      const displayDate = time.format('YYYY-MM-DD'); // Correct date for each entry
      const displayTime = time.format('hh:mm A');

      // Push time with the correct date to the array
      newTimes.push(`${displayTime}`);
    }

    return newTimes;
  };

  useEffect(() => {
    // Get the current time and add 1 hour for default
    const currentTime = moment().add(1, 'hours');
    // Extract the default start hour and start minutes
    const currentHour = currentTime.hour();
    const currentMinutes = currentTime.minute();

    const updatedTimes = updateTimesIntake(
      currentHour, // Start hour from current time + 1 hour
      currentMinutes, // Start minutes from current time
      selectedHour, // Interval in hours
      selectedTempScheduleCountIntake, // Number of times
    );
    setTimesIntake(updatedTimes);
  }, [
    selectedHour,
    selectedMinute,
    selectedTempScheduleCountIntake,
    selectedStartDate,
  ]);

  // calculating user schedule

  const generateMedicationSchedule = (
    isTextSelected: string,
    selectedStartDate: string,
    selectedEndDate: string,
    selectedDays: SelectedDay[], // For specific days
    userSelectedDays: number, // For every X days
    scheduleTempTimesToShow: string[],
    type: string,
  ): ScheduleObject[] => {
    const schedule: ScheduleObject[] = [];
    const startDate: Moment = moment(selectedStartDate);
    console.log('start_date :', startDate);
    const endDate: Moment = moment(selectedEndDate);
    const currentTime: Moment = moment();

    console.log('schedule_time_show inside', scheduleTempTimesToShow);

    const createScheduleObject = (date: Moment): ScheduleObject => {
      // UTC date for reference
      const utcDate = date.utc().format('YYYY-MM-DD');

      // Determine which times to use based on the type
      const timesToShow =
        type === 'schedule'
          ? scheduleTempTimesToShow
          : scheduleTempTimesToShowIntake;

      // Convert each time in timesToShow to UTC time
      const utcScheduleTimes = timesToShow.map(time => {
        // Extract hour, minute, and AM/PM from the time string
        const [hourMinute, meridiem] = time.split(' ');
        const [hour, minute] = hourMinute.split(':').map(Number);

        // Convert to 24-hour format considering AM/PM
        let localHour = hour;
        if (meridiem === 'PM' && hour < 12) {
          localHour += 12;
        } else if (meridiem === 'AM' && hour === 12) {
          localHour = 0;
        }

        // Create a moment object for the local time based on the selected date
        const localDateTime = moment(date).set({
          hour: localHour,
          minute: minute,
          second: 0,
          millisecond: 0,
        });

        // Convert to UTC directly
        const utcTime = localDateTime.utc();

        return utcTime.toISOString(); // Convert to full ISO format with UTC time
      });

      // Return the final object
      return {
        schedule_dates: utcDate, // Local date
        schedule_times: timesToShow, // Original times in local format
        utc_schedule_dates: utcDate, // Date in UTC (same value, just formatted)
        utc_schedule_times: utcScheduleTimes, // Times in UTC ISO format
        utcTime: date.utc().format(), // Full UTC date and time
        status: 'pending',
      };
    };

    // Example usage_____

    switch (isTextSelected) {
      case 'Only one day':
        // Add current date and time to the schedule
        schedule.push(createScheduleObject(currentTime));
        break;

      case 'Weekly':
        let weeklyDate = startDate.clone();
        while (weeklyDate.isSameOrBefore(endDate)) {
          schedule.push(
            createScheduleObject(
              weeklyDate.clone().set({
                hour: currentTime.hour(),
                minute: currentTime.minute(),
                second: currentTime.second(),
              }),
            ),
          );
          weeklyDate.add(1, 'week');
        }
        break;

      case 'Every day':
        let dailyDate = startDate.clone();
        while (dailyDate.isSameOrBefore(endDate)) {
          schedule.push(
            createScheduleObject(
              dailyDate.clone().set({
                hour: currentTime.hour(),
                minute: currentTime.minute(),
                second: currentTime.second(),
              }),
            ),
          );
          dailyDate.add(1, 'day');
        }
        break;

      case `Every ${userSelectedDays} Day`:
        let everyXDaysDate = startDate.clone();
        while (everyXDaysDate.isSameOrBefore(endDate)) {
          schedule.push(
            createScheduleObject(
              everyXDaysDate.clone().set({
                hour: currentTime.hour(),
                minute: currentTime.minute(),
                second: currentTime.second(),
              }),
            ),
          );
          everyXDaysDate.add(userSelectedDays, 'days');
        }
        break;

      case 'On specific days of the week':
        const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const specificDays = Array.from(
          new Set(
            selectedDays.filter(item => item.isChecked).map(item => item.day),
          ),
        ).sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));

        let specificDaysDate = startDate.clone();
        while (specificDaysDate.isSameOrBefore(endDate)) {
          specificDays.forEach(day => {
            let dayToAdd = specificDaysDate.clone().day(day);
            if (dayToAdd.isBefore(specificDaysDate, 'day')) {
              dayToAdd.add(1, 'week');
            }
            if (dayToAdd.isSameOrBefore(endDate)) {
              schedule.push(
                createScheduleObject(
                  dayToAdd.clone().set({
                    hour: currentTime.hour(),
                    minute: currentTime.minute(),
                    second: currentTime.second(),
                  }),
                ),
              );
            }
          });
          specificDaysDate.add(1, 'week');
        }
        break;

      default:
        // console.log('Invalid option selected');
        break;
    }

    return schedule;
  };

  // Example usage
  const medicationSchedule = generateMedicationSchedule(
    isTextTempSelected,
    selectedStartDate,
    selectedEndDate,
    days,
    selectedDay,
    scheduleTempTimesToShow,
    isScheduleOrIntervalIntake,
  );

  console.log('medication_schedule', medicationSchedule);
  console.log('seletedDay', selectedDay);

  const callMedicationScheduled = async () => {
    //firebase_api_notifications();
    // intake_times logic
    let intake_Times;

    if (isScheduleOrIntervalIntake === 'schedule') {
      intake_Times = scheduleTempTimesToShow.map(time => time);
    } else {
      intake_Times = scheduleTempTimesToShowIntake.map(time => time);
    }

    let days_Of_the_week;
    let daysValues;

    if (isTextSelected === 'On specific days of the week') {
      daysValues = isTextSelected;
      days_Of_the_week = PermDays.filter(item => item.isChecked).map(
        value => value.day,
      );
    } else {
      daysValues = isTextSelected;
      days_Of_the_week = null;
    }

    let intake_days;
    if (isTextSelected && isTextSelected === `Every ${selectedDay} Day`) {
      intake_days = selectedDay;
    } else {
      intake_days = null;
    }

    const medicationData = {
      medication_name: name,
      medication_description: condition,
      days: daysValues,
      user_id: userData.id,
      type: isScheduleOrIntervalIntake as 'schedule' | 'intervalIntake',
      intake_times: medicationSchedule,
      //schedule_times: medicationSchedule,
      every_x_hour: selectedHour,
      dose_quantity: doseData.dose,
      mg_dose_quantity: doseData.mgPerDose,
      start_date: selectedStartDate,
      end_date: selectedEndDate,
      regular_notifications: toggleRegularNotification,
      intake_days: intake_days,
      week_days: days_Of_the_week,
      created_at: moment(new Date()).valueOf(),
      updated_at: moment(new Date()).valueOf(),
      created_by: userData.id,
      updated_by: userData.id,
      medicine_type: type,
      medicine_image: image ? image : 'avatar',
      is_created_by_admin_panel: false,
      how_schedule_times:
        isScheduleOrIntervalIntake === 'schedule' ? selectedScheduleCount : 1,
      how_intake_times:
        isScheduleOrIntervalIntake === 'intervalIntake'
          ? selectedScheduleCountIntake
          : 1,
      color: color,
    };

    const formattedMedicationData = {
      ...medicationData,
      intake_times: [
        {
          schedule_dates: medicationData.start_date,
          schedule_times: Array.isArray(medicationData.intake_times)
            ? medicationData.intake_times
            : [],
          utc_schedule_dates: medicationData.start_date,
          utc_schedule_times: Array.isArray(medicationData.intake_times)
            ? medicationData.intake_times.map(time => {
                const [timeStr, meridiem] = time.split(' ');
                const [hours, minutes] = timeStr.split(':');
                let hour = parseInt(hours);
                if (meridiem === 'PM' && hour < 12) hour += 12;
                if (meridiem === 'AM' && hour === 12) hour = 0;

                return `${medicationData.start_date}T${hour
                  .toString()
                  .padStart(2, '0')}:${minutes}:00.000Z`;
              })
            : [],
          status: 'pending',
        },
      ],
    };

    console.log('DATA:', JSON.stringify(formattedMedicationData, null, 2));

    const success = await scheduleMedicationNotifications(
      formattedMedicationData,
    );
    if (success) {
      console.log('SUCCESS:', {success});
      toast.show('Medication reminders scheduled successfully', {
        type: 'success',
        placement: 'top',
        duration: 4000,
        animationType: 'slide-in',
      });
    } else {
      console.error('Failed to schedule notifications.');
      toast.show('Failed to schedule medication reminders', {
        type: 'danger',
        placement: 'top',
        duration: 4000,
        animationType: 'slide-in',
      });
    }

    // console.log('~ medications_Data :', medicationData);

    // store data to supabase

    // const notificationData = {
    //   ...medicationData,
    //   intake_times: medicationData.intake_times
    //     .map(schedule => schedule.schedule_times)
    //     .flat(),
    // };

    // await storeMedicationDetails(
    //   // values,
    //   medicationData,
    //   {userid: userData.id},
    //   () => {
    //     setIsLoading(true);
    //   },
    //   async (successData: any) => {
    //     setIsLoading(false);
    //     dispatch(setUserData(successData));
    //     toast.show('Medications details stored', {
    //       type: 'success',
    //       placement: 'top',
    //       duration: 4000,
    //       animationType: 'slide-in',
    //     });
    //     // Extract schedule times as strings before passing to notifications

    //     // navigation.navigate('PillsReminder');
    //   },
    //   (error: any) => {
    //     toast.show(`you're unabel to upload medication details`, {
    //       type: 'danger',
    //       placement: 'top',
    //       duration: 4000,
    //       animationType: 'slide-in',
    //     });
    //     console.log('error :', error);
    //     setIsLoading(false);
    //   },
    // );
  };

  const handleDoseChange = (newDose: any) => {
    setDoseData(prevData => ({
      ...prevData,
      dose: newDose,
    }));
  };

  const handleMgPerDoseChange = (newMg: any) => {
    setDoseData(prevData => ({
      ...prevData,
      mgPerDose: newMg,
    }));
  };
  const toggleHandler = () => {
    setToggleRegularNotification(!toggleRegularNotification);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          minHeight: '90%',
        }}>
        <View style={[styles.medicationContainer, styles.Box]}>
          <View>
            <Text style={[styles.label, {fontSize: size.xlg}]}>{type}</Text>
            <Text style={styles.label}>{name}</Text>
          </View>
          <View>{renderIcon()}</View>
        </View>

        <View style={styles.Box}>
          <TouchableOpacity
            style={[
              styles.BoxItem,
              {
                borderBottomWidth: 1,
                borderBottomColor: themeColors.lightGray,
              },
            ]}
            onPress={() => setPeriodicityModalVisible(true)}>
            <Text style={[styles.label, {fontFamily: fonts.OpenSansRegular}]}>
              {isTextSelected}
            </Text>
            <MaterialIcon
              name="arrow-forward-ios"
              size={15}
              color={themeColors.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.BoxItem,
              {
                borderBottomWidth: 1,
                borderBottomColor: themeColors.lightGray,
              },
            ]}
            onPress={() => setIntakePlanModalVisible(true)}>
            {isScheduleOrIntervalIntake === 'schedule' ? (
              <View>
                <Text
                  style={[styles.label, {fontFamily: fonts.OpenSansRegular}]}>
                  {`${selectedScheduleCount} Times per day (${isScheduleOrIntervalIntake})`}
                </Text>

                <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                  {scheduleTempTimesToShow?.map((time, index) => (
                    <View
                      key={index}
                      style={{
                        borderWidth: 1,
                        borderRadius: 50,
                        marginHorizontal: horizontalScale(2),
                        borderColor: themeColors.primary,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingHorizontal: horizontalScale(10),
                        paddingVertical: verticalScale(3),
                        marginVertical: verticalScale(5),
                      }}>
                      <Text
                        key={index}
                        style={[
                          {
                            textAlign: 'center',
                            fontWeight: '900',
                            fontSize: moderateScale(13),
                            color: themeColors.primary,
                          },
                        ]}>
                        {time}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <>
                <View>
                  <Text
                    style={[styles.label, {fontFamily: fonts.OpenSansRegular}]}>
                    {`${selectedScheduleCountIntake} Times per day (${isScheduleOrIntervalIntake})`}
                  </Text>

                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                    }}>
                    {scheduleTempTimesToShowIntake?.map((time, index) => (
                      <View
                        key={index}
                        style={{
                          borderWidth: 1,
                          borderRadius: 20,
                          marginHorizontal: horizontalScale(3),
                          borderColor: themeColors.primary,
                          justifyContent: 'center',
                          alignItems: 'center',
                          paddingHorizontal: horizontalScale(10),
                          paddingVertical: verticalScale(2),
                          marginVertical: verticalScale(5),
                        }}>
                        <Text
                          key={index}
                          style={[
                            {
                              textAlign: 'center',
                              fontWeight: '900',
                              fontSize: moderateScale(13),
                              color: themeColors.primary,
                            },
                          ]}>
                          {time}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            )}
            <MaterialIcon
              name="arrow-forward-ios"
              size={15}
              color={themeColors.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.BoxItem,
              {
                borderBottomWidth: 1,
                borderBottomColor: themeColors.lightGray,
              },
            ]}
            onPress={() => setQuantityModalVisible(true)}>
            <Text style={[styles.label, {fontFamily: fonts.OpenSansRegular}]}>
              {`Quantity per intake (${doseData.dose}.${doseData.mgPerDose})`}
            </Text>
            <MaterialIcon
              name="arrow-forward-ios"
              size={15}
              color={themeColors.primary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.Box}>
          <TouchableOpacity
            style={[
              styles.BoxItem,
              {
                borderBottomWidth: 1,
                borderBottomColor: themeColors.lightGray,
              },
            ]}
            onPress={() => {
              setStartDateModalVisible(true);
            }}>
            <Text style={[styles.label, {fontFamily: fonts.OpenSansRegular}]}>
              Starts: {moment(selectedStartDate).format('dddd, DD MMMM')}
            </Text>
            <MaterialIcon
              name="arrow-forward-ios"
              size={15}
              color={themeColors.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.BoxItem,
              {
                borderBottomWidth: 1,
                borderBottomColor: themeColors.lightGray,
              },
            ]}
            onPress={() => setEndDateModalVisible(true)}>
            <View>
              <Text style={[styles.label, {fontFamily: fonts.OpenSansRegular}]}>
                Ends: {moment(selectedEndDate).format('dddd, DD MMMM')}
              </Text>
            </View>
            <MaterialIcon
              name="arrow-forward-ios"
              size={15}
              color={themeColors.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              toggleHandler();
            }}
            style={[
              styles.BoxItem,
              {
                borderBottomWidth: 1,
                borderBottomColor: themeColors.lightGray,
              },
            ]}>
            <Text style={[styles.label, {fontFamily: fonts.OpenSansRegular}]}>
              Regular notifications
            </Text>
            <Switch
              onTouchStart={() => {
                toggleHandler();
              }}
              style={{position: 'absolute', right: 0}}
              value={toggleRegularNotification}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity
        activeOpacity={0.7}
        disabled={isLoading ? true : false}
        style={styles.actionBtnText}
        onPress={() => {
          callMedicationScheduled();
          // await scheduleNotification();
          // firebase_api_notifications();
          // medications_api();
        }}>
        {isLoading ? (
          <ActivityIndicator size="small" color={themeColors.white} />
        ) : (
          <Text style={styles.donetext}>{'Done'}</Text>
        )}
      </TouchableOpacity>

      <EveryDayModal
        setStateModal={setPeriodicityModalVisible}
        stateModal={periodicityModalVisible}
        setIsTextSelected={setIsTextSelected}
        isTextSelected={isTextSelected}
        setIsTempTextSelected={setIsTextTempSelected}
        isTextTempSelected={isTextTempSelected}
        setSelectedDay={setSelectedDay}
        selectedDay={selectedDay}
        days={days}
        setDays={setDays}
        PermDays={PermDays}
        setPermDays={setPermDays}
      />

      {/*  Times Per Day Modal Start */}

      <Modal
        visible={intakePlanModalVisible}
        transparent
        animationType="none"
        onRequestClose={() => setIntakePlanModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text
              style={[
                styles.label,
                {textAlign: 'center', fontSize: size.xlg, marginBottom: 20},
              ]}>
              Intake Plan
            </Text>

            <View style={styles.intakePlanHeader}>
              <TouchableOpacity
                onPress={() => {
                  dispatch({type: 'updatedSchedule', payload: 'schedule'});
                }}
                style={{justifyContent: 'center', alignItems: 'center'}}>
                <MaterialIcon
                  name="schedule"
                  size={20}
                  color={
                    state.changeSchedule === 'schedule'
                      ? themeColors.primary
                      : themeColors.darkGray
                  }
                />

                <Text
                  style={[
                    styles.label,
                    {
                      fontSize: size.sl,
                      color:
                        state.changeSchedule === 'schedule'
                          ? themeColors.primary
                          : themeColors.darkGray,
                    },
                  ]}>
                  Schedule
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                // onPress={() => setIntervalIntake(true)}
                onPress={() => {
                  dispatch({
                    type: 'updatedSchedule',
                    payload: 'intervalintake',
                  });
                }}
                style={{justifyContent: 'center', alignItems: 'center'}}>
                <FontisoIcon
                  name="arrow-swap"
                  size={20}
                  color={
                    state.changeSchedule === 'intervalintake'
                      ? themeColors.primary
                      : themeColors.darkGray
                  }
                />
                <Text
                  style={[
                    styles.label,
                    {
                      fontSize: size.sl,
                      color:
                        state.changeSchedule === 'intervalintake'
                          ? themeColors.primary
                          : themeColors.darkGray,
                    },
                  ]}>
                  Interval intake
                </Text>
              </TouchableOpacity>
            </View>

            {state.changeSchedule === 'schedule' ? (
              <>
                <ScheduleSection
                  setIsIntervalModal={setIsIntervalModal}
                  selectedTempScheduleCount={selectedTempScheduleCount}
                  setTempTimes={setTempTimes}
                  setSelectedTempScheduleCount={setSelectedTempScheduleCount}
                  setSelectedScheduleCount={setSelectedScheduleCount}
                  setIntakePlanModalVisible={setIntakePlanModalVisible}
                  scheduleTempTimesToShow={scheduleTempTimesToShow}
                  selectedScheduleCount={selectedScheduleCount}
                  isIntervalModal={isIntervalModal}
                  setIsScheduleOrIntervalIntake={setIsScheduleOrIntervalIntake}
                  isScheduleOrIntervalIntake={isScheduleOrIntervalIntake}
                  selectedStartDate={selectedStartDate}
                  startDateModalVisible={startDateModalVisible}
                  setSelectedStartDate={setSelectedStartDate}
                  temp_times={temp_times}
                  editPage={false}
                  // isDatePickerVisible={isDatePickerVisible}
                />
              </>
            ) : (
              <IntervalIntakeSection
                setIntervalBetweenIntakesModalVisible={
                  setIntervalBetweenIntakesModalVisible
                }
                setIntakePlanModalVisible={setIntakePlanModalVisible}
                setIsIntervalModalIntake={setIsIntervalModalIntake}
                isIntervalModalIntake={isIntervalModalIntake}
                // counting variables temp and perm
                setSelectedTempScheduleCountIntake={
                  setSelectedTempScheduleCountIntake
                }
                selectedTempScheduleCountIntake={
                  selectedTempScheduleCountIntake
                }
                selectedScheduleCountIntake={selectedScheduleCountIntake}
                setSelectedScheduleCountIntake={setSelectedScheduleCountIntake}
                // counting  variable close temp and perm
                setIsScheduleOrIntervalIntake={setIsScheduleOrIntervalIntake}
                isScheduleOrIntervalIntake={isScheduleOrIntervalIntake}
                selectedHour={selectedHour}
                setSelectedHour={setSelectedHour}
                selectedMinute={selectedMinute}
                setSelectedMinute={setSelectedMinute}
                setTimesIntake={setTimesIntake}
                timesIntake={timesIntake}
                scheduleTempTimesToShowIntake={scheduleTempTimesToShowIntake}
                selectedStartDate={selectedStartDate}
                selectedEndDate={selectedEndDate}
                editPage={false}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* xxxxxxxxxxxxxxxxxx Times Per Day Modal Close xxxxxxxxxxxxxxxxxx */}

      {/* <TimesPerdayModal
        intakePlanModalVisible={intakePlanModalVisible}
        setIntakePlanModalVisible={setIntakePlanModalVisible}
        setIntervalIntake={setIntervalIntake}
        IntervalIntake={intervalIntake}
        setIsIntervalModal={setIsIntervalModal}
        isIntervalModal={isIntervalModal}
        setIntervalBetweenIntakesModalVisible={
          setIntervalBetweenIntakesModalVisible
        }
        intervalBetweenIntakesModalVisible={intervalBetweenIntakesModalVisible}
      /> */}

      {/* every 4 hour modal start */}

      <Modal
        visible={intervalBetweenIntakesModalVisible}
        transparent
        animationType="none"
        onRequestClose={() => setIntervalBetweenIntakesModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, {alignItems: 'center'}]}>
            <Text
              style={[
                styles.label,
                {textAlign: 'center', fontSize: size.xlg, marginBottom: 20},
              ]}>
              Interval between intakes
            </Text>
            <View style={styles.pickerContainer}>
              <View style={styles.pickerWrapper}>
                <Text style={styles.pickerLabel}>Hours</Text>
                <Picker
                  selectedValue={selectedHour}
                  dropdownIconColor={themeColors.black}
                  style={styles.picker}
                  onValueChange={itemValue => setSelectedHour(itemValue)}>
                  {hours.map(hour => (
                    <Picker.Item
                      key={hour}
                      label={hour.toString()}
                      value={hour}
                    />
                  ))}
                </Picker>
              </View>

              <Text style={styles.pickerLabel}>:</Text>
              <View style={styles.pickerWrapper}>
                <Text style={styles.pickerLabel}>Minutes</Text>
                <Picker
                  dropdownIconColor={themeColors.black}
                  selectedValue={selectedMinute}
                  style={styles.picker}
                  onValueChange={itemValue => setSelectedMinute(itemValue)}>
                  {minutes.map(minute => (
                    <Picker.Item
                      key={minute}
                      label={minute.toString()}
                      value={minute}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={{flexDirection: 'row', marginTop: verticalScale(10)}}>
              <TouchableOpacity
                style={[
                  styles.closeButton,
                  {
                    flex: 1,
                    backgroundColor: 'transparent',
                    borderColor: themeColors.primary,
                    borderWidth: 1,
                  },
                ]}
                onPress={() => setIntervalBetweenIntakesModalVisible(false)}>
                <Text
                  style={[
                    styles.closeButtonText,
                    {textAlign: 'center', color: themeColors.primary},
                  ]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.closeButton, {flex: 1}]}
                onPress={() => setIntervalBetweenIntakesModalVisible(false)}>
                <Text style={[styles.closeButtonText, {textAlign: 'center'}]}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* every 4 hour modal close */}

      <Modal
        visible={quantityModalVisible}
        transparent
        animationType="none"
        onRequestClose={() => setQuantityModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, {alignItems: 'center'}]}>
            <Text
              style={[
                styles.label,
                {textAlign: 'center', fontSize: size.xlg, marginBottom: 20},
              ]}>
              Quantity per intake
            </Text>
            <View style={styles.pickerContainer}>
              <View style={styles.pickerWrapper}>
                <Text style={styles.pickerLabel}>Dose</Text>
                <Picker
                  selectedValue={doseData.dose.toString()}
                  style={styles.picker}
                  dropdownIconColor={themeColors.black}
                  onValueChange={handleDoseChange}>
                  {[...Array(100).keys()].map(d => (
                    <Picker.Item
                      key={d + 1}
                      label={`${d + 1}`}
                      value={`${d + 1}`}
                    />
                  ))}
                </Picker>
              </View>
              <Text style={styles.pickerLabel}>,</Text>
              <View style={styles.pickerWrapper}>
                <Text style={styles.pickerLabel}>MG/Dose</Text>
                <Picker
                  dropdownIconColor={themeColors.black}
                  selectedValue={doseData.mgPerDose.toString()}
                  style={styles.picker}
                  onValueChange={handleMgPerDoseChange}>
                  {['0', '25', '50', '75', '1'].map(g => (
                    <Picker.Item key={g} label={g} value={g} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={{flexDirection: 'row', marginTop: 10}}>
              <TouchableOpacity
                style={[
                  styles.closeButton,
                  {
                    flex: 1,
                    backgroundColor: 'transparent',
                    borderColor: themeColors.primary,
                    borderWidth: 1,
                  },
                ]}
                onPress={() => setQuantityModalVisible(false)}>
                <Text
                  style={[
                    styles.closeButtonText,
                    {textAlign: 'center', color: themeColors.primary},
                  ]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.closeButton, {flex: 1}]}
                onPress={() => setQuantityModalVisible(false)}>
                <Text style={[styles.closeButtonText, {textAlign: 'center'}]}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={startDateModalVisible}
        transparent
        animationType="none"
        onRequestClose={() => setStartDateModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Calendar
              current={selectedStartDate}
              onDayPress={(day: any) => {
                setSelectedStartDate(day.dateString);
                setStartDateModalVisible(false);
              }}
              markedDates={{
                [selectedStartDate]: {
                  selected: true,
                  selectedColor: themeColors.primary,
                },
              }}
              theme={{
                selectedDayBackgroundColor: themeColors.primary,
                todayTextColor: themeColors.primary,
                arrowColor: themeColors.primary,
                monthTextColor: themeColors.primary,
                textDayFontFamily: fonts.OpenSansRegular,
                textMonthFontFamily: fonts.OpenSansRegular,
                textDayHeaderFontFamily: fonts.OpenSansRegular,
              }}
              style={styles.calendar}
            />
            <TouchableOpacity
              style={[styles.closeButton]}
              onPress={() => setStartDateModalVisible(false)}>
              <Text style={[styles.closeButtonText]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={endDateModalVisible}
        transparent
        animationType="none"
        onRequestClose={() => setEndDateModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Calendar
              current={selectedEndDate}
              onDayPress={(day: any) => {
                setSelectedEndDate(day.dateString);
                setEndDateModalVisible(false);
              }}
              markedDates={{
                [selectedEndDate]: {
                  selected: true,
                  selectedColor: themeColors.primary,
                },
              }}
              theme={{
                selectedDayBackgroundColor: themeColors.primary,
                todayTextColor: themeColors.primary,
                arrowColor: themeColors.primary,
                monthTextColor: themeColors.primary,
                textDayFontFamily: fonts.OpenSansRegular,
                textMonthFontFamily: fonts.OpenSansRegular,
                textDayHeaderFontFamily: fonts.OpenSansRegular,
              }}
              style={styles.calendar}
            />
            <TouchableOpacity
              style={[styles.closeButton]}
              onPress={() => setEndDateModalVisible(!endDateModalVisible)}>
              <Text style={[styles.closeButtonText]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: themeColors.lightGray,
  },
  inputContainer: {},
  label: {
    fontSize: size.md,
    fontFamily: fonts.OpenSansBold,
    color: themeColors.darkGray,
    marginBottom: 5,
  },
  input: {
    padding: 0,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: themeColors.darkGray,
    fontSize: size.md,
    color: themeColors.black,
  },
  textInput: {
    height: 150,
    textAlignVertical: 'top',
  },
  item: {
    width: 80, // Adjusted width to fit 4 items on most screens
    height: 80, // Fixed height for the box
    marginHorizontal: 5, // Space between items
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  itemText: {
    textAlign: 'center',
    marginTop: 10,
    fontFamily: fonts.OpenSansRegular,
    fontSize: size.sl,
  },
  colorPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  colorButton: {
    marginTop: 20,
    padding: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorButtonText: {
    color: themeColors.white,
    fontFamily: fonts.OpenSansRegular,
    fontSize: size.md,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    // alignItems: 'center',
  },
  selectColorText: {
    fontSize: size.md,
    color: themeColors.darkGray,
    fontFamily: fonts.OpenSansBold,
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  colorBox: {
    width: 40,
    height: 40,
    margin: 10,
    // marginHorizontal:20,
    borderRadius: 20,
    borderColor: themeColors.darkGray,
    borderWidth: 1,
  },
  closeButton: {
    margin: 10,
    padding: 10,
    backgroundColor: themeColors.primary,
    borderRadius: 5,
    alignSelf: 'center',
  },
  closeButtonText: {
    fontSize: size.md,
    color: themeColors.white,
  },
  photoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  donetext: {
    color: themeColors.white,
    fontSize: size.md,
    fontFamily: fonts.OpenSansBold,
  },
  backBtnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  Box: {
    backgroundColor: themeColors.white,
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
  },
  BoxItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  medicationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  intakePlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },

  pickerContainer: {
    flexDirection: 'row',
    // alignItems: 'center',
  },
  pickerWrapper: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  pickerLabel: {
    fontSize: size.md,
    fontFamily: fonts.OpenSansMedium,
    color: themeColors.black,
    // marginBottom: 5,
  },
  picker: {
    // height: 200,
    width: horizontalScale(105),
    color: themeColors.black,
    borderWidth: 2,
    // backgroundColor: 'orange',
    borderColor: themeColors.black,
  },
  calendar: {
    width: '100%',
    borderRadius: 10,
  },
});

export default MedicationTimeSlots;
