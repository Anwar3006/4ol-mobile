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
import {AddMedicationSchema} from '../../validation';
import MedicationCustomInput from '../../components/reusable_component/MedicationCustomInput';
import RawBottomSheet from '../../components/shared-components/RawBottomSheet';
import {horizontalScale, verticalScale} from '../../utils/metrics';

interface Medication {
  type: string;
  color: string;
  image: string;
  // Add any other relevant properties here
}

type MedicationParams = {
  AddMedicationContinue: {
    medication: Medication;
  };
  // Add other screens here
};

const AddMedication = () => {
  const [medication, setMedication] = useState({
    type: 'Tablet',
    color: '#63605C',
    image: '',
  });

  console.log('Medication :', medication);
  const navigation = useNavigation<NavigationProp<MedicationParams>>();
  const refRBSheet = useRef<any>();
  const [imagePath, setimagePath] = useState<string>('');

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

  useEffect(() => {
    // requestCameraPermission();
    // requestGalleryPermission();
  }, []);

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

  // const handleSubmit = () => {
  // setErrors({
  //   name: '',
  //   condition: '',
  // });
  // if (medication?.name?.trim()?.length == 0) {
  //   setErrors(prev => ({...prev, name: 'Medication name is required'}));
  // }
  // if (medication?.condition?.trim()?.length == 0) {
  //   setErrors(prev => ({...prev, condition: 'Condition is required'}));
  // }
  // if (
  //   medication?.condition?.trim()?.length == 0 ||
  //   medication?.name?.trim()?.length == 0
  // ) {
  //   return;
  // }
  // navigation.navigate(SCREENS.MEDICATIONTIMESLOTS);
  // };

  const handleSubmit = (values: any) => {
    console.log('values', values);

    navigation.navigate('AddMedicationContinue', {
      medication: {...medication, ...values},
    });

    // navigation.navigate('MedicationTimeSlots');
    // console.log('medication', medication);
  };

  // console.log('image-path', imagePath);

  return (
    <Formik
      initialValues={{
        name: '',
        condition: '',
      }}
      onSubmit={handleSubmit}
      validationSchema={AddMedicationSchema}>
      {({
        errors,
        values,
        handleChange,
        handleReset,
        handleSubmit,
        resetForm,
        touched,
        setSubmitting,
        isSubmitting,
      }) => (
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
                  onChangevalue={handleChange('name')}
                  value={values.name}
                  style={styles.input}
                  touched={touched.name}
                  error={errors?.name}
                />
              </View>
              <View style={[styles.inputContainer, {marginVertical: 15}]}>
                <Text style={styles.label}>Condition:</Text>

                <MedicationCustomInput
                  placeHolder="Enter Condition"
                  onChangevalue={handleChange('condition')}
                  value={values.condition}
                  style={[styles.input, styles.textInput]}
                  touched={touched.condition}
                  error={errors?.condition}
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
                  }}></TouchableOpacity>
              </View>

              <View style={styles.photoContainer}>
                <View
                  style={{
                    alignItems: 'center',
                    backgroundColor: themeColors.white,
                    padding: 12,
                    borderRadius: 20,
                  }}>
                  {medication.image ? (
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
                          setMedication(prev => ({...prev, image: ''}))
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

export default AddMedication;
