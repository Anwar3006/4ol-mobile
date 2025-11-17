import React, {useEffect, useState, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  ScrollView,
  Alert,
  RefreshControl,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {themeColors} from '../../theme/colors';
import {
  createNotes,
  deleteMedicationReminder,
  fetchMedicationDetails,
} from '../../services/medication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee from '@notifee/react-native';
import moment from 'moment';
import {refreshAllNotifications} from '../../services/scheduleNotifications';
import {useFocusEffect} from '@react-navigation/native';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import {Toast} from 'react-native-toast-notifications';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import Modals from 'react-native-modal';
import {horizontalScale} from '../../utils/metrics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PillReminderDetails = ({navigation, route}) => {
  const {notificationData} = route.params || {};
  console.log('Notification Data:', notificationData);
  const flatlistRef = useRef<FlatList>(null);
  const [highlightedId, setHighlightedId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const rotation = useSharedValue(0);
  const firstItemOffset = useSharedValue(0);
  const secondItemOffset = useSharedValue(0);
  const opacity = useSharedValue(0);
  const [reminderData, setReminderData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isListEmpty, setIsListEmpty] = useState(false);
  const [notificationsRefreshed, setNotificationsRefreshed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isSelected, setIsSelected] = useState('');
  const [notes, setNotes] = useState('');
  const [showOptionsModal, setShowOptionsModal] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  // Add state for note modal visibility
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // const handleAddNote = () => {
  //   setIsMenuOpen(false);
  //   console.log('Add note pressed');
  // };

  useEffect(() => {
    if (notificationData?.medicationId) {
      const targetId = notificationData.medicationId;
      const index = reminderData.findIndex((r: any) => r.id === targetId);
      console.log('FROM USEEFFECT==>', index, targetId);
      if (index >= 0) {
        // 2. Scroll to the item
        flatlistRef.current?.scrollToIndex({index, animated: true});
        setHighlightedId(targetId);

        const timer = setTimeout(() => {
          setHighlightedId(null);
        }, 3000);

        return () => clearTimeout(timer);
      }
    }
  }, [notificationData]);

  // Add handlers for date and time pickers
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(false);
    setSelectedDate(currentDate);
  };

  const onTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || new Date();
    setShowTimePicker(false);
    setSelectedTime(currentTime);
  };

  // New state for timestamps modal
  const [timestampsModal, setTimestampsModal] = useState({
    visible: false,
    title: '',
    timestamps: [],
  });

  const addNotes = async () => {
    const user_id = await AsyncStorage.getItem('user_id');

    // Combine selected date and time
    const combinedDateTime = moment(selectedDate)
      .hour(moment(selectedTime).hour())
      .minute(moment(selectedTime).minute())
      .second(moment(selectedTime).second());

    // Format as ISO string for Supabase timestamptz
    const formattedTimestamp = combinedDateTime.toISOString();

    const notesData = {
      user_id,
      emotion: isSelected,
      note: notes,
      timestamp: formattedTimestamp,
    };

    console.log('TSTAMP: ', formattedTimestamp);

    try {
      await createNotes(user_id, notesData);
      Toast.show('Notes added successfully!', {
        type: 'success',
        placement: 'top',
        duration: 4000,
        animationType: 'slide-in',
      });
    } catch (error) {
      console.log('error adding notes', error);
    }
  };

  // Load medication data
  const loadMedicationData = useCallback(async () => {
    try {
      setIsLoading(true);
      const userId = await AsyncStorage.getItem('user_id');

      if (!userId) {
        console.warn('User ID not found in AsyncStorage');
        setReminderData([]);
        setIsListEmpty(true);
        setIsLoading(false);
        return;
      }

      const fetchedData = await fetchMedicationDetails(userId);
      console.log('FETCHED DATA==>', fetchedData);
      // console.log(
      //   'Fetched MEDICATION REMINDER data:',
      //   JSON.stringify(fetchedData, null, 2),
      // );

      if (Array.isArray(fetchedData) && fetchedData.length > 0) {
        setReminderData(fetchedData);
        setIsListEmpty(false);

        const success = await refreshAllNotifications(fetchedData);
        setNotificationsRefreshed(success);

        if (success) {
          console.log('Notifications refreshed successfully');
        } else {
          console.warn('Failed to refresh notifications');
        }
      } else {
        setReminderData([]);
        setIsListEmpty(true);
      }
    } catch (error) {
      console.error('Error fetching medication details:', error);
      setReminderData([]);
      setIsListEmpty(true);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadMedicationData();
    return () => {};
  }, [loadMedicationData]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMedicationData();
  }, [loadMedicationData]);

  // Manual refresh handler with success/error messages
  const handleManualRefresh = async () => {
    try {
      setIsLoading(true);
      await loadMedicationData();
      Alert.alert(
        'Reminders Refreshed',
        'Your medication reminders have been refreshed and notifications have been rescheduled.',
        [{text: 'OK'}],
      );
    } catch (error) {
      console.error('Error refreshing reminders:', error);
      Alert.alert(
        'Refresh Failed',
        'There was a problem refreshing your medication reminders. Please try again later.',
        [{text: 'OK'}],
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkNotificationPermission = async () => {
      const settings = await notifee.requestPermission();

      if (settings.authorizationStatus < 1) {
        Alert.alert(
          'Notification Permission Required',
          'This app needs notification permission to remind you about your medications.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Open Settings',
              onPress: () => {
                // Open app settings
                notifee.openNotificationSettings();
              },
            },
          ],
        );
      }
    };

    checkNotificationPermission();
  }, []);

  const handleAddMedication = () => {
    console.log('Add Medication pressed');
    navigation.navigate('AddMedication', {title: 'Create Medication Reminder'});
    setIsMenuOpen(false);
  };

  const handleAddNote = () => {
    console.log('Add Note pressed');
    setNoteModalVisible(true);
    setIsMenuOpen(false);
  };

  // Add a function to close the modal and reset input fields
  const closeNoteModal = () => {
    setNoteModalVisible(false);
    setIsSelected('');
    setNotes('');
    setSelectedDate(new Date());
    setSelectedTime(new Date());
  };

  const showTimestamps = (medicationName, timestamps) => {
    if (!timestamps || !Array.isArray(timestamps) || timestamps.length === 0) {
      setTimestampsModal({
        visible: true,
        title: `${medicationName} Schedule`,
        timestamps: ['No scheduled timestamps available'],
      });
      return;
    }

    setTimestampsModal({
      visible: true,
      title: `${medicationName} Schedule`,
      timestamps,
    });
  };

  const toggleMenu = () => {
    const newValue = !isOpen;
    setIsOpen(newValue);

    rotation.value = withSpring(newValue ? 45 : 0, {
      damping: 12,
      stiffness: 120,
    });

    opacity.value = withTiming(newValue ? 1 : 0, {
      duration: 300,
    });

    firstItemOffset.value = withSpring(newValue ? -70 : 0, {
      damping: 12,
      stiffness: 120,
    });

    secondItemOffset.value = withSpring(newValue ? -140 : 0, {
      damping: 12,
      stiffness: 120,
    });
  };

  const fabStyle = useAnimatedStyle(() => {
    return {
      transform: [{rotate: `${rotation.value}deg`}],
    };
  });

  const firstItemStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{translateY: firstItemOffset.value}],
    };
  });

  const secondItemStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{translateY: secondItemOffset.value}],
    };
  });

  // Format timestamp for user-friendly display
  const formatTimestamp = timestamp => {
    return moment(timestamp).format('ddd, MMM D, YYYY [at] h:mm A');
  };

  const groupTimestampsByDate = timestamps => {
    if (!timestamps || !Array.isArray(timestamps)) return {};

    const grouped = {};
    timestamps.forEach(timestamp => {
      const date = moment(timestamp).format('ddd, MMM D, YYYY');
      const time = moment(timestamp).format('h:mm A');

      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(time);
    });

    return grouped;
  };

  const getMedicationIcon = type => {
    const iconSize = 22;
    const iconColor = '#fff';

    switch (type?.toUpperCase()) {
      case 'TABLET':
        return (
          <FontAwesome5 name="tablets" size={iconSize} color={iconColor} />
        );
      case 'CAPSULE':
        return (
          <FontAwesome5 name="capsules" size={iconSize} color={iconColor} />
        );
      case 'INJECTION':
        return (
          <MaterialCommunityIcons
            name="needle"
            size={iconSize}
            color={iconColor}
          />
        );
      case 'SPRAY':
        return (
          <MaterialCommunityIcons
            name="spray"
            size={iconSize}
            color={iconColor}
          />
        );
      case 'DROPS':
        return (
          <MaterialCommunityIcons
            name="water-plus"
            size={iconSize}
            color={iconColor}
          />
        );
      case 'SOLUTION':
        return (
          <MaterialCommunityIcons
            name="bottle-tonic"
            size={iconSize}
            color={iconColor}
          />
        );
      case 'HERBS':
        return (
          <MaterialCommunityIcons
            name="leaf"
            size={iconSize}
            color={iconColor}
          />
        );
      default:
        return (
          <Icon name="medical-services" size={iconSize} color={iconColor} />
        );
    }
  };

  const formatReminderType = (type, gap_days = null) => {
    if (!type) return 'Not specified';

    switch (type.toUpperCase()) {
      case 'ONCE':
        return 'One time only';
      case 'DAILY':
        return 'Daily';
      case 'WITH_DAYS_GAP':
        return `Every ${gap_days || 1} days`;
      case 'WEEKLY':
        return 'Weekly';
      case 'SPECIFIC_DAYS':
        return 'Specific days';
      default:
        return type;
    }
  };

  const formatDateRange = (start, end) => {
    if (!start || !end) return 'No date range specified';

    const startDate = moment(start).format('MMM D, YYYY');
    const endDate = moment(end).format('MMM D, YYYY');

    return `${startDate} - ${endDate}`;
  };

  const getMedicationTypeLabel = (type, count) => {
    if (!type) return 'unit(s)';

    const isSingular = count === 1;

    switch (type.toUpperCase()) {
      case 'TABLET':
        return isSingular ? 'tablet' : 'tablets';
      case 'CAPSULE':
        return isSingular ? 'capsule' : 'capsules';
      case 'INJECTION':
        return isSingular ? 'injection' : 'injections';
      case 'SPRAY':
        return isSingular ? 'spray' : 'sprays';
      case 'DROPS':
        return 'drops';
      case 'SOLUTION':
        return 'ml';
      case 'HERBS':
        return isSingular ? 'sachet' : 'sachets';
      default:
        return 'unit(s)';
    }
  };

  const renderMedicationItem = ({item}) => {
    const medicationAmount = item.medication_amount || 0;
    const medicationDose = item.medication_dose || 0;
    const intakeAmount = item.intake_amount || 1;
    const hasTimestamps =
      item.reminder_timestamps &&
      Array.isArray(item.reminder_timestamps) &&
      item.reminder_timestamps.length > 0;

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('MedicationDetailsView', {medication: item})
        }>
        <View
          style={[
            styles.medicationCard,
            {borderLeftColor: item.color || themeColors.primary},
            highlightedId === item.id && styles.highlightedCard,
          ]}>
          <View
            style={[
              styles.iconContainer,
              {backgroundColor: item.color || themeColors.primary},
            ]}>
            {getMedicationIcon(item.medication_type)}
          </View>
          <View style={styles.medicationInfo}>
            <Text style={styles.medicationName}>
              {item.medication_name || 'Unnamed Medication'}
            </Text>
            <Text style={styles.medicationDosage}>
              {medicationDose > 0 ? `${medicationDose}mg • ` : ''}
              {medicationAmount > 0
                ? `${medicationAmount} ${getMedicationTypeLabel(
                    item.medication_type,
                    medicationAmount,
                  )}`
                : ''}
              {intakeAmount > 0 ? ` • ${intakeAmount}x daily` : ''}
            </Text>
            <View style={styles.reminderInfoContainer}>
              <View style={styles.reminderInfoItem}>
                <Icon
                  name="event"
                  size={14}
                  color="#666"
                  style={styles.infoIcon}
                />
                <Text style={styles.reminderInfoText}>
                  {formatReminderType(item.reminder_type, item.gap_days)}
                </Text>
              </View>

              <View style={[styles.reminderInfoItem]}>
                <Icon
                  name="date-range"
                  size={14}
                  color="#666"
                  style={styles.infoIcon}
                />
                <Text style={styles.reminderInfoText}>
                  {formatDateRange(item.start_date, item.end_date)}
                </Text>
              </View>
            </View>
          </View>
          {/*<View style={styles.chevronContainer}>
          <Icon name="chevron-right" size={24} color="#AAA" />
          </View>*/}
          {hasTimestamps && (
            <View style={styles.menuTopRight}>
              <Menu>
                <MenuTrigger>
                  <View style={styles.infoButtonPopup}>
                    <Icon name="more-vert" size={20} color="#000" />
                  </View>
                </MenuTrigger>

                <MenuOptions
                  customStyles={{optionsContainer: styles.menuOptions}}>
                  <MenuOption
                    onSelect={() =>
                      navigation.navigate('MedicationDetailsView', {
                        medication: item,
                      })
                    }>
                    <View style={styles.menuOptionRow}>
                      <Icon
                        name="visibility"
                        size={18}
                        color="#333"
                        style={styles.menuOptionIcon}
                      />
                      <Text style={styles.menuOptionText}>View</Text>
                    </View>
                  </MenuOption>

                  <MenuOption
                    onSelect={() => {
                      navigation.navigate('AddMedication', {
                        title: 'Edit Medication Reminder',
                        medication: item,
                      });
                    }}>
                    <View style={styles.menuOptionRow}>
                      <Icon
                        name="edit"
                        size={18}
                        color="#333"
                        style={styles.menuOptionIcon}
                      />
                      <Text style={styles.menuOptionText}>Edit</Text>
                    </View>
                  </MenuOption>

                  <MenuOption
                    onSelect={() => {
                      setSelectedReminder(item); // store selected medication/reminder
                      setDeleteModalVisible(true); // open modal
                    }}>
                    <View style={styles.menuOptionRow}>
                      <Icon
                        name="delete"
                        size={18}
                        color="red"
                        style={styles.menuOptionIcon}
                      />
                      <Text style={[styles.menuOptionText, {color: 'red'}]}>
                        Delete
                      </Text>
                    </View>
                  </MenuOption>
                </MenuOptions>
              </Menu>
            </View>
          )}
          {/* <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setShowOptionsModal(true)}>
          <Icon name="more-vert" size={20} color="#666" />
          </TouchableOpacity> */}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={styles.emptyText}>Loading your medications...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Icon name="medication" size={64} color="#DDD" />
        <Text style={styles.emptyTitle}>No Medications</Text>
        <Text style={styles.emptyText}>
          You haven't added any medication reminders yet.
        </Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={handleAddMedication}>
          <Icon name="add" size={18} color="#FFF" />
          <Text style={styles.emptyButtonText}>Add Medication</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderListHeader = () => {
    if (isListEmpty) return null;

    return (
      <View style={styles.listHeader}>
        <View style={styles.headerRow}>
          <Text style={styles.headerSubtitle}>
            {reminderData.length}{' '}
            {reminderData.length === 1 ? 'reminder' : 'reminders'}
          </Text>
          <View style={styles.headerRightContainer}>
            {renderNotificationStatus()}
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleManualRefresh}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator size="small" color={themeColors.primary} />
              ) : (
                <Icon name="refresh" size={20} color={themeColors.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  useFocusEffect(
    React.useCallback(() => {
      loadMedicationData();
      return () => {
        // Cleanup if needed
      };
    }, []), // Remove loadMedicationData from dependencies
  );

  const renderNotificationStatus = () => {
    if (isLoading) return null;

    return (
      <View style={styles.notificationStatus}>
        <Icon
          name={
            notificationsRefreshed
              ? 'notifications-active'
              : 'notifications-off'
          }
          size={16}
          color={notificationsRefreshed ? themeColors.primary : '#888'}
        />
        <Text
          style={{
            fontSize: 12,
            color: notificationsRefreshed ? themeColors.primary : '#888',
            marginLeft: 4,
          }}>
          {notificationsRefreshed ? 'Reminders active' : 'Reminders not set'}
        </Text>
      </View>
    );
  };

  const handleDeleteReminder = async () => {
    deleteMedicationReminder(
      selectedReminder?.id,
      () => setDeleteLoading(true),
      () => {
        setDeleteLoading(false);
        Toast.show('Medication reminder deleted successfully!', {
          type: 'success',
          placement: 'top',
          duration: 4000,
          animationType: 'slide-in',
        });
        setTimeout(() => {
          setDeleteModalVisible(false);
          setSelectedReminder(null);
          loadMedicationData();
        }, 0);
      },
      (error: any) => {
        setDeleteLoading(false);
        Toast.show(`Failed to delete reminder: ${error.message}`, {
          type: 'danger',
          placement: 'top',
          duration: 4000,
          animationType: 'slide-in',
        });
        setTimeout(() => {
          setDeleteModalVisible(false);
          setSelectedReminder(null);
        }, 0);
      },
    );
  };

  console.log('Reminder Data:', reminderData);

  return (
    <View style={styles.container}>
      <FlatList
        data={reminderData}
        keyExtractor={item => item.id}
        renderItem={renderMedicationItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyComponent}
        ListHeaderComponent={<>{renderListHeader()}</>}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        onScrollToIndexFailed={({index}) => {
          setTimeout(() => {
            flatlistRef.current?.scrollToIndex({index, animated: true});
          }, 500);
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[themeColors.primary]}
            tintColor={themeColors.primary}
          />
        }
      />

      <View style={styles.fabContainer}>
        {isMenuOpen && (
          <>
            <TouchableOpacity
              style={styles.fabItem}
              onPress={handleAddMedication}>
              <View style={[styles.fabItemInner, {backgroundColor: '#2196F3'}]}>
                <Icon name="medical-services" size={20} color="white" />
              </View>
              <View style={styles.fabLabel}>
                <Text style={styles.fabLabelText}>Add Medication</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.fabItem} onPress={handleAddNote}>
              <View style={[styles.fabItemInner, {backgroundColor: '#4CAF50'}]}>
                <Icon name="note-add" size={20} color="white" />
              </View>
              <View style={styles.fabLabel}>
                <Text style={styles.fabLabelText}>Add Note</Text>
              </View>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={styles.fab}
          onPress={() => setIsMenuOpen(!isMenuOpen)}
          activeOpacity={0.8}>
          <Icon name={isMenuOpen ? 'close' : 'add'} size={24} color="white" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={timestampsModal.visible}
        transparent={true}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() =>
          setTimestampsModal({...timestampsModal, visible: false})
        }>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() =>
            setTimestampsModal({...timestampsModal, visible: false})
          }>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{timestampsModal.title}</Text>
              <TouchableOpacity
                onPress={() =>
                  setTimestampsModal({...timestampsModal, visible: false})
                }>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.timestampsList}>
              {timestampsModal.timestamps.length === 0 ? (
                <Text style={styles.noTimestampsText}>
                  No scheduled times available
                </Text>
              ) : (
                Object.entries(
                  groupTimestampsByDate(timestampsModal.timestamps),
                ).map(([date, times]) => (
                  <View key={date} style={styles.timestampDateGroup}>
                    <Text style={styles.timestampDate}>{date}</Text>
                    {times.map((time, index) => (
                      <View key={index} style={styles.timestampItem}>
                        <Icon
                          name="access-time"
                          size={16}
                          color={themeColors.primary}
                          style={styles.timestampIcon}
                        />
                        <Text style={styles.timestampTime}>{time}</Text>
                      </View>
                    ))}
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* <Modal
        visible={showOptionsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowOptionsModal(false)}>
        <TouchableWithoutFeedback onPress={() => setShowOptionsModal(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <View style={[styles.optionsModal, {}]}>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => {
              setShowOptionsModal(false);
              // Handle view action
              // navigation.navigate('ViewReminder', { id: item.id });
            }}>
            <Text style={styles.optionText}>View Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => {
              setShowOptionsModal(false);
              // Handle edit action
              // navigation.navigate('EditReminder', { id: item.id });
            }}>
            <Text style={styles.optionText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionButton, styles.deleteOption]}
            onPress={() => {
              setShowOptionsModal(false);
              // Handle delete action
              Alert.alert(
                'Delete Reminder',
                'Are you sure you want to delete this reminder?',
                [
                  {text: 'Cancel', style: 'cancel'},
                  // { text: 'Delete', onPress: () => deleteReminder(item.id) }
                ],
              );
            }}>
            <Text style={[styles.optionText, styles.deleteText]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </Modal> */}

      {/* <Modal
        visible={showOptionsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowOptionsModal(false)}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View
            style={{
              height: 300,
              width: 400,
              backgroundColor: '#fff',
            }}>
            <Text>MODAL OPENS</Text>
          </View>
        </View>
      </Modal> */}

      {/* Note Entry Modal - Update to use noteModalVisible state */}
      <Modal
        visible={noteModalVisible}
        transparent={true}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeNoteModal}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{flex: 1}}>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            activeOpacity={1}
            onPress={closeNoteModal}>
            <View
              style={{
                padding: 20,
                borderRadius: 10,
                width: '85%',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'white',
              }}
              // Prevent closing when tapping on the modal content
              onStartShouldSetResponder={() => true}
              onTouchEnd={e => e.stopPropagation()}>
              {/* Close button at top right */}
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  zIndex: 1,
                }}
                onPress={closeNoteModal}>
                <Icon name="close" size={24} color="#888" />
              </TouchableOpacity>

              <Text
                style={{
                  fontSize: 20,
                  color: 'black',
                  fontWeight: 'bold',
                  marginTop: 10,
                }}>
                I am feeling
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  width: '100%',
                  paddingVertical: 20,
                }}>
                {['terrible', 'bad', 'okay', 'good', 'great'].map(
                  (emotion, index) => {
                    return (
                      <TouchableOpacity
                        key={emotion}
                        style={{alignItems: 'center'}}
                        onPress={() => setIsSelected(emotion)}>
                        <MaterialCommunityIcons
                          name={
                            index === 0
                              ? 'emoticon-dead-outline'
                              : index === 1
                              ? 'emoticon-sad-outline'
                              : index === 2
                              ? 'emoticon-neutral-outline'
                              : index === 3
                              ? 'emoticon-happy-outline'
                              : 'emoticon-excited-outline'
                          }
                          size={24}
                          color={
                            isSelected === emotion
                              ? themeColors.primary
                              : '#888'
                          }
                        />
                        <Text
                          style={{
                            marginTop: 5,
                            color:
                              isSelected === emotion
                                ? themeColors.primary
                                : '#666',
                            fontSize: 12,
                            textTransform: 'capitalize',
                          }}>
                          {emotion}
                        </Text>
                      </TouchableOpacity>
                    );
                  },
                )}
              </View>
              <View style={{width: '100%'}}>
                <Text
                  style={{
                    color: '#666',
                    fontSize: 12,
                    marginBottom: 5,
                    alignSelf: 'flex-start',
                  }}>
                  Notes
                </Text>
                <TextInput
                  multiline={true}
                  numberOfLines={4}
                  maxLength={500}
                  placeholder="Enter your notes here..."
                  style={{
                    width: '100%',
                    borderWidth: 1,
                    borderColor: notes.length > 500 ? 'red' : '#ccc',
                    borderRadius: 8,
                    padding: 10,
                    textAlignVertical: 'top',
                    minHeight: 100,
                  }}
                  value={notes}
                  onChangeText={text => setNotes(text)}
                />
                <Text
                  style={{
                    color: notes.length > 500 ? 'red' : '#666',
                    fontSize: 12,
                    alignSelf: 'flex-end',
                    marginTop: 5,
                  }}>
                  {notes.length}/500
                </Text>
              </View>

              {/* Date and Time Picker Buttons */}
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 15,
                  gap: 10,
                }}>
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f0f0f0',
                    padding: 12,
                    borderRadius: 8,
                    flex: 1,
                    gap: 5,
                  }}
                  onPress={() => setShowDatePicker(true)}>
                  <Icon
                    name="calendar-today"
                    size={18}
                    color={themeColors.primary}
                  />
                  <Text style={{color: '#444', fontWeight: '500'}}>
                    {moment(selectedDate).format('MMM D, YYYY')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f0f0f0',
                    padding: 12,
                    borderRadius: 8,
                    flex: 1,
                  }}
                  onPress={() => setShowTimePicker(true)}>
                  <Icon
                    name="access-time"
                    size={18}
                    color={themeColors.primary}
                  />
                  <Text
                    style={{marginLeft: 8, color: '#444', fontWeight: '500'}}>
                    {selectedTime.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Date Picker */}
              {showDatePicker && (
                <RNDateTimePicker
                  maximumDate={new Date()}
                  value={selectedDate}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                />
              )}

              {/* Time Picker */}
              {showTimePicker && (
                <RNDateTimePicker
                  value={selectedTime}
                  mode="time"
                  display="default"
                  onChange={onTimeChange}
                />
              )}
              <View
                style={{
                  width: '100%',
                  marginTop: 20,
                }}>
                <TouchableOpacity
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: themeColors.primary,
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    addNotes();
                    closeNoteModal(); // Close modal after adding
                  }}>
                  <Text style={{color: 'white', fontWeight: '600'}}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}>
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContainer}>
            <Text style={styles.deleteModalTitle}>Delete Reminder?</Text>
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to delete this reminder?
            </Text>

            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                disabled={deleteLoading}
                style={[styles.deleteButton, {backgroundColor: '#f0f0f0'}]}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setSelectedReminder(null);
                }}>
                <Text style={[styles.deleteButtonText, {color: '#333'}]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={deleteLoading}
                style={[styles.deleteButton, {backgroundColor: 'red'}]}
                onPress={() => {
                  handleDeleteReminder();
                }}>
                {deleteLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.deleteButtonText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listHeader: {
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  listContainer: {
    padding: 20,
    flexGrow: 1,
    paddingBottom: 100, // Space for FAB
  },
  medicationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    borderLeftWidth: 6,
    alignItems: 'center',
  },
  highlightedCard: {
    backgroundColor: '#FFF9C4',
    borderLeftWidth: 4,
    borderLeftColor: '#FFA000',
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    padding: 5,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  medicationDosage: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  reminderInfoContainer: {
    marginTop: 2,
  },
  reminderInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 4,
  },
  reminderInfoText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  infoButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: themeColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    height: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#444',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginHorizontal: 30,
    marginBottom: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    backgroundColor: themeColors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  emptyButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'center',
  },
  fab: {
    backgroundColor: themeColors.primary, // or your themeColors.primary
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabItem: {
    // position: 'absolute',
    width: 38,
    height: 68,
    right: 6,
    bottom: 30, // Position above the main FAB
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  fabItemInner: {
    width: 52,
    height: 52,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white', // Default color, overridden inline
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    marginLeft: 10,
  },
  fabLabel: {
    position: 'absolute',
    right: 50,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  fabLabelText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  optionsModal: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 5,
    width: horizontalScale(170),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  optionText: {
    fontSize: 16,
    color: '#333',
  },

  deleteOption: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },

  deleteText: {
    color: 'red',
  },
  modalContent: {
    width: 400,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    height: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  timestampsList: {
    padding: 16,
    maxHeight: 300,
  },
  timestampDateGroup: {
    marginBottom: 16,
  },
  timestampDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  timestampItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    marginBottom: 4,
  },
  timestampIcon: {
    marginRight: 8,
  },
  timestampTime: {
    fontSize: 14,
    color: '#444',
  },
  noTimestampsText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
  notificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    marginLeft: 15,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  menuTopRight: {
    position: 'absolute',
    top: 10, // distance from the top edge of the card
    right: 10, // distance from the right edge of the card
    zIndex: 10, // ensure it's above other content
  },
  infoButtonPopup: {
    // backgroundColor: '#4CAF50',
    // borderRadius: 20,
    // padding: 6,
  },
  menuOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  menuOptionIcon: {
    marginRight: 10,
  },
  menuOptionText: {
    fontSize: 16,
    color: '#333',
  },
  menuOptions: {
    borderRadius: 6,
    padding: 5,
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModalContainer: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  deleteModalMessage: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  deleteModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PillReminderDetails;
