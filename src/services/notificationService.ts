import axios from 'axios';
import {notification_api_url} from '../constants';
import {supabase} from '../utils/supabaseClient';
import {limit} from '../../config/variables';
import notifee, {EventType} from '@notifee/react-native';
import {AndroidImportance, TriggerType} from '@notifee/react-native';
import {Linking, Platform} from 'react-native';
import messaging from '@react-native-firebase/messaging';

export function registerNotificationHandlers(navigationRef: any) {
  // 🔹 Foreground & background click handling
  notifee.onForegroundEvent(({type, detail}) => {
    if (type === EventType.PRESS && detail.notification?.data?.screen) {
      navigationRef.current?.navigate(detail.notification.data.screen);
    }
  });

  notifee.onBackgroundEvent(async ({type, detail}) => {
    if (type === EventType.PRESS && detail.notification?.data?.screen) {
      // Will run when app was killed and opened by tapping notification
      navigationRef.current?.navigate(detail.notification.data.screen);
    }
  });

  // 🔹 App opened from quit state (cold start)
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage?.data?.screen) {
        navigationRef.current?.navigate(remoteMessage.data.screen);
      }
    });
}

export const requestExactAlarmPermission = () => {
  if (Platform.OS === 'android' && Platform.Version >= 31) {
    // This opens the specific settings page for exact alarms
    Linking.openSettings();
    // Or if you want the exact alarm settings directly:
    // Linking.openURL('package:' + Application.applicationId + '/exact_alarm_permission');
  }
};

export const notification_firebase_api = async () => {
  try {
    const response = await axios.post(notification_api_url);
    console.log(response.data);
    return response;
  } catch (error) {
    console.log('error sending notifications', error);
  }
};

export const scheduleMedicationNotification = async (
  triggerTime: Date,
  medicationName: string,
) => {
  const channelId = await notifee.createChannel({
    id: 'medication-reminders',
    name: 'Medication Reminders',
    importance: AndroidImportance.HIGH,
  });
  +3;

  await notifee.createTriggerNotification(
    {
      title: `Time to take ${medicationName}`,
      body: 'Your medication reminder',
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: triggerTime.getTime(), // Exact trigger time
    },
  );
};

async function scheduleNotification(triggerTime: Date, medicationName: string) {
  // Required for Android
  const channelId = await notifee.createChannel({
    id: 'medication-reminders',
    name: 'Medication Reminders',
    importance: AndroidImportance.HIGH,
  });

  await notifee.createTriggerNotification(
    {
      title: `Time to take ${medicationName}`,
      body: 'Your medication reminder',
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: triggerTime.getTime(), // Exact trigger time
    },
  );
}

export const getNotifications = async (
  userId: string,
  offset: number,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  try {
    loadCallback();
    const {data, error} = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', {ascending: false})
      .range(offset, offset + limit - 1)
      .eq('user_id', userId);
    if (error) {
      errorCallback(new Error('Failed to fetch notifications list'));
      return;
    }
    successCallback(data);
  } catch (err) {
    errorCallback(err as Error);
  }
};

export const handleNotificationSeen = async (
  notificationId: string,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  try {
    loadCallback();
    const {data, error} = await supabase
      .from('notifications')
      .update({is_seen: true}) // Set is_seen to true
      .eq('id', notificationId); // Match the notification by ID

    if (error) {
      errorCallback(new Error('Failed to mark notification as seen'));
      return;
    }

    successCallback(data);
  } catch (err) {
    errorCallback(err as Error);
  }
};

export const handleUpdateTrackerLogsAlerts = async (
  userId: string,
  isEnabled: boolean,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  try {
    loadCallback();
    const {data, error} = await supabase
      .from('user_profiles')
      .update({is_tracker_notifications_enabled: isEnabled})
      .eq('id', userId);

    if (error) {
      errorCallback(new Error('Failed to update alerts'));
      return;
    }

    const {data: updatedUser, error: updateError} = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (updateError) {
      errorCallback(new Error('Failed to update user'));
      return;
    }

    successCallback(updatedUser);
  } catch (err) {
    errorCallback(err as Error);
  }
};
