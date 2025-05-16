import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Button,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import ColorPicker, {
  Panel1,
  Swatches,
  Preview,
  HueSlider,
  OpacitySlider,
} from 'reanimated-color-picker';
import {runOnJS} from 'react-native-reanimated';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import {themeColors} from '../../theme/colors';
import Icon from 'react-native-vector-icons/FontAwesome5';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import FontisoIcon from 'react-native-vector-icons/Fontisto';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

type RootStackParamList = {
  AddReminderDetails: {
    medicationName: string;
    conditionName: string;
    medicationType: string;
    color: string;
    imageUrl?: string;
  };
  // add other routes with their params as needed
};

const medicationKeyValues = [
  {label: 'Tablet', value: 'Tablet'},
  {label: 'Injection', value: 'Injection'},
  {label: 'Spray', value: 'Spray'},
  {label: 'Drops', value: 'Drops'},
  {label: 'Solution', value: 'Solution'},
  {label: 'Herbs', value: 'Herbs'},
];

export default function AddMedication() {
  const router = useNavigation<NavigationProp<RootStackParamList>>();

  const [medicationName, setMedicationName] = useState('');
  const [conditionName, setConditionName] = useState('');
  const [medicationType, setMedicationType] = useState('');
  const [color, setColor] = useState('#ffffff');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [showImageOptions, setShowImageOptions] = useState(false);

  // Add validation state variables
  const [errors, setErrors] = useState({
    medicationName: '',
    conditionName: '',
    medicationType: '',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Update existing setter functions to clear errors when user enters data
  const updateMedicationName = (text: string) => {
    setMedicationName(text);
    if (text.trim()) {
      setErrors(prev => ({...prev, medicationName: ''}));
    }
  };

  const updateConditionName = (text: string) => {
    setConditionName(text);
    if (text.trim()) {
      setErrors(prev => ({...prev, conditionName: ''}));
    }
  };

  const updateMedicationType = (item: any) => {
    setMedicationType(item.label);
    setErrors(prev => ({...prev, medicationType: ''}));
  };

  const medicationTypes = [
    {
      id: '1',
      icon: (
        <Icon
          name="tablets"
          size={25}
          color={
            medicationType === 'Tablet'
              ? themeColors.white
              : themeColors.lightPink
          }
        />
      ),
      label: 'Tablet',
    },
    {
      id: '2',
      icon: (
        <Icon
          name="capsules"
          size={25}
          color={
            medicationType === 'Capsule'
              ? themeColors.white
              : themeColors.lightPink
          }
        />
      ),
      label: 'Capsule',
    },
    {
      id: '3',
      icon: (
        <FontisoIcon
          name="injection-syringe"
          size={25}
          color={
            medicationType === 'Injection'
              ? themeColors.white
              : themeColors.lightPink
          }
        />
      ),
      label: 'Injection',
    },
    {
      id: '4',
      icon: (
        <MaterialCommunityIcon
          name="spray"
          size={25}
          color={
            medicationType === 'Spray'
              ? themeColors.white
              : themeColors.lightPink
          }
        />
      ),
      label: 'Spray',
    },
    {
      id: '5',
      icon: (
        <EntypoIcon
          name="drop"
          size={25}
          color={
            medicationType === 'Drops'
              ? themeColors.white
              : themeColors.lightPink
          }
        />
      ),
      label: 'Drops',
    },
    {
      id: '6',
      icon: (
        <FontAwesome6
          name="glass-water"
          size={25}
          color={
            medicationType === 'Solution'
              ? themeColors.white
              : themeColors.lightPink
          }
        />
      ),
      label: 'Solution',
    },
    {
      id: '7',
      icon: (
        <Image
          source={
            medicationType === 'Herbs'
              ? require('../../../assets/images/herbalIcon2.png')
              : require('../../../assets/images/herbalIcon.png')
          }
          style={{width: 30, height: 30}}
        />
      ),
      label: 'Herbs',
    },
  ];

  // Image selection options
  const selectImage = () => {
    setShowImageOptions(true);
  };

  const takePhoto = () => {
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      response => {
        if (response.didCancel) {
          console.log('User cancelled camera');
        } else if (response.errorCode) {
          console.log('Camera Error: ', response.errorMessage);
        } else if (response.assets && response.assets[0].uri) {
          setImageUri(response.assets[0].uri);
        }
        setShowImageOptions(false);
      },
    );
  };

  const chooseFromGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.8,
      },
      response => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
        } else if (response.assets && response.assets[0].uri) {
          setImageUri(response.assets[0].uri);
        }
        setShowImageOptions(false);
      },
    );
  };

  // This handler will be called when the user completes the color selection
  const onSelectColor = ({hex}) => {
    'worklet';
    // do something with the selected color.
    console.log(hex);
    runOnJS(setColor)(hex);
  };

  // Update the submit function to validate fields first
  const onSubmit = () => {
    setFormSubmitted(true);

    // Validate fields
    const newErrors = {
      medicationName: !medicationName.trim()
        ? 'Medication name is required'
        : '',
      conditionName: !conditionName.trim() ? 'Condition name is required' : '',
      medicationType: !medicationType ? 'Please select a medication type' : '',
    };

    setErrors(newErrors);

    // Check if there are any errors
    if (
      newErrors.medicationName ||
      newErrors.conditionName ||
      newErrors.medicationType
    ) {
      // If there are errors, don't navigate
      return;
    }

    router.navigate('AddReminderDetails', {
      medicationName,
      conditionName,
      medicationType,
      color,
      imageUrl: imageUri || undefined,
    });
  };

  // Helper function to get input border color based on validation state
  const getBorderColor = (fieldName: string) => {
    return formSubmitted && errors[fieldName] ? 'red' : 'lightgray';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.label}>Medication Name *</Text>
        <TextInput
          style={[
            styles.textInput,
            {borderColor: getBorderColor('medicationName')},
          ]}
          value={medicationName}
          onChangeText={updateMedicationName}
          placeholder="Enter medication name"
          placeholderTextColor={'#888'}
        />
        {formSubmitted && errors.medicationName ? (
          <Text style={styles.errorText}>{errors.medicationName}</Text>
        ) : null}

        <Text style={styles.label}>Condition Name *</Text>
        <TextInput
          style={[
            styles.textInput,
            {borderColor: getBorderColor('conditionName')},
          ]}
          value={conditionName}
          onChangeText={updateConditionName}
          placeholder="Enter condition name"
          placeholderTextColor={'#888'}
        />
        {formSubmitted && errors.conditionName ? (
          <Text style={styles.errorText}>{errors.conditionName}</Text>
        ) : null}

        <Text style={styles.label}>Medication Type *</Text>
        <Dropdown
          data={medicationTypes}
          labelField="label"
          valueField="label"
          placeholder="Select type"
          value={medicationType}
          onChange={updateMedicationType}
          style={[
            styles.dropdown,
            {borderColor: getBorderColor('medicationType')},
          ]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          renderItem={item => (
            <View
              style={[
                styles.dropdownItem,
                {
                  backgroundColor:
                    medicationType === item.label
                      ? themeColors.primary
                      : 'white',
                },
              ]}>
              {item.icon}
              <Text
                style={{
                  color: medicationType === item.label ? 'white' : '#000',
                  marginLeft: 10,
                  fontSize: 16,
                }}>
                {item.label}
              </Text>
            </View>
          )}
        />
        {formSubmitted && errors.medicationType ? (
          <Text style={styles.errorText}>{errors.medicationType}</Text>
        ) : null}

        <Text style={styles.label}>Color (Optional)</Text>
        <TouchableOpacity
          onPress={() => setShowColorPicker(true)}
          style={[styles.colorButton, {backgroundColor: color}]}
        />

        <Text style={styles.label}>Image (Optional)</Text>
        {!imageUri ? (
          <TouchableOpacity
            onPress={selectImage}
            style={styles.imagePickerButton}>
            <MaterialIcon
              name="add-photo-alternate"
              size={24}
              color={themeColors.primary}
            />
            <Text style={styles.imagePickerText}>Add Image</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.imagePreviewContainer}>
            <Image source={{uri: imageUri}} style={styles.imagePreview} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => setImageUri(null)}>
              <MaterialIcon name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity onPress={onSubmit} style={styles.nextButton}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>

      {/* Color Picker Modal */}
      <Modal
        visible={showColorPicker}
        animationType="fade"
        transparent={true}
        statusBarTranslucent>
        <View style={styles.modalContainer}>
          <View style={styles.colorPickerContainer}>
            <ColorPicker value={color} onComplete={onSelectColor}>
              <Preview />
              <Panel1 />
              <HueSlider />
              <OpacitySlider />
              <Swatches />
            </ColorPicker>
            <TouchableOpacity
              onPress={() => setShowColorPicker(false)}
              style={styles.colorPickerButton}>
              <Text style={styles.colorPickerButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Image Selection Modal */}
      <Modal
        visible={showImageOptions}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowImageOptions(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.imageOptionsContainer}>
            <Text style={styles.imageOptionsTitle}>Select Image</Text>

            <TouchableOpacity
              style={styles.imageOptionButton}
              onPress={takePhoto}>
              <MaterialIcon
                name="camera-alt"
                size={24}
                color={themeColors.primary}
              />
              <Text style={styles.imageOptionText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.imageOptionButton}
              onPress={chooseFromGallery}>
              <MaterialIcon
                name="photo-library"
                size={24}
                color={themeColors.primary}
              />
              <Text style={styles.imageOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowImageOptions(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Update your StyleSheet to add errorText style
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 100, // Extra padding at bottom to ensure content is visible
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    fontWeight: '500',
  },
  textInput: {
    color: 'black',
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    borderColor: 'lightgray',
    fontSize: 16,
  },
  dropdown: {
    borderWidth: 1,
    marginBottom: 16,
    borderRadius: 8,
    borderColor: 'lightgray',
    padding: 12,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 2,
  },
  colorButton: {
    height: 50,
    width: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 16,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: themeColors.primary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    justifyContent: 'center',
  },
  imagePickerText: {
    marginLeft: 8,
    color: themeColors.primary,
    fontSize: 16,
  },
  imagePreviewContainer: {
    marginBottom: 16,
    position: 'relative',
    alignSelf: 'center',
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  nextButton: {
    backgroundColor: themeColors.primary,
    padding: 15,
    alignItems: 'center',
    borderRadius: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  colorPickerContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    width: '85%',
  },
  colorPickerButton: {
    backgroundColor: themeColors.primary,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  colorPickerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageOptionsContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  imageOptionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  imageOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  imageOptionText: {
    marginLeft: 16,
    fontSize: 16,
  },
  cancelButton: {
    padding: 15,
    marginTop: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: themeColors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#888',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#000',
  },
  dropdownContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  // Add this new style for error messages
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 8,
  },
});
