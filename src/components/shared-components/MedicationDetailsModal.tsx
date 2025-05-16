import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import {height, size} from '../../theme/fontStyle';
import ReactNativeModal from 'react-native-modal';
import {themeColors} from '../../theme/colors';
import {fonts} from '../../theme/fonts';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MedicineBox from 'react-native-vector-icons/AntDesign';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {NavigationStackParams} from '../../interfaces';
import CrossIcon from 'react-native-vector-icons/Entypo';
interface MedicationSchedule {
  created_at: number; // Timestamp in milliseconds
  created_by: string; // User ID of the creator
  days: string; // Description of the days
  end_date: string; // End date in YYYY-MM-DD format
  id: string; // Unique identifier for the schedule
  intake_times: string[]; // Array of intake times in specific format
  is_created_by_admin_panel: boolean; // Indicates if created by admin panel
  medication_description: string; // Description of the medication
  medication_name: string; // Name of the medication
  quantity_per_intake: number; // Quantity to be taken per intake
  regular_notifications: boolean; // Indicates if regular notifications are enabled
  start_date: string; // Start date in YYYY-MM-DD format
  type: string; // Type of schedule
  updated_at: number; // Timestamp of the last update in milliseconds
  updated_by: string; // User ID of the last updater
  user_id: string; // User ID associated with the schedule
  how_many_times: number;
  medication_image: string | undefined;
  dose_quantity: string;
  mg_dose_quantity: string;
}

interface IPropsMedication {
  stateModal: boolean;
  setStateModal: React.Dispatch<React.SetStateAction<boolean>>;
  userMedicationsDetails: MedicationSchedule;
}

const MedicationDetailsModal = ({
  setStateModal,
  stateModal,
  userMedicationsDetails,
}: IPropsMedication) => {
  const navigation = useNavigation<NavigationProp<any>>();
  console.log('user medications in modal', userMedicationsDetails);

  return (
    <ReactNativeModal
      isVisible={stateModal}
      animationIn={'fadeInDown'}
      backdropTransitionInTiming={1000}
      animationOut={'fadeOut'}
      animationInTiming={400}
      animationOutTiming={400}
      coverScreen={true}
      backdropOpacity={0.5}
      style={{margin: 0}}
      onBackButtonPress={() => setStateModal(false)} // For Android back button
      onBackdropPress={() => setStateModal(false)} // Modal will close when clicking outside the modal
    >
      <View style={styles.modalContainer}>
        {/* modal content start */}
        <View style={styles.modalContent}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              // alignItems: 'flex-end',
            }}>
            <TouchableOpacity
              onPress={() => {
                setStateModal(false);
              }}
              activeOpacity={0.7}>
              <CrossIcon name="cross" size={24} color={themeColors.darkGray} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('EditUserMedicationInfo', {
                  userMedicationDetails: userMedicationsDetails,
                });
                setStateModal(false);
              }}>
              <Icon name="pencil" size={24} color={themeColors.darkGray} />
            </TouchableOpacity>
          </View>
          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <MedicineBox
              name="medicinebox"
              style={{alignSelf: 'center'}}
              size={80}
              color={themeColors.darkGray}
            />

            <Text
              style={{
                color: themeColors.black,
                fontWeight: '800',
                fontSize: moderateScale(18),
                paddingTop: verticalScale(20),
              }}>
              9:00
            </Text>

            <Text
              style={{
                color: themeColors.black,
                // fontWeight: '800',
                fontSize: moderateScale(18),
              }}>
              {userMedicationsDetails?.medication_name}
            </Text>
            <View
              style={{
                paddingTop: verticalScale(18),
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  color: themeColors.darkGray,
                  // fontWeight: '800',
                  fontSize: moderateScale(18),
                }}>
                {`Dosage : ${userMedicationsDetails.dose_quantity ?? 1}.${
                  userMedicationsDetails.mg_dose_quantity ?? 0
                } PCs.`}
              </Text>
              <Text
                style={{
                  color: themeColors.darkGray,
                  // fontWeight: '800',
                  fontSize: moderateScale(18),
                }}>
                {`information : ${userMedicationsDetails?.medication_description}`}
              </Text>
            </View>
          </View>
        </View>
        {/* modal content end */}
      </View>
    </ReactNativeModal>
  );
};

export default MedicationDetailsModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: themeColors.lightGray,
  },
  label: {
    fontSize: size.md,
    color: themeColors.darkGray,
    paddingVertical: verticalScale(10),
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Darken the background
  },
  modalContent: {
    width: horizontalScale(350),
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    height: verticalScale(650),
  },
  closeButton: {
    marginTop: 20,
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
