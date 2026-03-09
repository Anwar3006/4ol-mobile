/**
 * notificationActions.ts
 *
 * Handles notification action button presses (Complete / Skip / Snooze)
 * and notification tap navigation.
 *
 * Previously imported @react-native-firebase/messaging for getInitialNotification.
 * Replaced entirely with expo-notifications.
 */

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigationRef } from './NavigationRef';
import { supabase } from '../../lib/supabase';
import { SCREENS } from '../constants/screens';
import {
  markasComplete,
  markasSkip,
  markasSnooze,
} from './notificationButtonPress';
import { refreshAllNotifications } from './scheduleNotifications';

// ─── Handle action button presses ────────────────────────────────────────────
export const handleNotificationAction = async ({
  notification,
  pressAction,
}: {
  notification: any;
  pressAction: { id: string };
}) => {
  try {
    if (!notification || !pressAction) {
      throw new Error('Invalid notification action data');
    }

    console.log('[NotificationActions] Action press:', pressAction.id, notification);

    const medicationId = notification?.data?.medicationId;
    if (!medicationId) throw new Error('Missing medicationId in notification data');

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
        console.warn('[NotificationActions] Unknown action type:', pressAction.id);
    }
  } catch (error: any) {
    console.error('[NotificationActions] Action failed:', {
      error: error.message,
      notificationId: notification?.id,
      action: pressAction?.id,
    });
  } finally {
    try {
      if (notification?.id) {
        await Notifications.cancelScheduledNotificationAsync(notification.id);
      }
    } catch (cancelError: any) {
      console.error('[NotificationActions] Failed to cancel notification:', cancelError.message);
    }
  }
};

// ─── Handle notification tap (navigate to medication details) ─────────────────
export const handleNotificationPress = async (notification: any) => {
  const medicationId = notification?.data?.medicationId;
  if (!medicationId) {
    console.warn('[NotificationActions] No medicationId found in notification data');
    return;
  }

  await AsyncStorage.setItem(
    'pendingNotification',
    JSON.stringify({
      ...notification.data,
      medicationId,
      notificationId: notification.id,
      timestamp: new Date().toISOString(),
    }),
  );

  await handlePendingNotification();
};

// ─── Handle app opened from killed state via notification tap ─────────────────
export const handlePendingNotification = async () => {
  try {
    let notificationData: any = null;

    // 1. Check if the app was opened by tapping a notification (cold start)
    const lastResponse = await Notifications.getLastNotificationResponseAsync();
    if (lastResponse?.notification?.request?.content?.data) {
      notificationData = lastResponse.notification.request.content.data;
    }

    // 2. Fall back to AsyncStorage (background-to-foreground taps)
    if (!notificationData) {
      const pending = await AsyncStorage.getItem('pendingNotification');
      if (pending) notificationData = JSON.parse(pending);
    }

    if (!notificationData?.medicationId) return;

    const { medicationId } = notificationData;

    // Wait until the navigation container is ready (max 5 s)
    const startedAt = Date.now();
    const MAX_WAIT_MS = 5000;
    const POLL_INTERVAL_MS = 200;

    const interval = setInterval(async () => {
      if (!navigationRef.current?.isReady()) {
        if (Date.now() - startedAt > MAX_WAIT_MS) {
          clearInterval(interval);
          console.warn('[NotificationActions] Navigation not ready after 5 s');
        }
        return;
      }

      clearInterval(interval);

      // Navigate to a loading state first so the user sees something immediately
      navigationRef.current.navigate('MedicationDetailsView', {
        isLoading: true,
        medication: {
          id: medicationId,
          medication_name: 'Loading…',
          medication_type: 'TABLET',
        },
      });

      try {
        const { data: medication, error } = await supabase
          .from('medication_reminders')
          .select('*')
          .eq('id', medicationId)
          .single();

        if (error) throw error;

        navigationRef.current.navigate('MedicationDetailsView', {
          isLoading: false,
          medication,
        });
      } catch (fetchError) {
        console.error('[NotificationActions] Failed to fetch medication:', fetchError);
        navigationRef.current.navigate('MedicationDetailsView', {
          isLoading: false,
          medication: {
            id: medicationId,
            medication_type: notificationData.medication_type || 'TABLET',
            medication_name: notificationData.medication_name || 'Medication',
          },
        });
      }

      await AsyncStorage.removeItem('pendingNotification');
    }, POLL_INTERVAL_MS);

    // Safety net: ensure the interval is cleared even if something goes wrong
    setTimeout(() => clearInterval(interval), MAX_WAIT_MS + 1000);
  } catch (error) {
    console.error('[NotificationActions] Failed to handle pending notification:', error);
    await AsyncStorage.removeItem('pendingNotification');
  }
};

// ─── Register foreground + response listeners ─────────────────────────────────
/**
 * Call once at app startup (e.g. in _layout.tsx) to wire up foreground
 * notification handling and action-button responses.
 *
 * Returns a cleanup function — call it when the root component unmounts.
 */
export const setupNotificationHandlers = (
): (() => void) => {
  // Fires when user taps a notification OR presses an action button
  const responseSub = Notifications.addNotificationResponseReceivedListener(
    async (response) => {
      const actionIdentifier = response.actionIdentifier;
      const notification = response.notification.request.content;

      if (
        actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER &&
        actionIdentifier !== Notifications.DISMISS_ACTION_IDENTIFIER
      ) {
        // Action button pressed (complete / skip / snooze)
        await handleNotificationAction({
          notification: { id: response.notification.request.identifier, data: notification.data },
          pressAction: { id: actionIdentifier },
        });
      } else if (actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
        // Normal tap on the notification
        await handleNotificationPress({
          id: response.notification.request.identifier,
          data: notification.data,
        });
      }
    },
  );

  return () => {
    responseSub.remove();
  };
};

// ─── Register notification categories (action buttons) ───────────────────────
export const setupNotificationCategories = async (): Promise<void> => {
  await Notifications.setNotificationCategoryAsync('medication_actions', [
    {
      identifier: 'complete',
      buttonTitle: 'Complete',
      options: { isDestructive: false, isAuthenticationRequired: false },
    },
    {
      identifier: 'skip',
      buttonTitle: 'Skip',
      options: { isDestructive: false, isAuthenticationRequired: false },
    },
    {
      identifier: 'snooze',
      buttonTitle: 'Snooze (15m)',
      options: { isDestructive: false, isAuthenticationRequired: false },
    },
  ]);
};
