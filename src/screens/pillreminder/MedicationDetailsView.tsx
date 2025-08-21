// import React, {useState, useEffect} from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
//   Dimensions,
//   Modal,
// } from 'react-native';
// import moment from 'moment';
// import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import {themeColors} from '../../theme/colors';
// import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import {deleteMedicationReminder} from '../../services/medication';
// import {Toast} from 'react-native-toast-notifications';
// import {ActivityIndicator} from 'react-native-paper';
// import {supabase} from '../../utils/supabaseClient';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// const {width} = Dimensions.get('window');

// const MedicationDetailsView = ({route, navigation}) => {
//   const [deleteModalVisible, setDeleteModalVisible] = useState(false);
//   const [deleteLoading, setDeleteLoading] = useState(false);
//   // const {medication} = route.params;
//   const [medication, setMedication] = useState(null);
//   const medicationId =
//     route.params?.medicationId || route.params?.medication?.id;
//   const [isLoading, setIsLoading] = useState(true);

//   // Fallback to empty object if medication is not provided..
//   // const medication = route.params?.medication || {};
//   // const [medication, setMedication] = useState(route.params?.medication || {});
//   // const [isLoading, setIsLoading] = useState(!route.params?.medication);

//   console.log('Medication details:', medication);

//   useEffect(() => {
//     const fetchMedicationData = async () => {
//       if (!medicationId) {
//         setIsLoading(false);
//         return;
//       }

//       try {
//         setIsLoading(true);

//         // 1. First try to get from cache
//         const cachedData = await AsyncStorage.getItem(
//           `medication_${medicationId}`,
//         );
//         if (cachedData) {
//           setMedication(JSON.parse(cachedData));
//           setIsLoading(false);
//           return;
//         }

//         // 2. Fetch from Supabase
//         const {data, error} = await supabase
//           .from('medication_reminders')
//           .select('*')
//           .eq('id', medicationId)
//           .single();

//         if (error) throw error;

//         // Cache the data
//         await AsyncStorage.setItem(
//           `medication_${medicationId}`,
//           JSON.stringify(data),
//         );

//         setMedication(data);
//       } catch (error) {
//         console.error('Failed to fetch medication:', error);

//         // 3. Fallback to route params if available
//         if (route.params?.medication) {
//           setMedication(route.params.medication);
//         } else {
//           // Minimal fallback data
//           setMedication({
//             id: medicationId,
//             medication_name: 'Medication',
//             medication_type: 'TABLET',
//             // Add other minimal fields
//           });
//         }
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchMedicationData();
//   }, [medicationId]);

//   const getMedicationById = async (medicationId: string) => {
//     try {
//       // Option A: If using Supabase/API
//       const {data, error} = await supabase
//         .from('medication_reminders')
//         .select('*')
//         .eq('id', medicationId)
//         .single();

//       if (error) throw error;
//       return data;
//     } catch (error) {
//       console.error('Failed to get medication:', error);
//       throw error;
//     }
//   };

//   // Helper function to get dose unit label
//   const getDoseLabel = () => {
//     switch (medication.medication_type) {
//       case 'TABLET':
//         return 'mg';
//       case 'CAPSULE':
//         return 'mg';
//       case 'INJECTION':
//         return 'mL or IU';
//       case 'SPRAY':
//         return 'mcg per spray';
//       case 'DROPS':
//         return 'mg/mL or % concentration';
//       case 'SOLUTION':
//         return 'mg/mL or % concentration';
//       case 'HERBS':
//         return 'mg or g';
//       default:
//         return 'mg';
//     }
//   };

//   // Helper function to get amount unit label
//   const getAmountLabel = () => {
//     switch (medication.medication_type) {
//       case 'TABLET':
//         return 'tablets';
//       case 'CAPSULE':
//         return 'capsules';
//       case 'INJECTION':
//         return 'injections';
//       case 'SPRAY':
//         return 'sprays';
//       case 'DROPS':
//         return 'drops';
//       case 'SOLUTION':
//         return 'mL or L';
//       case 'HERBS':
//         return 'grams or sachets';
//       default:
//         return 'units';
//     }
//   };

//   const weekdaysOptions = [
//     {label: 'Monday', value: 'Mon'},
//     {label: 'Tuesday', value: 'Tue'},
//     {label: 'Wednesday', value: 'Wed'},
//     {label: 'Thursday', value: 'Thu'},
//     {label: 'Friday', value: 'Fri'},
//     {label: 'Saturday', value: 'Sat'},
//     {label: 'Sunday', value: 'Sun'},
//   ];

//   // Format reminder type
//   const formatReminderType = () => {
//     switch (medication.reminder_type) {
//       case 'ONCE':
//         return 'Only one day';
//       case 'DAILY':
//         return 'Daily';
//       case 'WITH_DAYS_GAP':
//         return `Every ${medication.gap_days || 1} days`;
//       case 'WEEKLY':
//         return 'Weekly';
//       case 'SPECIFIC_DAYS':
//         return 'Specific days';
//       default:
//         return medication.reminder_type;
//     }
//   };

//   // Get medication icon
//   const getMedicationIcon = (type, customColor) => {
//     const iconSize = 22;
//     const iconColor = customColor ? '#fff' : themeColors.primary;

//     switch (type?.toUpperCase()) {
//       case 'TABLET':
//         return (
//           <FontAwesome5 name="tablets" size={iconSize} color={iconColor} />
//         );
//       case 'CAPSULE':
//         return (
//           <FontAwesome5 name="capsules" size={iconSize} color={iconColor} />
//         );
//       case 'INJECTION':
//         return (
//           <MaterialCommunityIcons
//             name="needle"
//             size={iconSize}
//             color={iconColor}
//           />
//         );
//       case 'SPRAY':
//         return (
//           <MaterialCommunityIcons
//             name="spray"
//             size={iconSize}
//             color={iconColor}
//           />
//         );
//       case 'DROPS':
//         return (
//           <MaterialCommunityIcons
//             name="water-plus"
//             size={iconSize}
//             color={iconColor}
//           />
//         );
//       case 'SOLUTION':
//         return (
//           <MaterialCommunityIcons
//             name="bottle-tonic"
//             size={iconSize}
//             color={iconColor}
//           />
//         );
//       case 'HERBS':
//         return (
//           <MaterialCommunityIcons
//             name="leaf"
//             size={iconSize}
//             color={iconColor}
//           />
//         );
//       default:
//         return (
//           <MaterialIcons
//             name="medical-services"
//             size={iconSize}
//             color={iconColor}
//           />
//         );
//     }
//   };

//   // Format upcoming reminders
//   const formatUpcomingReminders = () => {
//     if (!medication.reminder_timestamps?.length) {
//       return <Text style={styles.emptyText}>No upcoming reminders</Text>;
//     }

//     const grouped = {};
//     medication.reminder_timestamps.forEach(timestamp => {
//       const date = moment(timestamp).format('MMM D, YYYY');
//       const time = moment(timestamp).format('h:mm A');
//       if (!grouped[date]) grouped[date] = [];
//       grouped[date].push(time);
//     });

//     return Object.entries(grouped).map(([date, times]) => (
//       <View key={date} style={styles.reminderGroup}>
//         <Text style={styles.reminderDate}>{date}</Text>
//         <View style={styles.timesContainer}>
//           {(times as string[]).map((time, i) => (
//             <View key={i} style={styles.timePill}>
//               <Text style={styles.timeText}>{time}</Text>
//             </View>
//           ))}
//         </View>
//       </View>
//     ));
//   };

//   const handleDeleteReminder = async () => {
//     deleteMedicationReminder(
//       medication?.id,
//       () => setDeleteLoading(true),
//       () => {
//         setDeleteLoading(false);
//         setDeleteModalVisible(false);
//         Toast.show('Medication reminder deleted successfully!', {
//           type: 'success',
//           placement: 'top',
//           duration: 4000,
//           animationType: 'slide-in',
//         });
//         navigation.goBack();
//       },
//       (error: any) => {
//         setDeleteLoading(false);
//         setDeleteModalVisible(false);
//         Toast.show(`Failed to delete reminder: ${error.message}`, {
//           type: 'danger',
//           placement: 'top',
//           duration: 4000,
//           animationType: 'slide-in',
//         });
//       },
//     );
//   };

//   // if (isLoading) {
//   //   return (
//   //     <View
//   //       style={[
//   //         styles.container,
//   //         {justifyContent: 'center', alignItems: 'center'},
//   //       ]}>
//   //       <ActivityIndicator size="large" color={themeColors.primary} />
//   //       <Text style={{marginTop: 10}}>Loading medication details...</Text>
//   //     </View>
//   //   );
//   // }

//   // useEffect(() => {
//   //   // If we got minimal data, try to fetch full data
//   //   if (isLoading && medication.id) {
//   //     const fetchData = async () => {
//   //       try {
//   //         const fullData = await getMedicationById(medication.id);
//   //         setMedication(fullData);
//   //         setIsLoading(false);
//   //       } catch (error) {
//   //         console.error('Failed to fetch medication:', error);
//   //         setIsLoading(false);
//   //       }
//   //     };
//   //     fetchData();
//   //   }
//   // }, []);

//   // if (isLoading) {
//   //   return (
//   //     <View
//   //       style={[
//   //         styles.container,
//   //         {justifyContent: 'center', alignItems: 'center'},
//   //       ]}>
//   //       <ActivityIndicator size="large" color={themeColors.primary} />
//   //       <Text style={{marginTop: 10}}>Loading medication details...</Text>
//   //     </View>
//   //   );
//   // }

//   useEffect(() => {
//     const fetchData = async () => {
//       if (isLoading && medication.id) {
//         try {
//           const {data, error} = await supabase
//             .from('medication_reminders')
//             .select('*')
//             .eq('id', medication.id)
//             .single();

//           if (!error) {
//             setMedication(data);
//           }
//         } catch (error) {
//           console.error('Failed to fetch medication:', error);
//         } finally {
//           setIsLoading(false);
//         }
//       }
//     };

//     fetchData();
//   }, []);

//   if (isLoading) {
//     return (
//       <View
//         style={[
//           styles.container,
//           {justifyContent: 'center', alignItems: 'center'},
//         ]}>
//         <ActivityIndicator size="large" color={themeColors.primary} />
//         <Text style={{marginTop: 10}}>Loading medication details...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* Medication Banner */}
//       <View style={styles.banner}>
//         {medication.imageUrl ? (
//           <Image
//             source={{uri: medication.imageUrl}}
//             style={styles.bannerImage}
//             resizeMode="cover"
//           />
//         ) : (
//           <View
//             style={[
//               styles.bannerIcon,
//               {backgroundColor: medication.color || themeColors.primary},
//             ]}>
//             {getMedicationIcon(medication.medication_type, true)}
//           </View>
//         )}
//         <Text style={styles.bannerTitle}>{medication.medication_name}</Text>
//       </View>

//       <ScrollView contentContainerStyle={styles.scrollContainer}>
//         {/* Basic Information Card */}
//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>Basic Information</Text>

//           <View style={styles.infoRow}>
//             {getMedicationIcon(medication.medication_type, false)}
//             <View style={styles.infoTextContainer}>
//               <Text style={styles.infoLabel}>Type</Text>
//               <Text style={styles.infoValue}>
//                 {medication.medication_type.charAt(0) +
//                   medication.medication_type.slice(1).toLowerCase()}
//               </Text>
//             </View>
//           </View>

//           <View style={styles.infoRow}>
//             <FontAwesome5Icon
//               name="heartbeat"
//               size={18}
//               color={themeColors.primary}
//             />
//             <View style={styles.infoTextContainer}>
//               <Text style={styles.infoLabel}>Condition</Text>
//               <Text style={styles.infoValue}>{medication.condition}</Text>
//             </View>
//           </View>

//           <View style={styles.infoRow}>
//             <FontAwesome5Icon
//               name="weight"
//               size={18}
//               color={themeColors.primary}
//             />
//             <View style={styles.infoTextContainer}>
//               <Text style={styles.infoLabel}>Amount</Text>
//               <Text style={styles.infoValue}>
//                 {medication.medication_amount} {getAmountLabel()}
//               </Text>
//             </View>
//           </View>

//           <View style={styles.infoRow}>
//             <FontAwesome5Icon
//               name="flask"
//               size={18}
//               color={themeColors.primary}
//             />
//             <View style={styles.infoTextContainer}>
//               <Text style={styles.infoLabel}>Dose</Text>
//               <Text style={styles.infoValue}>
//                 {medication.medication_dose} {getDoseLabel()}
//               </Text>
//             </View>
//           </View>
//         </View>

//         {/* Schedule Card */}
//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>Schedule</Text>

//           <View style={styles.infoRow}>
//             <FontAwesome5Icon
//               name="calendar-alt"
//               size={18}
//               color={themeColors.primary}
//             />
//             <View style={styles.infoTextContainer}>
//               <Text style={styles.infoLabel}>Frequency</Text>
//               <Text style={styles.infoValue}>{formatReminderType()}</Text>
//               {medication.reminder_type === 'SPECIFIC_DAYS' && (
//                 <Text style={styles.infoValue}>
//                   (
//                   {medication.specific_days?.length
//                     ? weekdaysOptions
//                         .filter(day =>
//                           medication.specific_days.includes(day.value),
//                         )
//                         .map(day => day.label)
//                         .join(', ')
//                     : 'None'}
//                   )
//                 </Text>
//               )}
//               {medication.reminder_type === 'WEEKLY' && (
//                 <Text style={styles.infoValue}>
//                   (
//                   {medication.week_day
//                     ? `Every ${
//                         weekdaysOptions.find(
//                           day => day.value === medication.week_day,
//                         )?.label
//                       }`
//                     : 'Not specified'}
//                   )
//                 </Text>
//               )}
//             </View>
//           </View>

//           <View style={styles.infoRow}>
//             <FontAwesome5Icon
//               name="clock"
//               size={18}
//               color={themeColors.primary}
//             />
//             <View style={styles.infoTextContainer}>
//               <Text style={styles.infoLabel}>Intakes</Text>
//               <Text style={styles.infoValue}>
//                 {medication.intake_amount} time
//                 {medication.intake_amount > 1 ? 's' : ''} per day
//               </Text>
//             </View>
//           </View>

//           <View style={styles.infoRow}>
//             <FontAwesome5Icon
//               name="calendar-plus"
//               size={18}
//               color={themeColors.primary}
//             />
//             <View style={styles.infoTextContainer}>
//               <Text style={styles.infoLabel}>Start Date</Text>
//               <Text style={styles.infoValue}>
//                 {moment(medication.start_date).format('MMM D, YYYY')}
//               </Text>
//             </View>
//           </View>

//           <View style={styles.infoRow}>
//             <FontAwesome5Icon
//               name="calendar-minus"
//               size={18}
//               color={themeColors.primary}
//             />
//             <View style={styles.infoTextContainer}>
//               <Text style={styles.infoLabel}>End Date</Text>
//               <Text style={styles.infoValue}>
//                 {moment(medication.end_date).format('MMM D, YYYY')}
//               </Text>
//             </View>
//           </View>
//         </View>

//         {/* Reminders Card */}
//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>Upcoming Reminders</Text>
//           {formatUpcomingReminders()}
//         </View>
//       </ScrollView>

//       {/* Action Buttons */}
//       <View style={styles.actionsContainer}>
//         <TouchableOpacity
//           style={[styles.actionButton, {backgroundColor: '#f0f0f0'}]}
//           onPress={() =>
//             navigation.navigate('AddMedication', {
//               title: 'Edit Medication Reminder',
//               medication,
//             })
//           }>
//           <MaterialIcons name="edit" size={20} color="#333" />
//           <Text style={[styles.actionButtonText, {color: '#333'}]}>Edit</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.actionButton, {backgroundColor: 'red'}]}
//           onPress={() => setDeleteModalVisible(true)}>
//           <Icon name="delete" size={18} color="white" />
//           <Text style={[styles.actionButtonText, {color: '#fff'}]}>Delete</Text>
//         </TouchableOpacity>
//       </View>
//       {/* Delete Confirmation Modal */}
//       <Modal
//         visible={deleteModalVisible}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setDeleteModalVisible(false)}>
//         <View style={styles.deleteModalOverlay}>
//           <View style={styles.deleteModalContainer}>
//             <Text style={styles.deleteModalTitle}>Delete Reminder?</Text>
//             <Text style={styles.deleteModalMessage}>
//               Are you sure you want to delete this reminder?
//             </Text>

//             <View style={styles.deleteModalActions}>
//               <TouchableOpacity
//                 disabled={deleteLoading}
//                 style={[styles.deleteButton, {backgroundColor: '#f0f0f0'}]}
//                 onPress={() => {
//                   setDeleteModalVisible(false);
//                 }}>
//                 <Text style={[styles.deleteButtonText, {color: '#333'}]}>
//                   Cancel
//                 </Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 disabled={deleteLoading}
//                 style={[styles.deleteButton, {backgroundColor: 'red'}]}
//                 onPress={() => {
//                   handleDeleteReminder();
//                 }}>
//                 {deleteLoading ? (
//                   <ActivityIndicator size="small" color="#fff" />
//                 ) : (
//                   <Text style={styles.deleteButtonText}>Delete</Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   banner: {
//     height: 180,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingTop: 20,
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: 2},
//     shadowOpacity: 0.1,
//     shadowRadius: 6,
//     elevation: 3,
//     backgroundColor: themeColors.primary,
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//   },
//   bannerImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     borderWidth: 3,
//     borderColor: 'rgba(255,255,255,0.3)',
//   },
//   bannerIcon: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 3,
//     borderColor: 'rgba(255,255,255,0.3)',
//   },
//   bannerTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginTop: 10,
//     textShadowColor: 'rgba(0,0,0,0.2)',
//     textShadowOffset: {width: 1, height: 1},
//     textShadowRadius: 3,
//   },
//   scrollContainer: {
//     padding: 16,
//     paddingBottom: 80,
//   },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: 2},
//     shadowOpacity: 0.1,
//     shadowRadius: 6,
//     elevation: 3,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: themeColors.primary,
//     marginBottom: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//     paddingBottom: 8,
//   },
//   infoRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   infoTextContainer: {
//     marginLeft: 12,
//     flex: 1,
//   },
//   infoLabel: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 2,
//   },
//   infoValue: {
//     fontSize: 16,
//     color: '#333',
//     fontWeight: '500',
//   },
//   reminderGroup: {
//     marginBottom: 12,
//   },
//   reminderDate: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#555',
//     marginBottom: 8,
//   },
//   timesContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//   },
//   timePill: {
//     backgroundColor: themeColors.primary + '20',
//     borderRadius: 16,
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     marginRight: 8,
//     marginBottom: 8,
//   },
//   timeText: {
//     color: themeColors.primary,
//     fontWeight: '500',
//   },
//   emptyText: {
//     color: '#888',
//     fontStyle: 'italic',
//     textAlign: 'center',
//   },
//   actionsContainer: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     flexDirection: 'row',
//     padding: 16,
//     backgroundColor: '#fff',
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: -2},
//     shadowOpacity: 0.1,
//     shadowRadius: 6,
//     elevation: 5,
//   },
//   actionButton: {
//     flex: 1,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 12,
//     borderRadius: 8,
//     marginHorizontal: 8,
//   },
//   actionButtonText: {
//     marginLeft: 8,
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   deleteModalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   deleteModalContainer: {
//     width: 300,
//     backgroundColor: 'white',
//     borderRadius: 10,
//     padding: 20,
//     alignItems: 'center',
//   },
//   deleteModalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//     color: '#333',
//   },
//   deleteModalMessage: {
//     fontSize: 15,
//     color: '#555',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   deleteModalActions: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//   },
//   deleteButton: {
//     flex: 1,
//     paddingVertical: 10,
//     marginHorizontal: 5,
//     borderRadius: 6,
//     alignItems: 'center',
//   },
//   deleteButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   errorText: {
//     fontSize: 18,
//     color: '#ff0000',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   retryButton: {
//     backgroundColor: themeColors.primary,
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//   },
//   retryButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });

// export default MedicationDetailsView;
//
//
//
//
//
//

// import React, {useState, useEffect} from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
//   Dimensions,
//   Modal,
//   RefreshControl,
// } from 'react-native';
// import moment from 'moment';
// import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import {themeColors} from '../../theme/colors';
// import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import {deleteMedicationReminder} from '../../services/medication';
// import {Toast} from 'react-native-toast-notifications';
// import {ActivityIndicator} from 'react-native-paper';
// import {supabase} from '../../utils/supabaseClient';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const {width} = Dimensions.get('window');

// const MedicationDetailsView = ({route, navigation}) => {
//   const [deleteModalVisible, setDeleteModalVisible] = useState(false);
//   const [deleteLoading, setDeleteLoading] = useState(false);
//   const [medication, setMedication] = useState(null);
//   const medicationId =
//     route.params?.medicationId || route.params?.medication?.id;
//   const [isLoading, setIsLoading] = useState(true);
//   const [isRefreshing, setIsRefreshing] = useState(false);

//   console.log('Medication details:', medication);

//   useEffect(() => {
//     fetchMedicationData();
//   }, [medicationId]);

//   const fetchMedicationData = async () => {
//     if (!medicationId) {
//       setIsLoading(false);
//       return;
//     }

//     try {
//       setIsRefreshing(true);

//       // 1. First try to get from cache
//       const cachedData = await AsyncStorage.getItem(
//         `medication_${medicationId}`,
//       );
//       if (cachedData) {
//         setMedication(JSON.parse(cachedData));
//         setIsRefreshing(false);
//         setIsLoading(false);
//         return;
//       }

//       // 2. Fetch from Supabase
//       const {data, error} = await supabase
//         .from('medication_reminders')
//         .select('*')
//         .eq('id', medicationId)
//         .single();

//       if (error) throw error;

//       // Cache the data
//       await AsyncStorage.setItem(
//         `medication_${medicationId}`,
//         JSON.stringify(data),
//       );

//       setMedication(data);
//     } catch (error) {
//       console.error('Failed to fetch medication:', error);

//       // 3. Fallback to route params if available
//       if (route.params?.medication) {
//         setMedication(route.params.medication);
//       } else {
//         // Minimal fallback data
//         setMedication({
//           id: medicationId,
//           medication_name: 'Medication',
//           medication_type: 'TABLET',
//           condition: 'Not specified',
//           medication_amount: 0,
//           medication_dose: 0,
//           reminder_type: 'DAILY',
//           intake_amount: 0,
//           start_date: new Date().toISOString(),
//           end_date: new Date().toISOString(),
//           reminder_timestamps: [],
//           specific_days: [],
//           color: themeColors.primary,
//         });
//       }
//     } finally {
//       setIsLoading(false);
//       setIsRefreshing(false);
//     }
//   };

//   // Helper function to get dose unit label
//   const getDoseLabel = () => {
//     const type = medication?.medication_type || 'TABLET';
//     switch (type) {
//       case 'TABLET':
//         return 'mg';
//       case 'CAPSULE':
//         return 'mg';
//       case 'INJECTION':
//         return 'mL or IU';
//       case 'SPRAY':
//         return 'mcg per spray';
//       case 'DROPS':
//         return 'mg/mL or % concentration';
//       case 'SOLUTION':
//         return 'mg/mL or % concentration';
//       case 'HERBS':
//         return 'mg or g';
//       default:
//         return 'mg';
//     }
//   };

//   // Helper function to get amount unit label
//   const getAmountLabel = () => {
//     const type = medication?.medication_type || 'TABLET';
//     switch (type) {
//       case 'TABLET':
//         return 'tablets';
//       case 'CAPSULE':
//         return 'capsules';
//       case 'INJECTION':
//         return 'injections';
//       case 'SPRAY':
//         return 'sprays';
//       case 'DROPS':
//         return 'drops';
//       case 'SOLUTION':
//         return 'mL or L';
//       case 'HERBS':
//         return 'grams or sachets';
//       default:
//         return 'units';
//     }
//   };

//   const weekdaysOptions = [
//     {label: 'Monday', value: 'Mon'},
//     {label: 'Tuesday', value: 'Tue'},
//     {label: 'Wednesday', value: 'Wed'},
//     {label: 'Thursday', value: 'Thu'},
//     {label: 'Friday', value: 'Fri'},
//     {label: 'Saturday', value: 'Sat'},
//     {label: 'Sunday', value: 'Sun'},
//   ];

//   // Format reminder type
//   const formatReminderType = () => {
//     const type = medication?.reminder_type || 'DAILY';
//     switch (type) {
//       case 'ONCE':
//         return 'Only one day';
//       case 'DAILY':
//         return 'Daily';
//       case 'WITH_DAYS_GAP':
//         return `Every ${medication?.gap_days || 1} days`;
//       case 'WEEKLY':
//         return 'Weekly';
//       case 'SPECIFIC_DAYS':
//         return 'Specific days';
//       default:
//         return type;
//     }
//   };

//   // Get medication icon
//   const getMedicationIcon = (type, customColor) => {
//     const iconSize = 22;
//     const iconColor = customColor ? '#fff' : themeColors.primary;
//     const medType = type || 'TABLET';

//     switch (medType.toUpperCase()) {
//       case 'TABLET':
//         return (
//           <FontAwesome5 name="tablets" size={iconSize} color={iconColor} />
//         );
//       case 'CAPSULE':
//         return (
//           <FontAwesome5 name="capsules" size={iconSize} color={iconColor} />
//         );
//       case 'INJECTION':
//         return (
//           <MaterialCommunityIcons
//             name="needle"
//             size={iconSize}
//             color={iconColor}
//           />
//         );
//       case 'SPRAY':
//         return (
//           <MaterialCommunityIcons
//             name="spray"
//             size={iconSize}
//             color={iconColor}
//           />
//         );
//       case 'DROPS':
//         return (
//           <MaterialCommunityIcons
//             name="water-plus"
//             size={iconSize}
//             color={iconColor}
//           />
//         );
//       case 'SOLUTION':
//         return (
//           <MaterialCommunityIcons
//             name="bottle-tonic"
//             size={iconSize}
//             color={iconColor}
//           />
//         );
//       case 'HERBS':
//         return (
//           <MaterialCommunityIcons
//             name="leaf"
//             size={iconSize}
//             color={iconColor}
//           />
//         );
//       default:
//         return (
//           <MaterialIcons
//             name="medical-services"
//             size={iconSize}
//             color={iconColor}
//           />
//         );
//     }
//   };

//   // Format upcoming reminders
//   const formatUpcomingReminders = () => {
//     if (!medication?.reminder_timestamps?.length) {
//       return <Text style={styles.emptyText}>No upcoming reminders</Text>;
//     }

//     const grouped = {};
//     medication.reminder_timestamps.forEach(timestamp => {
//       const date = moment(timestamp).format('MMM D, YYYY');
//       const time = moment(timestamp).format('h:mm A');
//       if (!grouped[date]) grouped[date] = [];
//       grouped[date].push(time);
//     });

//     return Object.entries(grouped).map(([date, times]) => (
//       <View key={date} style={styles.reminderGroup}>
//         <Text style={styles.reminderDate}>{date}</Text>
//         <View style={styles.timesContainer}>
//           {(times as string[]).map((time, i) => (
//             <View key={i} style={styles.timePill}>
//               <Text style={styles.timeText}>{time}</Text>
//             </View>
//           ))}
//         </View>
//       </View>
//     ));
//   };

//   const handleDeleteReminder = async () => {
//     if (!medication?.id) return;

//     deleteMedicationReminder(
//       medication.id,
//       () => setDeleteLoading(true),
//       () => {
//         setDeleteLoading(false);
//         setDeleteModalVisible(false);
//         Toast.show('Medication reminder deleted successfully!', {
//           type: 'success',
//           placement: 'top',
//           duration: 4000,
//           animationType: 'slide-in',
//         });
//         navigation.goBack();
//       },
//       (error: any) => {
//         setDeleteLoading(false);
//         setDeleteModalVisible(false);
//         Toast.show(`Failed to delete reminder: ${error.message}`, {
//           type: 'danger',
//           placement: 'top',
//           duration: 4000,
//           animationType: 'slide-in',
//         });
//       },
//     );
//   };

//   if (isLoading) {
//     return (
//       <View
//         style={[
//           styles.container,
//           {justifyContent: 'center', alignItems: 'center'},
//         ]}>
//         <ActivityIndicator size="large" color={themeColors.primary} />
//         <Text style={{marginTop: 10}}>Loading medication details...</Text>
//       </View>
//     );
//   }

//   if (!medication) {
//     return (
//       <View
//         style={[
//           styles.container,
//           {justifyContent: 'center', alignItems: 'center', padding: 20},
//         ]}>
//         <Text style={styles.errorText}>Medication not found</Text>
//         <TouchableOpacity
//           style={styles.retryButton}
//           onPress={() => navigation.goBack()}>
//           <Text style={styles.retryButtonText}>Go Back</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* Medication Banner */}
//       <View style={styles.banner}>
//         {medication?.imageUrl ? (
//           <Image
//             source={{uri: medication.imageUrl}}
//             style={styles.bannerImage}
//             resizeMode="cover"
//           />
//         ) : (
//           <View
//             style={[
//               styles.bannerIcon,
//               {backgroundColor: medication?.color || themeColors.primary},
//             ]}>
//             {getMedicationIcon(medication?.medication_type, true)}
//           </View>
//         )}
//         <Text style={styles.bannerTitle}>
//           {medication?.medication_name || 'Medication'}
//         </Text>
//       </View>

//       <ScrollView
//         contentContainerStyle={styles.scrollContainer}
//         refreshControl={
//           <RefreshControl
//             refreshing={isRefreshing}
//             onRefresh={fetchMedicationData}
//           />
//         }>
//         {/* Basic Information Card */}
//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>Basic Information</Text>

//           <View style={styles.infoRow}>
//             {getMedicationIcon(medication?.medication_type, false)}
//             <View style={styles.infoTextContainer}>
//               <Text style={styles.infoLabel}>Type</Text>
//               <Text style={styles.infoValue}>
//                 {medication?.medication_type
//                   ? medication.medication_type.charAt(0) +
//                     medication.medication_type.slice(1).toLowerCase()
//                   : 'Not specified'}
//               </Text>
//             </View>
//           </View>

//           <View style={styles.infoRow}>
//             <FontAwesome5Icon
//               name="heartbeat"
//               size={18}
//               color={themeColors.primary}
//             />
//             <View style={styles.infoTextContainer}>
//               <Text style={styles.infoLabel}>Condition</Text>
//               <Text style={styles.infoValue}>
//                 {medication?.condition || 'Not specified'}
//               </Text>
//             </View>
//           </View>

//           <View style={styles.infoRow}>
//             <FontAwesome5Icon
//               name="weight"
//               size={18}
//               color={themeColors.primary}
//             />
//             <View style={styles.infoTextContainer}>
//               <Text style={styles.infoLabel}>Amount</Text>
//               <Text style={styles.infoValue}>
//                 {medication?.medication_amount || 0} {getAmountLabel()}
//               </Text>
//             </View>
//           </View>

//           <View style={styles.infoRow}>
//             <FontAwesome5Icon
//               name="flask"
//               size={18}
//               color={themeColors.primary}
//             />
//             <View style={styles.infoTextContainer}>
//               <Text style={styles.infoLabel}>Dose</Text>
//               <Text style={styles.infoValue}>
//                 {medication?.medication_dose || 0} {getDoseLabel()}
//               </Text>
//             </View>
//           </View>
//         </View>

//         {/* Schedule Card */}
//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>Schedule</Text>

//           <View style={styles.infoRow}>
//             <FontAwesome5Icon
//               name="calendar-alt"
//               size={18}
//               color={themeColors.primary}
//             />
//             <View style={styles.infoTextContainer}>
//               <Text style={styles.infoLabel}>Frequency</Text>
//               <Text style={styles.infoValue}>{formatReminderType()}</Text>
//               {medication?.reminder_type === 'SPECIFIC_DAYS' && (
//                 <Text style={styles.infoValue}>
//                   (
//                   {medication?.specific_days?.length
//                     ? weekdaysOptions
//                         .filter(day =>
//                           medication.specific_days.includes(day.value),
//                         )
//                         .map(day => day.label)
//                         .join(', ')
//                     : 'None'}
//                   )
//                 </Text>
//               )}
//               {medication?.reminder_type === 'WEEKLY' && (
//                 <Text style={styles.infoValue}>
//                   (
//                   {medication?.week_day
//                     ? `Every ${
//                         weekdaysOptions.find(
//                           day => day.value === medication.week_day,
//                         )?.label
//                       }`
//                     : 'Not specified'}
//                   )
//                 </Text>
//               )}
//             </View>
//           </View>

//           <View style={styles.infoRow}>
//             <FontAwesome5Icon
//               name="clock"
//               size={18}
//               color={themeColors.primary}
//             />
//             <View style={styles.infoTextContainer}>
//               <Text style={styles.infoLabel}>Intakes</Text>
//               <Text style={styles.infoValue}>
//                 {medication?.intake_amount || 0} time
//                 {(medication?.intake_amount || 0) > 1 ? 's' : ''} per day
//               </Text>
//             </View>
//           </View>

//           <View style={styles.infoRow}>
//             <FontAwesome5Icon
//               name="calendar-plus"
//               size={18}
//               color={themeColors.primary}
//             />
//             <View style={styles.infoTextContainer}>
//               <Text style={styles.infoLabel}>Start Date</Text>
//               <Text style={styles.infoValue}>
//                 {medication?.start_date
//                   ? moment(medication.start_date).format('MMM D, YYYY')
//                   : 'Not specified'}
//               </Text>
//             </View>
//           </View>

//           <View style={styles.infoRow}>
//             <FontAwesome5Icon
//               name="calendar-minus"
//               size={18}
//               color={themeColors.primary}
//             />
//             <View style={styles.infoTextContainer}>
//               <Text style={styles.infoLabel}>End Date</Text>
//               <Text style={styles.infoValue}>
//                 {medication?.end_date
//                   ? moment(medication.end_date).format('MMM D, YYYY')
//                   : 'Not specified'}
//               </Text>
//             </View>
//           </View>
//         </View>

//         {/* Reminders Card */}
//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>Upcoming Reminders</Text>
//           {formatUpcomingReminders()}
//         </View>
//       </ScrollView>

//       {/* Action Buttons */}
//       {medication?.id && (
//         <View style={styles.actionsContainer}>
//           <TouchableOpacity
//             style={[styles.actionButton, {backgroundColor: '#f0f0f0'}]}
//             onPress={() =>
//               navigation.navigate('AddMedication', {
//                 title: 'Edit Medication Reminder',
//                 medication,
//               })
//             }>
//             <MaterialIcons name="edit" size={20} color="#333" />
//             <Text style={[styles.actionButtonText, {color: '#333'}]}>Edit</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.actionButton, {backgroundColor: 'red'}]}
//             onPress={() => setDeleteModalVisible(true)}>
//             <Icon name="delete" size={18} color="white" />
//             <Text style={[styles.actionButtonText, {color: '#fff'}]}>
//               Delete
//             </Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* Delete Confirmation Modal */}
//       <Modal
//         visible={deleteModalVisible}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setDeleteModalVisible(false)}>
//         <View style={styles.deleteModalOverlay}>
//           <View style={styles.deleteModalContainer}>
//             <Text style={styles.deleteModalTitle}>Delete Reminder?</Text>
//             <Text style={styles.deleteModalMessage}>
//               Are you sure you want to delete this reminder?
//             </Text>

//             <View style={styles.deleteModalActions}>
//               <TouchableOpacity
//                 disabled={deleteLoading}
//                 style={[styles.deleteButton, {backgroundColor: '#f0f0f0'}]}
//                 onPress={() => {
//                   setDeleteModalVisible(false);
//                 }}>
//                 <Text style={[styles.deleteButtonText, {color: '#333'}]}>
//                   Cancel
//                 </Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 disabled={deleteLoading}
//                 style={[styles.deleteButton, {backgroundColor: 'red'}]}
//                 onPress={handleDeleteReminder}>
//                 {deleteLoading ? (
//                   <ActivityIndicator size="small" color="#fff" />
//                 ) : (
//                   <Text style={styles.deleteButtonText}>Delete</Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   banner: {
//     height: 180,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingTop: 20,
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: 2},
//     shadowOpacity: 0.1,
//     shadowRadius: 6,
//     elevation: 3,
//     backgroundColor: themeColors.primary,
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//   },
//   bannerImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     borderWidth: 3,
//     borderColor: 'rgba(255,255,255,0.3)',
//   },
//   bannerIcon: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 3,
//     borderColor: 'rgba(255,255,255,0.3)',
//   },
//   bannerTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginTop: 10,
//     textShadowColor: 'rgba(0,0,0,0.2)',
//     textShadowOffset: {width: 1, height: 1},
//     textShadowRadius: 3,
//   },
//   scrollContainer: {
//     padding: 16,
//     paddingBottom: 80,
//   },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: 2},
//     shadowOpacity: 0.1,
//     shadowRadius: 6,
//     elevation: 3,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: themeColors.primary,
//     marginBottom: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//     paddingBottom: 8,
//   },
//   infoRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   infoTextContainer: {
//     marginLeft: 12,
//     flex: 1,
//   },
//   infoLabel: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 2,
//   },
//   infoValue: {
//     fontSize: 16,
//     color: '#333',
//     fontWeight: '500',
//   },
//   reminderGroup: {
//     marginBottom: 12,
//   },
//   reminderDate: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#555',
//     marginBottom: 8,
//   },
//   timesContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//   },
//   timePill: {
//     backgroundColor: themeColors.primary + '20',
//     borderRadius: 16,
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     marginRight: 8,
//     marginBottom: 8,
//   },
//   timeText: {
//     color: themeColors.primary,
//     fontWeight: '500',
//   },
//   emptyText: {
//     color: '#888',
//     fontStyle: 'italic',
//     textAlign: 'center',
//   },
//   actionsContainer: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     flexDirection: 'row',
//     padding: 16,
//     backgroundColor: '#fff',
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: -2},
//     shadowOpacity: 0.1,
//     shadowRadius: 6,
//     elevation: 5,
//   },
//   actionButton: {
//     flex: 1,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 12,
//     borderRadius: 8,
//     marginHorizontal: 8,
//   },
//   actionButtonText: {
//     marginLeft: 8,
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   deleteModalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   deleteModalContainer: {
//     width: 300,
//     backgroundColor: 'white',
//     borderRadius: 10,
//     padding: 20,
//     alignItems: 'center',
//   },
//   deleteModalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//     color: '#333',
//   },
//   deleteModalMessage: {
//     fontSize: 15,
//     color: '#555',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   deleteModalActions: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//   },
//   deleteButton: {
//     flex: 1,
//     paddingVertical: 10,
//     marginHorizontal: 5,
//     borderRadius: 6,
//     alignItems: 'center',
//   },
//   deleteButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   errorText: {
//     fontSize: 18,
//     color: '#ff0000',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   retryButton: {
//     backgroundColor: themeColors.primary,
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//   },
//   retryButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });

// export default MedicationDetailsView;

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  RefreshControl,
} from 'react-native';
import moment from 'moment';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {themeColors} from '../../theme/colors';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {deleteMedicationReminder} from '../../services/medication';
import {Toast} from 'react-native-toast-notifications';
import {ActivityIndicator} from 'react-native-paper';
import {supabase} from '../../utils/supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useCallback} from 'react';

const {width} = Dimensions.get('window');

const MedicationDetailsView = ({route, navigation}) => {
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [medication, setMedication] = useState(null);
  const medicationId =
    route.params?.medicationId || route.params?.medication?.id;
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(Date.now()); // Add this state

  console.log('Medication details:', medication);

  useEffect(() => {
    fetchMedicationData();
  }, [medicationId]);

  const fetchMedicationData = useCallback(
    async (forceRefresh = false) => {
      if (!medicationId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsRefreshing(true);

        if (forceRefresh) {
          await AsyncStorage.removeItem(`medication_${medicationId}`);
        }

        // 1. First try to get from cache
        const cachedData = await AsyncStorage.getItem(
          `medication_${medicationId}`,
        );
        if (cachedData && !forceRefresh) {
          setMedication(JSON.parse(cachedData));
          setIsRefreshing(false);
          setIsLoading(false);
          return;
        }

        // 2. Fetch from Supabase
        const {data, error} = await supabase
          .from('medication_reminders')
          .select('*')
          .eq('id', medicationId)
          .single();

        if (error) throw error;

        // Cache the data
        await AsyncStorage.setItem(
          `medication_${medicationId}`,
          JSON.stringify(data),
        );

        setMedication(data);
      } catch (error) {
        console.error('Failed to fetch medication:', error);

        // 3. Fallback to route params if available
        if (route.params?.medication) {
          setMedication(route.params.medication);
        } else {
          // Minimal fallback data
          setMedication({
            id: medicationId,
            medication_name: 'Medication',
            medication_type: 'TABLET',
            condition: 'Not specified',
            medication_amount: 0,
            medication_dose: 0,
            reminder_type: 'DAILY',
            intake_amount: 0,
            start_date: new Date().toISOString(),
            end_date: new Date().toISOString(),
            reminder_timestamps: [],
            specific_days: [],
            color: themeColors.primary,
          });
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [medicationId],
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchMedicationData(true); // Force refresh on screen focus
    });

    return unsubscribe;
  }, [navigation, fetchMedicationData]);

  // Helper function to get dose unit label
  const getDoseLabel = () => {
    const type = medication?.medication_type || 'TABLET';
    switch (type) {
      case 'TABLET':
        return 'mg';
      case 'CAPSULE':
        return 'mg';
      case 'INJECTION':
        return 'mL or IU';
      case 'SPRAY':
        return 'mcg per spray';
      case 'DROPS':
        return 'mg/mL or % concentration';
      case 'SOLUTION':
        return 'mg/mL or % concentration';
      case 'HERBS':
        return 'mg or g';
      default:
        return 'mg';
    }
  };

  // Helper function to get amount unit label
  const getAmountLabel = () => {
    const type = medication?.medication_type || 'TABLET';
    switch (type) {
      case 'TABLET':
        return 'tablets';
      case 'CAPSULE':
        return 'capsules';
      case 'INJECTION':
        return 'injections';
      case 'SPRAY':
        return 'sprays';
      case 'DROPS':
        return 'drops';
      case 'SOLUTION':
        return 'mL or L';
      case 'HERBS':
        return 'grams or sachets';
      default:
        return 'units';
    }
  };

  const weekdaysOptions = [
    {label: 'Monday', value: 'Mon'},
    {label: 'Tuesday', value: 'Tue'},
    {label: 'Wednesday', value: 'Wed'},
    {label: 'Thursday', value: 'Thu'},
    {label: 'Friday', value: 'Fri'},
    {label: 'Saturday', value: 'Sat'},
    {label: 'Sunday', value: 'Sun'},
  ];

  // Format reminder type
  const formatReminderType = () => {
    const type = medication?.reminder_type || 'DAILY';
    switch (type) {
      case 'ONCE':
        return 'Only one day';
      case 'DAILY':
        return 'Daily';
      case 'WITH_DAYS_GAP':
        return `Every ${medication?.gap_days || 1} days`;
      case 'WEEKLY':
        return 'Weekly';
      case 'SPECIFIC_DAYS':
        return 'Specific days';
      default:
        return type;
    }
  };

  // Get medication icon
  const getMedicationIcon = (type, customColor) => {
    const iconSize = 22;
    const iconColor = customColor ? '#fff' : themeColors.primary;
    const medType = type || 'TABLET';

    switch (medType.toUpperCase()) {
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
          <MaterialIcons
            name="medical-services"
            size={iconSize}
            color={iconColor}
          />
        );
    }
  };

  // Format upcoming reminders
  const formatUpcomingReminders = () => {
    if (!medication?.reminder_timestamps?.length) {
      return <Text style={styles.emptyText}>No upcoming reminders</Text>;
    }

    const grouped = {};
    medication.reminder_timestamps.forEach(timestamp => {
      const date = moment(timestamp).format('MMM D, YYYY');
      const time = moment(timestamp).format('h:mm A');
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(time);
    });

    return Object.entries(grouped).map(([date, times]) => (
      <View key={date} style={styles.reminderGroup}>
        <Text style={styles.reminderDate}>{date}</Text>
        <View style={styles.timesContainer}>
          {(times as string[]).map((time, i) => (
            <View key={i} style={styles.timePill}>
              <Text style={styles.timeText}>{time}</Text>
            </View>
          ))}
        </View>
      </View>
    ));
  };

  const handleDeleteReminder = async () => {
    if (!medication?.id) return;

    deleteMedicationReminder(
      medication.id,
      () => setDeleteLoading(true),
      () => {
        setDeleteLoading(false);
        setDeleteModalVisible(false);
        Toast.show('Medication reminder deleted successfully!', {
          type: 'success',
          placement: 'top',
          duration: 4000,
          animationType: 'slide-in',
        });
        navigation.goBack();
      },
      (error: any) => {
        setDeleteLoading(false);
        setDeleteModalVisible(false);
        Toast.show(`Failed to delete reminder: ${error.message}`, {
          type: 'danger',
          placement: 'top',
          duration: 4000,
          animationType: 'slide-in',
        });
      },
    );
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          {justifyContent: 'center', alignItems: 'center'},
        ]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={{marginTop: 10}}>Loading medication details...</Text>
      </View>
    );
  }

  if (!medication) {
    return (
      <View
        style={[
          styles.container,
          {justifyContent: 'center', alignItems: 'center', padding: 20},
        ]}>
        <Text style={styles.errorText}>Medication not found</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Medication Banner */}
      <View style={styles.banner}>
        {medication?.imageUrl ? (
          <Image
            source={{uri: medication.imageUrl}}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.bannerIcon,
              {backgroundColor: medication?.color || themeColors.primary},
            ]}>
            {getMedicationIcon(medication?.medication_type, true)}
          </View>
        )}
        <Text style={styles.bannerTitle}>
          {medication?.medication_name || 'Medication'}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={fetchMedicationData}
          />
        }>
        {/* Basic Information Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Basic Information</Text>

          <View style={styles.infoRow}>
            {getMedicationIcon(medication?.medication_type, false)}
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Type</Text>
              <Text style={styles.infoValue}>
                {medication?.medication_type
                  ? medication.medication_type.charAt(0) +
                    medication.medication_type.slice(1).toLowerCase()
                  : 'Not specified'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <FontAwesome5Icon
              name="heartbeat"
              size={18}
              color={themeColors.primary}
            />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Condition</Text>
              <Text style={styles.infoValue}>
                {medication?.condition || 'Not specified'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <FontAwesome5Icon
              name="weight"
              size={18}
              color={themeColors.primary}
            />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Amount</Text>
              <Text style={styles.infoValue}>
                {medication?.medication_amount || 0} {getAmountLabel()}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <FontAwesome5Icon
              name="flask"
              size={18}
              color={themeColors.primary}
            />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Dose</Text>
              <Text style={styles.infoValue}>
                {medication?.medication_dose || 0} {getDoseLabel()}
              </Text>
            </View>
          </View>
        </View>

        {/* Schedule Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Schedule</Text>

          <View style={styles.infoRow}>
            <FontAwesome5Icon
              name="calendar-alt"
              size={18}
              color={themeColors.primary}
            />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Frequency</Text>
              <Text style={styles.infoValue}>{formatReminderType()}</Text>
              {medication?.reminder_type === 'SPECIFIC_DAYS' && (
                <Text style={styles.infoValue}>
                  (
                  {medication?.specific_days?.length
                    ? weekdaysOptions
                        .filter(day =>
                          medication.specific_days.includes(day.value),
                        )
                        .map(day => day.label)
                        .join(', ')
                    : 'None'}
                  )
                </Text>
              )}
              {medication?.reminder_type === 'WEEKLY' && (
                <Text style={styles.infoValue}>
                  (
                  {medication?.week_day
                    ? `Every ${
                        weekdaysOptions.find(
                          day => day.value === medication.week_day,
                        )?.label
                      }`
                    : 'Not specified'}
                  )
                </Text>
              )}
            </View>
          </View>

          <View style={styles.infoRow}>
            <FontAwesome5Icon
              name="clock"
              size={18}
              color={themeColors.primary}
            />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Intakes</Text>
              <Text style={styles.infoValue}>
                {medication?.intake_amount || 0} time
                {(medication?.intake_amount || 0) > 1 ? 's' : ''} per day
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <FontAwesome5Icon
              name="calendar-plus"
              size={18}
              color={themeColors.primary}
            />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Start Date</Text>
              <Text style={styles.infoValue}>
                {medication?.start_date
                  ? moment(medication.start_date).format('MMM D, YYYY')
                  : 'Not specified'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <FontAwesome5Icon
              name="calendar-minus"
              size={18}
              color={themeColors.primary}
            />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>End Date</Text>
              <Text style={styles.infoValue}>
                {medication?.end_date
                  ? moment(medication.end_date).format('MMM D, YYYY')
                  : 'Not specified'}
              </Text>
            </View>
          </View>
        </View>

        {/* Reminders Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Upcoming Reminders</Text>
          {formatUpcomingReminders()}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {medication?.id && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, {backgroundColor: '#f0f0f0'}]}
            onPress={() =>
              navigation.navigate('AddMedication', {
                title: 'Edit Medication Reminder',
                medication,
              })
            }>
            <MaterialIcons name="edit" size={20} color="#333" />
            <Text style={[styles.actionButtonText, {color: '#333'}]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, {backgroundColor: 'red'}]}
            onPress={() => setDeleteModalVisible(true)}>
            <Icon name="delete" size={18} color="white" />
            <Text style={[styles.actionButtonText, {color: '#fff'}]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      )}

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
                }}>
                <Text style={[styles.deleteButtonText, {color: '#333'}]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={deleteLoading}
                style={[styles.deleteButton, {backgroundColor: 'red'}]}
                onPress={handleDeleteReminder}>
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
    backgroundColor: '#f5f5f5',
  },
  banner: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    backgroundColor: themeColors.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  bannerImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  bannerIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: themeColors.primary,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  reminderGroup: {
    marginBottom: 12,
  },
  reminderDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  timesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  timePill: {
    backgroundColor: themeColors.primary + '20',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  timeText: {
    color: themeColors.primary,
    fontWeight: '500',
  },
  emptyText: {
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  actionButtonText: {
    marginLeft: 8,
    fontWeight: 'bold',
    fontSize: 16,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ff0000',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: themeColors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MedicationDetailsView;
