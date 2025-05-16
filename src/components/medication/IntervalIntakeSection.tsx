import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import {themeColors} from '../../theme/colors';
import {fonts} from '../../theme/fonts';
import {size} from '../../theme/fontStyle';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import IntakeModal from '../shared-components/IntakeModal';
import moment from 'moment';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

interface IIntervalIntakeSection {
  setIntervalBetweenIntakesModalVisible: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  setIntakePlanModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setIsIntervalModalIntake: React.Dispatch<React.SetStateAction<boolean>>;
  isIntervalModalIntake: boolean;
  setSelectedTempScheduleCountIntake: React.Dispatch<
    React.SetStateAction<number>
  >;
  selectedTempScheduleCountIntake: number;
  setSelectedScheduleCountIntake: React.Dispatch<React.SetStateAction<any>>;
  selectedScheduleCountIntake: number;
  setIsScheduleOrIntervalIntake: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
  isScheduleOrIntervalIntake: string | undefined;
  selectedHour: number;
  setSelectedHour: React.Dispatch<React.SetStateAction<any>>;
  selectedMinute: number | undefined;
  setSelectedMinute: React.Dispatch<React.SetStateAction<number>>;
  setTimesIntake: React.Dispatch<React.SetStateAction<string[]>>;
  scheduleTempTimesToShowIntake: string[];
  selectedStartDate: string | undefined;
  selectedEndDate: string | undefined;
  editPage: boolean;
}

const IntervalIntakeSection = ({
  setIntakePlanModalVisible,
  setIntervalBetweenIntakesModalVisible,
  setIsIntervalModalIntake,
  isIntervalModalIntake,
  setSelectedTempScheduleCountIntake,
  selectedTempScheduleCountIntake,
  setSelectedScheduleCountIntake,
  selectedScheduleCountIntake,
  isScheduleOrIntervalIntake,
  setIsScheduleOrIntervalIntake,
  selectedHour,
  selectedMinute,
  setTimesIntake,
  scheduleTempTimesToShowIntake,
  selectedStartDate,
  selectedEndDate,
  editPage,
}: IIntervalIntakeSection) => {
  const [getIndex, setGetIndex] = useState<number | null>(null);
  const [getTimeIndex, setGetTimeIndex] = useState<number | null>(null);
  const [isDatePickerVisibleIntake, setDatePickerVisibilityIntake] =
    useState(false);
  console.log('! selected start date:', selectedStartDate);

  const showDatePicker = (index: number, timeIndex: number) => {
    console.log('~ index:', index);
    setGetIndex(index);
    setGetTimeIndex(timeIndex);
    setDatePickerVisibilityIntake(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibilityIntake(false);
  };

  const handleConfirm = (date: Date) => {
    const formattedTime = moment(date).format('hh:mm A'); // Format the selected time

    if (getIndex !== null) {
      if (editPage) {
        setTimesIntake((prevTimes: any) => {
          const updatedTimes = {...prevTimes};
          if (Array.isArray(updatedTimes.schedule_times)) {
            updatedTimes.schedule_times[getIndex] = formattedTime;
          }

          return updatedTimes; // Return the updated object
        });
      } else {
        setTimesIntake(prevTimes => {
          const updatedTimes = [...prevTimes]; // Copy the previous times
          updatedTimes[getIndex] = formattedTime; // Update the time at the correct index
          return updatedTimes; // Return the updated times
        });
      }
    }
    hideDatePicker(); // Hide the date picker after selection
  };

  const cancelModalIntervalIntake = () => {
    setSelectedTempScheduleCountIntake(selectedScheduleCountIntake);
    setIntakePlanModalVisible(false);
  };

  const doneModalIntervalIntake = () => {
    setIsScheduleOrIntervalIntake('intervalIntake');
    setIntakePlanModalVisible(false);
  };

  return (
    <>
      <Text
        style={[styles.label, {paddingTop: verticalScale(10), width: '100%'}]}>
        How often?
      </Text>

      <TouchableOpacity
        onPress={() => setIsIntervalModalIntake(true)}
        style={[
          styles.BoxItem,
          {
            borderBottomWidth: 1,
            borderBottomColor: themeColors.lightGray,
            width: '100%',
          },
        ]}>
        <Text style={[styles.label, {fontFamily: fonts.OpenSansRegular}]}>
          {`${selectedTempScheduleCountIntake} Times per day`}
        </Text>
        <MaterialIcon
          name="arrow-forward-ios"
          size={15}
          color={themeColors.primary}
        />
      </TouchableOpacity>

      <Text
        style={[
          styles.label,
          {marginVertical: verticalScale(10), width: '100%'},
        ]}>
        Interval
      </Text>

      <TouchableOpacity
        style={[
          styles.BoxItem,
          {
            borderBottomWidth: 1,
            borderBottomColor: themeColors.lightGray,
            width: '100%',
          },
        ]}
        onPress={() => {
          setIntervalBetweenIntakesModalVisible(true);
        }}>
        <Text style={[styles.label, {fontFamily: fonts.OpenSansRegular}]}>
          {`Every ${selectedHour}:${selectedMinute} hour`}
        </Text>
        <MaterialIcon
          name="arrow-forward-ios"
          size={15}
          color={themeColors.primary}
        />
      </TouchableOpacity>

      <Text
        style={[
          styles.label,
          {marginVertical: verticalScale(10), width: '100%'},
        ]}>
        Tap on the time to change it:
      </Text>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
        }}>
        {scheduleTempTimesToShowIntake?.map((time, index) => (
          // console.log('~ index', index),
          <TouchableOpacity
            onPress={() => showDatePicker(index)}
            activeOpacity={0.7}
            key={index}
            style={{
              // backgroundColor: 'orange',
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
          </TouchableOpacity>
        ))}
        {/* {editPage ? (
          scheduleTempTimesToShowIntake
            ?.slice(0, 1)
            .map((item: any, index: number) =>
              item?.schedule_times.map((time: string, timeIndex: number) => (
                <TouchableOpacity
                  onPress={() => showDatePicker(index, timeIndex)}
                  activeOpacity={0.7}
                  key={timeIndex}
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
              )),
            )
        ) : (
          <>
            {scheduleTempTimesToShowIntake?.map((time, index) => (
              // console.log('~ index', index),
              <TouchableOpacity
                onPress={() => showDatePicker(index)}
                activeOpacity={0.7}
                key={index}
                style={{
                  // backgroundColor: 'orange',
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
              </TouchableOpacity>
            ))}
          </>
        )} */}
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
          onPress={cancelModalIntervalIntake}>
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
          onPress={doneModalIntervalIntake}>
          <Text style={[styles.closeButtonText, {textAlign: 'center'}]}>
            Done
          </Text>
        </TouchableOpacity>
      </View>

      <IntakeModal
        setStateModal={setIsIntervalModalIntake}
        stateModal={isIntervalModalIntake}
        selectedTempScheduleCount={selectedTempScheduleCountIntake}
        setSelectedTempScheduleCount={setSelectedTempScheduleCountIntake}
        setSelectedScheduleCount={setSelectedScheduleCountIntake}
        selectedScheduleCount={selectedScheduleCountIntake}
        title="Interval between intake"
      />

      <DateTimePickerModal
        isVisible={isDatePickerVisibleIntake}
        mode="time"
        onConfirm={handleConfirm}
        minuteInterval={30}
        onCancel={hideDatePicker}
      />
    </>
  );
};

export default IntervalIntakeSection;

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
  actionBtn: {
    // flex: 1,
    // justifyContent: 'flex-end',
    // marginBottom: 15,
  },
  actionBtnText: {
    color: themeColors.white,
    fontSize: size.md,
    fontFamily: fonts.OpenSansBold,
    textAlign: 'center',
    backgroundColor: themeColors.primary,
    padding: 10,
    borderRadius: 10,
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
