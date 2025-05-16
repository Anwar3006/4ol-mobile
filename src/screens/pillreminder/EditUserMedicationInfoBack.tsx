import React, {useEffect, useRef, useState} from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Pressable,
  Image,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import {themeColors} from '../../theme/colors';
import Icon from 'react-native-vector-icons/FontAwesome5';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import FontisoIcon from 'react-native-vector-icons/Fontisto';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import {size} from '../../theme/fontStyle';
import {fonts} from '../../theme/fonts';
import {PERMISSIONS, request} from 'react-native-permissions';
import {Image as compressImage} from 'react-native-compressor';
import ImageCropPicker from 'react-native-image-crop-picker';
import {Formik} from 'formik';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {NavigationStackParams} from '../../interfaces';
import {AddMedicationSchema, EditUserMedication} from '../../validation';
import MedicationCustomInput from '../../components/reusable_component/MedicationCustomInput';
import RawBottomSheet from '../../components/shared-components/RawBottomSheet';
import {horizontalScale, verticalScale} from '../../utils/metrics';

// interface Medication {
//   type: string;
//   color: string;
//   image: string;
//   // Add any other relevant properties here
// }

// type MedicationParams = {
//   EditMedication: {
//     medication: {
//       id: string;
//       user_id: string;
//       medication_name: string;
//       medication_description: string;
//       quantity_per_intake: number;
//       intake_times: string[];
//       start_date: string;
//       end_date: string;
//       days: string | undefined;
//       type: string;
//       regular_notifications: boolean;
//       is_created_by_admin_panel: boolean;
//       created_by: string;
//       updated_by: string;
//       created_at: number;
//       updated_at: number;
//       how_many_times: number;
//       medicine_image: string;
//       medicine_type: string;
//       color: string;
//       days_of_the_week: string[];
//       intake_days: number | null;
//     };
//   };
//   medicationsDetailsData: {
//     color: string; // "#63605C"
//     created_at: number; // Unix timestamp 1729598383088
//     created_by: string; // UUID "707cc7d3-30a8-4ead-a495-f449a1881087"
//     days: string; // "Weekly"
//     days_of_the_week: string[] | null; // Can be an array of strings or null
//     end_date: string; // "2024-10-23" (ISO date string)
//     how_many_times: number; // 1
//     id: string; // UUID "b9199573-58b1-4ad9-b623-debe061bbbd6"
//     intake_days: string[] | null; // Can be an array of strings or null
//     intake_times: string[]; // Array of times
//     is_created_by_admin_panel: boolean; // false
//     medication_description: string; // "Maba"
//     medication_name: string; // "Nag"
//     medicine_image: string; // "avatar"
//     medicine_type: string; // "Tablet"
//     quantity_per_intake: number; // 1
//     regular_notifications: boolean; // false
//     start_date: string; // "2024-10-22" (ISO date string)
//     type: string; // "schedule"
//     updated_at: number; // Unix timestamp 1729598383088
//     updated_by: string; // UUID "707cc7d3-30a8-4ead-a495-f449a1881087"
//     user_id: string; // UUID "707cc7d3-30a8-4ead-a495-f449a1881087"
//   };
//   // Add other screens here
// };

type MedicationTimeSlotsProps = {
  route?: {
    params: {
      userMedicationDetails: {
        color: string; // "#63605C"
        created_at: number; // Unix timestamp 1729598383088
        created_by: string; // UUID "707cc7d3-30a8-4ead-a495-f449a1881087"
        days: string; // "Weekly"
        days_of_the_week: string[] | null; // Can be an array of strings or null
        end_date: string; // "2024-10-23" (ISO date string)
        how_many_times: number; // 1
        id: string; // UUID "b9199573-58b1-4ad9-b623-debe061bbbd6"
        intake_days: string[] | null; // Can be an array of strings or null
        intake_times: string[]; // Array of times
        is_created_by_admin_panel: boolean; // false
        medication_description: string; // "Maba"
        medication_name: string; // "Nag"
        medicine_image: string; // "avatar"
        medicine_type: string; // "Tablet"
        quantity_per_intake: number; // 1
        regular_notifications: boolean; // false
        start_date: string; // "2024-10-22" (ISO date string)
        type: string; // "schedule"
        updated_at: number; // Unix timestamp 1729598383088
        updated_by: string; // UUID "707cc7d3-30a8-4ead-a495-f449a1881087"
        user_id: string; // UUID "707cc7d3-30a8-4ead-a495-f449a1881087"
      };
    };
  };
};

const EditUserMedicationInfo = ({route}: MedicationTimeSlotsProps) => {
  console.log('~ route :', route);
  const {
    medication_name,
    medication_description,
    type,
    medicine_image,
    medicine_type,
    created_at,
    created_by,
    days,
    end_date,
    id,
    intake_times,
    is_created_by_admin_panel,
    quantity_per_intake,
    regular_notifications,
    start_date,
    updated_at,
    updated_by,
    user_id,
    how_many_times,
    days_of_the_week,
    intake_days,
    color,
  } = route?.params?.userMedicationDetails || {};

  const [medication, setMedication] = useState({
    type: medicine_type,
    color: color,
    image: medicine_image,
  });

  const navigation = useNavigation<NavigationProp<NavigationStackParams>>();
  const refRBSheet = useRef<any>();
  const [modalVisible, setModalVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [cameraPermission, setCameraPermission] = React.useState<string>('');
  const [galleryPermission, setGalleryPermission] = React.useState<string>('');

  const medicationTypes = [
    {
      id: '1',
      icon: (
        <Icon
          name="tablets"
          size={25}
          color={
            medication.type === 'Tablet'
              ? themeColors.white
              : themeColors.lightPink
          }
        />
      ),
      title: 'Tablet',
    },
    {
      id: '2',
      icon: (
        <Icon
          name="capsules"
          size={25}
          color={
            medication.type === 'Capsule'
              ? themeColors.white
              : themeColors.lightPink
          }
        />
      ),
      title: 'Capsule',
    },
    {
      id: '3',
      icon: (
        <FontisoIcon
          name="injection-syringe"
          size={25}
          color={
            medication.type === 'Injection'
              ? themeColors.white
              : themeColors.lightPink
          }
        />
      ),
      title: 'Injection',
    },
    {
      id: '4',
      icon: (
        <MaterialCommunityIcon
          name="spray"
          size={25}
          color={
            medication.type === 'Spray'
              ? themeColors.white
              : themeColors.lightPink
          }
        />
      ),
      title: 'Spray',
    },
    {
      id: '5',
      icon: (
        <EntypoIcon
          name="drop"
          size={25}
          color={
            medication.type === 'Drops'
              ? themeColors.white
              : themeColors.lightPink
          }
        />
      ),
      title: 'Drops',
    },
    {
      id: '6',
      icon: (
        <FontAwesome6
          name="glass-water"
          size={25}
          color={
            medication.type === 'Solution'
              ? themeColors.white
              : themeColors.lightPink
          }
        />
      ),
      title: 'Solution',
    },
    {
      id: '7',
      icon: (
        <Image
          source={
            medication.type === 'Herbs'
              ? require('../../../assets/images/herbalIcon2.png')
              : require('../../../assets/images/herbalIcon.png')
          }
          style={{width: 30, height: 30}}
        />
      ),
      title: 'Herbs',
    },
  ];

  const colors = [
    '#47BE7D',
    '#F640B1',
    '#0E124C',
    'red',
    '#000000',
    '#63605C',
    '#5270FF',
    '#FBDE5A',
    '#F8AC25',
    '#FFFFFF',
  ]; // Array of colors

  const openGallery = async () => {
    const galleryImage = await ImageCropPicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
    });
    const result = await compressImage.compress(galleryImage?.path);
    setMedication(prev => ({...prev, image: result}));
    // handleimageUpload();
    refRBSheet.current.close();
  };

  const openCamera = async () => {
    const cameraImage = await ImageCropPicker.openCamera({
      width: 300,
      height: 400,
      cropping: true,
    });
    const result = await compressImage.compress(cameraImage?.path);
    setMedication(prev => ({...prev, image: result}));

    refRBSheet.current.close();
  };

  const requestCameraPermission = async () => {
    try {
      const result = await request(
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.CAMERA
          : PERMISSIONS.ANDROID.CAMERA,
      );
      if (result === 'granted') {
        setCameraPermission(result);
      } else {
        console.log('Permission camera granted', result);
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
    }
  };

  const requestGalleryPermission = async () => {
    try {
      const result = await request(
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.PHOTO_LIBRARY
          : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      );
      if (result === 'granted') {
        setGalleryPermission(result);
      } else {
        console.log('Permission granted', result);
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
    }
  };

  const handleCameraOpen = () => {
    try {
      setImageModalVisible(false);
      if (cameraPermission === 'granted') {
        ImageCropPicker.openCamera({
          multiple: false,
          mediaType: 'photo',
          compressImageQuality: 0.3,
        })
          .then(async (images: any) => {
            const result = await compressImage.compress(images?.path);
            setMedication(prev => ({...prev, image: result}));
          })
          .catch(error => {
            console.log(error, 'error');
          });
      } else {
        Alert.alert(
          'Permission Required',
          'Please grant permission to access the camera to proceed.',
          [
            {
              text: 'OK',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                }
                if (Platform.OS === 'android') {
                  Linking.openSettings();
                }
              },
            },
          ],
        );
      }
    } catch (error) {
      console.log(error, 'error');
    }
  };

  const handleGalleryOpen = () => {
    try {
      setImageModalVisible(false);
      if (galleryPermission === 'granted') {
        ImageCropPicker.openPicker({
          multiple: false,
          mediaType: 'photo',
          compressImageQuality: 0.3,
        })
          .then(async (images: any) => {
            const result = await compressImage.compress(images?.path);
            setMedication(prev => ({...prev, image: result}));
          })
          .catch(error => {
            console.log(error, 'error');
          });
      } else {
        Alert.alert(
          'Permission Required',
          'Please grant permission to access the gallery to proceed.',
          [
            {
              text: 'OK',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                }
                if (Platform.OS === 'android') {
                  Linking.openSettings();
                }
              },
            },
          ],
        );
      }
    } catch (error) {
      console.log(error, 'error');
    }
  };

  const handleSubmit = (values: any) => {
    console.log('values', values);

    // Navigating to the next screen and passing data
    navigation.navigate('EditMedication', {
      ...medication, // existing medication data
      ...values, // form values being submitted
      medicationsDetailsData: route?.params?.userMedicationDetails, // additional data from route params
    });
  };

  return (
    <Formik
      initialValues={{
        editname: medication_name || '',
        editcondition: medication_description || '',
      }}
      onSubmit={handleSubmit}
      validationSchema={EditUserMedication}>
      {({errors, values, handleChange, handleSubmit, touched}) => (
        // Your form content goes here (e.g., TextInput, Button)

        <View style={styles.container}>
          <ScrollView
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              //   justifyContent: 'center',
              //   alignItems: 'center',
              minHeight: '90%',
            }}>
            <View style={{flex: 1}}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Medication Name:</Text>

                <MedicationCustomInput
                  placeHolder="Enter Medication Name"
                  onChangevalue={handleChange('editname')}
                  value={values.editname}
                  style={styles.input}
                  touched={touched.editname}
                  error={errors?.editname}
                />
              </View>

              <View style={[styles.inputContainer, {marginVertical: 15}]}>
                <Text style={styles.label}>Condition:</Text>
                <MedicationCustomInput
                  placeHolder="Enter Condition"
                  onChangevalue={handleChange('editcondition')}
                  value={values.editcondition}
                  style={[styles.input, styles.textInput]}
                  touched={touched.editcondition}
                  error={errors?.editcondition}
                  multiline
                />
              </View>

              <View>
                <Text style={styles.label}>Medication Type:</Text>
                <FlatList
                  horizontal
                  data={medicationTypes}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      style={[
                        styles.item,
                        {
                          backgroundColor:
                            item.title === medication.type
                              ? themeColors.primary
                              : themeColors.white,
                        },
                      ]}
                      onPress={() =>
                        setMedication(prev => ({...prev, type: item.title}))
                      }>
                      {item.icon}
                      <Text
                        style={[
                          styles.itemText,
                          {
                            color:
                              item.title === medication.type
                                ? themeColors.white
                                : themeColors.darkGray,
                          },
                        ]}>
                        {item.title}
                      </Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={item => item.id}
                  showsHorizontalScrollIndicator={false}
                />
              </View>

              <View style={styles.colorPickerContainer}>
                <Text style={styles.label}>Color:</Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(true)}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: medication.color,
                    marginLeft: 10,
                  }}
                />
              </View>

              <View style={styles.photoContainer}>
                <View
                  style={{
                    alignItems: 'center',
                    backgroundColor: themeColors.white,
                    padding: 12,
                    borderRadius: 20,
                  }}>
                  {medication.image !== 'avatar' || '' ? (
                    <View style={{position: 'relative'}}>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        // onPress={() => setImageModalVisible(true)}
                      >
                        <Image
                          source={{
                            uri: medication.image,
                          }}
                          style={{width: 100, height: 100, borderRadius: 10}}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.2}
                        style={{position: 'absolute', right: 0, top: 0}}
                        onPress={() =>
                          setMedication(prev => ({...prev, image: 'avatar'}))
                        }>
                        <MaterialCommunityIcon
                          name="close"
                          size={22}
                          color={themeColors.primary}
                          style={{
                            // position: 'absolute',
                            right: horizontalScale(-15),
                            top: verticalScale(-15),
                          }}
                        />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => refRBSheet.current.open()}
                      style={{alignItems: 'center'}}>
                      <MaterialCommunityIcon
                        name="camera-plus"
                        size={70}
                        color={themeColors.lightPink}
                      />
                      <Text
                        style={[
                          styles.label,
                          {textTransform: 'uppercase', fontSize: size.s},
                        ]}>
                        Add a photo
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.actionBtn}>
            <TouchableOpacity
              // disabled={}
              onPress={() => handleSubmit()}>
              <Text style={styles.actionBtnText}>{'Continue'}</Text>
            </TouchableOpacity>
          </View>

          {/* Color Picker Modal */}

          <Modal
            visible={modalVisible}
            transparent
            animationType="none"
            onRequestClose={() => setModalVisible(false)}>
            <View style={styles.modalContainer}>
              <View style={[styles.modalContent, {width: '80%'}]}>
                <Text style={styles.selectColorText}>Select a Color</Text>
                <View style={styles.colorOptions}>
                  {colors.map(color => (
                    <Pressable
                      key={color}
                      style={[styles.colorBox, {backgroundColor: color}]}
                      onPress={() => {
                        setMedication(prev => ({...prev, color}));
                        setModalVisible(false);
                      }}
                    />
                  ))}
                </View>
                <TouchableOpacity
                  style={[styles.closeButton]}
                  onPress={() => setModalVisible(false)}>
                  <Text style={[styles.closeButtonText]}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Image Picker Modal */}
          {/* 
          <Modal
            visible={imageModalVisible}
            transparent
            animationType="none"
            onRequestClose={() => setImageModalVisible(false)}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={handleCameraOpen}>
                  <Text style={styles.modalOptionText}>Open Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={handleGalleryOpen}>
                  <Text style={styles.modalOptionText}>
                    Choose from Gallery
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.closeButton]}
                  onPress={() => setImageModalVisible(false)}>
                  <Text style={[styles.closeButtonText]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal> */}

          <RawBottomSheet
            openCamera={openCamera}
            openGallery={openGallery}
            refRB={refRBSheet}
          />
        </View>
      )}
    </Formik>
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
    color: themeColors.black,
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
  modalOption: {
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: themeColors.lightGray,
  },
  modalOptionText: {
    fontSize: size.md,
    fontFamily: fonts.OpenSansBold,
    color: themeColors.primary,
  },
  errorText: {
    color: 'red',
    fontSize: size.sl,
  },
});

export default EditUserMedicationInfo;
