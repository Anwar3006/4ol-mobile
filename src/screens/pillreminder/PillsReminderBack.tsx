import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Pressable,
  Image,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MedicineBox from 'react-native-vector-icons/AntDesign';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import {Calendar} from 'react-native-calendars';
import moment from 'moment';
import {themeColors} from '../../theme/colors';
import {height, size} from '../../theme/fontStyle';
import {fonts} from '../../theme/fonts';
import DateTimePicker from '@react-native-community/datetimepicker';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SCREENS} from '../../constants/screens';
import {ActivityIndicator} from 'react-native-paper';
import {FlashList} from '@shopify/flash-list';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import {supabase} from '../../utils/supabaseClient';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import MedicationDetailsModal from '../../components/shared-components/MedicationDetailsModal';
import {useSelector} from 'react-redux';
import {user} from '../../store/selectors';

const PillsReminderScreen = () => {
  const [selectedDate, setSelectedDate] = useState(
    moment().format('YYYY-MM-DD'),
  );
  const [note, setNote] = useState('');
  const [dates, setDates] = useState<any>();
  const [emoji, setEmoji] = useState('');
  const [date, setDate] = useState(moment().format('YYYY-MM-DD'));
  const [time, setTime] = useState<any>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [isFabOpen, setisFabOpen] = useState<any>({open: false});
  const [medicationsData, setMedicationData] = useState<any[] | null>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userMedicationsDetails, setUserMedicationsDetails] = useState({});
  const [isOpenMedicationDetailsModal, setIsOpenMedicationDetailsModal] =
    useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const userData: any = useSelector(user);
  const getMedicationData = async () => {
    setIsLoading(true);
    try {
      const {data, error} = await supabase
        .from('medications') // Table name
        .select('*')
        .eq('user_id', userData.id);
      setIsLoading(false);
      const sortedData: any | undefined = data?.sort(
        (a, b) => a.created_at - b.created_at,
      );
      setMedicationData(sortedData);

      if (error) {
        console.error('Error fetching medications:', error.message);
      } else {
        console.log('Medications data:', data); // Successfully fetched data
      }
    } catch (error) {
      setIsLoading(false);
      console.log('~ error medicaitons api:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      getMedicationData();
    }, []),
  );

  const handleTimeChange = (event: any, selectedDate: any) => {
    const currentDate = selectedDate || date;
    setShowTimePicker(false);
    setTime(currentDate);
  };

  const handleSave = () => {
    // Handle save functionality here
    setIsNoteModalVisible(false);
  };

  const getDates = (date: any) => {
    const dates = [];
    if (!date) {
      for (let i = -3; i <= 3; i++) {
        dates.push(moment().add(i, 'days').format('YYYY-MM-DD'));
      }
    } else {
      for (let i = -3; i <= 3; i++) {
        dates.push(moment(date).add(i, 'days').format('YYYY-MM-DD'));
      }
    }
    setDates(dates);
  };

  const handleDateSelect = (date: any, isPicker: any) => {
    setSelectedDate(date);
    setCalendarVisible(false);
    if (isPicker) {
      getDates(date);
    }
  };

  useEffect(() => {
    getDates(false);
  }, []);

  return (
    // <Pressable style={styles.container} onPress={() => setPickerVisible(false)}>
    <>
      <View style={styles.headerMain}>
        <View style={styles.header}>
          <Text style={styles.dateText}>
            {moment(selectedDate).format('dddd, DD MMMM')}
          </Text>
          <TouchableOpacity
            onPress={() => setCalendarVisible(!isCalendarVisible)}
            style={styles.calendarButton}>
            <Icon name="calendar-month" size={30} color={themeColors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.dateScroll}>
          {dates?.map((date: any) => (
            <TouchableOpacity
              key={date}
              onPress={() => handleDateSelect(date, false)}
              style={[
                styles.dateItem,
                date === selectedDate && styles.selectedDateItem,
              ]}>
              <Text
                style={[
                  styles.dayText,
                  date === selectedDate && styles.selectedDayText,
                ]}>
                {moment(date).format('ddd')}
              </Text>
              <Text
                style={[
                  styles.dateTextSmall,
                  date === selectedDate && styles.selectedDateText,
                ]}>
                {moment(date).format('DD')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Modal
        transparent={true}
        visible={isCalendarVisible}
        animationType="none"
        onRequestClose={() => setCalendarVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Calendar
              current={selectedDate}
              onDayPress={(day: any) => handleDateSelect(day.dateString, true)}
              markedDates={{
                [selectedDate]: {
                  selected: true,
                  selectedColor: themeColors.primary,
                },
              }}
              theme={{
                selectedDayBackgroundColor: themeColors.primary,
                todayTextColor: themeColors.primary,
                arrowColor: themeColors.primary,
                monthTextColor: themeColors.primary,
                textDayFontFamily: fonts.OpenSansRegular,
                textMonthFontFamily: fonts.OpenSansRegular,
                textDayHeaderFontFamily: fonts.OpenSansRegular,
              }}
              style={styles.calendar}
            />
            <TouchableOpacity
              style={[styles.optionButton]}
              onPress={() => setCalendarVisible(!isCalendarVisible)}>
              <Text style={[styles.optionButtonText]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={showDatePicker}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Calendar
              current={date}
              onDayPress={(day: any) => {
                setDate(day.dateString);
                setShowDatePicker(false);
                // setIsNoteModalVisible(true);
              }}
              markedDates={{
                [date]: {
                  selected: true,
                  selectedColor: themeColors.primary,
                },
              }}
              theme={{
                selectedDayBackgroundColor: themeColors.primary,
                todayTextColor: themeColors.primary,
                arrowColor: themeColors.primary,
                monthTextColor: themeColors.primary,
                textDayFontFamily: fonts.OpenSansRegular,
                textMonthFontFamily: fonts.OpenSansRegular,
                textDayHeaderFontFamily: fonts.OpenSansRegular,
              }}
              style={styles.calendar}
            />
            <TouchableOpacity
              style={[styles.optionButton]}
              onPress={() => {
                setShowDatePicker(false);
                // setIsNoteModalVisible(true);
              }}>
              <Text style={[styles.optionButtonText]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={styles.addIconCondatiner}
        onPress={() => setPickerVisible(true)}>
        <View style={{flexDirection: 'row', position: 'relative'}}>
          <Icon
            name="plus"
            size={20}
            color={themeColors.white}
            style={{position: 'absolute', left: -25, top: 2}}
          />
          <Text
            style={{
              color: themeColors.white,
              fontFamily: fonts.OpenSansBold,
              fontSize: size.md,
            }}>
            Add
          </Text>
        </View>
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="none"
        onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, {paddingVertical: 20}]}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                // margin: 20,
                backgroundColor: themeColors.primary,
                alignSelf: 'center',
                padding: 10,
                borderRadius: 10,
              }}>
              <Text
                style={{
                  fontSize: size.md,
                  color: themeColors.white,
                  fontFamily: fonts.OpenSansRegular,
                  marginRight: 10,
                }}>
                Add Medication
              </Text>
              <FontistoIcon name="pills" size={20} color={themeColors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 10,
                backgroundColor: themeColors.primary,
                alignSelf: 'center',
                padding: 10,
                borderRadius: 10,
              }}
              onPress={() => {
                setIsModalVisible(false);
                setIsNoteModalVisible(true);
              }}>
              <Text
                style={{
                  fontSize: size.md,
                  color: themeColors.white,
                  fontFamily: fonts.OpenSansRegular,
                  marginRight: 10,
                }}>
                Add Note
              </Text>
              <Icon name="note-plus" size={20} color={themeColors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                {
                  backgroundColor: 'none',
                  borderWidth: 1,
                  borderColor: themeColors.primary,
                },
              ]}
              onPress={() => setIsModalVisible(!isModalVisible)}>
              <Text
                style={[styles.optionButtonText, {color: themeColors.primary}]}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={isNoteModalVisible}
        animationType="none"
        onRequestClose={() => setIsNoteModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, {padding: 20}]}>
            <Text style={styles.headerText}>I am feeling</Text>
            <View style={{flexDirection: 'row', marginVertical: 10}}>
              <Icon
                name="emoticon-confused-outline"
                size={30}
                color={
                  emoji == 'confused'
                    ? themeColors.primary
                    : themeColors.darkGray
                }
                style={{marginRight: 5}}
                onPress={() => setEmoji('confused')}
              />
              <Icon
                name="emoticon-sad-outline"
                size={30}
                color={
                  emoji == 'sad' ? themeColors.primary : themeColors.darkGray
                }
                style={{marginRight: 5}}
                onPress={() => setEmoji('sad')}
              />
              <Icon
                name="emoticon-neutral-outline"
                size={30}
                color={
                  emoji == 'neutral'
                    ? themeColors.primary
                    : themeColors.darkGray
                }
                style={{marginRight: 5}}
                onPress={() => setEmoji('neutral')}
              />
              <Icon
                name="emoticon-happy-outline"
                size={30}
                color={
                  emoji == 'happy' ? themeColors.primary : themeColors.darkGray
                }
                style={{marginRight: 5}}
                onPress={() => setEmoji('happy')}
              />
              <Icon
                name="emoticon-outline"
                size={30}
                color={
                  emoji == 'excited'
                    ? themeColors.primary
                    : themeColors.darkGray
                }
                onPress={() => setEmoji('excited')}
              />
            </View>

            <TextInput
              style={styles.textInput}
              multiline
              maxLength={500}
              placeholder="Notes"
              value={note}
              onChangeText={setNote}
              placeholderTextColor={themeColors.black}
            />
            <View style={styles.characterCount}>
              <Text style={styles.characterCountText}>{note.length}/500</Text>
            </View>
            <View style={styles.dateTimeContainer}>
              <Text style={styles.timeLabel}>Date:</Text>
              <TouchableOpacity
                style={styles.dateTimePickerButton}
                onPress={() => {
                  // setIsNoteModalVisible(false);
                  setShowDatePicker(true);
                }}>
                <Text style={styles.dateTimePickerText}>
                  {moment(date).format('dddd, DD MMMM')}
                </Text>
                <Icon
                  name="calendar-clock"
                  size={20}
                  color={themeColors.primary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.dateTimeContainer}>
              <Text style={styles.timeLabel}>Time:</Text>
              <TouchableOpacity
                style={styles.dateTimePickerButton}
                onPress={() => {
                  setShowTimePicker(true);
                  // setIsNoteModalVisible(false);
                }}>
                <Text style={styles.dateTimePickerText}>
                  {time.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                <Icon
                  name="clock-time-nine-outline"
                  size={20}
                  color={themeColors.primary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor: 'none',
                    borderWidth: 1,
                    borderColor: themeColors.primary,
                  },
                ]}
                onPress={() => setIsNoteModalVisible(false)}>
                <Text style={[styles.buttonText, {color: themeColors.primary}]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      {isOpenMedicationDetailsModal && (
        <MedicationDetailsModal
          stateModal={isOpenMedicationDetailsModal}
          setStateModal={setIsOpenMedicationDetailsModal}
          userMedicationsDetails={userMedicationsDetails}
        />
      )}

      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        {isLoading ? (
          <ActivityIndicator size={22} color={themeColors.primary} />
        ) : medicationsData && medicationsData.length > 0 ? (
          <FlatList
            data={medicationsData}
            scrollEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{paddingVertical: verticalScale(20)}}
            showsVerticalScrollIndicator={false}
            keyExtractor={item => item.id}
            renderItem={({item: medication}) => (
              console.log('medication', medication),
              (
                <>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      setIsOpenMedicationDetailsModal(true);
                      setUserMedicationsDetails(medication); // Poora object set karein
                    }}
                    style={{
                      width: horizontalScale(330),
                      paddingVertical: verticalScale(20),
                      borderRadius: 12,
                      marginVertical: verticalScale(5),
                      backgroundColor: themeColors.white,
                      paddingHorizontal: horizontalScale(10),
                    }}
                    key={medication.id}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <View style={{flexDirection: 'row'}}>
                        <Text
                          style={{
                            color: themeColors.black,
                            fontWeight: '800',
                            fontSize: moderateScale(18),
                          }}>
                          9:00
                        </Text>
                        <Text
                          style={{
                            color: themeColors.black,
                            fontWeight: '800',
                            fontSize: moderateScale(18),
                            paddingLeft: horizontalScale(8),
                            width: horizontalScale(240),
                          }}>
                          {medication.medication_name.length > 20
                            ? `${medication.medication_name.slice(
                                0,
                                10,
                              )}........${medication.medication_name.slice(-6)}`
                            : medication.medication_name}
                        </Text>
                      </View>
                      <TouchableOpacity activeOpacity={0.7}>
                        <MedicineBox
                          name="medicinebox"
                          size={30}
                          color={themeColors.primary}
                        />
                      </TouchableOpacity>
                    </View>
                    <Text
                      style={{
                        color: themeColors.darkGray,

                        // fontWeight: '800',
                        fontSize: moderateScale(15),
                      }}>
                      {`${medication.dose_quantity ?? 1}.${
                        medication.mg_dose_quantity ?? 0
                      } PCs.`}
                    </Text>
                  </TouchableOpacity>
                </>
              )
            )}
          />
        ) : (
          <>
            <FontistoIcon
              name="first-aid-alt"
              size={60}
              color={themeColors.lightPink}
            />
            <Text style={styles.noReminderText}>
              No reminders set yet! Click the "Add" button to set reminders for
              your medication.
            </Text>
          </>
        )}
      </View>

      <Modal
        transparent={true}
        visible={isPickerVisible}
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}>
        <View style={[styles.modalContainer, {position: 'relative'}]}>
          <View style={styles.dropdown}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: verticalScale(20),
              }}
              onPress={() => {
                setPickerVisible(false);
                setIsModalVisible(false);
                navigation?.navigate(SCREENS.ADDMEDICATION);
              }}>
              <Text
                style={{
                  fontSize: size.md,
                  color: themeColors.white,
                  fontFamily: fonts.OpenSansBold,
                  marginRight: 10,
                }}>
                Add Medication
              </Text>

              <View
                style={{
                  backgroundColor: themeColors.primary,
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <FontistoIcon
                  name="pills"
                  size={20}
                  color={themeColors.white}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 20,
              }}
              onPress={() => {
                setPickerVisible(false);
                setIsModalVisible(false);
                setIsNoteModalVisible(true);
              }}>
              <Text
                style={{
                  fontSize: size.md,
                  color: themeColors.white,
                  fontFamily: fonts.OpenSansBold,
                  marginRight: 10,
                }}>
                Add Note
              </Text>
              <View
                style={{
                  backgroundColor: themeColors.primary,
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Icon name="note-plus" size={20} color={themeColors.white} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
              onPress={() => {
                setPickerVisible(false);
                setIsModalVisible(false);
              }}>
              <Text
                style={{
                  fontSize: size.md,
                  color: themeColors.white,
                  fontFamily: fonts.OpenSansBold,
                  marginRight: 10,
                }}>
                Close
              </Text>
              <View
                style={{
                  backgroundColor: themeColors.primary,
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Icon name="close" size={20} color={themeColors.white} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
    // </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.lightGray,
  },
  headerMain: {
    backgroundColor: themeColors.primary,
    padding: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateText: {
    fontSize: size.lg,
    color: themeColors.white,
    fontFamily: fonts.OpenSansBold,
  },
  dateScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateItem: {
    padding: 5,
    borderRadius: 10,
    alignItems: 'center',
    width: '12%',
  },
  selectedDateItem: {
    backgroundColor: themeColors.white,
  },
  dayText: {
    fontSize: size.sl,
    color: themeColors.white,
    fontFamily: fonts.OpenSansBold,
  },
  selectedDayText: {
    color: themeColors.darkGray,
  },
  dateTextSmall: {
    fontSize: size.s,
    color: themeColors.white,
    fontFamily: fonts.OpenSansBold,
  },
  selectedDateText: {
    color: themeColors.darkGray,
  },
  calendarButton: {},
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: themeColors.white,
    borderRadius: 10,
    width: '90%',
  },
  calendar: {
    width: '100%',
    borderRadius: 10,
  },
  optionButton: {
    margin: 10,
    padding: 10,
    backgroundColor: themeColors.primary,
    borderRadius: 5,
    alignSelf: 'center',
  },
  optionButtonText: {
    fontSize: size.md,
    color: themeColors.white,
  },
  addIconCondatiner: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: themeColors.primary,
    padding: 10,
    borderRadius: 30,
    width: 100,
    // height: 35,
    // borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  headerText: {
    fontSize: size.md,
    fontFamily: fonts.OpenSansRegular,
  },
  textInput: {
    width: '100%',
    height: 150,
    borderColor: themeColors.darkGray,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    textAlignVertical: 'top',
    color: themeColors.black,
  },
  characterCount: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  characterCountText: {
    color: themeColors.darkGray,
    fontSize: size.sl,
    fontFamily: fonts.OpenSansRegular,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  timeLabel: {
    fontSize: size.md,
    fontFamily: fonts.OpenSansRegular,
    marginRight: 10,
    color: themeColors.darkGray,
  },
  dateTimePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: themeColors.darkGray,
    padding: 5,
    flex: 1,
    justifyContent: 'center',
    borderRadius: 5,
  },
  dateTimePickerText: {
    fontSize: size.md,
    fontFamily: fonts.OpenSansRegular,
    marginRight: 10,
    color: themeColors.darkGray,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  button: {
    backgroundColor: themeColors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  buttonText: {
    color: themeColors.white,
    fontSize: size.md,
    fontFamily: fonts.OpenSansRegular,
  },
  noReminderText: {
    marginBottom: 100,
    padding: 15,
    textAlign: 'center',
    fontSize: size.md,
    fontFamily: fonts.OpenSansRegular,
    color: themeColors.darkGray,
  },

  dropdown: {
    bottom: verticalScale(160),
    right: 15,
    position: 'absolute',
    alignItems: 'flex-end',
    // backgroundColor:'red',
    // width: 200,
    // backgroundColor: '#fff',
    // borderColor: '#ccc',
    // borderWidth: 1,
    // borderRadius: 5,
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: 2},
    // shadowOpacity: 0.2,
    // shadowRadius: 4,
    // elevation: 2,
  },
  dropdownItem: {
    // padding: 10,
    // borderBottomWidth: 1,
    // borderBottomColor: '#ccc',
  },
  dropdownText: {
    // fontSize: 16,
    // color: '#333',
  },
});

export default PillsReminderScreen;
