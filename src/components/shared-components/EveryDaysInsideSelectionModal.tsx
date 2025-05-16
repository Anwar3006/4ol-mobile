import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import Modal from 'react-native-modal';
import {fonts} from '../../theme/fonts';
import {size} from '../../theme/fontStyle';
import {themeColors} from '../../theme/colors';
import {horizontalScale, verticalScale} from '../../utils/metrics';
import {Picker} from '@react-native-picker/picker';
import {everyDays100} from '../../constants';

interface Props {
  isEveryDaySelected: boolean;
  selectedDay: String;
  setSelectedDay: React.Dispatch<React.SetStateAction<string>>;
  setIsEveryDaySelected: React.Dispatch<React.SetStateAction<boolean>>;
  setTempSelectedDay: React.Dispatch<React.SetStateAction<string | any>>;
  tempSelectedDay: any;
}

const EveryDaysInsideSelectionModal = ({
  isEveryDaySelected,
  selectedDay,
  setSelectedDay,
  setIsEveryDaySelected,
  setTempSelectedDay,
  tempSelectedDay,
}: Props) => {
  const [previousDay, setPreviousDay] = useState(true);

  useEffect(() => {
    if (previousDay === false) {
      setTempSelectedDay(selectedDay);
    }
  }, [previousDay]);

  const cancelModal: () => void = async () => {
    setPreviousDay(false);
    setIsEveryDaySelected(false);
    setTempSelectedDay(() => {
      return !previousDay ? selectedDay : tempSelectedDay;
    });
  };

  return (
    <Modal
      isVisible={isEveryDaySelected}
      animationIn={'fadeInDown'}
      backdropTransitionInTiming={1000}
      animationOut={'fadeOut'}
      animationInTiming={400}
      animationOutTiming={400}
      //   backdropColor="rgba(0,0,0,0.3)"
      coverScreen={true}
      backdropOpacity={0.1}
      style={{margin: 0}}
      onBackButtonPress={() => {
        setPreviousDay(false);
        setIsEveryDaySelected(false);

        setTempSelectedDay(() => {
          return !previousDay ? selectedDay : tempSelectedDay;
        });
      }}>
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, {alignItems: 'center'}]}>
          <Text
            style={[
              styles.label,
              {textAlign: 'center', fontSize: size.xlg, marginBottom: 20},
            ]}>
            {`Every ${tempSelectedDay} Days`}
          </Text>

          {/* Only Hours Picker */}
          <View style={styles.pickerContainer}>
            <View style={styles.pickerWrapper}>
              {/* <Text style={styles.pickerLabel}>Every Day</Text> */}
              <Picker
                selectedValue={tempSelectedDay}
                onValueChange={itemValue => setTempSelectedDay(itemValue)}
                dropdownIconColor={themeColors.black}
                // dropdownIconColor={'white'}
                style={styles.picker}>
                {everyDays100.map((num, i) => (
                  <Picker.Item key={num} label={num.toString()} value={num} />
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
              onPress={() => cancelModal()}>
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
              onPress={() => {
                setSelectedDay(tempSelectedDay);
                setIsEveryDaySelected(false);
              }}>
              <Text style={[styles.closeButtonText, {textAlign: 'center'}]}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EveryDaysInsideSelectionModal;

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
