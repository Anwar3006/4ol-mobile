// import notifee, {EventType} from '@notifee/react-native';
// import {
//   handleNotificationAction,
//   handleNotificationPress,
// } from './notificationActions';

// export async function onBackgroundEvent(event: any) {
//   try {
//     if (event.type === EventType.ACTION_PRESS) {
//       await handleNotificationAction(event.detail);
//     } else if (event.type === EventType.PRESS) {
//       await handleNotificationPress(event.detail.notification);
//     }
//   } catch (error: any) {
//     console.error('Background notification handler failed:', error.message);
//   } finally {
//     return Promise.resolve();
//   }
// }

// notifee.onBackgroundEvent(onBackgroundEvent);

// import notifee, {EventType} from '@notifee/react-native';
// import {
//   handleNotificationAction,
//   handleNotificationPress,
// } from './notificationActions';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export async function onBackgroundEvent(event: any) {
//   try {
//     if (event.type === EventType.ACTION_PRESS) {
//       await handleNotificationAction(event.detail);
//     } else if (event.type === EventType.PRESS) {
//       // For killed state, we need to store the notification data
//       // and handle it when the app fully initializes
//       const notification = event.detail.notification;
//       if (notification?.data?.medicationId) {
//         await AsyncStorage.setItem(
//           'pendingNotification',
//           JSON.stringify(notification.data),
//         );
//       }
//       // Then let the normal press handler continue
//       await handleNotificationPress(notification);
//     }
//   } catch (error: any) {
//     console.error('Background notification handler failed:', error.message);
//   }
// }
// // Register the headless task
// notifee.onBackgroundEvent(onBackgroundEvent);

// // src/services/notifeeBackgroundHandler.ts
// import notifee, {EventType} from '@notifee/react-native';
// import {
//   handleNotificationAction,
//   handleNotificationPress,
// } from './notificationActions';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {navigate} from './NavigationRef';

// notifee.onBackgroundEvent(async ({type, detail}) => {
//   try {
//     if (type === EventType.ACTION_PRESS) {
//       await handleNotificationAction(detail);
//       // navigate('MedicationDetail', {id: detail.notification?.data?.id});
//     } else if (type === EventType.PRESS) {
//       const notification = detail.notification;

//       // Save for killed state redirect
//       if (notification?.data?.medicationId) {
//         await AsyncStorage.setItem(
//           'notificationRedirect',
//           JSON.stringify({
//             page: 'MedicationDetailPage',
//             data: notification.data,
//           }),
//         );
//       }

//       // Handle normal press (optional)
//       await handleNotificationPress(notification);
//     }
//   } catch (error: any) {
//     console.error('Background notification handler failed:', error.message);
//   }
// });

import notifee, {EventType} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  handleNotificationAction,
  handleNotificationPress,
} from './notificationActions';

export const onBackgroundEvent = async ({
  type,
  detail,
}: {
  type: EventType;
  detail: any;
}) => {
  try {
    if (type === EventType.ACTION_PRESS) {
      await handleNotificationAction(detail);
    } else if (type === EventType.PRESS) {
      const notification = detail.notification;

      if (notification?.data?.medicationId) {
        await AsyncStorage.setItem(
          'pendingNotification',
          JSON.stringify(notification.data),
        );
      }

      await handleNotificationPress(notification);
    }
  } catch (error: any) {
    console.error('Background notification handler failed:', error.message);
  }
};
