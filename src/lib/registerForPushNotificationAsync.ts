import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

/**
 * Registers the device for Expo push notifications and returns the push token string.
 * Must be called on a physical device — simulators/emulators will throw.
 *
 * On Android, creates the required default notification channel.
 * On both platforms, requests notification permission if not already granted.
 */
export async function registerForPushNotificationAsync(): Promise<string> {
  // Android requires a notification channel to be created before displaying any notifications.
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
    });
  }

  // Request / check permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    throw new Error('Notification permission was not granted.');
  }

  // Resolve the EAS project ID from app config
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    (Constants as any)?.easConfig?.projectId;

  if (!projectId) {
    throw new Error(
      'EAS Project ID not found. Make sure eas.projectId is set in app.config.ts extras.',
    );
  }

  const pushTokenString = (
    await Notifications.getExpoPushTokenAsync({ projectId })
  ).data;

  console.log('[Push Notifications] Expo Push Token:', pushTokenString);
  return pushTokenString;
}
