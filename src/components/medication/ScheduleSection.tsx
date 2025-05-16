import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {themeColors} from '../../theme/colors';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import {size} from '../../theme/fontStyle';
import {fonts} from '../../theme/fonts';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import IntakeModal from '../shared-components/IntakeModal';

interface IScheduleSectionProps {
  setIntakePlanModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedTempScheduleCount: React.Dispatch<React.SetStateAction<any>>;
  selectedTempScheduleCount: number | undefined;
  selectedScheduleCount: number | undefined;
  setSelectedScheduleCount: React.Dispatch<
    React.SetStateAction<any | number | undefined>
  >;
  setTempTimes: React.Dispatch<React.SetStateAction<string[]>>;
  scheduleTempTimesToShow: string[];
  setIsIntervalModal: React.Dispatch<React.SetStateAction<boolean>>;
  isIntervalModal: boolean;
  setIsScheduleOrIntervalIntake: React.Dispatch<
    React.SetStateAction<any | string | undefined>
  >;
  isScheduleOrIntervalIntake: string | undefined;
  selectedStartDate: string | undefined;

  startDateModalVisible: boolean | undefined;
  setSelectedStartDate: React.Dispatch<
    React.SetStateAction<string | any | undefined>
  >;
  temp_times: string[];
  editPage: boolean;
}

const ScheduleSection = ({
  scheduleTempTimesToShow,
  selectedScheduleCount,
  selectedTempScheduleCount,
  setIntakePlanModalVisible,
  setIsIntervalModal,
  setSelectedScheduleCount,
  setSelectedTempScheduleCount,
  setTempTimes,
  isIntervalModal,
  setIsScheduleOrIntervalIntake,
  selectedStartDate,
  editPage,
}: IScheduleSectionProps) => {
  const [getIndex, setGetIndex] = useState<number | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  console.log('selected_start_date', selectedStartDate);

  const showDatePicker = (index: number) => {
    setGetIndex(index); // Store the index of the pressed time
    setDatePickerVisibility(true); // Show the date picker
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false); // Hide the date picker
  };

  const handleConfirm = (date: Date) => {
    const formattedTime = moment(date).format('hh:mm A'); // Format the selected time

    if (getIndex !== null) {
      if (editPage) {
        setTempTimes((prevTimes: any) => {
          const updatedTimes = {...prevTimes};
          if (Array.isArray(updatedTimes.schedule_times)) {
            updatedTimes.schedule_times[getIndex] = formattedTime;
          }

          return updatedTimes; // Return the updated object
        });
      } else {
        setTempTimes(prevTimes => {
          const updatedTimes = [...prevTimes]; // Copy the previous times
          updatedTimes[getIndex] = formattedTime; // Update the time at the correct index
          return updatedTimes; // Return the updated times
        });
      }
    }
    hideDatePicker(); // Hide the date picker after selection
  };

  const cancelModalSchedule = () => {
    setSelectedTempScheduleCount(selectedScheduleCount);
    setIntakePlanModalVisible(false);
  };

  const doneModalSchedule = () => {
    setIsScheduleOrIntervalIntake('schedule');
    setSelectedScheduleCount(selectedTempScheduleCount);
    setIntakePlanModalVisible(false);
  };
  // console.log("~ tempTImeTOshow :",scheduleTempTimesToShow);
  return (
    <>
      <Text style={[styles.label, {marginVertical: 10, width: '100%'}]}>
        How often?
      </Text>

      {/* {scheduleTempTimesToShow.map((time, index) => (
        <TouchableOpacity onPress={() => showDatePicker(index)} key={index}>
          <Text style={{color: 'orange', marginVertical: 3}}>{time}</Text>
        </TouchableOpacity>
      ))} */}

      <TouchableOpacity
        style={[
          styles.BoxItem,
          {
            borderBottomWidth: 1,
            borderBottomColor: themeColors.lightGray,
            width: '100%',
          },
        ]}
        onPress={() => setIsIntervalModal(true)}>
        <Text style={[styles.label, {fontFamily: fonts.OpenSansRegular}]}>
          {`${selectedTempScheduleCount} Times per day`}
        </Text>
        <MaterialIcon
          name="arrow-forward-ios"
          size={15}
          color={themeColors.primary}
        />
      </TouchableOpacity>

      <Text style={[styles.label, {marginVertical: 10, width: '100%'}]}>
        Tap on the time to change it:
      </Text>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        // minuteInterval={30}
        mode="time"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />

      <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
        {scheduleTempTimesToShow.map((time: any, index: any) => (
          <TouchableOpacity
            onPress={() => showDatePicker(index)}
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
        {/* {editPage ? (
          scheduleTempTimesToShow.map((time: any, timeIndex: any) => (
            <TouchableOpacity
              onPress={() => showDatePicker(0, timeIndex)}
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
          ))
        ) : (
          <>
            {scheduleTempTimesToShow?.map((time, index) => (
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
          onPress={cancelModalSchedule}>
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
          onPress={doneModalSchedule}>
          <Text style={[styles.closeButtonText, {textAlign: 'center'}]}>
            Done
          </Text>
        </TouchableOpacity>
      </View>

      <IntakeModal
        setStateModal={setIsIntervalModal}
        stateModal={isIntervalModal}
        selectedTempScheduleCount={selectedTempScheduleCount}
        setSelectedTempScheduleCount={setSelectedTempScheduleCount}
        setSelectedScheduleCount={setSelectedScheduleCount}
        selectedScheduleCount={selectedScheduleCount}
        title="Interval between intake"
      />
    </>
  );
};

export default ScheduleSection;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: themeColors.lightGray,
  },
  label: {
    fontSize: size.md,
    fontFamily: fonts.OpenSansBold,
    color: themeColors.darkGray,
    marginBottom: 5,
  },
  BoxItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
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
});
