import {navigationRef} from './NavigationRef';

import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';

export async function checkRedirect() {
  try {
    // 1️⃣ Check AsyncStorage for pending notification
    const stored = await AsyncStorage.getItem('pendingNotification');
    if (stored) {
      const data = JSON.parse(stored);
      const ts = new Date(data.timestamp).getTime();
      const now = Date.now();

      // Ignore if older than 30 seconds
      if (now - ts < 30000 && data.medicationId) {
        navigationRef.current?.navigate('MedicationDetailsView', {
          medicationId: data.medicationId,
          fromNotification: true,
        });
      }

      await AsyncStorage.removeItem('pendingNotification');
      return;
    }

    // 2️⃣ Check Firebase getInitialNotification (cold start)
    const remoteMessage = await messaging().getInitialNotification();
    if (remoteMessage?.data?.medicationId) {
      const ts = remoteMessage?.sentTime || Date.now();
      if (Date.now() - ts < 30000) {
        navigationRef.current?.navigate('MedicationDetailsView', {
          medicationId: remoteMessage.data.medicationId,
          fromNotification: true,
        });
      }
    }
  } catch (err) {
    console.error('checkRedirect failed:', err);
  }
}
