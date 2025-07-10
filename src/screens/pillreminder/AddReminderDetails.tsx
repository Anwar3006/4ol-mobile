import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Dropdown, MultiSelect} from 'react-native-element-dropdown';
import notifee, {
  AndroidImportance,
  AuthorizationStatus,
} from '@notifee/react-native';
import {useNavigation} from '@react-navigation/native';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import {themeColors} from '../../theme/colors';
import moment from 'moment';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {addMedicationReminder} from '../../services/medication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {uploadMedicationImage} from '../../services/uploadMedicationImage';

const notificationOptions = [
  {label: 'Only one day', value: 'one_day'},
  {label: 'Daily', value: 'daily'},
  {label: 'Every n days', value: 'every_n_days'},
  {label: 'Weekly', value: 'weekly'},
  {label: 'Specific Days', value: 'specific_days'},
];

const notificationTypeOptions = [
  {label: 'Scheduled', value: 'Schedule'},
  {label: 'Interval', value: 'Interval'},
];

const intakeOptions = Array.from({length: 4}, (_v, i) => ({
  label: String(i + 1) + `${i === 0 ? ' intake' : ' intakes'}`,
  value: i + 1,
}));
const gapDaysOptions = Array.from({length: 31}, (_v, i) => ({
  label: String(i + 1),
  value: i + 1,
}));
const weekdaysOptions = [
  {label: 'Monday', value: 'Mon'},
  {label: 'Tuesday', value: 'Tue'},
  {label: 'Wednesday', value: 'Wed'},
  {label: 'Thursday', value: 'Thu'},
  {label: 'Friday', value: 'Fri'},
  {label: 'Saturday', value: 'Sat'},
  {label: 'Sunday', value: 'Sun'},
];

const InfoButton = ({onPress}) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      width: 18,
      height: 18,
      borderRadius: 11,
      backgroundColor: themeColors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8,
    }}>
    <FontAwesome5Icon name="info" size={12} color="#fff" />
  </TouchableOpacity>
);

// Info Modal component
const InfoModal = ({visible, onClose, title, content}) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="fade"
    onRequestClose={onClose}>
    <TouchableOpacity
      style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      activeOpacity={1}
      onPress={onClose}>
      <View
        style={{
          width: '85%',
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 20,
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: themeColors.primary,
            }}>
            {title}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color={themeColors.primary} />
          </TouchableOpacity>
        </View>
        <Text style={{fontSize: 14, lineHeight: 20, color: 'black'}}>
          {content}
        </Text>
      </View>
    </TouchableOpacity>
  </Modal>
);

export default function AddReminderDetails({route}) {
  const {medicationName, conditionName, medicationType, color, imageUrl} =
    route.params;

  useEffect(() => {
    console.log({
      medicationName,
      conditionName,
      medicationType,
      color,
      imageUrl,
    });
  }, []);

  const navigation = useNavigation();
  const [submitButtonHeight, setSubmitButtonHeight] = useState(0);

  const [infoModal, setInfoModal] = useState({
    visible: false,
    title: '',
    content: '',
  });

  useEffect(() => {
    navigation.setOptions({
      headerTitle: `${medicationName} Reminder Details`,
    });
  }, [navigation, medicationName, color]);

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [amount, setAmount] = useState('');
  const [dose, setDose] = useState('');

  // New state for scheduling options
  const [notificationSchedule, setNotificationSchedule] = useState('');
  const [gapDays, setGapDays] = useState(1);
  const [weekDay, setWeekDay] = useState('');
  const [specificDays, setSpecificDays] = useState<any[]>([]);
  const [numberOfIntakes, setNumberOfIntakes] = useState(1);
  const [notificationType, setNotificationType] = useState('Schedule');
  // For Scheduled: array of times (one per intake)
  const [scheduledTimes, setScheduledTimes] = useState<Date[]>(
    Array(1).fill(new Date()),
  );
  // For Interval: first intake time and interval hours (1-6)
  const [firstIntakeTime, setFirstIntakeTime] = useState(new Date());
  const [intervalHours, setIntervalHours] = useState(1);
  const [intervalMinutes, setIntervalMinutes] = useState(1);
  const [showTimePicker, setShowTimePicker] = useState<{
    index: number;
  } | null>(null);
  const [showIntervalPicker, setShowIntervalPicker] = useState(false);
  const [showFirstTimePicker, setShowFirstTimePicker] = useState(false);

  // Update scheduledTimes array when numberOfIntakes changes
  useEffect(() => {
    setScheduledTimes(prev => {
      const newArr = [...prev];
      while (newArr.length < numberOfIntakes) newArr.push(new Date());
      return newArr.slice(0, numberOfIntakes);
    });
  }, [numberOfIntakes]);

  useEffect(() => {
    (async () => {
      const settings = await notifee.getNotificationSettings();

      if (settings.authorizationStatus == AuthorizationStatus.AUTHORIZED) {
        console.log('Notification permissions has been authorized');
      } else if (settings.authorizationStatus == AuthorizationStatus.DENIED) {
        console.log('Notification permissions has been denied');
      }
      if (Platform.OS === 'android') {
        await notifee.createChannel({
          id: 'medication-reminders',
          name: 'Medication Reminders',
          lights: true,
          vibration: true,
          importance: AndroidImportance.HIGH, // Make sure notifications appear as proper alerts
          sound: 'default',
        });
      }
    })();
  }, []);
  const onChangeStart = (event: any, selectedDate?: Date) => {
    setShowStart(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(selectedDate);
      if (notificationSchedule === 'one_day') setEndDate(selectedDate);
    }
  };

  const onChangeEnd = (event: any, selectedDate?: Date) => {
    setShowEnd(Platform.OS === 'ios');
    if (selectedDate) setEndDate(selectedDate);
  };

  // Handler for time pickers for scheduled times
  const onChangeScheduledTime = (
    index: number,
    event: any,
    selectedDate?: Date,
  ) => {
    setShowTimePicker(null);
    if (selectedDate) {
      const newTimes = [...scheduledTimes];
      newTimes[index] = selectedDate;
      setScheduledTimes(newTimes);
    }
  };

  const onChangeFirstIntake = (event: any, selectedDate?: Date) => {
    setShowFirstTimePicker(false);
    if (selectedDate) setFirstIntakeTime(selectedDate);
  };

  const onSubmit = async () => {
    try {
      // Get user ID from AsyncStorage
      const userId = await AsyncStorage.getItem('user_id');

      if (!userId) {
        Alert.alert('Error', 'User ID not found. Please login again.');
        return;
      }

      // Validate required fields
      if (!notificationSchedule) {
        Alert.alert('Required Field', 'Please select a notification schedule');
        return;
      }

      if (!amount) {
        Alert.alert('Required Field', 'Please enter medication amount');
        return;
      }

      if (!dose) {
        Alert.alert('Required Field', 'Please enter medication dose');
        return;
      }

      // Special validation for specific schedule types
      if (notificationSchedule === 'weekly' && !weekDay) {
        Alert.alert('Required Field', 'Please select a day of the week');
        return;
      }

      if (
        notificationSchedule === 'specific_days' &&
        specificDays.length === 0
      ) {
        Alert.alert('Required Field', 'Please select at least one day');
        return;
      }

      // Capture the current time once for calculations
      const now = new Date();

      // Calculate all timestamps for notifications
      const triggers: Date[] = [];
      let currentDate = new Date(startDate);

      // Helper: set date with time from a Date object
      function combineDateTime(datePart: Date, timePart: Date) {
        const newDate = new Date(datePart);
        newDate.setHours(timePart.getHours(), timePart.getMinutes(), 0, 0);
        return newDate;
      }

      // Determine dates to schedule notifications on based on notificationSchedule
      const datesToSchedule: Date[] = [];

      if (notificationSchedule === 'one_day') {
        datesToSchedule.push(new Date(startDate));
      } else {
        while (currentDate <= endDate) {
          let add = false;

          if (notificationSchedule === 'daily') {
            add = true;
          } else if (notificationSchedule === 'every_n_days') {
            add = true;
            // Adjust for gap days
            currentDate.setDate(currentDate.getDate() + gapDays - 1);
          } else if (notificationSchedule === 'weekly') {
            const options = {weekday: 'short'} as const;
            if (currentDate.toLocaleDateString('en-US', options) === weekDay) {
              add = true;
            }
          } else if (notificationSchedule === 'specific_days') {
            const options = {weekday: 'short'} as const;
            const currentDayShort = currentDate.toLocaleDateString(
              'en-US',
              options,
            );
            if (specificDays.includes(currentDayShort)) {
              add = true;
            }
          }

          if (add) datesToSchedule.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }

      // For each scheduled date, add time slots
      datesToSchedule.forEach(date => {
        if (notificationType === 'Schedule') {
          scheduledTimes.forEach(time => {
            const dt = combineDateTime(date, time);
            if (dt >= now) triggers.push(dt);
          });
        } else {
          // Interval: calculate slots based on firstIntakeTime, intervalHours and intervalMinutes
          for (let i = 0; i < numberOfIntakes; i++) {
            const dt = combineDateTime(date, firstIntakeTime);
            dt.setHours(
              dt.getHours() + i * intervalHours,
              dt.getMinutes() + i * intervalMinutes,
            );
            if (dt >= now) triggers.push(dt);
          }
        }
      });

      // If there are no valid timestamps, don't proceed
      if (triggers.length === 0) {
        Alert.alert(
          'No upcoming notifications',
          'Please set a time in the future.',
        );
        return;
      }

      // Map reminder type from UI to database enum values
      const mapReminderType = (uiType: string): string => {
        switch (uiType) {
          case 'one_day':
            return 'ONCE';
          case 'daily':
            return 'DAILY';
          case 'every_n_days':
            return 'WITH_DAYS_GAP';
          case 'weekly':
            return 'WEEKLY';
          case 'specific_days':
            return 'SPECIFIC_DAYS';
          default:
            return 'DAILY'; // fallback
        }
      };

      // Format timestamps to ISO strings for the database
      const formattedTimestamps = triggers.map(date => date.toISOString());

      const uploadImageUrl = imageUrl
        ? await uploadMedicationImage({
            uri: imageUrl,
            name: imageUrl.split('/').pop() || `image_${Date.now()}.jpg`,
            type: 'image/jpeg', // Assuming JPEG, adjust as needed
          })
        : null;

      // Create medication reminder object to store in database
      const medicationReminderData = {
        user_id: userId,
        medication_name: medicationName,
        condition: conditionName,
        medication_amount: parseFloat(amount),
        medication_dose: parseFloat(dose),
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        reminder_type: mapReminderType(notificationSchedule),
        notification_type: notificationType.toUpperCase(),
        medication_type: medicationType.toUpperCase(),
        reminder_timestamps: formattedTimestamps,
        imageUrl: uploadImageUrl,
        intake_amount: numberOfIntakes,
        status: 'pending',
        color: color || '#32a852', // Default to green if no color specified
      };

      console.log('Saving medication reminder data:', medicationReminderData);

      // Call the service to add the medication reminder to the database
      const result = await addMedicationReminder(
        userId,
        medicationReminderData,
      );

      console.log('Medication reminder saved successfully:', result);

      // Show success message and navigate back
      Alert.alert('Success', 'Medication reminder has been set successfully!', [
        {
          text: 'OK',
          onPress: () => {
            navigation.dispatch(navigation.popToTop());
            navigation.navigate('PillReminder', {tabIndex: 1}); // Navigate to PillReminder with 2nd tab selected
          },
        },
      ]);
    } catch (error) {
      console.error('Error saving medication reminder:', error);
      Alert.alert(
        'Error',
        'Failed to save medication reminder. Please try again.',
      );
    }
  };

  const showInfoModal = (title, content) => {
    setInfoModal({
      visible: true,
      title,
      content,
    });
  };

  // Helper function to get dose unit label based on medication type
  const getDoseLabel = () => {
    switch (medicationType) {
      case 'Tablet':
        return 'mg';
      case 'Capsule':
        return 'mg';
      case 'Injection':
        return 'mL or IU';
      case 'Spray':
        return 'mcg per spray';
      case 'Drops':
        return 'mg/mL or % concentration';
      case 'Solution':
        return 'mg/mL or % concentration';
      case 'Herbs':
        return 'mg or g';
      default:
        return 'mg';
    }
  };

  // Helper function to get amount unit label based on medication type
  const getAmountLabel = () => {
    switch (medicationType) {
      case 'Tablet':
        return 'tablets';
      case 'Capsule':
        return 'capsules';
      case 'Injection':
        return 'vials/ampoules';
      case 'Spray':
        return 'sprays';
      case 'Drops':
        return 'drops';
      case 'Solution':
        return 'mL or L';
      case 'Herbs':
        return 'grams or sachets';
      default:
        return 'units';
    }
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          backgroundColor: '#fff',
          paddingBottom: submitButtonHeight + 10,
        }}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={{fontWeight: '700', color: 'black'}}>
            Notification Schedule
          </Text>
          <InfoButton
            onPress={() =>
              showInfoModal(
                'Notification Schedule',
                'Choose how often you want to be reminded:\n\n' +
                  "• Only one day: You'll be notified only once on the start date\n" +
                  "• Daily: You'll be notified every day\n" +
                  "• Every n days: You'll be notified every specified number of days\n" +
                  "• Weekly: You'll be notified on the same day each week\n" +
                  "• Specific Days: You'll be notified on selected days of the week",
              )
            }
          />
        </View>
        <Dropdown
          data={notificationOptions}
          labelField="label"
          valueField="value"
          placeholder="Select schedule"
          value={notificationSchedule}
          onChange={item => {
            setNotificationSchedule(item.value);
            if (item.value === 'one_day') {
              setEndDate(startDate);
            }
          }}
          itemTextStyle={{color: 'black'}}
          selectedTextStyle={{color: 'black'}}
          placeholderStyle={{color: 'gray'}}
          style={{
            borderWidth: 1,
            marginVertical: 8,
            padding: 8,
            borderRadius: 8,
            borderColor: 'lightgray',
          }}
        />
        {notificationSchedule === 'every_n_days' && (
          <>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={{fontWeight: '700', color: 'black'}}>
                Gap (Days)
              </Text>
              <InfoButton
                onPress={() =>
                  showInfoModal(
                    'Gap Days',
                    "Specify how many days should pass between each notification. For example, if you set this to 3, you'll be reminded every 3 days.",
                  )
                }
              />
            </View>
            <Dropdown
              itemTextStyle={{color: 'black'}}
              selectedTextStyle={{color: 'black'}}
              placeholderStyle={{color: 'gray'}}
              data={gapDaysOptions}
              labelField="label"
              valueField="value"
              placeholder="Select gap"
              value={gapDays}
              onChange={item => setGapDays(item.value)}
              style={{
                borderWidth: 1,
                marginVertical: 8,
                padding: 8,
                borderRadius: 8,
                borderColor: 'lightgray',
              }}
            />
          </>
        )}
        {notificationSchedule === 'weekly' && (
          <>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={{fontWeight: '700', color: 'black'}}>
                Choose Weekday
              </Text>
              <InfoButton
                onPress={() =>
                  showInfoModal(
                    'Weekday',
                    ' Choose the day of the week you want to be reminded on. For example, if you select Monday, you will be reminded every Monday.',
                  )
                }
              />
            </View>
            <Dropdown
              itemTextStyle={{color: 'black'}}
              selectedTextStyle={{color: 'black'}}
              placeholderStyle={{color: 'gray'}}
              data={weekdaysOptions}
              labelField="label"
              valueField="value"
              placeholder="Select weekday"
              value={weekDay}
              onChange={item => setWeekDay(item.value)}
              style={{
                borderWidth: 1,
                marginVertical: 8,
                padding: 8,
                borderRadius: 8,
                borderColor: 'lightgray',
              }}
            />
          </>
        )}
        {notificationSchedule === 'specific_days' && (
          <>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={{fontWeight: '700', color: 'black'}}>
                Specific Days
              </Text>
              <InfoButton
                onPress={() =>
                  showInfoModal(
                    'Specific Days',
                    'Choose the days of the week you want to be reminded on. For example, if you select Monday and Thursday, you will be reminded every Monday and Thursday.',
                  )
                }
              />
            </View>
            <MultiSelect
              renderItem={(item, selected) => (
                <View
                  style={{
                    flexGrow: 1,
                    alignItems: 'center',
                    padding: 8,
                    margin: 4,
                    flexDirection: 'row',
                    gap: 10,
                    justifyContent: 'center',
                  }}>
                  {selected && (
                    <FontAwesome5Icon
                      name="check"
                      color={themeColors.primary}
                    />
                  )}
                  <Text style={{color: 'black'}}>{item.label}</Text>
                </View>
              )}
              renderSelectedItem={(item, index) => (
                <View
                  style={{
                    flexGrow: 1,
                    alignItems: 'center',
                    padding: 8,
                    margin: 4,
                    backgroundColor: themeColors.primary,
                    borderRadius: 8,
                    flexDirection: 'row',
                    gap: 10,
                    justifyContent: 'center',
                  }}>
                  <FontAwesome5Icon name="check" color="#fff" />
                  <Text style={{color: '#fff'}}>{item.label}</Text>
                </View>
              )}
              style={{
                borderWidth: 1,
                marginVertical: 8,
                padding: 8,
                borderRadius: 8,
                borderColor: 'lightgray',
              }}
              data={weekdaysOptions}
              labelField="label"
              valueField="value"
              placeholder="Select days"
              value={specificDays}
              onChange={setSpecificDays}
            />
          </>
        )}
        <View style={{marginTop: 10, flexDirection: 'row', gap: 10}}>
          <View style={{flexGrow: 1}}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={{fontWeight: '700', color: 'black'}}>
                Reminder Start Date
              </Text>
              <InfoButton
                onPress={() =>
                  showInfoModal(
                    'Start Date',
                    'Select the first day you want to receive medication reminders. Your notification schedule will begin from this date.',
                  )
                }
              />
            </View>
            <TouchableOpacity
              onPress={() => setShowStart(true)}
              style={{
                borderWidth: 1,
                padding: 8,
                marginVertical: 8,
                borderRadius: 8,
                borderColor: 'lightgray',
              }}>
              <Text style={{color: 'black'}}>
                {moment(startDate.toDateString()).format('DD/MM/YYYY')}
              </Text>
            </TouchableOpacity>
          </View>
          {showStart && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={onChangeStart}
            />
          )}
          <View style={{flexGrow: 1}}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={{fontWeight: '700', color: 'black'}}>
                Reminder End Date
              </Text>
              <InfoButton
                onPress={() =>
                  showInfoModal(
                    'End Date',
                    'Select the last day you want to receive medication reminders. After this date, no more notifications will be sent.',
                  )
                }
              />
            </View>
            <TouchableOpacity
              onPress={() => setShowEnd(true)}
              style={{
                borderWidth: 1,
                padding: 8,
                marginVertical: 8,
                borderRadius: 8,
                borderColor: 'lightgray',
              }}>
              <Text style={{color: 'black'}}>
                {moment(endDate.toDateString()).format('DD/MM/YYYY')}
              </Text>
            </TouchableOpacity>
          </View>
          {showEnd && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={onChangeEnd}
            />
          )}
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={{fontWeight: '700', color: 'black'}}>
            Amount of medication ({getAmountLabel()})
          </Text>
          <InfoButton
            onPress={() =>
              showInfoModal(
                `Amount (${getAmountLabel()})`,
                `Enter how many ${getAmountLabel()} you need to take each time. For ${medicationType.toLowerCase()}, this refers to the number of ${getAmountLabel()} per dose.`,
              )
            }
          />
        </View>
        <TextInput
          placeholderTextColor={'gray'}
          style={{
            color: 'black',
            borderWidth: 1,
            padding: 8,
            marginVertical: 8,
            borderRadius: 8,
            borderColor: 'lightgray',
          }}
          placeholder="Enter amount"
          value={amount}
          onChangeText={setAmount}
        />
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={{fontWeight: '700', color: 'black'}}>
            Dose of medication ({getDoseLabel()})
          </Text>
          <InfoButton
            onPress={() =>
              showInfoModal(
                `Dose (${getDoseLabel()})`,
                `Enter the dosage strength in ${getDoseLabel()}. This is the concentration or amount of active ingredient in each ${getAmountLabel().slice(
                  0,
                  -1,
                )}.`,
              )
            }
          />
        </View>
        <TextInput
          placeholderTextColor={'gray'}
          style={{
            color: 'black',
            borderWidth: 1,
            padding: 8,
            marginVertical: 8,
            borderRadius: 8,
            borderColor: 'lightgray',
          }}
          placeholder="Enter dose"
          value={dose}
          onChangeText={setDose}
        />
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={{fontWeight: '700', color: 'black'}}>
            How many times will you take medicine?
          </Text>
          <InfoButton
            onPress={() =>
              showInfoModal(
                'Number of Intakes',
                'Select how many times per day you need to take this medication. You can set up to 4 reminders per day.',
              )
            }
          />
        </View>
        <Dropdown
          itemTextStyle={{color: 'black'}}
          selectedTextStyle={{color: 'black'}}
          placeholderStyle={{color: 'gray'}}
          data={intakeOptions}
          labelField="label"
          valueField="value"
          placeholder="Select intakes"
          value={numberOfIntakes}
          onChange={item => setNumberOfIntakes(item.value)}
          style={{
            borderWidth: 1,
            marginVertical: 8,
            padding: 8,
            borderRadius: 8,
            borderColor: 'lightgray',
          }}
        />
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={{fontWeight: '700', color: 'black'}}>
            Choose time manually or set Interval?
          </Text>
          <InfoButton
            onPress={() =>
              showInfoModal(
                'Notification Type',
                'Choose how you want to set your reminder times:\n\n' +
                  '• Scheduled: Select specific times each day for your reminders\n' +
                  '• Interval: Set the first dose time and how many hours/minutes between each dose',
              )
            }
          />
        </View>
        <Dropdown
          itemTextStyle={{color: 'black'}}
          selectedTextStyle={{color: 'black'}}
          placeholderStyle={{color: 'gray'}}
          data={notificationTypeOptions}
          labelField="label"
          valueField="value"
          placeholder="Select notification type"
          value={notificationType}
          onChange={item => setNotificationType(item.value)}
          style={{
            borderWidth: 1,
            marginVertical: 8,
            padding: 8,
            borderRadius: 8,
            borderColor: 'lightgray',
          }}
        />
        {notificationType === 'Schedule' && (
          <View
            style={{flexDirection: 'row', gap: 10, flex: 1, flexWrap: 'wrap'}}>
            {scheduledTimes.map((time, index) => (
              <View style={{flexGrow: 1}} key={index}>
                <Text style={{fontWeight: '700', color: 'black'}}>
                  Intake {index + 1} Time
                </Text>

                <TouchableOpacity
                  onPress={() => setShowTimePicker({index})}
                  style={{
                    borderWidth: 1,
                    padding: 8,
                    marginVertical: 8,
                    borderRadius: 8,
                    borderColor: 'lightgray',
                  }}>
                  <Text style={{color: 'black'}}>
                    {time.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </TouchableOpacity>
                {showTimePicker && showTimePicker.index === index && (
                  <DateTimePicker
                    value={time}
                    mode="time"
                    display="default"
                    onChange={(e, selectedDate) =>
                      onChangeScheduledTime(index, e, selectedDate)
                    }
                  />
                )}
              </View>
            ))}
          </View>
        )}
        {notificationType === 'Interval' && (
          <>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={{fontWeight: '700', color: 'black'}}>
                First Intake Time
              </Text>
              <InfoButton
                onPress={() =>
                  showInfoModal(
                    'First Intake Time',
                    'Select time for the first dose of medication. Subsequent doses will be calculated based on the interval you set.',
                  )
                }
              />
            </View>
            <TouchableOpacity
              onPress={() => setShowFirstTimePicker(true)}
              style={{
                borderWidth: 1,
                padding: 8,
                marginVertical: 8,
                borderRadius: 8,
                borderColor: 'lightgray',
              }}>
              <Text style={{color: 'black'}}>
                {firstIntakeTime.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </TouchableOpacity>
            {showFirstTimePicker && (
              <DateTimePicker
                value={firstIntakeTime}
                mode="time"
                display="default"
                onChange={onChangeFirstIntake}
              />
            )}
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={{fontWeight: '700', color: 'black'}}>
                Interval Between Medication
              </Text>
              <InfoButton
                onPress={() =>
                  showInfoModal(
                    'Interval Between Medication',
                    'Select the number of hours and minutes between each dose. For example, if you set 2 hours and 30 minutes, you will be reminded every 2 hours and 30 minutes.',
                  )
                }
              />
            </View>
            <View style={{marginTop: 10, flexDirection: 'row', gap: 10}}>
              <View style={{flex: 1}}>
                <Text style={{fontWeight: '700', color: 'black'}}>Hours</Text>
                <Dropdown
                  itemTextStyle={{color: 'black'}}
                  selectedTextStyle={{color: 'black'}}
                  placeholderStyle={{color: 'gray'}}
                  dropdownPosition="top"
                  data={Array.from({length: 7}, (_v, i) => ({
                    label: String(i),
                    value: i,
                  }))}
                  labelField="label"
                  valueField="value"
                  placeholder="Select hours"
                  value={intervalHours}
                  onChange={item => setIntervalHours(item.value)}
                  style={{
                    borderWidth: 1,
                    marginVertical: 8,
                    padding: 8,
                    borderRadius: 8,
                    borderColor: 'lightgray',
                  }}
                />
              </View>
              <View style={{flex: 1}}>
                <Text style={{fontWeight: '700', color: 'black'}}>Minutes</Text>

                <Dropdown
                  itemTextStyle={{color: 'black'}}
                  selectedTextStyle={{color: 'black'}}
                  placeholderStyle={{color: 'gray'}}
                  dropdownPosition="top"
                  data={Array.from({length: 60}, (_v, i) => ({
                    label: String(i),
                    value: i,
                  }))}
                  labelField="label"
                  valueField="value"
                  placeholder="Select Minutes"
                  value={intervalMinutes}
                  onChange={item => setIntervalMinutes(item.value)}
                  style={{
                    borderWidth: 1,
                    marginVertical: 8,
                    padding: 8,
                    borderRadius: 8,
                    borderColor: 'lightgray',
                  }}
                />
              </View>
            </View>
            <View style={{marginVertical: 8}}>
              <Text
                style={{fontWeight: '700', color: 'black', marginBottom: 8}}>
                You will be notified on:
              </Text>
              <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
                {Array.from({length: numberOfIntakes}, (_, i) => {
                  const calcTime = new Date(firstIntakeTime);
                  calcTime.setHours(
                    calcTime.getHours() + i * intervalHours,
                    calcTime.getMinutes() + i * intervalMinutes,
                  );
                  return (
                    <View
                      key={i}
                      style={{
                        flexGrow: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: themeColors.primary,
                        padding: 8,
                        borderRadius: 6,
                        marginBottom: 4,
                      }}>
                      <Text style={{color: 'white', fontWeight: '500'}}>
                        {calcTime.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </>
        )}
      </ScrollView>
      <TouchableOpacity
        onLayout={e => setSubmitButtonHeight(e.nativeEvent.layout.height)}
        onPress={onSubmit}
        style={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          right: 10,
          backgroundColor: themeColors.primary,
          padding: 12,
          alignItems: 'center',
          borderRadius: 4,
          marginTop: 16,
        }}>
        <Text style={{color: '#fff', fontWeight: '700'}}>Set Reminder</Text>
      </TouchableOpacity>
      <InfoModal
        visible={infoModal.visible}
        title={infoModal.title}
        content={infoModal.content}
        onClose={() => setInfoModal({...infoModal, visible: false})}
      />
    </KeyboardAvoidingView>
  );
}
