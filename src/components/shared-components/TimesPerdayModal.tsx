import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {themeColors} from '../../theme/colors';
import {size} from '../../theme/fontStyle';
import {fonts} from '../../theme/fonts';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Modal from 'react-native-modal';
import FontisoIcon from 'react-native-vector-icons/Fontisto';
import {horizontalScale} from '../../utils/metrics';

interface ModalProps {
  intakePlanModalVisible: boolean;
  setIntakePlanModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  isIntervalModal: boolean;
  setIsIntervalModal: React.Dispatch<React.SetStateAction<boolean>>;
  intervalBetweenIntakesModalVisible: boolean;
  setIntervalBetweenIntakesModalVisible: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  setIntervalIntake: React.Dispatch<React.SetStateAction<boolean>>;
  IntervalIntake: boolean;
}

const TimesPerdayModal = ({
  intakePlanModalVisible,
  intervalBetweenIntakesModalVisible,
  isIntervalModal,
  setIntakePlanModalVisible,
  setIntervalBetweenIntakesModalVisible,
  setIsIntervalModal,
  setIntervalIntake,
  IntervalIntake,
}: ModalProps) => {
  return (
    <Modal
      isVisible={intakePlanModalVisible}
      animationIn={'fadeInDown'}
      backdropTransitionInTiming={1000}
      animationOut={'fadeOut'}
      animationInTiming={400}
      animationOutTiming={400}
      onBackButtonPress={() => setIntakePlanModalVisible(false)}
      //   backdropColor="rgba(0,0,0,0.3)"
      coverScreen={true}
      backdropOpacity={0.1}
      style={{margin: 0}}
      // transparent
      // animationType="none"
      // onRequestClose={() => setIntakePlanModalVisible(false)}
    >
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
              onPress={() => setIntervalIntake(false)}
              style={{justifyContent: 'center', alignItems: 'center'}}>
              <MaterialIcon
                name="schedule"
                size={20}
                color={
                  !intakePlanModalVisible
                    ? themeColors.primary
                    : themeColors.darkGray
                }
              />
              <Text
                style={[
                  styles.label,
                  {
                    fontSize: size.sl,
                    color: !intakePlanModalVisible
                      ? themeColors.primary
                      : themeColors.darkGray,
                  },
                ]}>
                Schedule
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIntakePlanModalVisible(true)}
              style={{justifyContent: 'center', alignItems: 'center'}}>
              <FontisoIcon
                name="arrow-swap"
                size={20}
                color={
                  intakePlanModalVisible
                    ? themeColors.primary
                    : themeColors.darkGray
                }
              />
              <Text
                style={[
                  styles.label,
                  {
                    fontSize: size.sl,
                    color: intakePlanModalVisible
                      ? themeColors.primary
                      : themeColors.darkGray,
                  },
                ]}>
                Interval intake
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.label, {marginVertical: 10, width: '100%'}]}>
            How often?
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
            onPress={() => setIsIntervalModal(true)}>
            <Text style={[styles.label, {fontFamily: fonts.OpenSansRegular}]}>
              4 Times per day
            </Text>
            <MaterialIcon
              name="arrow-forward-ios"
              size={15}
              color={themeColors.primary}
            />
          </TouchableOpacity>
          {intakePlanModalVisible && (
            <>
              <Text style={[styles.label, {marginVertical: 10, width: '100%'}]}>
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
                <Text
                  style={[styles.label, {fontFamily: fonts.OpenSansRegular}]}>
                  Every 4 hour
                </Text>
                <MaterialIcon
                  name="arrow-forward-ios"
                  size={15}
                  color={themeColors.primary}
                />
              </TouchableOpacity>
            </>
          )}
          <Text style={[styles.label, {marginVertical: 10, width: '100%'}]}>
            Tap on the time to change it:
          </Text>
          <View
            style={{
              flexDirection: 'row',
              marginTop: 10,
              width: '100%',
              flexWrap: 'wrap',
            }}>
            <Text
              style={[
                styles.label,
                {
                  // fontSize: size.sl,
                  borderWidth: 1,
                  borderColor: themeColors.primary,
                  // width: 50,
                  padding: 5,
                  textAlign: 'center',
                  borderRadius: 20,
                  marginRight: 10,
                  color: themeColors.primary,
                },
              ]}>
              09:00
            </Text>
            <Text
              style={[
                styles.label,
                {
                  // fontSize: size.sl,
                  borderWidth: 1,
                  borderColor: themeColors.primary,
                  // width: 50,
                  padding: 5,
                  textAlign: 'center',
                  borderRadius: 20,
                  marginRight: 10,
                  color: themeColors.primary,
                },
              ]}>
              14:00
            </Text>
            <Text
              style={[
                styles.label,
                {
                  // fontSize: size.sl,
                  borderWidth: 1,
                  borderColor: themeColors.primary,
                  // width: 50,
                  padding: 5,
                  textAlign: 'center',
                  borderRadius: 20,
                  marginRight: 10,
                  color: themeColors.primary,
                },
              ]}>
              18:00
            </Text>
            <Text
              style={[
                styles.label,
                {
                  // fontSize: size.sl,
                  borderWidth: 1,
                  borderColor: themeColors.primary,
                  // width: 50,
                  padding: 5,
                  textAlign: 'center',
                  borderRadius: 20,
                  marginRight: 10,
                  color: themeColors.primary,
                },
              ]}>
              22:00
            </Text>
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
              onPress={() => setIntakePlanModalVisible(false)}>
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
              onPress={() => setIntakePlanModalVisible(false)}>
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

export default TimesPerdayModal;

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
