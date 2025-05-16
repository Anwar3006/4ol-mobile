import messaging from '@react-native-firebase/messaging';
import notifee, {
  AndroidImportance,
  AndroidVisibility,
} from '@notifee/react-native';
import {Platform} from 'react-native';

const requestPermissionAndGetToken = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization Status :', authStatus);
    return await getFcmToken();
  } else {
    console.log('Notification permissions not granted.');
    return null; // Return null if not authorized
  }
};

const getFcmToken = async () => {
  try {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    return token; // Token ko return karna
  } catch (error) {
    console.log('Error retrieving FCM token:', error);
    return null; // Agar error ho toh null return karna
  }
};

const displayNotification = async (data: any) => {
  if (Platform.OS === 'android') {
    await notifee.requestPermission();
  }

  const channelId = await notifee.createChannel({
    id: 'default 1',
    name: 'default Channel 1',
    sound: 'default',
    importance: AndroidImportance.HIGH,
    vibration: true,
  });

  await notifee.displayNotification({
    title: data?.notification?.title,
    body: data?.notification?.body,
    android: {
      channelId,
      visibility: AndroidVisibility.PUBLIC,
      pressAction: {
        id: 'default',
      },
    },
  });
};

const notificationListeners = () => {
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log('🚀 ~ unsubscribe ~ remoteMessage:', remoteMessage);
    await displayNotification(remoteMessage);
  });

  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('🚀 ~ messaging ~ remoteMessage:', remoteMessage);
  });

  return unsubscribe; // Return unsubscribe function
};

export {requestPermissionAndGetToken, notificationListeners};
