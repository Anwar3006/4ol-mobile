import notifee, {Event, EventDetail, EventType} from '@notifee/react-native';
import {
  markasComplete,
  markasSkip,
  markasSnooze,
} from './notificationButtonPress';
import {SCREENS} from '../constants/screens';
import {Linking} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {navigationRef} from './NavigationRef';
import {supabase} from '../utils/supabaseClient';
import messaging from '@react-native-firebase/messaging';

export const handleNotificationAction = async ({
  notification,
  pressAction,
}: {
  notification: any;
  pressAction: any;
}) => {
  try {
    if (!notification || !pressAction) {
      throw new Error('Invalid notification action data');
    }
    console.log('I AM RUNNING FROM NOTIFICATIONACTIONS==>');
    console.log('NOTIFICATION EVENT==>', notification, pressAction);

    const medicationId = notification?.data?.medicationId;
    if (!medicationId) {
      throw new Error('Missing medicationId in notification data');
    }

    switch (pressAction.id) {
      case 'complete':
        await markasComplete(medicationId);
        break;
      case 'skip':
        await markasSkip(medicationId);
        break;
      case 'snooze':
        await markasSnooze(medicationId);
        break;
      default:
        console.warn('Unknown action type:', pressAction.id);
    }
  } catch (error: any) {
    console.error('Notification action failed:', {
      error: error.message,
      notificationId: notification?.id,
      action: pressAction?.id,
      timestamp: new Date().toISOString(),
    });
  } finally {
    try {
      if (notification?.id) {
        await notifee.cancelNotification(notification.id);
      }
    } catch (cancelError: any) {
      console.error('Failed to cancel notification:', cancelError.message);
    }
  }
};

export const handleNotificationPress = async (notification: any) => {
  const medicationId = notification?.data?.medicationId;
  if (!medicationId) {
    throw new Error('Missing medicationId in notification data');
  }

  // Store complete notification data including all needed fields
  await AsyncStorage.setItem(
    'pendingNotification',
    JSON.stringify({
      ...notification.data,
      // Add critical fields that might be needed
      medicationId,
      notificationId: notification.id,
      timestamp: new Date().toISOString(),
    }),
  );

  // Check if navigation is ready

  await handlePendingNotification();
};
export const handlePendingNotification = async () => {
  try {
    let notificationData = null;

    // 1. Check if app was opened from killed state via FCM
    const initialNotification = await messaging().getInitialNotification();
    if (initialNotification?.data) {
      notificationData = initialNotification.data;
    }

    // 2. If not from killed state, check AsyncStorage (for background cases)
    if (!notificationData) {
      const pending = await AsyncStorage.getItem('pendingNotification');
      if (pending) {
        notificationData = JSON.parse(pending);
      }
    }

    if (!notificationData?.medicationId) return;

    const medicationId = notificationData.medicationId;

    // Wait until navigation is ready
    let tries = 0;
    const maxMs = 5000;
    const startedAt = Date.now();
    const interval = setInterval(async () => {
      if (navigationRef.current?.isReady()) {
        clearInterval(interval);
        if (Date.now() - startedAt > maxMs) {
          return;
        }
        // Navigate to a loading screen first
        navigationRef.current.navigate('MedicationDetailsView', {
          isLoading: true,
          medication: {
            id: medicationId,
            medication_name: 'Loading...',
            medication_type: 'TABLET',
          },
        });

        try {
          const {data: medication, error} = await supabase
            .from('medication_reminders')
            .select('*')
            .eq('id', medicationId)
            .single();

          if (error) throw error;

          navigationRef.current.navigate('MedicationDetailsView', {
            isLoading: false,
            medication,
          });
        } catch (error) {
          console.error('Failed to fetch medication:', error);
          navigationRef.current.navigate('MedicationDetailsView', {
            isLoading: false,
            medication: {
              id: medicationId,
              medication_type: notificationData.medication_type || 'TABLET',
              medication_name: notificationData.medication_name || 'Medication',
            },
          });
        }

        // Clear pending notification
        await AsyncStorage.removeItem('pendingNotification');
      }

      tries++;
      if (tries > 25) {
        // ~5 seconds max
        clearInterval(interval);
        console.warn('Navigation not ready after 5s');
      }
    }, 200);
    // Safety timeout to clear interval if never ready
    setTimeout(() => clearInterval(interval), 6000);
  } catch (error) {
    console.error('Failed to handle pending notification:', error);
    await AsyncStorage.removeItem('pendingNotification');
  }
};

// export const handlePendingNotification = async () => {
//   try {
//     const pendingNotification = await AsyncStorage.getItem(
//       'pendingNotification',
//     );
//     if (!pendingNotification) return;

//     const notificationData = JSON.parse(pendingNotification);
//     const medicationId = notificationData.medicationId;

//     if (!medicationId) {
//       await AsyncStorage.removeItem('pendingNotification');
//       return;
//     }

//     // Navigate to loading screen first
//     navigationRef.current?.navigate('MedicationDetailsView', {
//       isLoading: true,
//       medication: {
//         id: medicationId,
//         medication_name: 'Loading...',
//         medication_type: 'TABLET',
//       },
//     });

//     // Then fetch the actual data
//     // const medication = await getMedicationById(medicationId);

//     try {
//       const {data: medication, error} = await supabase
//         .from('medication_reminders')
//         .select('*')
//         .eq('id', medicationId)
//         .single();

//       if (error) throw error;

//       if (navigationRef.current?.isReady()) {
//         navigationRef.current?.navigate('MedicationDetailsView', {
//           isLoading: false,
//           medication: medication,
//         });
//       }
//     } catch (error) {
//       console.error('Failed to fetch medication:', error);
//       // Fallback to showing basic data

//       // Navigate again with actual data
//       navigationRef.current?.navigate('MedicationDetailsView', {
//         isLoading: false,
//         medication: {
//           id: medicationId,
//           // Ensure all required fields exist
//           medication_type: notificationData.medication_type || 'TABLET',
//           medication_name: notificationData.medication_name || 'Medication',
//           // Add other required fields with defaults
//         },
//       });

//       // Clear the pending notification
//       await AsyncStorage.removeItem('pendingNotification');
//     }
//   } catch (error) {
//     console.error('Failed to handle pending notification:', error);
//     // Fallback to home screen
//     await AsyncStorage.removeItem('pendingNotification');
//   }
// };

// const getMedicationById = async (medicationId: string) => {
//   try {
//     // Try to get from cache first
//     const cachedData = await AsyncStorage.getItem(`medication_${medicationId}`);
//     if (cachedData) return JSON.parse(cachedData);

//     // Fetch from Supabase
//     const {data, error} = await supabase
//       .from('medication_reminders')
//       .select('*')
//       .eq('id', medicationId)
//       .single();

//     if (error) throw error;

//     // Cache the data
//     await AsyncStorage.setItem(
//       `medication_${medicationId}`,
//       JSON.stringify(data),
//     );

//     return data;
//   } catch (error) {
//     console.error('Failed to fetch medication:', error);
//     // Return minimal data structure
//     return {
//       id: medicationId,
//       medication_type: 'TABLET',
//       medication_name: 'Medication Reminder',
//       // Add other required minimal fields
//     };
//   }
// };

const navigateToMedicationDetails = async (medicationId: string) => {
  try {
    // const item = await getMedicationById(medicationId);
    navigationRef.current?.navigate('MedicationDetailsView', {
      isLoading: true,
      medication: {
        id: medicationId,
        medication_type: 'Tablet',
        medication_name: 'Loading...',
      },
    });

    const item = await getMedicationById(medicationId);

    // Navigate again with full data
    navigationRef.current?.navigate('MedicationDetailsView', {
      isLoading: false,
      medication: item,
    });
  } catch (error) {
    console.error('Navigation failed:', error);
    // Fallback to home screen if navigation fails
    navigationRef.current?.navigate(SCREENS.HOME);
  }
};

export const setupNotificationHandlers = () => {
  // Foreground event handler
  notifee.onForegroundEvent(async (event: any) => {
    try {
      if (event.type === EventType.ACTION_PRESS) {
        await handleNotificationAction(event.detail as EventDetail);
      } else if (event.type === EventType.PRESS) {
        handleNotificationPress(event.detail.notification);
      }
    } catch (error: any) {
      console.error('Foreground notification handler failed:', error.message);
    }
  });
};

export const setupNotificationCategories = async () => {
  await notifee.setNotificationCategories([
    {
      id: 'user_actions',
      actions: [
        {
          id: 'complete',
          title: 'Complete',
        },
        {
          id: 'skip',
          title: 'Skip',
        },
        {
          id: 'snooze',
          title: 'Snooze (15m)',
        },
      ],
    },
  ]);
};
