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
} from 'react-native';
import {themeColors} from '../../theme/colors';
import Icon from 'react-native-vector-icons/FontAwesome5';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import FontisoIcon from 'react-native-vector-icons/Fontisto';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {size} from '../../theme/fontStyle';
import {fonts} from '../../theme/fonts';
import {Picker} from '@react-native-picker/picker';
import moment, {Moment} from 'moment';
import {Calendar} from 'react-native-calendars';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import EveryDayModal from '../../components/shared-components/EveryDayModal';
import ScheduleSection from '../../components/medication/ScheduleSection';
import IntervalIntakeSection from '../../components/medication/IntervalIntakeSection';
import {ToastType, useToast} from 'react-native-toast-notifications';
import {updateMedicationDetails} from '../../services/medication';
import {setUserData} from '../../store/slices/User';
import {useSelector} from 'react-redux';
import {user} from '../../store/selectors';
import {ScheduleObject, SelectedDay, StateType} from '../../interfaces';
import {ActivityIndicator} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {notification_firebase_api} from '../../services/notificationService';

type MedicationTimeSlotsProps = {
  route?: {
    params: {
      medicationsDetailsData: {
        id: string;
        user_id: string;
        medication_name: string;
        medication_description: string;

        intake_times: any;
        start_date: string;
        end_date: string;
        days: string | undefined;
        type: string;
        regular_notifications: boolean;
        is_created_by_admin_panel: boolean;
        created_by: string;
        updated_by: string;
        created_at: number;
        updated_at: number;
        how_schedule_times: number;
        how_intake_times: number;
        medicine_image: string;
        medicine_type: string;
        week_days: string[];
        intake_days: number | null;
        color: string;
        is_checked_days: string[];
        every_x_hour: number;
        dose_quantity: string | undefined;
        mg_dose_quantity: string | undefined;
      };
    };
  };
};

const EditMedications = ({route}: MedicationTimeSlotsProps) => {
  const {
    week_days,
    intake_days,
    medicine_image,
    medicine_type,
    days,
    end_date,
    id,
    intake_times,
    dose_quantity,
    mg_dose_quantity,
    regular_notifications,
    start_date,
    user_id,
    type,
    how_schedule_times,
    how_intake_times,
    every_x_hour,
  } = route?.params?.medicationsDetailsData || {};

  // console.log('how_schedule_times', how_schedule_times);
  // console.log('how_intake_times', how_intake_times);
  console.log('intake_times___', intake_times);

  intake_times.forEach((schedule: any) => {
    console.log(`Date: ${schedule.schedule_dates}`);
    schedule.schedule_times.forEach((time: Moment, index: any) => {
      console.log(`${time}`);
    });
  });

  const {
    color,
    editcondition,
    editname,
    image,
    type: medType,
  }: any = route?.params || {};

  const [periodicityModalVisible, setPeriodicityModalVisible] = useState(false);
  const [intakePlanModalVisible, setIntakePlanModalVisible] = useState(false);
  const [startDateModalVisible, setStartDateModalVisible] = useState(false);
  const [endDateModalVisible, setEndDateModalVisible] = useState(false);
  const [isIntervalModal, setIsIntervalModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [
    intervalBetweenIntakesModalVisible,
    setIntervalBetweenIntakesModalVisible,
  ] = useState(false);
  const [quantityModalVisible, setQuantityModalVisible] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number | undefined>(
    every_x_hour,
  );

  const [isTextSelected, setIsTextSelected] = useState(days);
  const [isTextTempSelected, setIsTextTempSelected] = useState(days);

  const [selectedDay, setSelectedDay] = useState(intake_days ?? 1);
  const [selectedStartDate, setSelectedStartDate] = useState<any>(start_date);
  const [selectedEndDate, setSelectedEndDate] = useState<any | Date>(end_date);
  const [selectedTempScheduleCount, setSelectedTempScheduleCount] =
    useState<any>(how_schedule_times ?? 1);

  const [selectedScheduleCount, setSelectedScheduleCount] = useState(
    how_schedule_times ?? 1,
  );

  const [isScheduleOrIntervalIntake, setIsScheduleOrIntervalIntake] =
    useState(type);
  const [toggleRegularNotification, setToggleRegularNotification] = useState<
    boolean | undefined
  >(regular_notifications);

  const userData: any = useSelector(user);

  const [selectedTempScheduleCountIntake, setSelectedTempScheduleCountIntake] =
    useState(how_intake_times ?? 1);

  const [selectedScheduleCountIntake, setSelectedScheduleCountIntake] =
    useState(how_intake_times ?? 1);
  // navigation_____
  const navigation = useNavigation<any>();
  const [isIntervalModalIntake, setIsIntervalModalIntake] =
    useState<boolean>(false);

  const [PermDays, setPermDays] = useState([
    {day: 'Mon', isChecked: false},
    {day: 'Tue', isChecked: false},
    {day: 'Wed', isChecked: false},
    {day: 'Thu', isChecked: false},
    {day: 'Fri', isChecked: false},
    {day: 'Sat', isChecked: false},
    {day: 'Sun', isChecked: false},
  ]);

  const [isDays, setisDays] = useState<any>([
    {day: 'Mon', isChecked: false},
    {day: 'Tue', isChecked: false},
    {day: 'Wed', isChecked: false},
    {day: 'Thu', isChecked: false},
    {day: 'Fri', isChecked: false},
    {day: 'Sat', isChecked: false},
    {day: 'Sun', isChecked: false},
  ]);

  const toast: ToastType = useToast();

  // toggle_____

  const toggleHandler = () => {
    setToggleRegularNotification(!toggleRegularNotification);
  };

  // useeffect_____

  useEffect(() => {
    const updatedDays = isDays.map((item: any) => ({
      ...item,
      isChecked: week_days?.includes(item.day),
    }));
    const updatedPermDays = isDays.map((item: any) => ({
      ...item,
      isChecked: week_days?.includes(item.day),
    }));
    setisDays(updatedDays);
    setPermDays(updatedPermDays);
  }, [week_days]);

  const [selectedMinute, setSelectedMinute] = useState(0);
  const [doseData, setDoseData] = useState({
    dose: dose_quantity ?? '1',
    mgPerDose: mg_dose_quantity ?? '0',
  });
  const hours = Array.from({length: 24}, (_, i) =>
    i.toString().padStart(2, '0'),
  );

  const minutes = Array.from({length: 60}, (_, i) =>
    i.toString().padStart(2, '0'),
  );

  const initialvalues: StateType = {
    changeSchedule: 'schedule',
    selectedCount: '1',
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

  // useReducer_____
  const [state, dispatch] = useReducer(reducer, initialvalues);

  const renderIcon = () => {
    switch (medicine_type) {
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
            source={require('../../../assets/images/herbalIcon3.png')}
            style={{width: 40, height: 40}}
          />
        );
      default:
        return null;
    }
  };

  // const times_array = intake_times
  //   .slice(0, 1)
  //   ?.map((item: any) => item.schedule_times);
  // console.log('times_:', times_array);

  const [temp_times, setTempTimes] = useState<string[] | any>(intake_times);
  console.log('! temp_times :', temp_times);
  const [timesIntake, setTimesIntake] = useState<string[] | any>(intake_times);
  const scheduleTempTimesToShow = Array.isArray(temp_times?.schedule_times)
    ? temp_times.schedule_times?.slice(0, selectedTempScheduleCount)
    : [];

  const scheduleTempTimesToShowIntake = Array.isArray(
    timesIntake?.schedule_times,
  )
    ? timesIntake?.schedule_times?.slice(0, selectedTempScheduleCountIntake)
    : [];

  console.log(
    ' scheduleTempTimesToShowIntake_new',
    scheduleTempTimesToShowIntake,
  );

  const firebase_api_notifications = async () => {
    try {
      const responseData = await notification_firebase_api();
      console.log('response_data:', responseData);
      return responseData;
    } catch (error) {
      console.log('ERROR FROM NOTIFICATIONS', error);
    }
  };

  // const updateTimesSchedule = (count: number) => {
  //   const newTimes: string[] = [];

  //   // Start from the current time instead of TempTimes last value
  //   let currentTime = moment().add(30, 'minutes');

  //   for (let i = 0; i < count; i++) {
  //     let time = moment(currentTime).add(i * 30, 'minutes');
  //     // const displayDate = moment(selectedStartDate).format('YYYY-MM-DD'); // New date from selectedStartDate
  //     const displayTime = time.format('hh:mm A'); // Newly calculated time
  //     // Push time with the correct date to the array
  //     newTimes.push(`${displayTime}`);
  //   }
  //   return newTimes;
  // };

  // useEffect(() => {
  //   const updatedTimes = updateTimesSchedule(
  //     selectedTempScheduleCount, // Number of times to generate
  //   );
  //   console.log('~ updated_times_schedule:', updatedTimes);

  //   setTempTimes(updatedTimes);
  // }, [selectedTempScheduleCount, selectedStartDate]);

  useEffect(() => {
    const times = intake_times[0] || []; // Access schedule_times directly
    console.log('times_ in_useeffect:', times); // Should log: ["07:45 PM", "08:15 PM", ...]
    setTempTimes(times); // Set times as a flat array
    setTimesIntake(times);
  }, []);

  // console.log('timesintaek', timesIntake);

  // const updateTimesIntake = (
  //   startHour: number,
  //   startMinutes: number,
  //   interval: number,
  //   count: number,
  // ) => {
  //   const newTimes: string[] = [];

  //   let currentTime = moment(selectedStartDate)
  //     .hour(startHour) // Set hour to startHour
  //     .minute(startMinutes) // Set minutes to startMinutes
  //     .second(0); // Reset seconds to 0

  //   for (let i = 0; i < count; i++) {
  //     // Calculate the time for each iteration
  //     let time = moment(currentTime).add(i * interval, 'hours'); // Progress by interval in hours

  //     // Determine the display date based on selectedStartDate
  //     // const displayDate = time.format('YYYY-MM-DD'); // Correct date for each entry
  //     const displayTime = time.format('hh:mm A');

  //     // Push time with the correct date to the array
  //     newTimes.push(`${displayTime}`);
  //   }
  //   return newTimes;
  // };

  // useEffect(() => {
  //   // Get the current time and add 1 hour for default
  //   const currentTime = moment().add(1, 'hours');

  //   // Extract the default start hour and start minutes
  //   const currentHour = currentTime.hour();
  //   const currentMinutes = currentTime.minute();

  //   const updatedTimes = updateTimesIntake(
  //     currentHour, // Start hour from current time + 1 hour
  //     currentMinutes, // Start minutes from current time
  //     selectedHour, // Interval in hours
  //     selectedTempScheduleCountIntake, // Number of times
  //   );

  //   console.log('updated_times_____', updatedTimes);
  //   // setTimesIntake(updatedTimes);
  // }, [
  //   selectedHour,
  //   selectedMinute,
  //   selectedTempScheduleCountIntake,
  //   selectedStartDate,
  // ]);

  const generateMedicationSchedule = (
    isTextSelected: string,
    selectedStartDate: string,
    selectedEndDate: string,
    selectedDays: SelectedDay[], // For specific days
    userSelectedDays: number, // For every X days
    scheduleTempTimesToShow: string[],
  ): ScheduleObject[] => {
    const schedule: ScheduleObject[] = [];
    const startDate: Moment = moment(selectedStartDate);
    console.log('start_date :', startDate);
    const endDate: Moment = moment(selectedEndDate);
    const currentTime: Moment = moment();

    console.log('schedule_time_show inside', scheduleTempTimesToShow);

    const createScheduleObject = (date: Moment): ScheduleObject => {
      // UTC date for reference_____
      const utcDate = date.utc().format('YYYY-MM-DD');

      // Determine which times to use based on the type_____
      const timesToShow =
        type === 'schedule'
          ? scheduleTempTimesToShow
          : scheduleTempTimesToShowIntake;

      // Convert each time in timesToShow to UTC time_____
      const utcScheduleTimes = timesToShow.map((time: any) => {
        // Extract hour, minute, and AM/PM from the time string_____
        const [hourMinute, meridiem] = time.split(' ');
        const [hour, minute] = hourMinute.split(':').map(Number);

        // Convert to 24-hour format considering AM/PM_____
        let localHour = hour;
        if (meridiem === 'PM' && hour < 12) {
          localHour += 12;
        } else if (meridiem === 'AM' && hour === 12) {
          localHour = 0;
        }

        // Create a moment object for the local time_____

        const localDateTime = moment.utc().set({
          hour: localHour,
          minute: minute,
          second: 0,
          millisecond: 0,
        });

        // Subtract 5 hours to convert local PKT to UTC
        const utcTime = localDateTime.subtract(5, 'hours');

        return utcTime.toISOString(); // Convert to full ISO format with UTC time
      });

      return {
        schedule_dates: utcDate,
        schedule_times: timesToShow, // Original times in local format
        utc_schedule_dates: utcDate, // Date in UTC
        utc_schedule_times: utcScheduleTimes, // Times in UTC ISO format
        utcTime: date.utc().format(), // Full UTC date and time
        status: 'pending',
      };
    };

    // Example usage

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
        console.log('Invalid option selected');
        break;
    }

    return schedule;
  };

  // Example usage_____
  const medicationSchedule = generateMedicationSchedule(
    isTextTempSelected, // Should be defined in your context
    selectedStartDate, // Should be defined in your context
    selectedEndDate, // Should be defined in your context
    PermDays, // Should be defined in your context
    selectedDay, // Should be defined in your context
    scheduleTempTimesToShow,
  );

  console.log('~ medication_schedule edit_page:', medicationSchedule);

  const callMedicationUpdated = async () => {
    firebase_api_notifications();

    let intake_Times;

    if (isScheduleOrIntervalIntake === 'schedule') {
      intake_Times = scheduleTempTimesToShow.map(
        (time: any) => time.schedule_times,
      );
    } else {
      intake_Times = scheduleTempTimesToShowIntake.map(
        (time: any) => time.schedule_times,
      );
    }

    let days_Of_the_week;
    let daysValues;

    if (isTextSelected === 'On specific days of the week') {
      daysValues = isTextSelected;
      days_Of_the_week = PermDays.filter(
        item => item.isChecked && item.day !== undefined,
      ).map(value => value.day);
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
      medication_name: editname,
      medication_description: editcondition,
      days: daysValues,
      user_id: userData.id,
      type: isScheduleOrIntervalIntake,
      intake_times: medicationSchedule,
      every_x_hour: selectedHour,
      start_date: selectedStartDate,
      end_date: selectedEndDate,
      regular_notifications: toggleRegularNotification,
      intake_days: intake_days,
      week_days: days_Of_the_week,
      created_at: moment(new Date()).valueOf(),
      updated_at: moment(new Date()).valueOf(),
      created_by: userData.id,
      medicine_type: medType,
      medicine_image: image ? image : 'avatar',
      updated_by: userData.id,
      is_created_by_admin_panel: false,
      dose_quantity: doseData.dose,
      mg_dose_quantity: doseData.mgPerDose,
      how_schedule_times:
        isScheduleOrIntervalIntake === 'schedule' ? selectedScheduleCount : 1,
      how_intake_times:
        isScheduleOrIntervalIntake === 'intervalIntake'
          ? selectedScheduleCountIntake
          : 1,
      color: color,
    };

    console.log('~ medication-data :', medicationData); // ye check karein ke value sahi aa rahi hai
    await updateMedicationDetails(
      // values,
      medicationData,
      id,
      () => {
        setIsLoading(true);
      },
      (successData: any) => {
        setIsLoading(false);
        dispatch(setUserData(successData));
        toast.show('Medications details updated', {
          type: 'success',
          placement: 'top',
          duration: 4000,
          animationType: 'slide-in',
        });
        navigation.navigate('PillsReminder');
      },
      (error: any) => {
        toast.show(`you're unabel to upload medication details`, {
          type: 'danger',
          placement: 'top',
          duration: 4000,
          animationType: 'slide-in',
        });
        console.log('~ error :', error);
        setIsLoading(false);
      },
    );
  };
  console.log('schedule_TIMESSHOW', scheduleTempTimesToShow);
  const handleDoseChange = (newDose: any) => {
    setDoseData(prevData => ({
      ...prevData,
      dose: newDose, // Store dose as a number
    }));
  };

  const handleMgPerDoseChange = (newMg: any) => {
    setDoseData(prevData => ({
      ...prevData,
      mgPerDose: newMg, // Store mg as a number
    }));
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          minHeight: '90%',
        }}>
        <View
          style={[
            styles.medicationContainer,
            styles.Box,
            {
              backgroundColor: themeColors.white,
            },
          ]}>
          <View>
            <Text
              style={[
                styles.label,
                {fontSize: size.xlg, width: horizontalScale(250)},
              ]}>
              {editname}
            </Text>
            <Text
              style={{
                fontSize: size.md,
                fontFamily: fonts.OpenSansBold,
                color: themeColors.darkGray,
                marginBottom: 5,
                width: horizontalScale(250),
              }}>
              {editcondition}
            </Text>
          </View>
          <View>{renderIcon()}</View>
        </View>

        <View
          style={[
            styles.Box,
            {
              backgroundColor: themeColors.white,
            },
          ]}>
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
            onPress={() => {
              if (isScheduleOrIntervalIntake == 'schedule') {
                dispatch({type: 'updatedSchedule', payload: 'schedule'});
                setIntakePlanModalVisible(true);
              } else {
                dispatch({type: 'updatedSchedule', payload: 'intervalIntake'});
                setIntakePlanModalVisible(true);
              }
            }}>
            {isScheduleOrIntervalIntake === 'schedule' ? (
              <View>
                <Text
                  style={[styles.label, {fontFamily: fonts.OpenSansRegular}]}>
                  {`${selectedScheduleCount} Times per day (${isScheduleOrIntervalIntake})`}
                </Text>

                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    width: horizontalScale(290),
                  }}>
                  {scheduleTempTimesToShow.map((time: any, index: any) => (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      key={index}
                      style={{
                        borderWidth: 1,
                        borderRadius: 20,
                        marginHorizontal: horizontalScale(3),
                        borderColor: themeColors.primary,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingHorizontal: horizontalScale(12),
                        paddingVertical: verticalScale(3),
                        marginVertical: verticalScale(5),
                      }}>
                      <Text
                        style={{
                          textAlign: 'center',
                          fontWeight: '900',
                          fontSize: moderateScale(13),
                          color: themeColors.primary,
                        }}>
                        {time}
                      </Text>
                    </TouchableOpacity>
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
                      width: horizontalScale(275),
                    }}>
                    {scheduleTempTimesToShowIntake?.map(
                      (time: any, index: any) => (
                        // console.log('~ index', index),
                        <TouchableOpacity
                          activeOpacity={0.7}
                          key={index}
                          style={{
                            borderWidth: 1,
                            borderRadius: 20,
                            marginHorizontal: horizontalScale(2),
                            borderColor: themeColors.primary,
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingHorizontal: horizontalScale(10),
                            paddingVertical: verticalScale(2),
                            marginVertical: verticalScale(5),
                          }}>
                          <Text
                            key={index}
                            style={{
                              textAlign: 'center',
                              fontWeight: '900',
                              fontSize: moderateScale(13),
                              color: themeColors.primary,
                            }}>
                            {time}
                          </Text>
                        </TouchableOpacity>
                      ),
                    )}
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
            onPress={() => {
              setQuantityModalVisible(true);
            }}>
            <Text style={[styles.label, {fontFamily: fonts.OpenSansRegular}]}>
              {/* {`Quantity per intake (${doseData.dose}.${doseData.mgPerDose})`} */}

              {
                `Quantity per intake (${doseData.dose}.${doseData.mgPerDose})`
                // : `Quantity per intake (${quantity_per_intake})`}
              }
            </Text>
            <MaterialIcon
              name="arrow-forward-ios"
              size={15}
              color={themeColors.primary}
            />
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.Box,
            {
              backgroundColor: themeColors.white,
            },
          ]}>
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
              {/* Starts: {moment(selectedStartDate).format('dddd, DD MMMM')} */}
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
            onPress={() => {
              setEndDateModalVisible(true);
            }}>
            <View>
              <Text style={[styles.label, {fontFamily: fonts.OpenSansRegular}]}>
                {/* Ends: {moment(selectedEndDate).format('dddd, DD MMMM')} */}
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
            onPress={toggleHandler}
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
              onTouchStart={toggleHandler}
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
          callMedicationUpdated();
        }}>
        {isLoading ? (
          <ActivityIndicator size={20} color={themeColors.white} />
        ) : (
          <Text style={styles.donetext}>{'Continue'}</Text>
        )}
      </TouchableOpacity>

      {/* <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingBottom: verticalScale(30),
        }}>
        {isDisabledField && (
          <ProfileCustomButton
            value={'cancel'}
            onPress={() => {
              setIsDisableField(false);
              setIsRealValueVisible((prevValues: any) => ({
                ...prevValues,
                dayselect: false,
                EndDate: false,
                quantityPerIntake: false,
                regularNotifications: false,
                startDate: false,
                schedule: false,
                intervalIntake: false,
              }));
              // resetForm();
            }}
            extraStyle={{
              // backgroundColor: 'orange',
              borderWidth: 1,
              borderRadius: 100,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: horizontalScale(20),
              width: horizontalScale(100),
              paddingVertical: verticalScale(10),
            }}
          />
        )}

        <ProfileCustomButton
          value={isDisabledField ? 'Update' : 'Edit'}
          isLoading={isLoading}
          extraStyle={{
            backgroundColor: themeColors.primary,
            borderRadius: 100,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: horizontalScale(20),
            width: isDisabledField
              ? horizontalScale(130)
              : horizontalScale(330),
            paddingVertical: verticalScale(18),
          }}
          onPress={() => {
            setIsDisableField(true);

            if (isDisabledField) callMedicationUpdated();
          }}
        />
      </View> */}

      {/* 
      <TouchableOpacity
        activeOpacity={0.7}
        disabled={isLoading ? true : false}
        style={styles.actionBtnText}
        onPress={() => {
          callMedicationScheduled();
        }}>
        {isLoading ? (
          <ActivityIndicator size={20} color={themeColors.white} />
        ) : (
          <Text style={styles.donetext}>{'Done'}</Text>
        )}
      </TouchableOpacity> */}

      <EveryDayModal
        setStateModal={setPeriodicityModalVisible}
        stateModal={periodicityModalVisible}
        setIsTextSelected={setIsTextSelected}
        isTextSelected={isTextSelected}
        setIsTempTextSelected={setIsTextTempSelected}
        isTextTempSelected={isTextTempSelected}
        setSelectedDay={setSelectedDay}
        selectedDay={selectedDay}
        days={isDays}
        setDays={setisDays}
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
                    payload: 'intervalIntake',
                  });
                }}
                style={{justifyContent: 'center', alignItems: 'center'}}>
                <FontisoIcon
                  name="arrow-swap"
                  size={20}
                  color={
                    state.changeSchedule === 'intervalIntake'
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
                        state.changeSchedule === 'intervalIntake'
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
                  setSelectedStartDate={setSelectedStartDate}
                  startDateModalVisible={startDateModalVisible}
                  editPage={true}

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
                editPage={true}

                // calculateTimes={calculateTimes}
              />
            )}
            {/* setIsRealValueVisible((prevValue:any)=>({
      ...prevValue,
      dayselect:true
    })); */}
          </View>
        </View>
      </Modal>

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
                    <Picker.Item key={hour} label={hour} value={hour} />
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
                    <Picker.Item key={minute} label={minute} value={minute} />
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

      {console.log(doseData.dose)}
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
                  selectedValue={doseData.dose?.toString()}
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
                  selectedValue={doseData.mgPerDose}
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
    // backgroundColor:  themeColors.white,
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

export default EditMedications;
