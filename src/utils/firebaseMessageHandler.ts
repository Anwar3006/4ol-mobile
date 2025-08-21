import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import {onBackgroundEvent} from '../services/notifeeBackgroundHandler';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('FCM Background Message:', remoteMessage);

  // Display notification using Notifee
  await notifee.displayNotification({
    title: remoteMessage.notification?.title,
    body: remoteMessage.notification?.body,
    android: {
      channelId: 'default',
      pressAction: {id: 'default'},
    },
    data: remoteMessage.data,
  });
});

// Notifee background click actions
notifee.onBackgroundEvent(onBackgroundEvent);
