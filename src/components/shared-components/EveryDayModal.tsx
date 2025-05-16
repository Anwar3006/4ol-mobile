// components and constants imports
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {fonts} from '../../theme/fonts';
import {themeColors} from '../../theme/colors';
import {size} from '../../theme/fontStyle';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import EveryDaysInsideSelectionModal from './EveryDaysInsideSelectionModal';
// libraries imports
import Modal from 'react-native-modal';
import CustomDynamicText from '../reusable_component/CustomDynamicText';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import ReactNativeModal from 'react-native-modal';

interface IPerdiodicityModalProps {
  stateModal: boolean;
  setStateModal: React.Dispatch<React.SetStateAction<boolean>>;
  setIsTextSelected: React.Dispatch<React.SetStateAction<string | undefined>>;
  isTextSelected: string | undefined;
  setIsTempTextSelected: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
  isTextTempSelected: string | undefined;
  setSelectedDay: React.Dispatch<
    React.SetStateAction<number | null | undefined>
  >;
  selectedDay: number | null | undefined;
  days: {
    day: string;
    isChecked: boolean;
  }[];
  setDays: React.Dispatch<
    React.SetStateAction<
      {
        day: string;
        isChecked: boolean;
      }[]
    >
  >;
  PermDays: {
    day: string;
    isChecked: boolean;
  }[];
  setPermDays: React.Dispatch<
    React.SetStateAction<
      {
        day: string;
        isChecked: boolean;
      }[]
    >
  >;
}

const EveryDayModal = ({
  stateModal,
  setStateModal,
  isTextSelected,
  setIsTextSelected,
  isTextTempSelected,
  setIsTempTextSelected,
  selectedDay,
  setSelectedDay,
  days,
  PermDays,
  setDays,
  setPermDays,
}: IPerdiodicityModalProps) => {
  const [isEveryDaySelected, setIsEveryDaySelected] = useState(false);
  const [tempSelectedDay, setTempSelectedDay] = useState<number | any>(1); // Temporary value
  const [trackDaysState, setTrackDaysState] = useState(false);
  const [previousDay, setPreviousDay] = useState(true);
  const [trackParentDayState, setTrackParentDayState] = useState(false);
  const [isPreviousValueDays, setIsPreviousValueDays] = useState(false);

  // cancel modal parent function

  const DoneHandler = useCallback(() => {
    setIsPreviousValueDays(true); // Setting this flag for conditional rendering
    setPermDays([...days]); // Saving current 'days' state to 'PermDays'
    setStateModal(false);
    setIsTextSelected(isTextTempSelected);
  }, [days, isTextTempSelected]);

  const cancelModalParent = () => {
    setIsPreviousValueDays(false);
    setDays([...PermDays]); // Reverting days to 'PermDays' which has the original saved state
    setIsTempTextSelected(isTextSelected);
    setStateModal(false); // Closing modal
    setTempSelectedDay(() => (!previousDay ? selectedDay : tempSelectedDay));
  };

  useEffect(() => {
    setIsTempTextSelected(isTextSelected);
  }, [isTextSelected]);

  const toggleCheckbox = useCallback(
    (index: number) => {
      setTrackDaysState(!trackDaysState);
      setDays(prevDays =>
        prevDays.map((day, i) =>
          i === index ? {...day, isChecked: !day.isChecked} : day,
        ),
      );
    },
    [trackDaysState],
  );

  useEffect(() => {
    if (!previousDay) {
      setTempSelectedDay(selectedDay as any);
    }
  }, [previousDay]);

  useEffect(() => {
    if (trackParentDayState) {
      setIsTempTextSelected(`Every ${selectedDay} Day`);
    }
  }, [selectedDay]);

  useEffect(() => {
    const noneChecked = days.every(item => !item.isChecked);

    setIsTempTextSelected(
      noneChecked ? isTextSelected : 'On specific days of the week',
    );
  }, [trackDaysState]);

  return (
    <ReactNativeModal
      isVisible={stateModal}
      animationIn={'fadeInDown'}
      backdropTransitionInTiming={1000}
      animationOut={'fadeOut'}
      animationInTiming={400}
      animationOutTiming={400}
      coverScreen={true}
      backdropOpacity={0.1}
      style={{margin: 0}}
      onBackButtonPress={() => {
        setIsPreviousValueDays(false);
        setDays([...PermDays]);
        setIsTempTextSelected(isTextSelected);
        setStateModal(false);
        setTempSelectedDay(() =>
          !previousDay ? selectedDay : tempSelectedDay,
        );
      }}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text
            style={[styles.label, {textAlign: 'center', fontSize: size.xlg}]}>
            Periodicity of intake
          </Text>
          <Text
            style={[
              styles.label,
              {
                textAlign: 'center',
                fontSize: size.s,
                marginBottom: 10,
              },
            ]}>
            How often you need to take the medicine?
          </Text>

          <CustomDynamicText
            onPress={() => {
              setIsTempTextSelected('Only one day');
              setDays(prevDays =>
                prevDays.map(day => ({...day, isChecked: false})),
              );
            }}
            label={'Only one day'}
            extraStyle={{
              borderBottomWidth: 1,
              borderBottomColor: themeColors.lightGray,
              fontSize: size.md,
              paddingVertical: verticalScale(10),
              color:
                isTextTempSelected === 'Only one day'
                  ? themeColors.darkGray
                  : themeColors.black,
              fontWeight: isTextTempSelected === 'Only one day' ? '900' : '400',
            }}
          />

          <CustomDynamicText
            onPress={() => {
              setIsTempTextSelected('Weekly');
              setDays(prevDays =>
                prevDays.map(day => ({...day, isChecked: false})),
              );
              // setDays(prevDays =>
              //   prevDays.map(day => ({...day, isChecked: false})),
              // );
            }}
            label={'Weekly'}
            extraStyle={{
              borderBottomWidth: 1,
              borderBottomColor: themeColors.lightGray,
              fontSize: size.md,
              paddingVertical: verticalScale(10),
              color:
                isTextTempSelected === 'Weekly'
                  ? themeColors.darkGray
                  : themeColors.black,
              fontWeight: isTextTempSelected === 'Weekly' ? '900' : '400',
            }}
          />

          <CustomDynamicText
            onPress={() => {
              setIsTempTextSelected('Every day');
              setDays(prevDays =>
                prevDays.map(day => ({...day, isChecked: false})),
              );
            }}
            label={'Every day'}
            extraStyle={{
              borderBottomWidth: 1,
              borderBottomColor: themeColors.lightGray,
              fontSize: size.md,
              paddingVertical: verticalScale(10),
              color:
                isTextTempSelected === 'Every day'
                  ? themeColors.darkGray
                  : themeColors.black,
              fontWeight: isTextTempSelected === 'Every day' ? '900' : '400',
            }}
          />

          <CustomDynamicText
            onPress={() => {
              setTrackParentDayState(true);
              setIsTempTextSelected(`Every ${selectedDay} Day`);
              setIsEveryDaySelected(true);
              setDays(prevDays =>
                prevDays.map(day => ({...day, isChecked: false})),
              );
            }}
            label={`Every ${selectedDay ?? 'x'} days`}
            extraStyle={{
              borderBottomWidth: 1,
              borderBottomColor: themeColors.lightGray,
              fontSize: size.md,
              paddingVertical: verticalScale(10),
              color:
                isTextTempSelected === `Every ${selectedDay} Day`
                  ? // isTextTempSelected.initialnumber === 1
                    themeColors.darkGray
                  : themeColors.black,
              fontWeight:
                // isTextTempSelected.initialnumber === 1
                isTextTempSelected === `Every ${selectedDay} Day`
                  ? '900'
                  : '400',
            }}
          />

          <EveryDaysInsideSelectionModal
            isEveryDaySelected={isEveryDaySelected}
            selectedDay={selectedDay}
            setIsEveryDaySelected={setIsEveryDaySelected}
            setSelectedDay={setSelectedDay}
            setTempSelectedDay={setTempSelectedDay}
            tempSelectedDay={tempSelectedDay}
          />

          {/* counting end */}

          <View
            style={{
              width: '100%',
              borderBottomWidth: 1,
              borderBottomColor: themeColors.lightGray,
              paddingVertical: 5,
            }}>
            <CustomDynamicText
              label={'On specific days of the week'}
              extraStyle={{
                borderBottomWidth: 1,
                borderBottomColor: themeColors.lightGray,
                fontSize: size.md,
                paddingVertical: verticalScale(10),
                color:
                  isTextTempSelected === 'On specific days of the week'
                    ? // isTextTempSelected.initialnumber === 1
                      themeColors.darkGray
                    : themeColors.black,
                fontWeight:
                  isTextTempSelected === 'On specific days of the week'
                    ? '900'
                    : '400',
              }}
            />

            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginVertical: verticalScale(5),
              }}>
              {(isPreviousValueDays ? PermDays : days).map((item, index) => {
                // console.log('~ items checked :', item.isChecked);
                return (
                  <View key={index} style={{width: '13%'}}>
                    <Text
                      style={{
                        fontSize: moderateScale(14),
                        color: themeColors.darkGray,
                        paddingBottom: verticalScale(8),
                      }}>
                      {item.day}
                    </Text>

                    <BouncyCheckbox
                      isChecked={item.isChecked} // Use isChecked from state
                      size={25}
                      fillColor={themeColors.darkGray}
                      unFillColor="#FFFFFF"
                      innerIconStyle={{
                        borderWidth: 2,
                        width: 22,
                        height: 22,
                      }}
                      onPress={(isChecked: boolean) => {
                        toggleCheckbox(index);
                      }} // Toggle when pressed
                    />
                  </View>
                );
              })}
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
              onPress={() => cancelModalParent()}>
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
              onPress={() => DoneHandler()}>
              <Text style={[styles.closeButtonText, {textAlign: 'center'}]}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ReactNativeModal>
  );
};

export default EveryDayModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: themeColors.lightGray,
  },
  inputContainer: {},
  label: {
    fontSize: size.md,
    // fontFamily: fonts.OpenSansBold,
    color: themeColors.darkGray,
    // marginBottom: 15,
    paddingVertical: verticalScale(10),
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
