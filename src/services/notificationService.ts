/**
 * notificationService.ts
 *
 * Notification-related API / Supabase helpers.
 * Previously imported @react-native-firebase/messaging for
 * getInitialNotification — replaced with expo-notifications.
 */

import axios from 'axios';
import { Linking, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { notification_api_url } from '../constants';
import { supabase } from '../../lib/supabase';
import { limit } from '../../config/variables';
import { handlePendingNotification } from './notificationActions';

// ─── Register app-wide navigation handlers ────────────────────────────────────
/**
 * Call once (in _layout.tsx) after the navigation container has been set up.
 * Handles:
 *   • Tapping a notification when the app is open (foreground/background)
 *   • Tapping a notification that wakes the app from a killed state
 */
export function registerNotificationHandlers(navigationRef: any) {
  // Listen for taps on notifications while the app is running
  Notifications.addNotificationResponseReceivedListener((response) => {
    const screen = response.notification.request.content.data?.screen as string | undefined;
    if (screen) {
      navigationRef.current?.navigate(screen);
    }
  });

  // Handle app opened from a killed state by a notification tap
  Notifications.getLastNotificationResponseAsync().then((response) => {
    if (response?.notification?.request?.content?.data?.screen) {
      const screen = response.notification.request.content.data.screen as string;
      navigationRef.current?.navigate(screen);
    }
  });

  // Also check AsyncStorage for any pending medication navigation
  handlePendingNotification();
}

// ─── Request exact alarm permission (Android 12+) ────────────────────────────
export const requestExactAlarmPermission = () => {
  if (Platform.OS === 'android' && Platform.Version >= 31) {
    Linking.openSettings();
  }
};

// ─── Send remote notification via API ────────────────────────────────────────
export const notification_firebase_api = async () => {
  try {
    const response = await axios.post(notification_api_url);
    console.log(response.data);
    return response;
  } catch (error) {
    console.error('[NotificationService] Error sending notifications:', error);
  }
};

// ─── Schedule an immediate medication notification ────────────────────────────
export const scheduleMedicationNotification = async (
  triggerTime: Date,
  medicationName: string,
): Promise<void> => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('medication-reminders', {
      name: 'Medication Reminders',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Time to take ${medicationName}`,
      body: 'Your medication reminder',
      sound: 'default',
      ...(Platform.OS === 'android' && {
        android: { channelId: 'medication-reminders' },
      }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerTime,
    },
  });
};

// ─── Fetch paginated notifications from Supabase ─────────────────────────────
export const getNotifications = async (
  userId: string,
  offset: number,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  try {
    loadCallback();
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
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

// ─── Mark a notification as seen ─────────────────────────────────────────────
export const handleNotificationSeen = async (
  notificationId: string,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  try {
    loadCallback();
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_seen: true })
      .eq('id', notificationId);

    if (error) {
      errorCallback(new Error('Failed to mark notification as seen'));
      return;
    }
    successCallback(data);
  } catch (err) {
    errorCallback(err as Error);
  }
};

// ─── Toggle tracker notifications for a user ──────────────────────────────────
export const handleUpdateTrackerLogsAlerts = async (
  userId: string,
  isEnabled: boolean,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  try {
    loadCallback();
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ is_tracker_notifications_enabled: isEnabled })
      .eq('id', userId);

    if (error) {
      errorCallback(new Error('Failed to update alerts'));
      return;
    }

    const { data: updatedUser, error: updateError } = await supabase
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
