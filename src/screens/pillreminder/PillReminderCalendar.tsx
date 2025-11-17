import React, {useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  CalendarProvider,
  ExpandableCalendar,
  AgendaList,
} from 'react-native-calendars';
import moment from 'moment';
import {themeColors} from '../../theme/colors';
import {fetchMedicationDetails, fetchNotes} from '../../services/medication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Positions} from 'react-native-calendars/src/expandableCalendar';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const PillsReminderCalendarScreen = () => {
  const [markedDates, setMarkedDates] = React.useState({});
  const [agendaSections, setAgendaSections] = React.useState<any[]>([]);
  const [selectedDate, setSelectedDate] = React.useState(
    moment().format('YYYY-MM-DD'),
  );
  const [refreshing, setRefreshing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    console.log('DATE TIMESTAMP: ', Date.now());
  }, []);

  const getMedicationIcon = type => {
    switch (type?.toUpperCase()) {
      case 'TABLET':
        return <FontAwesome5 name="tablets" size={16} color="#fff" />;
      case 'CAPSULE':
        return <FontAwesome5 name="capsules" size={16} color="#fff" />;
      case 'INJECTION':
        return <MaterialCommunityIcons name="needle" size={16} color="#fff" />;
      case 'SPRAY':
        return <MaterialCommunityIcons name="spray" size={16} color="#fff" />;
      case 'DROPS':
        return (
          <MaterialCommunityIcons name="water-plus" size={16} color="#fff" />
        );
      case 'SOLUTION':
        return (
          <MaterialCommunityIcons name="bottle-tonic" size={16} color="#fff" />
        );
      case 'HERBS':
        return <MaterialCommunityIcons name="leaf" size={16} color="#fff" />;
      default:
        return <Icon name="medication" size={16} color="#fff" />;
    }
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

  // Function to get emotion icon based on the emotion string
  const getEmotionIcon = emotion => {
    switch (emotion?.toLowerCase()) {
      case 'terrible':
        return (
          <MaterialCommunityIcons
            name="emoticon-dead-outline"
            size={16}
            color="#fff"
          />
        );
      case 'bad':
        return (
          <MaterialCommunityIcons
            name="emoticon-sad-outline"
            size={16}
            color="#fff"
          />
        );
      case 'okay':
        return (
          <MaterialCommunityIcons
            name="emoticon-neutral-outline"
            size={16}
            color="#fff"
          />
        );
      case 'good':
        return (
          <MaterialCommunityIcons
            name="emoticon-happy-outline"
            size={16}
            color="#fff"
          />
        );
      case 'great':
        return (
          <MaterialCommunityIcons
            name="emoticon-excited-outline"
            size={16}
            color="#fff"
          />
        );
      default:
        return (
          <MaterialCommunityIcons
            name="note-text-outline"
            size={16}
            color="#fff"
          />
        );
    }
  };

  // Modified function to load both medication reminders and notes
  const loadMedicationReminders = async () => {
    try {
      setIsLoading(true);
      const userId = await AsyncStorage.getItem('user_id');

      // Fetch both medications and notes in parallel
      const [fetchedMedicationSchedule, fetchedNotes] = await Promise.all([
        fetchMedicationDetails(userId),
        fetchNotes(userId),
      ]);

      //console.log('fetchedMedicationSchedule', fetchedMedicationSchedule);
      //console.log('fetchedNotes', fetchedNotes);

      // Prepare marked dates and agenda items
      const marks: {[date: string]: any} = {};
      const agendaMap: {[date: string]: any[]} = {};

      // Process each medication record
      fetchedMedicationSchedule.forEach(medication => {
        // Skip if no timestamps
        if (
          !medication.reminder_timestamps ||
          !Array.isArray(medication.reminder_timestamps) ||
          medication.reminder_timestamps.length === 0
        ) {
          return;
        }

        // Process each timestamp
        medication.reminder_timestamps.forEach((timestamp: string) => {
          // Format the date key (YYYY-MM-DD)
          const dateKey = moment(timestamp).format('YYYY-MM-DD');

          // Mark this date on the calendar - always use themeColors.primary for dots
          marks[dateKey] = {
            marked: true,
            dotColor: themeColors.primary,
          };

          // Format time to display (e.g., 9:00 AM)
          const timeFormatted = moment(timestamp).format('h:mm A');

          // Create medication dosage text
          let dosageText = '';
          if (medication.medication_amount) {
            dosageText += `${
              medication.medication_amount
            } ${getMedicationTypeLabel(
              medication.medication_type,
              medication.medication_amount,
            )}`;
          }
          if (medication.medication_dose) {
            dosageText += dosageText
              ? `, ${medication.medication_dose}mg`
              : `${medication.medication_dose}mg`;
          }

          // Create agenda item for this medication
          const agendaItem = {
            time: timeFormatted,
            medication: medication.medication_name,
            dosage: dosageText,
            medicationType: medication.medication_type,
            color: medication.color || themeColors.primary,
            id: medication.id,
            type: 'medication', // Add a type to distinguish between medications and notes
          };

          // Add to agenda map
          if (!agendaMap[dateKey]) {
            agendaMap[dateKey] = [agendaItem];
          } else {
            agendaMap[dateKey].push(agendaItem);
          }
        });
      });

      // Process each note record
      if (Array.isArray(fetchedNotes)) {
        fetchedNotes.forEach(note => {
          if (!note.timestamp) return;

          // Format the date key (YYYY-MM-DD)
          const dateKey = moment(note.timestamp).format('YYYY-MM-DD');

          // Mark this date on the calendar - always use themeColors.primary for dots
          marks[dateKey] = {
            ...marks[dateKey],
            marked: true,
            dotColor: themeColors.primary,
          };

          // Format time to display (e.g., 9:00 AM)
          const timeFormatted = moment(note.timestamp).format('h:mm A');

          // Create agenda item for this note
          const agendaItem = {
            time: timeFormatted,
            emotion: note.emotion || 'Note',
            note: note.note || '',
            color: getEmotionColor(note.emotion),
            id: note.id,
            type: 'note', // Add a type to distinguish between medications and notes
          };

          // Add to agenda map
          if (!agendaMap[dateKey]) {
            agendaMap[dateKey] = [agendaItem];
          } else {
            agendaMap[dateKey].push(agendaItem);
          }
        });
      }

      // Sort agenda items by time within each day
      Object.keys(agendaMap).forEach(date => {
        agendaMap[date].sort((a, b) => {
          return moment(a.time, 'h:mm A').diff(moment(b.time, 'h:mm A'));
        });
      });

      setMarkedDates(marks);

      // Create sections for AgendaList
      const sections = Object.keys(agendaMap)
        .sort((a, b) => moment(a).diff(moment(b))) // Sort dates chronologically
        .map(dateKey => ({
          title: dateKey,
          data: agendaMap[dateKey],
        }));

      setAgendaSections(sections);
    } catch (e) {
      console.error('Error loading medication reminders and notes:', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Add a helper function to get color based on emotion
  const getEmotionColor = emotion => {
    switch (emotion?.toLowerCase()) {
      case 'terrible':
        return '#8B0000'; // Dark red
      case 'bad':
        return '#DC143C'; // Crimson red
      case 'okay':
        return '#A9A9B0'; // Grey
      case 'good':
        return '#6FCF97'; // Green
      case 'great':
        return '#2F80ED'; // Blue
      default:
        return '#8e44ad'; // Default purple for unspecified emotions
    }
  };

  useEffect(() => {
    loadMedicationReminders();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMedicationReminders();
  };

  // Filter agendaSections for the selected day
  const filteredAgenda = agendaSections.filter(
    section => section.title === selectedDate,
  );

  return (
    <CalendarProvider
      date={selectedDate}
      theme={{
        todayButtonTextColor: themeColors.primary,
      }}>
      <View style={styles.container}>
        <ExpandableCalendar
          onDayPress={day => {
            setSelectedDate(day.dateString);
          }}
          initialPosition={Positions.CLOSED}
          markedDates={markedDates}
          theme={{
            calendarBackground: '#ffffff',
            textSectionTitleColor: 'black',
            selectedDayBackgroundColor: themeColors.primary,
            selectedDayTextColor: '#ffffff',
            todayTextColor: themeColors.primary,
            dayTextColor: '#2d4150',
            textDisabledColor: '#d9e1e8',
            dotColor: themeColors.primary, // Default dot color is primary
            selectedDotColor: '#ffffff', // Selected dot color is white
            arrowColor: themeColors.primary,

            monthTextColor: themeColors.primary,
            textDayFontWeight: 'bold',
          }}
          firstDay={1} // Start week on Monday
        />
        <AgendaList
          sectionStyle={{paddingTop: 10}}
          sections={filteredAgenda}
          renderItem={({item}) => {
            // Render different component based on item type
            if (item.type === 'medication') {
              // Render medication item
              return (
                <View style={styles.itemContainer}>
                  <View
                    style={[
                      styles.iconContainer,
                      {backgroundColor: item.color},
                    ]}>
                    {getMedicationIcon(item.medicationType)}
                  </View>
                  <View style={styles.medicationDetails}>
                    <View style={styles.timeRow}>
                      <Icon name="access-time" size={14} color="#555" />
                      <Text style={styles.timeText}>{item.time}</Text>
                    </View>
                    <Text style={styles.medicationName}>{item.medication}</Text>
                    <Text style={styles.medicationDosage}>{item.dosage}</Text>
                  </View>
                </View>
              );
            } else {
              // Render note item
              return (
                <View style={styles.itemContainer}>
                  <View
                    style={[
                      styles.iconContainer,
                      {backgroundColor: item.color}, // Using the emotion color
                    ]}>
                    {getEmotionIcon(item.emotion)}
                  </View>
                  <View style={styles.medicationDetails}>
                    <View style={styles.timeRow}>
                      <Icon name="access-time" size={14} color="#555" />
                      <Text style={styles.timeText}>{item.time}</Text>
                    </View>
                    <View style={styles.emotionRow}>
                      <Text style={styles.emotionText}>Feeling: </Text>
                      <Text style={[styles.emotionValue, {color: item.color}]}>
                        {item.emotion || 'Note'}
                      </Text>
                    </View>
                    {item.note ? (
                      <Text style={styles.noteText} numberOfLines={2}>
                        {item.note}
                      </Text>
                    ) : null}
                  </View>
                </View>
              );
            }
          }}
          ListEmptyComponent={() => (
            <>
              {!isLoading && filteredAgenda.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Icon name="calendar-today" size={50} color="#DDD" />
                  <Text style={styles.emptyText}>
                    No medication reminders for this day
                  </Text>
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Icon name="calendar-today" size={50} color="#DDD" />
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                    }}>
                    <ActivityIndicator
                      size="large"
                      color={themeColors.primary}
                    />
                    <Text style={styles.emptyText}>
                      Loading medication reminder...
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={themeColors.primary}
              colors={[themeColors.primary]}
            />
          }
          style={styles.agendaList}
        />
      </View>
    </CalendarProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
    flex: 1,
    backgroundColor: '#ffffff',
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  medicationDetails: {
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 13,
    color: '#555',
    marginLeft: 4,
    fontWeight: '500',
  },
  medicationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  medicationDosage: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  agendaList: {
    flex: 1,
  },
  emotionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  emotionText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  emotionValue: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});

export default PillsReminderCalendarScreen;
