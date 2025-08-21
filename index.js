// /**
//  * @format
//  */

// import {AppRegistry} from 'react-native';
// import './src/services/notifeeBackgroundHandler';
// import App from './App';
// import {name as appName} from './app.json';
// import messaging from '@react-native-firebase/messaging';

// messaging().setBackgroundMessageHandler(async remoteMessage => {
//   // Your code to handle notifications in killed state. For example
//   // console.log('Killed state notification.', remoteMessage);
// });

// AppRegistry.registerComponent(appName, () => App);

//
//
//
//
//

// /**
//  * @format
//  */
// import {AppRegistry} from 'react-native';
// import './src/services/notifeeBackgroundHandler'; // This file imports onBackgroundEvent
// import App from './App';
// import {name as appName} from './app.json';
// import messaging from '@react-native-firebase/messaging';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// messaging().setBackgroundMessageHandler(async remoteMessage => {
//   console.log('📩 [Killed/Background FCM]', remoteMessage);

//   if (remoteMessage?.data) {
//     // Store so AppNavigation can handle after startup
//     await AsyncStorage.setItem(
//       'pendingNotification',
//       JSON.stringify(remoteMessage.data),
//     );
//   }
//   // If you want, trigger a local notification here via Notifee for data-only messages
// });

// AppRegistry.registerComponent(appName, () => App);
// index.js

/**
 * @format
 */
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import notifee, {EventType} from '@notifee/react-native';
import {navigate} from './src/services/NavigationRef';
import './src/services/notifeeBackgroundHandler';
import {onBackgroundEvent} from './src/services/notifeeBackgroundHandler';

/**
 * Navigate to MedicationDetailsView if notification contains medicationId
 */
function handleNavigationFromNotification(data) {
  if (data?.medicationId) {
    console.log(
      'Navigating to MedicationDetailsView with ID:',
      data.medicationId,
    );
    navigate('MedicationDetailsView', {
      medicationId: data.medicationId,
      fromNotification: true,
    });
  } else {
    console.log('Notification did not contain medicationId');
  }
}

/**
 * 📌 When app is in BACKGROUND and notification is tapped
 */
messaging().onNotificationOpenedApp(remoteMessage => {
  console.log('📩 Notification opened from BACKGROUND:', remoteMessage);
  handleNavigationFromNotification(remoteMessage?.data);
});

/**
 * 📌 When app is in KILLED/QUIT state and opened via notification tap
 */
messaging()
  .getInitialNotification()
  .then(remoteMessage => {
    if (remoteMessage) {
      console.log('📩 Notification opened from KILLED state:', remoteMessage);
      handleNavigationFromNotification(remoteMessage?.data);
    }
  });

/**
 * 📌 When app is in FOREGROUND and Notifee notification is tapped
 */
notifee.onForegroundEvent(({type, detail}) => {
  if (type === EventType.PRESS) {
    console.log('📩 Notification tapped in FOREGROUND:', detail.notification);
    handleNavigationFromNotification(detail.notification?.data);
  }
});

/**
 * 📌 When app is in BACKGROUND or KILLED and Notifee event occurs
 *    This is important for Android press handling
 */
// notifee.onBackgroundEvent(async ({type, detail}) => {
//   if (type === EventType.PRESS) {
//     console.log(
//       '📩 Notification tapped from BACKGROUND/KILLED via Notifee:',
//       detail.notification,
//     );
//     handleNavigationFromNotification(detail.notification?.data);
//   }
// });

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('FCM Background Message:', remoteMessage);

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

notifee.onBackgroundEvent(onBackgroundEvent);

AppRegistry.registerComponent(appName, () => App);
