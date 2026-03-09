/**
 * notificationServiceHelper.ts
 *
 * Helpers for requesting notification permission and displaying
 * immediate (non-scheduled) notifications via expo-notifications.
 *
 * Previously relied on @react-native-firebase/messaging — fully replaced
 * with expo-notifications.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Requests notification permission (if not already granted) and returns
 * whether the user authorised notifications.
 */
export const requestPermissionAndGetToken = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  const enabled = finalStatus === 'granted';
  console.log('[Notifications] Permission status:', finalStatus);
  return enabled;
};

/**
 * Displays an immediate (trigger-less) notification using the supplied
 * remote-message-style data object (matches the shape previously received
 * from firebase messaging).
 */
export const displayNotification = async (data: {
  notification?: { title?: string; body?: string };
  [key: string]: any;
}): Promise<void> => {
  // Ensure Android channel exists
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
    });
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: data?.notification?.title ?? 'Notification',
      body: data?.notification?.body ?? '',
      sound: 'default',
      data: data,
    },
    trigger: null, // null = display immediately
  });
};

/**
 * Starts listening for incoming notifications while the app is in the
 * foreground. Returns an unsubscribe function — call it when the component
 * that registered the listener unmounts.
 */
export const notificationListeners = (): (() => void) => {
  // Foreground notification received
  const receivedSub = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log('[Notifications] Received in foreground:', notification);
      displayNotification({
        notification: {
          title: notification.request.content.title ?? undefined,
          body: notification.request.content.body ?? undefined,
        },
        ...((notification.request.content.data as object) ?? {}),
      });
    },
  );

  // User tapped a notification (foreground or background)
  const responseSub = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      console.log('[Notifications] User tapped notification:', response);
    },
  );

  return () => {
    receivedSub.remove();
    responseSub.remove();
  };
};
