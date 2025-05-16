import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import ReactNativeModal from 'react-native-modal';
import {themeColors} from '../../theme/colors';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import {useNavigation} from '@react-navigation/native';
import {PeriodTrackerData} from '../../interfaces';

interface OvulationStatusProps {
  stateModal: boolean;
  closeModal: () => void;
  periodTrackerData: PeriodTrackerData[];
}

const OvulationStatusModal = ({
  stateModal,
  closeModal,
  periodTrackerData,
}: OvulationStatusProps) => {
  const navigation = useNavigation<any>();

  console.log(
    'periodTrackerDataIN-Modal_PERIOD_LENGTH',
    periodTrackerData[0]?.period_length,
  );
  console.log(
    'periodTrackerDataIN-ModalCYCLE_LENGTH',
    periodTrackerData[0]?.cycle_length,
  );
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
      onBackButtonPress={() => {}}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text
            style={{
              color: themeColors.black,
              fontWeight: 'bold',
              lineHeight: 20,
              fontSize: moderateScale(13),
              fontStyle: 'italic',
              textAlign: 'center',
            }}>
            Do you want to update your dates?
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              alignSelf: 'center',
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
                onPress={closeModal}
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
                  navigation.navigate('SelectDateOfPeriod', {
                    periodTrackerData: periodTrackerData,
                    trackLengthCycle: periodTrackerData[0]?.cycle_length,
                    trackLengthPeriods: periodTrackerData[0]?.period_length,
                  });
                  closeModal();
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
      </View>
    </ReactNativeModal>
  );
};

export default OvulationStatusModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: themeColors.lightGray,
  },

  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    // alignItems: 'center',
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
